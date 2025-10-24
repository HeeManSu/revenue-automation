"""
ASC 606 Revenue Schedule Generator

This module contains the main RevenueScheduleGenerator class that generates the revenue schedule for ASC 606 revenue recognition.
"""

import calendar
from datetime import date, datetime, timedelta
from typing import Any, Dict, List
from app.ASC606.models import PerformanceObligationModel, RevenueScheduleModel


class RevenueScheduleGenerator:
    """
    Generates the revenue schedule for ASC 606 revenue recognition.
    """
    
    def __init__(self, contract_data: Dict[str, Any]):
        self.contract_data = contract_data
        self.revenue_schedule: List[RevenueScheduleModel] = []
        
    def generate_schedule(self, performance_obligations: List[PerformanceObligationModel]) -> List[RevenueScheduleModel]:
        """Generate the revenue schedule for ASC 606 revenue recognition"""
        effective_date = self.contract_data["effective_date"]
        if isinstance(effective_date, str):
            effective_date = datetime.strptime(effective_date, "%Y-%m-%d").date()
        
        end_date = self.contract_data["end_date"]
        if isinstance(end_date, str):
            end_date = datetime.strptime(end_date, "%Y-%m-%d").date()
        
        for obligation in performance_obligations:
            if obligation.recognition_method == "over_time":
                self._process_over_time_obligation(obligation, effective_date, end_date)
            elif obligation.recognition_method == "point_in_time":
                self._process_point_in_time_obligation(obligation, effective_date, end_date)
            else:
                raise ValueError(f"Unsupported recognition method: {obligation.recognition_method}")
                
        return self.revenue_schedule
    
    
    def _process_point_in_time_obligation(self, obligation: PerformanceObligationModel, effective_date: date, end_date: date) -> None:
        """Process point-in-time performance obligation"""
        if obligation.milestones and len(obligation.milestones) > 0:
            for milestone in obligation.milestones:
                milestone_amount = milestone.get("value", 0)
                revenue_entry = RevenueScheduleModel(
                    contract_id=self.contract_data["contract_id"],
                    obligation_name=f"{obligation.name} - {milestone['name']}",
                    period_start=effective_date,
                    period_end=effective_date,
                    amount=round(milestone_amount, 2),
                    recognition_method="point_in_time",
                    status="recognized",
                    created_at=datetime.now()
                )
                self.revenue_schedule.append(revenue_entry)
        else:
            # Single point-in-time recognition
            revenue_entry = RevenueScheduleModel(
                contract_id=self.contract_data["contract_id"],
                obligation_name=obligation.name,
                period_start=effective_date,
                period_end=effective_date,
                amount=round(obligation.allocated_amount, 2),
                recognition_method="point_in_time",
                status="recognized",
                created_at=datetime.now()
            )
            self.revenue_schedule.append(revenue_entry)
    
    def _process_over_time_obligation(self, obligation: PerformanceObligationModel, effective_date: date, end_date: date) -> None:
        """Process over-time performance obligation"""
        if not obligation.recognition_period:
            raise ValueError(f"Recognition period is required for over-time obligations: {obligation.name}")
            
        period_start = effective_date
        if isinstance(period_start, str):
            period_start = datetime.strptime(period_start, "%Y-%m-%d").date()
        period_end = end_date
        if isinstance(period_end, str):
            period_end = datetime.strptime(period_end, "%Y-%m-%d").date()
            
        frequency = obligation.recognition_period["frequency"]
        
        if period_start < effective_date or period_end > end_date:
            raise ValueError("Recognition period is outside the contract period")
            
        if frequency == 'monthly':
            self._generate_monthly_schedule(obligation, period_start, period_end)
        elif frequency == 'quarterly':
            self._generate_quarterly_schedule(obligation, period_start, period_end)
        elif frequency == 'yearly':
            self._generate_yearly_schedule(obligation, period_start, period_end)
        elif frequency.startswith('every_'):
            self._generate_custom_interval_schedule(obligation, period_start, period_end, frequency)
        else:
            raise ValueError(f"Unsupported frequency: {frequency}")
            
    def _generate_monthly_schedule(self, obligation: PerformanceObligationModel, start_date: date, end_date: date) -> None:
        """Generate monthly revenue schedule"""
        # Calculate total months between start and end date
        total_months = (end_date.year - start_date.year) * 12 + (end_date.month - start_date.month) + 1
        monthly_amount = obligation.allocated_amount / total_months if total_months > 0 else 0

        current_date = start_date
        while current_date <= end_date:
            next_month = self._add_months(current_date, 1)
            period_end = next_month - timedelta(days=1)
            if period_end > end_date:
                period_end = end_date

            revenue_entry = RevenueScheduleModel(
                contract_id=self.contract_data["contract_id"],
                obligation_name=obligation.name,
                period_start=current_date,
                period_end=period_end,
                amount=round(monthly_amount, 2),
                recognition_method=obligation.recognition_method,
                status="recognized" if current_date <= date.today() else "deferred",
                created_at=datetime.now()
            )
            self.revenue_schedule.append(revenue_entry)

            # Move to next month
            current_date = next_month
            
    
    def _generate_quarterly_schedule(self, obligation: PerformanceObligationModel, start_date: date, end_date: date) -> None:
        """Generate quarterly revenue schedule"""
        
        # Calculate total quarters between start and end date
        total_quarters = ((end_date.year - start_date.year) * 12 + (end_date.month - start_date.month)) // 3 + 1
        
        quarterly_amount = obligation.allocated_amount / total_quarters if total_quarters > 0 else 0
        
        current_date = start_date
        while current_date <= end_date:
            quarter_end = self._get_quarter_end(current_date)
            if quarter_end > end_date:
                quarter_end = end_date
                
            revenue_entry = RevenueScheduleModel(
                contract_id=self.contract_data["contract_id"],
                obligation_name=obligation.name,
                period_start=current_date,
                period_end=quarter_end,
                amount=round(quarterly_amount, 2),
                recognition_method=obligation.recognition_method,
                status="recognized" if current_date <= date.today() else "deferred",
                created_at=datetime.now()
            )
            
            self.revenue_schedule.append(revenue_entry)
            
            # Move to next quarter
            current_date = self._get_next_quarter_start(current_date)
            
    
    def _generate_yearly_schedule(self, obligation: PerformanceObligationModel, start_date: date, end_date: date) -> None:
        """Generate yearly revenue schedule"""
        total_years = (end_date.year - start_date.year) + 1
        yearly_amount = obligation.allocated_amount / total_years if total_years > 0 else 0
        
        current_date = start_date
        while current_date <= end_date:
            year_end = current_date.replace(month=12, day=31)
            if year_end > end_date:
                year_end = end_date
                
            revenue_entry = RevenueScheduleModel(
                contract_id=self.contract_data["contract_id"],
                obligation_name=obligation.name,
                period_start=current_date,
                period_end=year_end,
                amount=round(yearly_amount, 2),
                recognition_method=obligation.recognition_method,
                status="recognized" if current_date <= date.today() else "deferred",
                created_at=datetime.now()
            )    
            self.revenue_schedule.append(revenue_entry)
            
            # Move to next year
            current_date = current_date.replace(year=current_date.year + 1)
    
    def _generate_custom_interval_schedule(self, obligation: PerformanceObligationModel, start_date: date, end_date: date, frequency: str) -> None:
        """Generate custom interval revenue schedule"""
        
        # Parse frequency like "every_3_months"
        parts = frequency.split('_')
        if len(parts) >= 3 and parts[0] == "every" and parts[2] == "months":
            interval_months = int(parts[1])
            
        # Calculate total periods
        total_months = (end_date.year - start_date.year) * 12 + (end_date.month - start_date.month) + 1
        total_periods = total_months // interval_months if interval_months > 0 else 0
        period_amount = obligation.allocated_amount / total_periods if total_periods > 0 else 0
        
        current_date = start_date
        while current_date <= end_date:
            # Calculate period end
            period_end = self._add_months(current_date, interval_months) - timedelta(days=1)
            if period_end > end_date:
                period_end = end_date
                
            revenue_entry = RevenueScheduleModel(
                contract_id=self.contract_data["contract_id"],
                obligation_name=obligation.name,
                period_start=current_date,
                period_end=period_end,
                amount=round(period_amount, 2),
                recognition_method="over_time",
                status="recognized" if current_date <= date.today() else "deferred",
                created_at=datetime.now()
            )
            self.revenue_schedule.append(revenue_entry)
            
            # Move to next period
            current_date = self._add_months(current_date, interval_months)
            
    def _get_next_quarter_start(self, date_obj: date) -> date:
        """Get the start date of the next quarter"""
        quarter = (date_obj.month - 1) // 3 + 1
        if quarter == 1:
            return date_obj.replace(month=4, day=1)
        elif quarter == 2:
            return date_obj.replace(month=7, day=1)
        elif quarter == 3:
            return date_obj.replace(month=10, day=1)
        else:
            return date_obj.replace(year=date_obj.year + 1, month=1, day=1)
    
    def _get_quarter_end(self, date_obj: date) -> date:
        """Get the end date of the quarter for a given date"""
        quarter = (date_obj.month - 1) // 3 + 1
        if quarter == 1:
            return date_obj.replace(month=3, day=31)
        elif quarter == 2:
            return date_obj.replace(month=6, day=30)
        elif quarter == 3:
            return date_obj.replace(month=9, day=30)
        else:
            return date_obj.replace(month=12, day=31)
    
    def _add_months(self, date_obj: date, months: int) -> date:
        """Add specified number of months to a date using calendar to clamp day."""
        month_index = date_obj.month - 1 + months
        year = date_obj.year + month_index // 12
        month = month_index % 12 + 1
        last_day = calendar.monthrange(year, month)[1]
        day = min(date_obj.day, last_day)
        return date(year, month, day)