"""
Revenue Recognition Background Job

This module defines the background task responsible for running the full
revenue recognition workflow. It handles contract data extraction,
applies ASC 606 accounting logic, and generates the corresponding
audit memo for documentation.
"""

from .celery_config import celery_app
from app.db import get_session
from app.models import Contract, ContractObligation, RevenueSchedule, AuditMessage
from app.extractor.llm_extractor import extract_contract_data
from app.ASC606 import revenue_recognition as asc606_revenue_recognition
from app.audit_memo import generate_audit_memo
from datetime import datetime

def calculate_time_saved(performance_obligations: int, revenue_schedules: int, audit_memo_length: int, contract_value: float) -> float:
    """
    Calculate estimated time saved in hours based on contract complexity.
    """
    
    base_time = 1.0  # Base time
    obligation_time = performance_obligations * 0.75  # 0.75 hours per obligation
    schedule_time = revenue_schedules * 0.08  # 0.08 hours per revenue schedule entry
    memo_time = min(audit_memo_length / 2000, 1.0)  # 1 hour for long memos (2000 chars)
    value_complexity = min(contract_value / 100000, 1.0)  # 1 hour if contract > $100K
    
    total_time = base_time + obligation_time + schedule_time + memo_time + value_complexity
    
    return round(total_time * 4) / 4;

@celery_app.task(bind=True, name="revenue_recognition")
def revenue_recognition(self, contract_id: str, text_content: str, file_info: dict):
    """
    Process the contract data through the full revenue recognition pipeline.
    
    """
    try:
        print(f"Starting revenue recognition processing for contract: {contract_id}")
        
        extracted_data = extract_contract_data(text_content, contract_id)
        print(f"Extracted data")
        revenue_result = asc606_revenue_recognition(extracted_data.model_dump())     
        print(f"Revenue result:")
        audit_memo = generate_audit_memo(extracted_data.model_dump(), revenue_result)    
        revenue_schedules = revenue_result.get('revenue_schedule', [])
        print(f"Audit memo:")
        
        revenue_schedule_count = len(revenue_schedules)
        performance_obligations_count = revenue_result.get('performance_obligations_count', 0)
        time_saved_hours = calculate_time_saved(
            performance_obligations_count, 
            revenue_schedule_count, 
            len(audit_memo),
            extracted_data.total_contract_value or 0
        )
        
        print(f"Time saved hours: {time_saved_hours}")
        
        with next(get_session()) as session:
            contract = session.query(Contract).filter(Contract.external_id == contract_id).first()
            extracted_json_data = extracted_data.model_dump(mode='json')
            
            if contract:
                contract.customer_name = extracted_data.customer
                contract.extracted_json = extracted_json_data
                contract.total_value = extracted_data.total_contract_value
                contract.currency = extracted_data.currency
                contract.start_date = extracted_data.effective_date
                contract.end_date = extracted_data.end_date
                contract.status = "processed"
                contract.time_saved_hours = time_saved_hours
            else:
                contract = Contract(
                    external_id=contract_id,
                    customer_name=extracted_data.customer,
                    file_name=file_info["filename"],
                    content_type=file_info["content_type"],
                    raw_text=text_content,
                    extracted_json=extracted_json_data,
                    total_value=extracted_data.total_contract_value,
                    currency=extracted_data.currency,
                    start_date=extracted_data.effective_date,
                    end_date=extracted_data.end_date,
                    status="processed",
                    time_saved_hours=time_saved_hours
                )
                session.add(contract)
            
            session.commit()
            session.refresh(contract)
            
            obligation_map = {}
            for obligation_data in extracted_data.performance_obligations:
                obligation = ContractObligation(
                    contract_id=contract.id,
                    name=obligation_data.name,
                    type=obligation_data.type,
                    allocated_amount=obligation_data.allocated_value,
                    recognition_method=obligation_data.revenue_recognition_method,
                    standalone_price=obligation_data.ssp,
                )
                session.add(obligation)
                session.flush()
                obligation_map[obligation_data.name] = obligation.id
            
            for schedule_entry in revenue_schedules:
                period_start = schedule_entry.get('period_start')
                period_end = schedule_entry.get('period_end')
                
                if isinstance(period_start, str):
                    period_start = datetime.fromisoformat(period_start).date()
                if isinstance(period_end, str):
                    period_end = datetime.fromisoformat(period_end).date()
                
                obligation_name = schedule_entry.get('obligation_name', '')
                obligation_id = obligation_map.get(obligation_name)
                
                revenue_schedule = RevenueSchedule(
                    contract_id=contract.id,
                    obligation_id=obligation_id,
                    period_start=period_start,
                    period_end=period_end,
                    amount=schedule_entry.get('amount', 0.0),
                    recognized=schedule_entry.get('status') == 'recognized'
                )
                session.add(revenue_schedule)
            
            audit_message = AuditMessage(
                contract_id=contract.id,
                memo_text=audit_memo
            )
            session.add(audit_message)
            
            session.commit()
            
            revenue_schedule_count = len(revenue_schedules)
            print(f"Successfully processed contract {contract_id} with {revenue_schedule_count} schedule entries")
            
            return {
                "status": "success",
                "contract_id": contract_id,
                "message": "Contract processed successfully",
                "revenue_processing": {
                    "total_schedule_entries": revenue_schedule_count,
                    "performance_obligations": performance_obligations_count,
                    "total_contract_value": revenue_result.get('total_contract_value', 0),
                    "audit_memo_length": len(audit_memo),
                    "time_saved_hours": time_saved_hours
                }
            }
            
    except Exception as e:
        print(f"Error processing contract {contract_id}: {str(e)}")
        
        try:
            with next(get_session()) as session:
                contract = session.query(Contract).filter(Contract.external_id == contract_id).first()
                if contract:
                    contract.status = "failed"
                    session.commit()
        except Exception as db_error:
            print(f"Error updating contract status: {str(db_error)}")
        
        # raise self.retry(exc=e, countdown=60, max_retries=0)
