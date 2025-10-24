
import re
from typing import List


RELEVANT_KEYWORDS = [

    # Who, When, Duration
    "Agreement", "Effective Date", "Commencement", "Start Date",
    "Term", "Renewal", "Expiration", "Termination", "Contract ID", "Agreement ID", "Extension", "Parties", "Contract Period", "Initial Term", "Renewal Term",

    # What is Promised
    "Scope", "Deliverables", "Obligations", "Performance Obligation",
    "Implementation", "Integration", "Support", "Maintenance", "Training",
    "Workshop", "Certification", "Add-On", "Module", "Feature",
    "Service", "SaaS License", "Subscription", "Access Rights",
    "Post-Contract Support", "Renewal Support", "Milestone", "Go-Live",
    "Acceptance", "Deployment", "Installation", "Configuration",

    # How Much
    "Pricing", "Fees", "Charges", "Consideration", "Compensation",
    "Payment", "Payment Terms", "Billing", "Invoice", "Invoicing",
    "Schedule of Payments", "Installments", "Advance Payment",
    "Discount", "Rebate", "Variable Consideration", "Service Credit",
    "Credit", "Refund", "Taxes", "Tax", "Taxation",
    "Adjustments", "Adjustment", "Overages", "Usage-Based Fees",
    "Deferred Payment", "Early Termination Fee",

    # How Price is Distributed
    "Allocation", "Standalone Selling Price", "SSP", "Schedule A",
    "Schedule B", "Schedule C", "Schedule D", "Contract Value", "Transaction Price",
    "Consideration Allocation", "Revenue Schedule", "Revenue Allocation",
    "Deferred Revenue", "Fair Value Allocation", "Reallocation",
    "Multiple Element Arrangement", "Price Allocation",

    # When Revenue is Recognized
    "Revenue Recognition", "Recognition", "Recognition Basis",
    "Timing of Revenue", "Transfer of Control", "Milestone Completion",
    "Over Time", "Point in Time", "ASC 606", "Revenue Pattern",
    "Recognition Schedule", "Recognition Criteria", "Recognition Method",

    # Additional Supporting Elements
    "Addendum", "Contract Modification", "Change Order",
    "Statement of Work", "SOW", "Financial Reporting",
    "Accounting", "Audit", "Audit Trail", "Deferred Revenue Disclosure"
]

# Date Pattern
# Match date formats like:
# - January 1, 2025
# - Jan 1 2025
# - 01/01/2025
# - 2025-01-01
# - Effective Date: ...

DATE_PATTERN = re.compile(
    r'\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|'
    r'May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|'
    r'Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)[\s\-.,]*\d{1,2}(?:st|nd|rd|th)?[\s,]*(\d{4})?\b'
    r'|\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b'
    r'|\b\d{4}-\d{2}-\d{2}\b',
    flags=re.IGNORECASE
)

# Money Pattern
# Match currency / money formats like:
# - $50,000
# - USD 365000
# - INR 2,50,000
# - ₹25,000
MONEY_PATTERN = re.compile(
    r'(\$|USD|US\$|INR|₹|EUR|€|GBP|£|AUD|A\$|CAD|C\$|CHF|₣|JPY|¥|RUB|₽|SEK|kr|NOK|MXN|NZD)\s?[\d,]+(?:\.\d+)?',
    flags=re.IGNORECASE
)


def clean_text(text: str) -> str:
    """
    Clean and normalize contract text for better processing.
    """
    
    # Remove page numbers and headers
    text = re.sub(r'Page \d+ of \d+', '', text)
    text = re.sub(r'^\d+\s*$', '', text, flags=re.MULTILINE) 
    
    text = re.sub(r'([a-z])([A-Z])', r'\1 \2', text)  # Add space between camelCase
    text = re.sub(r'([a-z])(\d)', r'\1 \2', text)     # Add space between letters and numbers
    text = re.sub(r'(\d)([A-Z])', r'\1 \2', text)     # Add space between numbers and letters
    
    # Normalize whitespace
    text = re.sub(r'\n+', '\n', text)                 # Multiple newlines to single
    text = re.sub(r'[ \t]+', ' ', text)               # Multiple spaces/tabs to single space
    text = re.sub(r'\n ', '\n', text)                 # Remove leading spaces from lines
    text = re.sub(r' \n', '\n', text)                 # Remove trailing spaces from lines
    
    # Clean up common PDF artifacts
    text = re.sub(r'[^\x00-\x7F]+', ' ', text)        # Remove non-ASCII characters
    text = re.sub(r'[^\w\s\.\,\;\:\!\?\-\(\)\$\%]', ' ', text)  # Keep only common punctuation
    
    return text.strip()
    
def split_sections(text: str) -> List[dict]:
    """
    Splits the contract text into structured sections with titles.
    Handles both markdown-style headers and numbered sections.
    """

    # Pattern to match various section formats:
    # 1. Numbered sections: "1. Parties", "2. Purpose and Overview", etc.
    # 2. Markdown headers: "## Section Name"
    # 3. All-caps headers: "SCOPE OF DELIVERABLES"
    # 4. Section headers: "SECTION 1: Title"
    pattern = r'(?m)^(?:#{1,6}\s*\**\s*)?(?:\d+(?:\.\d+)*\.\s+[A-Za-z].*|SECTION\s+\d+[:\.\-]\s+[A-Z].*|[A-Z][A-Z\s,&\-()]+[:\.]?\s*$|Schedule\s+[A-Z][:\.\-]?\s*[A-Z].*)'
    matches = list(re.finditer(pattern, text))
    sections = []

    for i, match in enumerate(matches):
        start = match.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        title = match.group().strip()
        content = text[start:end].strip()
        
        if len(content) > 50:
            sections.append({"title": title, "content": content})

    return sections



def filter_relevant_sections(sections: List[dict]) -> List[dict]:
    """
    Include only relevant sections.
    """

    relevant_sections = []
    for sec in sections:
        title = sec["title"]
        content = sec["content"]
        
        combined_content = f"{title}\n{content}"
        
        sec_lower = combined_content.lower()
        has_keyword = any(k.lower() in sec_lower for k in RELEVANT_KEYWORDS)
        has_date = bool(DATE_PATTERN.search(combined_content))
        has_money = bool(MONEY_PATTERN.search(combined_content))
        if has_keyword or has_date or has_money:
            relevant_sections.append(combined_content)
    return relevant_sections