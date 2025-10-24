from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import select
from app.db import init_db, get_session
from app.models import Contract, ContractObligation, RevenueSchedule, AuditMessage
from app.jobs import revenue_recognition
import uuid

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield
    
    
app = FastAPI(title="Finance Automation Platform", version="1.0.0", lifespan=lifespan)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {"message": "OK", "status": "running", "cors": "enabled"}

@app.get("/health")
def detailed_health_check():
    return {
        "message": "Revenue Automation API is running",
        "status": "healthy",
        "cors_enabled": True,
        "endpoints": [
            "GET /contracts",
            "POST /contracts/upload", 
            "GET /contracts/{id}",
            "GET /contracts/{id}/revenue-schedules",
            "GET /contracts/{id}/audit-memos"
        ]
    }

@app.post("/contracts/upload")
async def upload_contract(file: UploadFile = File(...)):
    """
    Upload a contract file and trigger revenue recognition job.
    """
    file_bytes = await file.read()
    
    try:
        text_content = file_bytes.decode('utf-8')
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="Invalid file format")
    
    file_info = {
        "filename": file.filename,
        "content_type": file.content_type,
        "size_in_kb": round(len(file_bytes) / 1024, 2),
        "line_count": len(text_content.splitlines()),
        "character_count": len(text_content),
    }
    
    contract_id = str(uuid.uuid4())
    
    try:
        with next(get_session()) as session:
            contract = Contract(
                external_id=contract_id,
                file_name=file.filename,
                content_type=file.content_type,
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


@app.get("/contracts/{contract_id}/status")
def get_contract_status(contract_id: str):
    """
    Get the processing status of a contract.
    
    Returns:
        - Contract details from database
        - Processing status (uploaded, processing, processed, failed)
        - Task status if available
    """
    try:
        with next(get_session()) as session:
            contract = session.query(Contract).filter(Contract.external_id == contract_id).first()
            
            if not contract:
                raise HTTPException(status_code=404, detail="Contract not found")
            
            return {
                "contract_id": contract_id,
                "status": contract.status,
                "file_name": contract.file_name,
                "created_at": contract.created_at,
                "updated_at": contract.updated_at,
                "customer_name": contract.customer_name,
                "total_value": contract.total_value,
                "currency": contract.currency
            }
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving contract status: {str(e)}")


@app.get("/contracts")
def get_contracts():
    """Get all contracts"""
    with next(get_session()) as session:
        contracts = session.exec(select(Contract)).all()
        return contracts

@app.get("/contracts/{contract_id}")
def get_contract(contract_id: int):
    """Get a specific contract by ID"""
    with next(get_session()) as session:
        contract = session.get(Contract, contract_id)
        if not contract:
            raise HTTPException(status_code=404, detail="Contract not found")
        return contract

@app.get("/contracts/{contract_id}/revenue-schedules")
def get_revenue_schedules(contract_id: int):
    """Get revenue schedules for a contract"""
    with next(get_session()) as session:
        schedules = session.exec(
            select(RevenueSchedule).where(RevenueSchedule.contract_id == contract_id)
        ).all()
        return schedules

@app.get("/contracts/{contract_id}/audit-memos")
def get_audit_memos(contract_id: int):
    """Get audit memos for a contract"""
    with next(get_session()) as session:
        memos = session.exec(
            select(AuditMessage).where(AuditMessage.contract_id == contract_id)
        ).all()
        return memos

# @app.get("/contracts/{contract_id}/revenue-summary")
# def get_revenue_summary(contract_id: int):
#     """Get a summary of revenue recognition for a contract"""
#     with next(get_session()) as session:
#         contract = session.get(Contract, contract_id)
#         if not contract:
#             raise HTTPException(status_code=404, detail="Contract not found")
        
#         schedules = session.exec(
#             select(RevenueSchedule).where(RevenueSchedule.contract_id == contract_id)
#         ).all()
        
#         obligations = session.exec(
#             select(ContractObligation).where(ContractObligation.contract_id == contract_id)
#         ).all()
        
#         total_recognized = sum(s.amount for s in schedules if s.recognized)
#         total_deferred = sum(s.amount for s in schedules if not s.recognized)
        
#         return {
#             "contract_id": contract_id,
#             "contract_value": contract.total_value,
#             "total_recognized": total_recognized,
#             "total_deferred": total_deferred,
#             "recognition_percentage": (total_recognized / contract.total_value * 100) if contract.total_value > 0 else 0,
#             "performance_obligations": len(obligations),
#             "schedule_entries": len(schedules)
#         }