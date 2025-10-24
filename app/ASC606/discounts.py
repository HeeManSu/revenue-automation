"""
ASC 606 Discount Handler

This module handles all the discount-related logic for ASC 606 revenue recognition.
"""

from typing import Dict, List

from app.ASC606.models import DiscountModel, PerformanceObligationModel


class DiscountHandler:
    """
    Handles discount-related logic for ASC 606 revenue recognition.
    """
    
    def __init__(self):
        self.discounts = []
        self.total_discount_amount = 0.0
        
        
    def process_discounts(self, contract_data: Dict) -> None:
        """Process and validate discounts from contract data"""
        if "discounts" not in contract_data:
            return
        
        for discount_data in contract_data["discounts"]:
            discount = DiscountModel(
                name=discount_data.get("name", ""),
                type=discount_data.get("type", "contract_level"),
                amount=discount_data.get("amount", 0.0),
                is_percentage=discount_data.get("is_percentage", False),
                scope=discount_data.get("scope", "global"),
                target_obligations=discount_data.get("target_obligations")
            )
            self.discounts.append(discount)
            
    def apply_discounts(self, performance_obligations: List[PerformanceObligationModel]) -> None:
        """Apply discounts to performance obligations before revenue recognition"""
        if not self.discounts:
            return
        
        # Calculate total SSP for allocation
        total_ssp = sum(obligation.standalone_price for obligation in performance_obligations)
        
        for discount in self.discounts:
            if discount.scope == "global":
                self._apply_global_discount(discount, performance_obligations, total_ssp)
            elif discount.scope == "obligation_specific":
                self._apply_obligation_specific_discount(discount, performance_obligations)
                
                
    def _apply_global_discount(self, discount: DiscountModel, performance_obligations:  List[PerformanceObligationModel], total_ssp: float) -> None:
        """Apply global contract-level discount pro rata across all obligations"""
        if discount.is_percentage:
            discount_amount = total_ssp * (discount.amount / 100)
        else:
            discount_amount = discount.amount
            
        # Allocate discount pro rata based on SSP
        for obligation in performance_obligations:
            if total_ssp > 0:
                obligation_discount = (obligation.standalone_price / total_ssp) * discount_amount
                obligation.discount_applied += obligation_discount
                obligation.allocated_amount -= obligation_discount
                
        self.total_discount_amount += discount_amount
        
        
    def _apply_obligation_specific_discount(self, discount: DiscountModel, performance_obligations: List[PerformanceObligationModel]) -> None:
        """Apply discount to specific obligations"""
        if not discount.target_obligations:
            return
        
        for obligation in performance_obligations:
            if obligation.name in discount.target_obligations:
                if discount.is_percentage:
                    obligation_discount = obligation.standalone_price * (discount.amount / 100)
                else:
                    obligation_discount = discount.amount
                obligation.discount_applied += obligation_discount
                obligation.allocated_amount -= obligation_discount
                self.total_discount_amount += obligation_discount