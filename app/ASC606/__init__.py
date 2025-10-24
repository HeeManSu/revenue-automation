"""
ASC 606 Revenue Recognition Module

This module helps automate revenue recognition for contracts according to ASC 606 standard.

The process involves 5 steps:
1. Identify the contract with the customer
2. Identify the performance obligations
3. Determine the transaction price
4. Allocate the transaction price to performance obligations
5. Recognize revenue as each obligation is fulfilled
"""

from typing import Dict

from app.ASC606.engine import ASC606Engine
from app.ASC606.models import PerformanceObligationModel, DiscountModel, RevenueScheduleModel
from app.ASC606.discounts import DiscountHandler
from app.ASC606.revenue_schedule import RevenueScheduleGenerator

def revenue_recognition(contract_data: Dict) -> Dict:
    """Main entry point for revenue recognition"""
    engine = ASC606Engine()
    return engine.process_contract(contract_data)


__all__ = [
    'ASC606Engine',
    'revenue_recognition',
    'PerformanceObligationModel',
    'DiscountModel',
    'RevenueScheduleModel',
    'DiscountHandler',
    'RevenueScheduleGenerator',
]