"""
ASC 606 Revenue Schedule Engine

This module contains the main ASC606Engine class that orchestrates the 5-step ASC 606 model.
"""

from typing import Any, Dict, List
from app.ASC606.discounts import DiscountHandler
from app.ASC606.models import PerformanceObligationModel, RevenueScheduleModel
from app.ASC606.revenue_schedule import RevenueScheduleGenerator


class ASC606Engine:
    """
    Core ASC 606 Revenue Recognition Engine
    
    This class implements the 5-step ASC 606 model:
    1. Identify contract
    2. Identify performance obligations
    3. Determine transaction price
    4. Allocate transaction price
    5. Generate revenue schedule
    """
    
    def __init__(self):
        self.contract_data = None
        self.performance_obligations: List[PerformanceObligationModel] = []
        self.revenue_schedule: List[RevenueScheduleModel] = []
        self.discount_handler =  DiscountHandler()
        self.revenue_schedule_generator = None
        
        
    def process_contract(self, contract_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Entry point for processing a contract through ASC 606 logic
        """
        
        self.contract_data = contract_data;
        self._process_performance_obligations();
        self.discount_handler.process_discounts(contract_data);
        self.discount_handler.apply_discounts(self.performance_obligations);
        self._generate_revenue_schedule();
        
        print(f"Processing contract: {contract_data}")
        
        return {
            "message": "Contract processed successfully.",
            "contract_data": contract_data,
            "revenue_schedule": [ 
            {
                "contract_id": revenue_schedule.contract_id,
                "obligation_name": revenue_schedule.obligation_name,
                "period_start": revenue_schedule.period_start.isoformat() if revenue_schedule.period_start else None,
                "period_end": revenue_schedule.period_end.isoformat() if revenue_schedule.period_end else None,
                "amount": revenue_schedule.amount,
                "recognition_method": revenue_schedule.recognition_method,
                "status": revenue_schedule.status,
                "created_at": revenue_schedule.created_at.isoformat() if revenue_schedule.created_at else None
            } for revenue_schedule in self.revenue_schedule],
            "total_discount_amount": self.discount_handler.total_discount_amount,
            "discounts_applied": len(self.discount_handler.discounts),
        }
        
               
    def _process_performance_obligations(self) -> None:
        """Process and validate performance obligations"""
        for obligation_data in self.contract_data["performance_obligations"]:
            obligation = PerformanceObligationModel(
                name=obligation_data["name"],
                type=obligation_data["type"],
                standalone_price=obligation_data["ssp"],
                allocated_amount=obligation_data["allocated_value"],
                recognition_method=obligation_data["revenue_recognition_method"],
                recognition_trigger=obligation_data["recognition_trigger"],
                recognition_period=obligation_data.get("recognition_period", {}),
                milestones=obligation_data.get("milestones", []),
            )
            self.performance_obligations.append(obligation)
            
            
    def _generate_revenue_schedule(self) -> None:
        """Generate revenue schedule based on ASC 606 rules"""
        self.revenue_schedule_generator = RevenueScheduleGenerator(self.contract_data)
        self.revenue_schedule = self.revenue_schedule_generator.generate_schedule(self.performance_obligations)