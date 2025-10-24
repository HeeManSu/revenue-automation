from datetime import date
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel

class RecognitionPeriod(BaseModel):
    start_date: date
    end_date: date
    frequency: str
    
    class Config:
        extra = "allow"
    
    
class Milestone(BaseModel):
    name: str
    value: float
    date: Optional[date] = None
    
    class Config:
        extra = "allow"
        
        
class RevenueRecognitionMethod(str, Enum):
    OVER_TIME: str = "over_time"
    POINT_IN_TIME: str = "point_in_time"
    
class PointInTimePerformanceObligation(BaseModel):
    name: str
    type: str
    ssp: float
    allocated_value: float
    revenue_recognition_method: RevenueRecognitionMethod
    recognition_trigger: str
    milestones: List[Milestone]
    
    class Config:
        extra = "allow"

class OverTimePerformanceObligation(BaseModel):
    name: str
    type: str
    ssp: float
    allocated_value: float
    revenue_recognition_method: RevenueRecognitionMethod
    recognition_trigger: str
    recognition_period: RecognitionPeriod
    milestones: List[Milestone]
    
    class Config:
        extra = "allow"
        

class DiscountScope(str, Enum):
    GLOBAL: str = "global"
    OBLIGATION_SPECIFIC: str = "obligation_specific"
        
class Discount(BaseModel):
    name: str
    type: str
    amount: float
    is_percentage: bool
    scope: DiscountScope
    target_obligations: Optional[List[str]] = None
    description: Optional[str] = None
    
    class Config:
        extra = "allow"
    

class ContractLLMResponseJsonSchema(BaseModel):
    contract_id: str
    provider: str
    customer: str
    effective_date: date
    end_date: Optional[date]
    currency: str
    total_contract_value: float
    contract_type: Optional[str] = "SaaS"
    performance_obligations: List[OverTimePerformanceObligation | PointInTimePerformanceObligation]
    discounts: Optional[List[Discount]] = []
    variable_considerations: Optional[List[dict]] = []
    termination_clause: Optional[dict] = None
    
    class Config:
        extra = "allow"