"""
This module is responsible for processing different file types and extracting data from them.
"""

import io
from typing import Tuple
import pdfplumber
from fastapi import HTTPException
import docx2txt
from bs4 import BeautifulSoup
import re

class FileProcessor:
    SUPPORTED_FILE_TYPES = ["pdf", "docx", "txt", "md", "html"]
    
    @staticmethod
    def extract_text(file_bytes: bytes, filename: str, content_type: str) -> Tuple[str, dict]:
        """
        Extract text from the files.
        """
        
        extension = filename.split(".")[-1].lower()
        
        if extension not in FileProcessor.SUPPORTED_FILE_TYPES:
            raise HTTPException(status_code=400, detail=f"Unsupported file type: .{extension}")
        
        try:
            if extension == "pdf":
                text = FileProcessor._extract_pdf(file_bytes)
            elif extension == "docx":
                text = FileProcessor._extract_docx(file_bytes)
            elif extension in ["txt", "md"]:
                text = FileProcessor._extract_text_or_markdown(file_bytes, extension)
            elif extension == "html":
                text = FileProcessor._extract_html(file_bytes)
            else:
                raise HTTPException(status_code=400, detail=f"Unsupported file type: .{extension}")
            
            file_info = {
                "filename": filename,
                "content_type": content_type,
                "size_in_kb": round(len(file_bytes) / 1024, 2),
                "line_count": len(text.splitlines()),
                "character_count": len(text),
                "word_count": len(text.split()),
                "file_extension": extension
            }
            
            return text.strip(), file_info
                
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to extract text from {extension.upper()} file: {str(e)}")
        
        
    @staticmethod
    def _extract_pdf(file_bytes: bytes) -> str:
        """Extract text from PDF file using pdfplumber."""
        try:
            text = ""
            with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
            return text
        except Exception as e:
            raise Exception(f"PDF extraction failed: {str(e)}")
    
    @staticmethod
    def _extract_docx(file_bytes: bytes) -> str:
        """Extract text from DOCX file using docx2txt."""
        try:
            temp_io = io.BytesIO(file_bytes)
            text = docx2txt.process(temp_io)
            return text or ""
        except Exception as e:
            raise Exception(f"DOCX extraction failed: {str(e)}")
    
    @staticmethod
    def _extract_html(file_bytes: bytes) -> str:
        """Extract text from HTML file."""
        try:
            html_content = file_bytes.decode("utf-8", errors="ignore")
            soup = BeautifulSoup(html_content, "html.parser")
            return soup.get_text(separator="\n")
        except Exception as e:
            raise Exception(f"HTML extraction failed: {str(e)}")
    
    
    @staticmethod
    def _extract_text_or_markdown(file_bytes: bytes, extension: str) -> str:
        """Extract text from TXT or MD files."""
        try:
            text = file_bytes.decode("utf-8", errors="ignore")
            
            if extension == "md":
                # Remove markdown symbols
                text = re.sub(r"#+\s", "", text)               # headings (#, ##)
                text = re.sub(r"\*\*(.*?)\*\*", r"\1", text)   # bold
                text = re.sub(r"\*(.*?)\*", r"\1", text)       # italics
                text = re.sub(r"`(.*?)`", r"\1", text)         # inline code
                text = re.sub(r"!\[.*?\]\(.*?\)", "", text)    # images
                text = re.sub(r"\[.*?\]\(.*?\)", "", text)     # links
                text = re.sub(r"^-{3,}\n", "", text)           # markdown code fences
                text = re.sub(r"^-{3,}\n", "", text)           # markdown code fences  
            return text
        except Exception as e:
            raise Exception(f"Text/Markdown extraction failed: {str(e)}")