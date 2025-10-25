from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import select
from app.db import init_db, get_session
from app.models import Contract, ContractObligation, RevenueSchedule, AuditMessage
from app.jobs import revenue_recognition
from app.utils.file_processor import FileProcessor
import uuid

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield
    
    
app = FastAPI(title="Finance Automation Platform", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {"message": "OK", "status": "running", "cors": "enabled"}

@app.post("/contracts/upload")
async def upload_contract(file: UploadFile = File(...)):
    file_bytes = await file.read()
    
    text_content, file_info = FileProcessor.extract_text(file_bytes, file.filename, file.content_type)
    contract_id = str(uuid.uuid4())
    
    try:
        with next(get_session()) as session:
            contract = Contract(
                external_id=contract_id,
                file_name=file_info["filename"],
                content_type=file_info["content_type"],
                raw_text=text_content,
                status="uploaded"
            )
            
            session.add(contract)
            session.commit()
            session.refresh(contract)
        
        task = revenue_recognition.delay(contract_id, text_content, file_info)
        
        return {
            "message": "Contract uploaded successfully. Processing started in background.",
            "contract_id": contract_id,
            "task_id": task.id,
            "file_info": file_info,
            "status": "uploaded",
            "processing_status": "started"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading contract: {str(e)}")


@app.get("/contracts")
def get_contracts():
    with next(get_session()) as session:
        contracts = session.exec(select(Contract)).all()
        return [
            {
                "id": contract.id,
                "external_id": contract.external_id,
                "customer_name": contract.customer_name,
                "file_name": contract.file_name,
                "content_type": contract.content_type,
                "total_value": contract.total_value,
                "currency": contract.currency,
                "start_date": contract.start_date,
                "end_date": contract.end_date,
                "status": contract.status,
                "time_saved_hours": contract.time_saved_hours,
                "created_at": contract.created_at,
                "updated_at": contract.updated_at
            }
            for contract in contracts
        ]

@app.get("/contracts/{contract_id}/revenue-schedules")
def get_revenue_schedules(contract_id: str):
    with next(get_session()) as session:
        contract = session.query(Contract).filter(Contract.external_id == contract_id).first()
        if not contract:
            raise HTTPException(status_code=404, detail="Contract not found")
        
        schedules = session.exec(
            select(RevenueSchedule, ContractObligation)
            .join(ContractObligation, RevenueSchedule.obligation_id == ContractObligation.id, isouter=True)
            .where(RevenueSchedule.contract_id == contract.id)
        ).all()
        
        result = []
        for schedule, obligation in schedules:
            schedule_data = {
                "id": schedule.id,
                "contract_id": schedule.contract_id,
                "obligation_id": schedule.obligation_id,
                "period_start": schedule.period_start,
                "period_end": schedule.period_end,
                "amount": schedule.amount,
                "recognized": schedule.recognized,
                "created_at": schedule.created_at,
                "obligation": {
                    "id": obligation.id if obligation else None,
                    "name": obligation.name if obligation else "Unknown",
                    "type": obligation.type if obligation else None,
                    "recognition_method": obligation.recognition_method if obligation else None
                } if obligation else None
            }
            result.append(schedule_data)
        
        return result

@app.get("/contracts/{contract_id}/audit-memos")
def get_audit_memos(contract_id: str):
    with next(get_session()) as session:
        contract = session.query(Contract).filter(Contract.external_id == contract_id).first()
        if not contract:
            raise HTTPException(status_code=404, detail="Contract not found")
        
        memos = session.exec(
            select(AuditMessage).where(AuditMessage.contract_id == contract.id)
        ).all()
        return memos

@app.get("/contracts/{contract_id}/audit-memos/structured")
def get_structured_audit_memos(contract_id: str):
    try:
        with next(get_session()) as session:
            contract = session.query(Contract).filter(Contract.external_id == contract_id).first()
            if not contract:
                raise HTTPException(status_code=404, detail="Contract not found")
            
            if not contract.extracted_json:
                raise HTTPException(status_code=404, detail="Contract data not found - contract may not be processed yet")
            
            extracted_data = contract.extracted_json
            
            performance_obligations = []
            for obligation in extracted_data.get("performance_obligations", []):
                performance_obligations.append({
                    "name": obligation.get("name", ""),
                    "type": obligation.get("type", "Service"),
                    "revenue_recognition_method": obligation.get("revenue_recognition_method", "over_time"),
                    "ssp": obligation.get("ssp", 0),
                    "allocated_value": obligation.get("allocated_value", 0),
                    "recognition_trigger": obligation.get("recognition_trigger", "Monthly" if obligation.get("revenue_recognition_method") == "over_time" else "Upon Completion")
                })
            
            contract_data = {
                "contract_id": extracted_data.get("contract_id", contract.external_id or str(contract.id)),
                "provider": extracted_data.get("provider", "Provider"),
                "customer": extracted_data.get("customer", "Customer"),
                "total_contract_value": extracted_data.get("total_contract_value", 0),
                "effective_date": extracted_data.get("effective_date", ""),
                "end_date": extracted_data.get("end_date", ""),
                "currency": extracted_data.get("currency", "USD"),
                "performance_obligations": performance_obligations,
                "variable_considerations": extracted_data.get("variable_considerations", []),
                "discounts": extracted_data.get("discounts", [])
            }
            
            schedules = session.exec(
                select(RevenueSchedule, ContractObligation)
                .join(ContractObligation, RevenueSchedule.obligation_id == ContractObligation.id, isouter=True)
                .where(RevenueSchedule.contract_id == contract.id)
            ).all()
            
            revenue_result = {
                "revenue_schedule": [
                    {
                        "period_start": schedule.period_start.strftime("%Y-%m-%d") if schedule.period_start else "",
                        "period_end": schedule.period_end.strftime("%Y-%m-%d") if schedule.period_end else "",
                        "amount": schedule.amount or 0,
                        "recognition_method": obligation.recognition_method if obligation else "over_time",
                        "status": "recognized" if schedule.recognized else "pending"
                    }
                    for schedule, obligation in schedules
                ]
            }
            
            from app.audit_memo import get_structured_memo
            structured_memo = get_structured_memo(contract_data, revenue_result)
            
            return structured_memo
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")