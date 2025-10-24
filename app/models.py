from datetime import datetime, date, timezone
from typing import Optional
from sqlalchemy import JSON
from sqlmodel import Column, Field, SQLModel


class Contract(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    external_id: Optional[str] = Field(default=None, index=True)
    customer_name: Optional[str]
    file_name: Optional[str]
    content_type: Optional[str]
    raw_text: Optional[str]
    extracted_json: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    total_value: Optional[float]
    currency: Optional[str]
    start_date: Optional[date]
    end_date: Optional[date]
    status: str = Field(default="uploaded")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    
class ContractObligation(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    contract_id: int = Field(default=None, foreign_key="contract.id")
    name: str
    type: Optional[str]
    standalone_price: Optional[float]
    allocated_amount: Optional[float]
    recognition_method: Optional[str]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    
class RevenueSchedule(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    obligation_id: Optional[int] = Field(default=None, foreign_key="contractobligation.id")
    contract_id: int = Field(default=None, foreign_key="contract.id")
    period_start: Optional[date]
    period_end: Optional[date]
    amount: Optional[float]
    recognized: bool = Field(default=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
class AuditMessage(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    contract_id: int = Field(default=None, foreign_key="contract.id")
    memo_text: Optional[str]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    
class AuditLog(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    step: str
    contract_id: int = Field(default=None, foreign_key="contract.id")
    input: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    llm_response: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))