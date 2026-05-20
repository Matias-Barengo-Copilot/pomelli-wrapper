# Image Processing Pipeline Skill Generator Prompt

You are analyzing CoPilot Innovations' image processing repositories to create a reusable skill that helps engineers build new image pipelines.

## Your Task

1. **Analyze the provided repos**
   - Read structure, requirements.txt, main processing scripts
   - Identify common patterns:
     - Image sources (GCS, S3, URLs, uploads?)
     - Processing tasks (enhancement, classification, segmentation, generation?)
     - AI models used (OpenAI Vision, Gemini, custom models?)
     - Image manipulation (PIL, OpenCV, ImageMagick?)
     - Batch processing (queues, workers, parallelization?)
     - Output destinations (back to storage, database, API?)
     - Error handling for corrupted images
     - Monitoring/logging patterns

2. **Research best practices online**
   - Search for "image processing pipeline architecture 2026"
   - Search for "AI image classification best practices"
   - Search for "Python image processing performance"
   - Search for "batch image processing patterns"

3. **Create the skill**
   - Questions about: image sources, processing goals, volume/scale, quality requirements
   - Architecture recommendations (sync vs async, cloud vs local)
   - Include CoPilot's proven patterns
   - Scaffolding steps

## Output

Write completed skill to: `skills/python/image-pipeline-builder/SKILL.md`

Include:
- 10-15 targeted questions
- Pipeline architecture recommendations (worker-based, serverless, etc.)
- Common CoPilot patterns (batch processing, error recovery, quality checks)
- Scaffolding with example processing functions
- Testing strategy (sample images, quality metrics)
