"""
ASC 606 Data Models

This module contains all the dataclasses and models used in the ASC 606 revenue recognition engine.
"""

from dataclasses import dataclass
from datetime import date, datetime
from typing import Dict, List, Optional


@dataclass
class PerformanceObligationModel:
    """Represents a performance obligation from ASC 606"""
    name: str
    type: str
    standalone_price: float
    allocated_amount: float
    recognition_method: str
    recognition_trigger: str
    recognition_period: Optional[Dict[str, str]]
    milestones: List[Dict[str, str]]
    discount_applied: float = 0.0
    
    
    
@dataclass
class DiscountModel:
    """Represents a discount applied to a contract"""
    name: str
    type: str 
    amount: float 
    is_percentage: bool
    scope: str 
    target_obligations: Optional[List[str]] = None
    
    
@dataclass
class RevenueScheduleModel:
    """Represents a single revenue recognition entry"""
    contract_id: str
    obligation_name: str
    period_start: date
    period_end: date
    amount: float
    recognition_method: str
    status: str
    created_at: datetime