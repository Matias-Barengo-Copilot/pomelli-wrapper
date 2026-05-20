# Document/OCR Processing Skill Generator Prompt

You are analyzing CoPilot Innovations' document processing repositories to create a reusable skill that helps engineers build new document OCR/classification pipelines.

## Your Task

1. **Analyze the provided repos**
   - Read structure, requirements.txt, processing scripts
   - Identify common patterns:
     - Document sources (Google Drive, S3, uploads?)
     - OCR approach (Tesseract, Google Vision, AWS Textract, Gemini Vision?)
     - Classification (AI models, rule-based, hybrid?)
     - Document types handled (PDFs, images, scans?)
     - Post-processing (structure extraction, entity recognition?)
     - Output format (JSON, database, CSV?)
     - Error handling (unclear scans, multi-page, rotated docs?)
     - Quality validation

2. **Research best practices online**
   - Search for "OCR best practices 2026"
   - Search for "document classification AI patterns"
   - Search for "PDF text extraction Python"
   - Search for "document processing pipeline architecture"

3. **Create the skill**
   - Questions about: doc types, source, accuracy needs, volume, structure extraction
   - Architecture recommendations
   - Include CoPilot's OCR patterns
   - Scaffolding steps

## Output

Write completed skill to: `skills/python/document-ocr-builder/SKILL.md`

Include:
- 12-16 targeted questions (OCR has many edge cases)
- Pipeline architecture (preprocessing, OCR, classification, validation)
- Common CoPilot patterns (quality checks, error recovery, multi-page handling)
- Scaffolding steps with example processing functions
- Testing strategy (sample documents, accuracy metrics)
