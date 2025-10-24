import json
from app.extractor.schemas import ContractLLMResponseJsonSchema, OverTimePerformanceObligation, PointInTimePerformanceObligation, Discount, RecognitionPeriod, Milestone

def get_revenue_recognition_prompt(contract_text: str) -> str:
    """Generate prompt for revenue recognition"""
    
    contract_schema = ContractLLMResponseJsonSchema.model_json_schema()

    supporting_schemas = {
        "OverTimePerformanceObligation": OverTimePerformanceObligation.model_json_schema(),
        "PointInTimePerformanceObligation": PointInTimePerformanceObligation.model_json_schema(),
        "Discount": Discount.model_json_schema(),
        "RecognitionPeriod": RecognitionPeriod.model_json_schema(),
        "Milestone": Milestone.model_json_schema(),
    }
    
    
    return f"""
    You are a financial contract analyst specializing in ASC 606 revenue recognition.
    
    Extract contract data and return it as valid JSON matching this EXACT schema:
    {json.dumps(contract_schema, indent=2)}
    
    Input contract text:
    {contract_text}
    
    CRITICAL RULES:
    - Return only valid JSON matching the schema above
    - Use exact field names and types from schema
    - Dates must be YYYY-MM-DD format
    - Numbers must be actual numbers, not strings
    - Use null for missing optional fields
    - There can be only two types of performance obligations: over_time and point_in_time
    - There can be only two types of discounts: global and obligation_specific
    - If the revenue recognition is not monthly, quarterly or yearly, it should be in the format of "every_<number_of_days>"
    - If you cannot find specific information in the contract text, use "NOT_PROVIDED" as the value, not null
    """
    