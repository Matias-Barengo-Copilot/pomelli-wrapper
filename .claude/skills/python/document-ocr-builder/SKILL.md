---
name: document-ocr-builder
description: Build document OCR and classification pipelines for extracting structured data from PDFs, scans, and images. Use when processing invoices, resumes, contracts, forms, or technical drawings. Covers OCR engines (Tesseract, Google Vision, AWS Textract, Gemini Vision), document classification, multi-page handling, text extraction, table parsing, entity recognition. Hybrid OCR with LLM fallback. Based on CoPilot proven patterns. Triggers on OCR, document processing, PDF extraction, text extraction, document classification, invoice parsing, resume parsing, scan processing, document OCR.
allowed-tools: Read, Write, Edit, Bash(pip *), Bash(git *)
---

# Document OCR & Classification Pipeline Builder

Build production-ready document processing pipelines that extract, classify, and structure data from PDFs, images, and scanned documents.

## When to use this skill

Use this skill when you need to:
- Extract structured data from PDFs, scans, or images (invoices, resumes, contracts, drawings)
- Classify documents into categories (drawings vs specs, invoice types, document categories)
- Build OCR pipelines that handle multi-page documents, rotated scans, or handwritten text
- Process documents at scale with quality validation and error recovery
- Integrate document processing into existing workflows (Google Drive, S3, SharePoint)

## What this skill will do

This skill guides you through building a complete document OCR/classification system by:

1. **Gathering requirements** through targeted questions about your document types, volume, and accuracy needs
2. **Recommending architecture** based on CoPilot Innovations' proven patterns from real production systems
3. **Scaffolding the pipeline** with preprocessing, OCR, classification, validation, and storage components
4. **Implementing quality checks** for handling unclear scans, multi-page documents, and edge cases
5. **Setting up testing** with sample documents and accuracy metrics

## Discovery Questions

### Document Types & Sources

1. **What types of documents will you process?**
   - PDFs (native text, scanned, or mixed)?
   - Images (PNG, JPG, TIFF)?
   - Specific formats (invoices, resumes, contracts, technical drawings, forms)?
   - Multi-page documents or single pages?

2. **Where do documents come from?**
   - File uploads (web, API)?
   - Cloud storage (Google Drive, S3, SharePoint, Dropbox)?
   - Email attachments?
   - Database/existing system?

3. **What is your document volume?**
   - Documents per day/hour?
   - Peak load requirements?
   - Average file size and page count?
   - Real-time processing or batch acceptable?

### Extraction & Classification Requirements

4. **What data needs to be extracted?**
   - Structured fields (dates, names, amounts, addresses)?
   - Tables and tabular data?
   - Full text content?
   - Specific sections or regions?
   - Handwritten vs printed text?

5. **Do documents need classification?**
   - Binary classification (e.g., drawing vs specification)?
   - Multi-class (invoice types, document categories)?
   - Confidence scoring required?
   - Human review workflow for low-confidence results?

6. **What accuracy level is required?**
   - Mission-critical (99%+ accuracy)?
   - Business-critical (95-98%)?
   - Best-effort extraction acceptable?
   - Tolerance for manual review/correction?

### Quality & Edge Cases

7. **What quality issues might occur?**
   - Low-resolution scans or photos?
   - Rotated or skewed documents?
   - Handwritten annotations on printed documents?
   - Multi-column layouts or complex tables?
   - Documents with stamps, signatures, or markings?

8. **How should errors be handled?**
   - Retry failed extractions?
   - Flag for human review?
   - Fallback OCR engines?
   - Partial extraction acceptable?

9. **Are there multi-page considerations?**
   - Extract data from specific pages only?
   - Aggregate data across all pages?
   - Handle documents with varying page counts?
   - Split multi-document PDFs?

### Output & Integration

10. **What output format is needed?**
    - JSON structured data?
    - Database records (PostgreSQL, MongoDB)?
    - CSV/Excel exports?
    - Integration with existing API/system?

11. **What metadata should be tracked?**
    - Processing timestamps?
    - Confidence scores per field?
    - OCR engine used?
    - Processing duration and status?
    - Audit trail for compliance?

### Technical & Operational

12. **What is your deployment environment?**
    - Cloud (AWS, GCP, Azure) or on-premise?
    - Containerized (Docker) deployment?
    - GPU available for processing?
    - Operating system constraints?

13. **What are your budget constraints?**
    - Free/open-source only?
    - Commercial API acceptable (Google Vision, AWS Textract, OpenAI)?
    - Cost per document budget?
    - Processing time vs cost tradeoffs?

14. **Are there security/compliance requirements?**
    - PII/PHI data handling?
    - Data residency requirements?
    - Encryption in transit and at rest?
    - Audit logging required?

15. **What existing systems integrate with this pipeline?**
    - Upstream systems (document sources)?
    - Downstream systems (data consumers)?
    - Authentication mechanisms?
    - API specifications?

16. **How will the system be monitored and maintained?**
    - Logging and alerting requirements?
    - Metrics to track (throughput, accuracy, errors)?
    - Human review dashboard needed?
    - Reprocessing/correction workflow?

## CoPilot Innovations Proven Patterns

Based on analysis of production systems (OGI Document Classifier, Halo Title OCR, Resume Parser), here are battle-tested patterns:

### Pattern 1: Hybrid OCR with LLM Fallback

**When to use:** High-accuracy requirements with complex documents

**Implementation:**
```python
import asyncio
from google import genai
from mistralai import Mistral
from tenacity import AsyncRetrying, stop_after_attempt, wait_exponential

class HybridOCR:
    """Primary OCR with automatic fallback to alternative engines."""

    def __init__(self, gemini_key: str, mistral_key: str):
        self.gemini_client = genai.Client(api_key=gemini_key)
        self.mistral_client = Mistral(api_key=mistral_key)

    async def extract_with_fallback(self, pdf_bytes: bytes, prompt: str, schema) -> dict:
        """
        Try Gemini first (best for structured extraction), fall back to Mistral.
        Pattern from: halo-title-ocr/llm.py
        """
        # Attempt 1: Gemini with retries
        try:
            pdf_part = types.Part(inline_data=types.Blob(
                mime_type="application/pdf",
                data=pdf_bytes
            ))

            retryer = AsyncRetrying(
                stop=stop_after_attempt(3),
                wait=wait_exponential(multiplier=1, min=2, max=10)
            )

            response = await retryer(
                asyncio.to_thread,
                self.gemini_client.models.generate_content,
                model="gemini-2.5-pro",
                contents=[pdf_part, prompt],
                config={
                    "response_mime_type": "application/json",
                    "response_schema": schema
                }
            )
            return response.parsed

        except Exception as e:
            print(f"Gemini failed: {e}")

        # Attempt 2: Mistral fallback
        try:
            messages = [{
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "document_url",
                        "document_url": f"data:application/pdf;base64,{base64.b64encode(pdf_bytes).decode()}"
                    }
                ]
            }]

            response = await asyncio.to_thread(
                self.mistral_client.chat.complete,
                model="mistral-large-latest",
                messages=messages,
                response_format={"type": "json_object"}
            )

            result = json.loads(response.choices[0].message.content)
            # Handle empty strings for integer fields
            if isinstance(result, list) and len(result) > 0:
                result = result[0]
            return schema.model_validate(result)

        except Exception as e:
            raise Exception(f"All OCR attempts failed: {e}")
```

**Key benefits:**
- Automatic retry with exponential backoff
- Graceful degradation to alternative engine
- Structured JSON output enforced by schema
- Handles edge cases (empty strings, list responses)

### Pattern 2: Multi-Method Classification with Confidence Scoring

**When to use:** Binary or multi-class document classification

**Implementation:**
```python
import fitz  # PyMuPDF
import re
from typing import Dict

class DocumentClassifier:
    """
    Multi-method classifier combining metadata, visual, text, and dimension analysis.
    Pattern from: OGI-Document-Spec-Classifier/services/classifier.py
    """

    def classify_document(self, pdf_path: str) -> Dict[str, Any]:
        """Classify using weighted scoring across multiple methods."""

        scores = {
            'metadata': 0.0,
            'visual_density': 0.0,
            'text_heuristic': 0.0,
            'dimension_analysis': 0.0,
            'filename': 0.0
        }

        doc = fitz.open(pdf_path)
        metadata = doc.metadata or {}

        # Method 1: Metadata early exit (fastest)
        creator = (metadata.get("creator") or "").lower()
        if any(term in creator for term in ["autocad", "revit", "cad"]):
            return {
                'classification': 'drawing',
                'confidence': 1.0,
                'reasoning': f"Direct CAD export detected: {creator}"
            }

        # Method 2: Visual density (strongest signal)
        scores['visual_density'] = self._analyze_visual_density(doc)
        if scores['visual_density'] >= 0.9:
            return {
                'classification': 'drawing',
                'confidence': 1.0,
                'reasoning': "High density of vector graphics detected (>500 paths)"
            }

        # Method 3: Dimension analysis
        scores['dimension_analysis'] = self._analyze_dimensions(doc)

        # Method 4: Filename
        scores['filename'] = self._analyze_filename(pdf_path)

        # Method 5: Text analysis (most expensive, run last)
        scores['text_heuristic'] = self._analyze_text(doc)

        doc.close()

        # Weighted composite score
        weights = {
            'metadata': 0.05,
            'visual_density': 0.40,
            'text_heuristic': 0.25,
            'dimension_analysis': 0.15,
            'filename': 0.15
        }

        final_score = sum(scores[k] * weights[k] for k in scores)

        if final_score >= 0.20:
            classification = 'drawing'
            confidence = min(final_score, 1.0)
        else:
            classification = 'specification'
            confidence = min(abs(final_score), 1.0)

        return {
            'classification': classification,
            'confidence': confidence,
            'methods': scores,
            'reasoning': self._generate_reasoning(scores, classification)
        }

    def _analyze_visual_density(self, doc: fitz.Document) -> float:
        """Analyze graphics-to-text ratio."""
        page = doc.load_page(0)
        paths = page.get_drawings()
        images = page.get_images()
        text_blocks = page.get_text("blocks")

        page_area = page.rect.width * page.rect.height
        text_area = sum((b[2] - b[0]) * (b[3] - b[1]) for b in text_blocks)
        text_density = text_area / page_area if page_area > 0 else 0

        # High vector count = definitive drawing
        if len(paths) > 500:
            return 1.0
        elif len(paths) > 50:
            return 0.6 if text_density < 0.15 else -0.5
        elif text_density > 0.25:
            return -0.8
        return 0.0

    def _analyze_dimensions(self, doc: fitz.Document) -> float:
        """Check for standard drawing sizes (landscape, large format)."""
        page = doc.load_page(0)
        width_in = page.rect.width / 72
        height_in = page.rect.height / 72

        # Standard drawing sizes (Arch D, C, B, etc.)
        drawing_sizes = [(24, 36), (36, 24), (18, 24), (24, 18)]
        for dw, dh in drawing_sizes:
            if abs(width_in - dw) < 2 and abs(height_in - dh) < 2:
                return 0.8

        aspect_ratio = width_in / height_in
        if aspect_ratio > 1.3:  # Landscape
            return 0.5
        elif 0.7 < aspect_ratio < 0.8:  # Letter/A4 portrait
            return -0.5
        return 0.0

    def _analyze_filename(self, filename: str) -> float:
        """Extract signals from filename."""
        filename = filename.lower()

        drawing_terms = ['drawing', 'plan', 'dwg', 'cad', 'blueprint']
        spec_terms = ['spec', 'specification', 'report', 'manual', 'scope']

        score = 0.0
        score += 0.2 * sum(1 for term in drawing_terms if term in filename)
        score -= 0.2 * sum(1 for term in spec_terms if term in filename)

        return max(min(score, 1.0), -1.0)

    def _analyze_text(self, doc: fitz.Document) -> float:
        """Keyword analysis across first few pages."""
        text = ""
        for i in range(min(3, len(doc))):
            text += doc.load_page(i).get_text().lower()

        drawing_keywords = {'scale', 'elevation', 'section', 'detail', 'sheet'}
        spec_keywords = {'specification', 'requirements', 'scope', 'shall'}

        drawing_count = sum(1 for kw in drawing_keywords if kw in text)
        spec_count = sum(1 for kw in spec_keywords if kw in text)

        total = drawing_count + spec_count
        if total == 0:
            return 0.0
        return (drawing_count - spec_count) / total

    def _generate_reasoning(self, scores: dict, classification: str) -> str:
        """Generate human-readable explanation."""
        reasons = []
        if scores['visual_density'] > 0.6:
            reasons.append("dense technical line work")
        if scores['dimension_analysis'] > 0.5:
            reasons.append("large-format blueprint dimensions")
        if scores['text_heuristic'] > 0.3:
            reasons.append("drawing terminology (Scale, Sheet No.)")

        if reasons:
            return f"Classified as {classification}: {', '.join(reasons)}"
        return f"Classified as {classification} based on composite scoring"
```

**Key benefits:**
- Early exit optimizations (check fast signals first)
- Weighted scoring prevents single-method bias
- Human-readable reasoning for debugging
- Handles ambiguous documents gracefully

### Pattern 3: Concurrent Document Processing with Rate Limiting

**When to use:** Batch processing with API rate limits

**Implementation:**
```python
import threading
import time
import random
from concurrent.futures import ThreadPoolExecutor
from openai import OpenAI

class RateLimitedProcessor:
    """
    Process multiple documents concurrently while respecting API limits.
    Pattern from: resume-parser/functions.py
    """

    MAX_CONCURRENT_REQUESTS = 2  # Adjust based on your API tier
    MAX_RETRIES = 6
    MAX_BACKOFF_SECONDS = 60

    def __init__(self, api_key: str):
        self.client = OpenAI(api_key=api_key)
        self.semaphore = threading.Semaphore(self.MAX_CONCURRENT_REQUESTS)

    def process_with_backoff(self, document_path: str, prompt: str) -> dict:
        """Process single document with exponential backoff on rate limits."""

        self.semaphore.acquire()
        try:
            backoff = 1.0

            for attempt in range(1, self.MAX_RETRIES + 1):
                try:
                    response = self.client.chat.completions.create(
                        model="gpt-4o",
                        messages=[
                            {"role": "system", "content": "You are a document processor."},
                            {"role": "user", "content": prompt}
                        ],
                        response_format={"type": "json_object"},
                        max_tokens=500
                    )
                    return json.loads(response.choices[0].message.content)

                except openai.RateLimitError:
                    if attempt == self.MAX_RETRIES:
                        raise

                    sleep_for = min(backoff, self.MAX_BACKOFF_SECONDS) + random.uniform(0, 1)
                    print(f"Rate limit hit (attempt {attempt}/{self.MAX_RETRIES}). "
                          f"Sleeping {sleep_for:.2f}s...")
                    time.sleep(sleep_for)
                    backoff = min(backoff * 2, self.MAX_BACKOFF_SECONDS)
        finally:
            self.semaphore.release()

    def process_batch(self, documents: list[str], prompt_template: str) -> list[dict]:
        """Process multiple documents in parallel with rate limiting."""

        max_workers = min(4, len(documents))

        def process_single(doc_path):
            try:
                return self.process_with_backoff(doc_path, prompt_template)
            except Exception as e:
                return {"error": str(e), "document": doc_path}

        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            results = list(executor.map(process_single, documents))

        return results
```

**Key benefits:**
- Semaphore prevents exceeding concurrent request limits
- Exponential backoff with jitter for rate limit errors
- Thread pool enables parallel processing without overwhelming APIs
- Graceful error handling per document

### Pattern 4: Empty & Invalid Document Detection

**When to use:** Prevent wasted processing on problematic files

**Implementation:**
```python
from pypdf import PdfReader
import pathlib

def is_pdf_empty(pdf_file: pathlib.Path) -> bool:
    """
    Detect empty or invalid PDFs before expensive OCR.
    Pattern from: halo-title-ocr/main.py
    """
    try:
        # Check file size first
        file_size = pdf_file.stat().st_size
        if file_size < 100:  # Minimal PDF structure needs ~100 bytes
            return True

        reader = PdfReader(pdf_file)

        # Check for pages
        if len(reader.pages) == 0:
            return True

        # Check if all pages are empty
        has_content = False
        for page in reader.pages:
            text = page.extract_text()
            if text and text.strip():
                has_content = True
                break

        return not has_content

    except Exception as e:
        print(f"Could not validate PDF: {e}")
        return False  # Let main processing handle the error

def validate_pdf_before_processing(pdf_path: str) -> dict:
    """Pre-flight validation with detailed error messages."""

    if not os.path.exists(pdf_path):
        return {"valid": False, "error": "File not found"}

    if is_pdf_empty(pathlib.Path(pdf_path)):
        return {"valid": False, "error": "Empty PDF (no extractable content)"}

    # Check PDF magic bytes
    with open(pdf_path, 'rb') as f:
        header = f.read(4)
        if header != b'%PDF':
            return {"valid": False, "error": "Not a valid PDF file"}

    return {"valid": True}
```

**Key benefits:**
- Fast pre-validation saves API costs
- Detailed error messages for debugging
- Prevents downstream errors from invalid inputs

### Pattern 5: Multi-Source Document Fetching with Error Recovery

**When to use:** Documents from various cloud sources (Google Drive, Dropbox, S3)

**Implementation:**
```python
import requests
from io import BytesIO

class DocumentFetcher:
    """
    Unified document fetcher for multiple cloud sources.
    Pattern from: resume-parser/functions.py
    """

    def fetch_document(self, url: str, timeout: int = 10) -> BytesIO:
        """Fetch document from URL with automatic source detection."""

        # Google Drive URL normalization
        if "drive.google.com" in url:
            file_id = self._extract_google_drive_id(url)
            if not file_id:
                raise ValueError("Could not extract Google Drive file ID")
            direct_url = f"https://drive.usercontent.google.com/download?id={file_id}&export=download&confirm=t"

        # Dropbox URL normalization
        elif "dropbox.com" in url:
            direct_url = url.replace("www.dropbox.com", "dl.dropboxusercontent.com")
            if "?dl=0" in direct_url:
                direct_url = direct_url.replace("?dl=0", "?dl=1")
            elif "?dl=1" not in direct_url:
                direct_url += "?dl=1"

        else:
            direct_url = url

        # Fetch with validation
        try:
            response = requests.get(direct_url, timeout=timeout)

            if response.status_code == 404:
                if "drive.usercontent.google.com" in direct_url:
                    raise ValueError("Google Drive file not accessible. Verify sharing settings (anyone with link can view).")
                raise ValueError("File not found (404)")

            response.raise_for_status()

            # Validate content type
            content_type = response.headers.get('Content-Type', '').lower()
            if 'pdf' not in content_type and response.content[:4] != b'%PDF':
                raise ValueError(f"URL does not contain a PDF. Content-Type: {content_type}")

            return BytesIO(response.content)

        except requests.exceptions.Timeout:
            raise ValueError(f"Request timed out after {timeout}s. File may be too large.")
        except requests.exceptions.RequestException as e:
            raise ValueError(f"Error downloading file: {e}")

    def _extract_google_drive_id(self, url: str) -> str:
        """Extract file ID from various Google Drive URL formats."""
        if "/file/d/" in url:
            return url.split('/file/d/')[1].split('/')[0]
        elif "id=" in url:
            return url.split('id=')[1].split('&')[0]
        return None
```

**Key benefits:**
- Automatic URL normalization for cloud providers
- Detailed error messages for common issues
- Content-type validation before processing
- Timeout handling for large files

### Pattern 6: Comprehensive Prompt Engineering for Structured Extraction

**When to use:** Complex structured data extraction from legal/technical documents

**Implementation:**
```python
# Pattern from: halo-title-ocr/prompt.py

EXTRACTION_PROMPT_TEMPLATE = """
You are an expert {document_type} analyst. Extract structured data with maximum precision.

## DOCUMENT CHARACTERISTICS
The document may contain:
- Scanned or handwritten text requiring careful OCR
- Tabular data with structured fields
- Multi-page documents with interconnected information
- Stamps, notations, and marginal notes

## EXTRACTION REQUIREMENTS

{field_definitions}

## OCR GUIDELINES
1. **Character disambiguation**: Distinguish 0 vs O, 1 vs I vs l, 5 vs S
2. **Date validation**: Month (01-12), Day (01-31), Year (1800-2099)
3. **Number precision**: For amounts, preserve exact decimals (do NOT round)
4. **Missing data**: Return null (not empty string) if field cannot be determined

## MULTI-PAGE PROCESSING
- Scan ALL pages of the document
- Aggregate related information across pages
- Stamps often appear on first or last page

## OUTPUT FORMAT
Return ONLY valid JSON matching this schema:
{json_schema}

## QUALITY CHECKLIST
Before returning, verify:
- All dates in {date_format} format
- Numeric fields contain only digits and decimal points
- All required keys present (even if null)
- No extra keys included
- Valid JSON syntax

Return ONLY the JSON - no explanatory text, no markdown blocks.
"""

def build_extraction_prompt(document_type: str, fields: dict, schema: str) -> str:
    """Build a comprehensive extraction prompt."""

    # Generate field definitions
    field_defs = []
    for field_name, config in fields.items():
        field_def = f"""
### {field_name}
- **Description**: {config['description']}
- **Format**: {config['format']}
- **Common locations**: {config['locations']}
- **Examples**: {', '.join(config['examples'])}
- **Return**: {config['return_type']} or null
"""
        field_defs.append(field_def)

    return EXTRACTION_PROMPT_TEMPLATE.format(
        document_type=document_type,
        field_definitions='\n'.join(field_defs),
        json_schema=schema,
        date_format="MM/DD/YYYY"
    )

# Example usage
fields = {
    "GRANTOR": {
        "description": "The party transferring rights (seller, lessor)",
        "format": "Complete legal names with middle initials",
        "locations": "Near 'Grantor:' label, signature blocks",
        "examples": ["John R. Murphy", "Mid Continent Land, Inc."],
        "return_type": "string"
    },
    "EFFECTIVE_DATE": {
        "description": "Date when agreement became legally effective",
        "format": "MM/DD/YYYY",
        "locations": "'effective date of', 'dated', 'executed on'",
        "examples": ["03/15/2024", "12/01/2023"],
        "return_type": "string (MM/DD/YYYY)"
    }
}
```

**Key benefits:**
- Explicit OCR disambiguation rules reduce errors
- Quality checklist embedded in prompt
- Field-specific location hints improve accuracy
- Strict output format enforcement

## Architecture Recommendations

Based on 2026 best practices and CoPilot patterns:

### Tier 1: Simple Pipeline (< 1000 docs/day, single doc type)

```
┌─────────────┐
│   Upload    │
│  /API/File  │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  Validation     │
│  - File type    │
│  - Size check   │
│  - Empty detect │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│   OCR Engine    │
│   (PaddleOCR    │
│    or Gemini)   │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Post-Process   │
│  - JSON parsing │
│  - Validation   │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Store Results  │
│  (JSON/DB)      │
└─────────────────┘
```

**Tech Stack:**
- Framework: FastAPI or Flask
- OCR: PaddleOCR (free, accurate) or Gemini API (best for structured extraction)
- Storage: PostgreSQL or JSON files
- Deployment: Single Docker container

**When to use:**
- Straightforward document types
- Low to moderate volume
- Simple deployment requirements

### Tier 2: Production Pipeline (1K-100K docs/day, multiple doc types)

```
┌────────────────────────────────────────────┐
│          Document Sources                   │
│  Google Drive | S3 | SharePoint | Upload   │
└───────────────┬────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────┐
│         Ingestion Service                    │
│  - URL normalization                         │
│  - Download & validation                     │
│  - Queue to processing                       │
└───────────────┬─────────────────────────────┘
                │
                ▼
        ┌───────────────┐
        │  Task Queue   │
        │  (Redis/RabbitMQ)
        └───────┬───────┘
                │
    ┌───────────┴───────────┐
    ▼                       ▼
┌──────────┐          ┌──────────┐
│ Worker 1 │   ...    │ Worker N │
│          │          │          │
│ 1. Classify         │ Parallel │
│ 2. Route to OCR     │ Processing
│ 3. Extract          │          │
│ 4. Validate         │          │
└────┬─────┘          └────┬─────┘
     │                     │
     └──────────┬──────────┘
                ▼
     ┌────────────────────┐
     │   Hybrid OCR       │
     │ Primary: Gemini    │
     │ Fallback: Mistral  │
     │ Local: PaddleOCR   │
     └──────┬─────────────┘
            │
            ▼
     ┌────────────────────┐
     │  Quality Gate      │
     │ - Confidence check │
     │ - Field validation │
     │ - Flag for review  │
     └──────┬─────────────┘
            │
      ┌─────┴─────┐
      ▼           ▼
┌──────────┐  ┌──────────┐
│ Database │  │  Review  │
│(Postgres)│  │  Queue   │
└──────────┘  └──────────┘
```

**Tech Stack:**
- API: FastAPI with async workers
- Classification: PyMuPDF + custom classifier
- OCR: Gemini (primary) + Mistral (fallback) + PaddleOCR (local)
- Queue: Redis or RabbitMQ
- Database: PostgreSQL with JSON fields
- Monitoring: Prometheus + Grafana
- Deployment: Docker Compose or Kubernetes

**When to use:**
- Multiple document types requiring classification
- High volume with SLA requirements
- Need for human review workflow
- Production reliability required

### Tier 3: Enterprise Pipeline (100K+ docs/day, multi-tenant)

```
┌──────────────────────────────────────────────────┐
│              Load Balancer / API Gateway          │
└────────────────────┬─────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
┌──────────────┐          ┌──────────────┐
│ Ingestion    │          │  Monitoring  │
│ Microservice │          │  & Metrics   │
└──────┬───────┘          └──────────────┘
       │
       ▼
┌──────────────────┐
│   Kafka / Kinesis│
│   Event Stream   │
└──────┬───────────┘
       │
       ├────────────────┬────────────────┐
       ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│Classification│  │    OCR       │  │ Post-Process │
│ Microservice │  │ Microservice │  │ Microservice │
│              │  │              │  │              │
│- GPU enabled │  │- GPU enabled │  │- Validation  │
│- AutoScale   │  │- Multi-engine│  │- Enrichment  │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       └────────┬────────┴─────────────────┘
                ▼
      ┌──────────────────┐
      │  Data Lake (S3)  │
      │  + Metadata DB   │
      └──────┬───────────┘
             │
      ┌──────┴──────┐
      ▼             ▼
┌──────────┐  ┌──────────┐
│Analytics │  │  Export  │
│Dashboard │  │  APIs    │
└──────────┘  └──────────┘
```

**Tech Stack:**
- Orchestration: Kubernetes (EKS/GKE/AKS)
- Event Streaming: Kafka or AWS Kinesis
- Microservices: FastAPI or Go services
- OCR: Multi-cloud (AWS Textract, GCP Document AI, Azure Form Recognizer)
- Storage: S3/GCS + PostgreSQL + Redis
- Monitoring: ELK stack + Prometheus + Grafana
- ML Ops: MLflow for model versioning

**When to use:**
- Enterprise scale (millions of documents)
- Multi-tenant requirements
- 99.9%+ uptime SLA
- Compliance and audit requirements
- Advanced analytics and reporting

## Technology Decision Matrix

### OCR Engine Selection

| Engine | Best For | Accuracy | Speed | Cost | GPU Required |
|--------|----------|----------|-------|------|--------------|
| **PaddleOCR** | Batch processing, multi-lingual | 94-96% | Fast | Free | Recommended |
| **Tesseract** | Clean text, high volume | 90-93% | Fastest | Free | No |
| **EasyOCR** | Handwritten, low-quality scans | 92-95% | Slow | Free | Yes |
| **Gemini 2.5 Pro** | Structured extraction, complex docs | 97-99% | Medium | $$$ | No |
| **GPT-4o** | Understanding + extraction | 96-98% | Medium | $$$ | No |
| **AWS Textract** | Forms, tables, enterprise | 96-98% | Fast | $$$ | No |
| **Google Document AI** | Enterprise, high accuracy | 97-99% | Fast | $$$ | No |

**2026 Recommendation:**
- **Free/OSS:** PaddleOCR for accuracy-critical, Tesseract for speed-critical
- **Paid API:** Gemini 2.5 Pro for structured extraction (best cost/performance)
- **Enterprise:** AWS Textract or Google Document AI for compliance/SLA

### PDF Library Selection

| Library | Best For | Speed | Features | License |
|---------|----------|-------|----------|---------|
| **PyMuPDF (fitz)** | All-around, complex layouts | Fastest | Text, images, tables, metadata | AGPL |
| **pypdfium2** | High-volume, simple extraction | Very Fast | Basic text extraction | Apache 2.0 |
| **pdfplumber** | Tables and forms | Medium | Table detection, structure | MIT |
| **PyPDF** | Manipulation, merging | Fast | Editing, splitting | BSD |

**CoPilot Pattern:** PyMuPDF for classification + extraction (used in all 3 projects)

## Implementation Steps

### Step 1: Setup Project Structure

```bash
# Create project directory
mkdir document-ocr-pipeline
cd document-ocr-pipeline

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Create directory structure
mkdir -p {api,services,models,utils,tests,config}
touch {api,services,models,utils,tests,config}/__init__.py
```

### Step 2: Install Dependencies

Create `requirements.txt`:
```txt
# Web Framework
fastapi==0.116.0
uvicorn==0.35.0
python-multipart==0.0.20

# PDF Processing
pymupdf==1.26.6
pypdf==4.0.0

# OCR Engines (choose based on requirements)
paddleocr==2.9.0  # Free, accurate
# easyocr==1.7.0  # Alternative for handwritten text

# AI APIs (optional)
google-genai==1.25.0
openai==2.8.1
mistralai==1.9.11

# Database
asyncpg==0.31.0  # For PostgreSQL
# psycopg2-binary==2.9.10  # Sync PostgreSQL

# Utilities
pydantic==2.12.4
pydantic-settings==2.11.0
python-dotenv==1.1.1
tenacity==8.5.0  # Retry logic
httpx==0.27.2
httpx-retries==0.4.5

# Monitoring
colorlog==6.10.1

# Task Queue (for production)
# celery==5.3.0
# redis==5.0.0
```

Install:
```bash
pip install -r requirements.txt
```

### Step 3: Configuration Setup

Create `config/settings.py`:
```python
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # API Configuration
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000

    # OCR Engine Selection
    OCR_ENGINE: str = "paddleocr"  # Options: paddleocr, gemini, openai, hybrid

    # AI API Keys (if using)
    GEMINI_API_KEY: Optional[str] = None
    MISTRAL_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None

    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/ocr_db"

    # Processing Configuration
    MAX_CONCURRENT_REQUESTS: int = 2
    MAX_FILE_SIZE_MB: int = 25
    SUPPORTED_FORMATS: list = ["pdf", "png", "jpg", "jpeg", "tiff"]

    # Storage
    UPLOAD_DIR: str = "./uploads"
    OUTPUT_DIR: str = "./outputs"

    class Config:
        env_file = ".env"

settings = Settings()
```

Create `.env`:
```env
# API Configuration
API_HOST=0.0.0.0
API_PORT=8000

# OCR Engine
OCR_ENGINE=paddleocr

# AI API Keys (uncomment if using)
# GEMINI_API_KEY=your_key_here
# MISTRAL_API_KEY=your_key_here
# OPENAI_API_KEY=your_key_here

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ocr_db

# Processing
MAX_CONCURRENT_REQUESTS=2
MAX_FILE_SIZE_MB=25
```

### Step 4: Create Data Models

Create `models/document.py`:
```python
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from enum import Enum

class DocumentType(str, Enum):
    INVOICE = "invoice"
    RESUME = "resume"
    CONTRACT = "contract"
    DRAWING = "drawing"
    SPECIFICATION = "specification"
    UNKNOWN = "unknown"

class ProcessingStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    REVIEW_NEEDED = "review_needed"

class DocumentMetadata(BaseModel):
    filename: str
    file_size: int
    page_count: int
    upload_timestamp: datetime = Field(default_factory=datetime.now)

class ClassificationResult(BaseModel):
    document_type: DocumentType
    confidence: float = Field(ge=0.0, le=1.0)
    methods: Dict[str, float] = {}
    reasoning: str

class ExtractionResult(BaseModel):
    """Customize fields based on your document type."""
    raw_text: Optional[str] = None
    structured_data: Dict[str, Any] = {}
    confidence_scores: Dict[str, float] = {}

class DocumentResult(BaseModel):
    id: str
    metadata: DocumentMetadata
    classification: Optional[ClassificationResult] = None
    extraction: Optional[ExtractionResult] = None
    status: ProcessingStatus
    error_message: Optional[str] = None
    processing_duration_seconds: Optional[float] = None
```

### Step 5: Implement Classification Service

Create `services/classifier.py`:
```python
import fitz  # PyMuPDF
from typing import Dict, Any
from models.document import ClassificationResult, DocumentType

class DocumentClassifier:
    """
    Classify documents using multi-method scoring.
    Based on CoPilot OGI-Document-Spec-Classifier pattern.
    """

    def classify(self, pdf_path: str) -> ClassificationResult:
        """Classify document using weighted multi-method analysis."""

        scores = {
            'metadata': 0.0,
            'visual_density': 0.0,
            'text_heuristic': 0.0,
            'dimension_analysis': 0.0,
            'filename': 0.0
        }

        doc = fitz.open(pdf_path)
        metadata = doc.metadata or {}

        # Fast checks first (early exit optimization)
        creator = (metadata.get("creator") or "").lower()
        if "autocad" in creator or "revit" in creator:
            doc.close()
            return ClassificationResult(
                document_type=DocumentType.DRAWING,
                confidence=1.0,
                methods={"metadata": 1.0},
                reasoning=f"CAD software detected: {creator}"
            )

        # Visual density (strongest signal)
        scores['visual_density'] = self._analyze_visual_density(doc)
        if scores['visual_density'] >= 0.9:
            doc.close()
            return ClassificationResult(
                document_type=DocumentType.DRAWING,
                confidence=1.0,
                methods=scores,
                reasoning="High density vector graphics (>500 paths)"
            )

        # Remaining checks
        scores['dimension_analysis'] = self._analyze_dimensions(doc)
        scores['filename'] = self._analyze_filename(pdf_path)
        scores['text_heuristic'] = self._analyze_text(doc)

        doc.close()

        # Weighted composite
        weights = {
            'metadata': 0.05,
            'visual_density': 0.40,
            'text_heuristic': 0.25,
            'dimension_analysis': 0.15,
            'filename': 0.15
        }

        final_score = sum(scores[k] * weights[k] for k in scores)

        # Map to your document types
        if final_score >= 0.20:
            doc_type = DocumentType.DRAWING
            confidence = min(final_score, 1.0)
        else:
            doc_type = DocumentType.SPECIFICATION
            confidence = min(abs(final_score), 1.0)

        return ClassificationResult(
            document_type=doc_type,
            confidence=confidence,
            methods=scores,
            reasoning=self._generate_reasoning(scores, doc_type)
        )

    def _analyze_visual_density(self, doc: fitz.Document) -> float:
        """Analyze graphics-to-text ratio."""
        page = doc.load_page(0)
        paths = page.get_drawings()
        text_blocks = page.get_text("blocks")

        page_area = page.rect.width * page.rect.height
        text_area = sum((b[2] - b[0]) * (b[3] - b[1]) for b in text_blocks)
        text_density = text_area / page_area if page_area > 0 else 0

        if len(paths) > 500:
            return 1.0
        elif len(paths) > 50:
            return 0.6 if text_density < 0.15 else -0.5
        elif text_density > 0.25:
            return -0.8
        return 0.0

    def _analyze_dimensions(self, doc: fitz.Document) -> float:
        """Check for standard drawing sizes."""
        page = doc.load_page(0)
        width_in = page.rect.width / 72
        height_in = page.rect.height / 72

        drawing_sizes = [(24, 36), (36, 24), (18, 24), (24, 18)]
        for dw, dh in drawing_sizes:
            if abs(width_in - dw) < 2 and abs(height_in - dh) < 2:
                return 0.8

        aspect_ratio = width_in / height_in
        if aspect_ratio > 1.3:
            return 0.5
        elif 0.7 < aspect_ratio < 0.8:
            return -0.5
        return 0.0

    def _analyze_filename(self, filename: str) -> float:
        """Filename heuristics."""
        filename = filename.lower()

        # Customize based on your document types
        drawing_terms = ['drawing', 'plan', 'dwg', 'blueprint']
        spec_terms = ['spec', 'specification', 'report']

        score = 0.2 * sum(1 for t in drawing_terms if t in filename)
        score -= 0.2 * sum(1 for t in spec_terms if t in filename)
        return max(min(score, 1.0), -1.0)

    def _analyze_text(self, doc: fitz.Document) -> float:
        """Keyword analysis."""
        text = ""
        for i in range(min(3, len(doc))):
            text += doc.load_page(i).get_text().lower()

        drawing_kw = {'scale', 'elevation', 'section', 'detail'}
        spec_kw = {'specification', 'requirements', 'scope'}

        drawing_count = sum(1 for k in drawing_kw if k in text)
        spec_count = sum(1 for k in spec_kw if k in text)

        total = drawing_count + spec_count
        if total == 0:
            return 0.0
        return (drawing_count - spec_count) / total

    def _generate_reasoning(self, scores: dict, doc_type: DocumentType) -> str:
        """Generate explanation."""
        reasons = []
        if scores['visual_density'] > 0.6:
            reasons.append("dense technical graphics")
        if scores['dimension_analysis'] > 0.5:
            reasons.append("large-format dimensions")
        if scores['text_heuristic'] > 0.3:
            reasons.append("drawing terminology")

        if reasons:
            return f"{doc_type.value}: {', '.join(reasons)}"
        return f"Classified as {doc_type.value}"
```

### Step 6: Implement OCR Service

Create `services/ocr_engine.py`:
```python
import asyncio
import base64
import json
from typing import Dict, Any, Optional
from abc import ABC, abstractmethod
from paddleocr import PaddleOCR
from google import genai
from google.genai import types
from tenacity import AsyncRetrying, stop_after_attempt, wait_exponential

class OCREngine(ABC):
    """Abstract base for OCR engines."""

    @abstractmethod
    async def extract(self, pdf_bytes: bytes, prompt: str = None) -> Dict[str, Any]:
        """Extract text/data from document."""
        pass

class PaddleOCREngine(OCREngine):
    """Local OCR using PaddleOCR."""

    def __init__(self, use_gpu: bool = False):
        self.ocr = PaddleOCR(use_angle_cls=True, lang='en', use_gpu=use_gpu)

    async def extract(self, pdf_bytes: bytes, prompt: str = None) -> Dict[str, Any]:
        """Extract text from PDF using PaddleOCR."""
        # Convert PDF to images, run OCR
        # This is simplified - see full implementation in scaffolding
        result = await asyncio.to_thread(self.ocr.ocr, pdf_bytes)

        # Extract text
        text = "\n".join([line[1][0] for page in result for line in page])

        return {
            "raw_text": text,
            "structured_data": {},
            "confidence": 0.9  # PaddleOCR provides per-line confidence
        }

class GeminiOCREngine(OCREngine):
    """AI-powered extraction using Gemini."""

    def __init__(self, api_key: str):
        self.client = genai.Client(api_key=api_key)

    async def extract(self, pdf_bytes: bytes, prompt: str, schema = None) -> Dict[str, Any]:
        """Extract structured data using Gemini."""

        pdf_part = types.Part(inline_data=types.Blob(
            mime_type="application/pdf",
            data=pdf_bytes
        ))

        config = {
            "response_mime_type": "application/json"
        }
        if schema:
            config["response_schema"] = schema

        retryer = AsyncRetrying(
            stop=stop_after_attempt(3),
            wait=wait_exponential(multiplier=1, min=2, max=10)
        )

        response = await retryer(
            asyncio.to_thread,
            self.client.models.generate_content,
            model="gemini-2.5-pro",
            contents=[pdf_part, prompt],
            config=config
        )

        return {
            "raw_text": None,
            "structured_data": response.parsed if schema else json.loads(response.text),
            "confidence": 0.95
        }

class HybridOCREngine(OCREngine):
    """Hybrid with fallback (CoPilot pattern)."""

    def __init__(self, gemini_key: str, mistral_key: str = None):
        self.gemini = GeminiOCREngine(gemini_key)
        # Add Mistral as fallback if needed

    async def extract(self, pdf_bytes: bytes, prompt: str, schema = None) -> Dict[str, Any]:
        """Try Gemini first, fallback to alternative."""

        try:
            return await self.gemini.extract(pdf_bytes, prompt, schema)
        except Exception as e:
            print(f"Gemini failed: {e}")
            # Implement Mistral fallback here
            raise Exception("All OCR engines failed")
```

### Step 7: Create API Endpoints

Create `api/main.py`:
```python
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import asyncio
import uuid
from pathlib import Path
from datetime import datetime

from config.settings import settings
from models.document import DocumentResult, DocumentMetadata, ProcessingStatus
from services.classifier import DocumentClassifier
from services.ocr_engine import PaddleOCREngine, GeminiOCREngine
from utils.validation import validate_pdf

app = FastAPI(title="Document OCR API")

# Initialize services
classifier = DocumentClassifier()

if settings.OCR_ENGINE == "paddleocr":
    ocr_engine = PaddleOCREngine()
elif settings.OCR_ENGINE == "gemini":
    ocr_engine = GeminiOCREngine(settings.GEMINI_API_KEY)
else:
    raise ValueError(f"Unknown OCR engine: {settings.OCR_ENGINE}")

@app.post("/process-document", response_model=DocumentResult)
async def process_document(file: UploadFile = File(...)):
    """Process uploaded document: classify and extract data."""

    start_time = datetime.now()
    doc_id = str(uuid.uuid4())

    # Validate file
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(400, "Only PDF files supported")

    # Read file
    pdf_bytes = await file.read()

    if len(pdf_bytes) > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(400, f"File too large (max {settings.MAX_FILE_SIZE_MB}MB)")

    # Save to temp
    temp_path = Path(settings.UPLOAD_DIR) / f"{doc_id}.pdf"
    temp_path.parent.mkdir(exist_ok=True)
    temp_path.write_bytes(pdf_bytes)

    try:
        # Validate PDF
        validation = validate_pdf(str(temp_path))
        if not validation["valid"]:
            return DocumentResult(
                id=doc_id,
                metadata=DocumentMetadata(
                    filename=file.filename,
                    file_size=len(pdf_bytes),
                    page_count=0
                ),
                status=ProcessingStatus.FAILED,
                error_message=validation["error"]
            )

        # Classify
        classification = classifier.classify(str(temp_path))

        # Extract (customize prompt based on classification)
        extraction = await ocr_engine.extract(
            pdf_bytes,
            prompt="Extract all text from this document."
        )

        duration = (datetime.now() - start_time).total_seconds()

        return DocumentResult(
            id=doc_id,
            metadata=DocumentMetadata(
                filename=file.filename,
                file_size=len(pdf_bytes),
                page_count=validation.get("page_count", 0)
            ),
            classification=classification,
            extraction=extraction,
            status=ProcessingStatus.COMPLETED,
            processing_duration_seconds=duration
        )

    except Exception as e:
        return DocumentResult(
            id=doc_id,
            metadata=DocumentMetadata(
                filename=file.filename,
                file_size=len(pdf_bytes),
                page_count=0
            ),
            status=ProcessingStatus.FAILED,
            error_message=str(e)
        )
    finally:
        # Cleanup
        if temp_path.exists():
            temp_path.unlink()

@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy", "ocr_engine": settings.OCR_ENGINE}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.API_HOST, port=settings.API_PORT)
```

### Step 8: Add Validation Utilities

Create `utils/validation.py`:
```python
from pypdf import PdfReader
import pathlib
from typing import Dict

def validate_pdf(pdf_path: str) -> Dict[str, any]:
    """
    Validate PDF before processing.
    CoPilot pattern from halo-title-ocr.
    """
    try:
        path = pathlib.Path(pdf_path)

        # File size check
        file_size = path.stat().st_size
        if file_size < 100:
            return {"valid": False, "error": "File too small (< 100 bytes)"}

        # PDF magic bytes
        with open(pdf_path, 'rb') as f:
            if f.read(4) != b'%PDF':
                return {"valid": False, "error": "Not a valid PDF"}

        # Read with pypdf
        reader = PdfReader(pdf_path)

        if len(reader.pages) == 0:
            return {"valid": False, "error": "PDF has no pages"}

        # Check for content
        has_content = False
        for page in reader.pages:
            text = page.extract_text()
            if text and text.strip():
                has_content = True
                break

        if not has_content:
            return {"valid": False, "error": "PDF appears empty (no extractable text)"}

        return {
            "valid": True,
            "page_count": len(reader.pages),
            "file_size": file_size
        }

    except Exception as e:
        return {"valid": False, "error": f"Validation error: {e}"}
```

### Step 9: Create Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Create directories
RUN mkdir -p uploads outputs

# Expose port
EXPOSE 8000

# Run application
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - OCR_ENGINE=paddleocr
      - DATABASE_URL=postgresql://user:password@db:5432/ocr_db
    volumes:
      - ./uploads:/app/uploads
      - ./outputs:/app/outputs
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=ocr_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

### Step 10: Testing Strategy

Create `tests/test_classifier.py`:
```python
import pytest
from pathlib import Path
from services.classifier import DocumentClassifier
from models.document import DocumentType

@pytest.fixture
def classifier():
    return DocumentClassifier()

def test_classify_drawing(classifier):
    """Test classification of technical drawing."""
    # Use sample drawing PDF
    result = classifier.classify("tests/samples/drawing.pdf")

    assert result.document_type == DocumentType.DRAWING
    assert result.confidence > 0.7
    assert "visual_density" in result.methods

def test_classify_specification(classifier):
    """Test classification of specification document."""
    result = classifier.classify("tests/samples/spec.pdf")

    assert result.document_type == DocumentType.SPECIFICATION
    assert result.confidence > 0.7

def test_empty_pdf(classifier):
    """Test handling of empty PDF."""
    # Should be caught by validation before classification
    from utils.validation import validate_pdf

    validation = validate_pdf("tests/samples/empty.pdf")
    assert not validation["valid"]
    assert "empty" in validation["error"].lower()
```

Create `tests/test_ocr.py`:
```python
import pytest
from services.ocr_engine import PaddleOCREngine
import asyncio

@pytest.fixture
def ocr_engine():
    return PaddleOCREngine()

@pytest.mark.asyncio
async def test_extract_text(ocr_engine):
    """Test text extraction from sample PDF."""
    with open("tests/samples/invoice.pdf", "rb") as f:
        pdf_bytes = f.read()

    result = await ocr_engine.extract(pdf_bytes)

    assert "raw_text" in result
    assert len(result["raw_text"]) > 0
    assert result["confidence"] > 0.0

@pytest.mark.asyncio
async def test_extraction_accuracy(ocr_engine):
    """Test extraction accuracy against ground truth."""
    with open("tests/samples/invoice.pdf", "rb") as f:
        pdf_bytes = f.read()

    result = await ocr_engine.extract(pdf_bytes)

    # Compare against known values
    ground_truth = {
        "invoice_number": "INV-12345",
        "total": "1234.56"
    }

    # Implement accuracy metrics
    # This is simplified - implement proper field matching
    assert "INV-12345" in result["raw_text"]
```

Run tests:
```bash
pytest tests/ -v --cov=services --cov=utils
```

### Step 11: Create Sample Test Documents

Create a test document generator:
```python
# tests/generate_samples.py
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

def generate_invoice_sample():
    """Generate sample invoice PDF for testing."""
    c = canvas.Canvas("tests/samples/invoice.pdf", pagesize=letter)

    c.setFont("Helvetica-Bold", 16)
    c.drawString(100, 750, "INVOICE")

    c.setFont("Helvetica", 12)
    c.drawString(100, 700, "Invoice Number: INV-12345")
    c.drawString(100, 680, "Date: 03/26/2026")
    c.drawString(100, 660, "Total: $1,234.56")

    c.save()

if __name__ == "__main__":
    generate_invoice_sample()
```

### Step 12: Monitoring and Logging

Create `utils/monitoring.py`:
```python
import logging
import colorlog
from datetime import datetime

def setup_logging():
    """Configure structured logging with colors."""

    handler = colorlog.StreamHandler()
    handler.setFormatter(colorlog.ColoredFormatter(
        '%(log_color)s%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        log_colors={
            'DEBUG': 'cyan',
            'INFO': 'green',
            'WARNING': 'yellow',
            'ERROR': 'red',
            'CRITICAL': 'bold_red',
        }
    ))

    logger = logging.getLogger()
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)

    return logger

class MetricsCollector:
    """Track processing metrics."""

    def __init__(self):
        self.metrics = {
            "total_processed": 0,
            "successful": 0,
            "failed": 0,
            "avg_processing_time": 0.0,
            "by_document_type": {}
        }

    def record_processing(self, doc_type: str, duration: float, success: bool):
        """Record processing metrics."""
        self.metrics["total_processed"] += 1

        if success:
            self.metrics["successful"] += 1
        else:
            self.metrics["failed"] += 1

        # Update average
        total = self.metrics["total_processed"]
        current_avg = self.metrics["avg_processing_time"]
        self.metrics["avg_processing_time"] = (
            (current_avg * (total - 1) + duration) / total
        )

        # By type
        if doc_type not in self.metrics["by_document_type"]:
            self.metrics["by_document_type"][doc_type] = 0
        self.metrics["by_document_type"][doc_type] += 1

    def get_metrics(self):
        """Return current metrics."""
        return self.metrics
```

## Quality Assurance Checklist

Before deploying your pipeline:

### Functionality
- [ ] All document types correctly classified (>95% accuracy on test set)
- [ ] Extraction accuracy meets requirements (benchmark against ground truth)
- [ ] Empty/invalid PDFs handled gracefully
- [ ] Multi-page documents processed correctly
- [ ] Error messages are clear and actionable

### Performance
- [ ] Processing time acceptable for volume (target: <5s per document)
- [ ] Concurrent processing works without errors
- [ ] Memory usage stable during batch processing
- [ ] API rate limits respected (no failed requests)

### Reliability
- [ ] Retry logic works for transient failures
- [ ] Fallback OCR engines activate on primary failure
- [ ] Database transactions are atomic
- [ ] Graceful degradation when services unavailable

### Security
- [ ] Input validation prevents injection attacks
- [ ] File size limits enforced
- [ ] Uploaded files cleaned up after processing
- [ ] API keys not exposed in logs/errors
- [ ] PII handling complies with requirements

### Monitoring
- [ ] Structured logging captures key events
- [ ] Metrics tracked (throughput, errors, latency)
- [ ] Alerts configured for critical failures
- [ ] Dashboard shows real-time status

### Documentation
- [ ] API endpoints documented
- [ ] Configuration options explained
- [ ] Deployment guide complete
- [ ] Troubleshooting section included

## Common Pitfalls & Solutions

### Problem: Low OCR Accuracy

**Symptoms:** Gibberish text, missing fields, wrong values

**Solutions:**
1. **Preprocessing:** Deskew, denoise, enhance contrast before OCR
2. **Engine selection:** Try Gemini/GPT-4o for complex layouts
3. **Multi-engine voting:** Compare results from 2+ engines
4. **Prompt engineering:** Add explicit OCR disambiguation rules

### Problem: Classification Errors

**Symptoms:** Documents misclassified, low confidence scores

**Solutions:**
1. **Add training data:** Expand keyword dictionaries
2. **Adjust weights:** Tune multi-method scoring weights
3. **Feature engineering:** Add domain-specific features
4. **Manual review:** Flag low-confidence for human review

### Problem: API Rate Limits

**Symptoms:** 429 errors, processing slowdowns

**Solutions:**
1. **Exponential backoff:** Implement retry with jitter (CoPilot pattern)
2. **Semaphore limiting:** Cap concurrent requests
3. **Queue batching:** Group requests to stay under quotas
4. **Upgrade tier:** Move to higher API plan

### Problem: Out of Memory

**Symptoms:** Process crashes on large PDFs

**Solutions:**
1. **Stream processing:** Process pages one at a time
2. **File cleanup:** Close documents after processing
3. **Garbage collection:** Force GC after batch
4. **Resource limits:** Set Docker memory caps

### Problem: Slow Processing

**Symptoms:** Exceeds SLA, backlogs growing

**Solutions:**
1. **GPU acceleration:** Enable for PaddleOCR/EasyOCR
2. **Parallel workers:** Scale horizontally
3. **Optimize early exits:** Check fast signals first
4. **Cache results:** Avoid reprocessing same documents

## Next Steps

After completing this skill:

1. **Expand to new document types:** Add invoice, contract, form extractors
2. **Implement human review workflow:** Build UI for low-confidence results
3. **Add table extraction:** Use pdfplumber or LayoutLM
4. **Train custom models:** Fine-tune BERT for classification
5. **Build analytics:** Dashboard for accuracy trends
6. **Integrate with workflows:** Connect to CRM, ERP, or databases
7. **Multi-language support:** Add OCR for non-English documents
8. **Compliance features:** Add audit logs, encryption, retention policies

## Resources

### Research Sources
- [Best Python OCR Library in 2026: 6 Libraries Tested](https://www.codesota.com/ocr/best-for-python)
- [Best Python PDF to Text Parser Libraries: A 2026 Evaluation](https://unstract.com/blog/evaluating-python-pdf-to-text-libraries/)
- [Document Classification: End-to-End ML Workflow Explained in 2026](https://labelyourdata.com/articles/document-classification)
- [How to Build a Document Processing Pipeline for RAG with Nemotron](https://developer.nvidia.com/blog/how-to-build-a-document-processing-pipeline-for-rag-with-nemotron/)

### CoPilot Innovations Reference Projects
- **OGI-Document-Spec-Classifier:** Multi-method classification, parallel processing
- **halo-title-ocr:** Gemini + Mistral hybrid, empty PDF detection
- **resume-parser:** Rate limiting, multi-source fetching, concurrent processing

---

**Skill Version:** 1.0
**Last Updated:** March 26, 2026
**Maintained By:** CoPilot Innovations
