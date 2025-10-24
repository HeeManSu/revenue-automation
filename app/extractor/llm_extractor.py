import os
import json
import re
import time
import google.generativeai as genai
from app.extractor.preprocess import clean_text, filter_relevant_sections, split_sections
from app.extractor.prompts import get_revenue_recognition_prompt
from app.extractor.schemas import ContractLLMResponseJsonSchema


def extract_contract_data(raw_text: str, contract_id: str, llm_model="gemini-2.5-flash") -> ContractLLMResponseJsonSchema:
    """Extract structured contract data using Gemini LLM and validate with Pydantic."""
    
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY environment variable is required")
    
    genai.configure(api_key=api_key)
    
    cleaned = clean_text(raw_text)
    sections = split_sections(cleaned)
    relevant_sections = filter_relevant_sections(sections)
    context = "\n\n".join(relevant_sections)
    
    prompt = get_revenue_recognition_prompt(context)
    
    model = genai.GenerativeModel(llm_model)
    generation_config = genai.types.GenerationConfig(
        temperature=0,
        max_output_tokens=16384,
    )
    
    max_retries = 3
    backoff_factor = 2
    error = None
    
    for attempt in range(1, max_retries + 1):
        try:
            response = model.generate_content(
                prompt,
                generation_config=generation_config
            )
            
            print(f"Response: {response}")
            text_output = response.candidates[0].content.parts[0].text.strip()
            
            match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text_output, re.DOTALL)
            response_json = match.group(1).strip() if match else text_output.strip()
            json_output = json.loads(response_json)
            
            validated = ContractLLMResponseJsonSchema(**json_output)
            return validated
        
        except Exception as e:
            error = e
            if attempt < max_retries:
                sleep_time = backoff_factor ** (attempt - 1)
                time.sleep(sleep_time)

    raise ValueError(f"Failed to extract valid JSON after {max_retries} attempts. Last error: {error}")
