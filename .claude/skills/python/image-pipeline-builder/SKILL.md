---
name: image-pipeline-builder
description: Build AI-powered image processing pipelines for batch processing, enhancement, classification, and transformation. Use when processing product images, removing backgrounds, enhancing quality, classifying images, or integrating with cloud storage (GCS, S3). Covers OpenCV, Pillow, AI APIs (Replicate, remove.bg, Gemini Vision), retry logic, error handling, batch processing. Based on CoPilot proven patterns. Triggers on image processing, image pipeline, batch images, background removal, image enhancement, image classification, product images, AI image processing.
allowed-tools: Read, Write, Edit, Bash(pip *), Bash(git *)
---

# Image Processing Pipeline Builder

**Category:** Python Development
**Purpose:** Build production-ready image processing pipelines based on CoPilot Innovations' proven patterns
**Experience Level:** Intermediate to Advanced

## Overview

This skill guides engineers through building robust, scalable image processing pipelines using patterns proven across CoPilot Innovations' real projects. It covers everything from simple batch processing to AI-powered classification and enhancement pipelines.

Based on analysis of:
- **tonerprice-image-processor**: Background removal, batch CSV processing, GCS upload
- **marks-jewelers-product-image-enhancer**: AI classification, enhancement, Google Drive integration
- **marks-jewelers-box-images**: AI composition, cost tracking, integrated workflows

## When to Use This Skill

Use this skill when you need to:
- Build a new image processing pipeline from scratch
- Process images in batch from various sources (URLs, cloud storage, local files)
- Remove backgrounds, enhance, resize, or validate images
- Integrate AI models for classification or enhancement
- Upload processed images to cloud storage with verification
- Generate output CSVs mapping inputs to processed results
- Handle errors gracefully in production environments

## Discovery Questions

Before building your pipeline, I need to understand your requirements:

### 1. Image Source & Scale
- Where are your source images? (URLs in CSV, Google Drive, S3, GCS, local directory, API endpoints?)
- How many images will you process? (10s, 100s, 1000s, millions?)
- What's the processing frequency? (one-time batch, daily, real-time as uploaded?)
- What image formats do you support? (JPEG, PNG, TIF, WebP, all?)

### 2. Processing Requirements
- What processing tasks do you need?
  - Background removal? (using which API: Replicate, remove.bg, local models?)
  - Image enhancement? (brightness, contrast, saturation, sharpness?)
  - AI classification? (what categories: product types, quality, defects?)
  - AI generation/editing? (object removal, style transfer, composition?)
  - Resizing/standardization? (target dimensions, aspect ratio constraints?)
  - Format conversion? (PNG, JPEG, WebP output?)
  - Watermarking or overlays?
  - Quality validation? (resolution, transparency, file size checks?)

### 3. AI Model Integration
- Do you need AI-powered classification or enhancement? (Gemini, OpenAI Vision, Replicate models?)
- Do you have API keys for these services? (or need local model alternatives?)
- What's your budget for API costs per image? (affects model selection)
- Do you need cost tracking and reporting? (per-image, daily, monthly?)

### 4. Output Requirements
- Where should processed images be stored? (GCS, S3, local directory, Google Drive?)
- Do you need to verify uploads succeed? (check file existence in cloud?)
- Do you need output CSVs? (mapping original to processed URLs, metadata, validation results?)
- What naming convention for processed images? (`{brand}_{model}.png`, preserve original names, custom?)
- What quality requirements? (min/max resolution, transparency, max file size?)

### 5. Error Handling & Reliability
- How should failed images be handled? (skip and continue, retry with backoff, capture screenshots of errors?)
- Do you need resume capability? (process only missing images on re-run?)
- Do you need detailed logging? (console, files, structured JSON logs?)
- Do you need progress tracking? (which images processed, which failed, summary reports?)

### 6. Performance & Architecture
- Do you need parallel processing? (multi-threading, multi-processing, async?)
- Do you have rate limits to respect? (API throttling, delays between requests?)
- Do you need progress saving? (incremental CSV updates every N images?)
- Should processing be sync or async? (blocking pipeline vs queue-based workers?)

## CoPilot's Proven Patterns

Based on analysis of production pipelines and industry best practices for 2026:

### Pattern 1: Modular Pipeline Architecture

**What it is:** Separate concerns into independent modules that can be tested, scaled, and replaced independently.

**CoPilot implementation:**
```python
# From tonerprice-image-processor
class ImageProcessingPipeline:
    def __init__(self, enable_gcs_upload=False, enable_csv_generation=False):
        self.image_processor = ImageProcessor()
        self.background_remover = BackgroundRemover()
        self.validator = ImageValidator()
        self.csv_processor = CSVProcessor()
        self.gcs_uploader = GCSUploader() if enable_gcs_upload else None
```

**Why it works:**
- Each module has a single responsibility
- Easy to swap implementations (e.g., different background removal APIs)
- Modules can be tested independently
- Optional features (GCS upload, CSV generation) are cleanly toggled

**When to use:** Always. This is the foundation of maintainable pipelines.

### Pattern 2: Smart API Selection & Fallback

**What it is:** Automatically choose the best API based on file type, with fallback strategies.

**CoPilot implementation:**
```python
# From marks-jewelers-product-image-enhancer
# TIF files → remove.bg API (98% accuracy for jewelry)
# JPG/PNG files → Replicate API with ISNet model (best for fine details)

if file_extension == '.tif' and self.removebg_api_key:
    result = self._remove_background_removebg(image)
else:
    result = self._remove_background_replicate(image, model='isnet')
```

**Why it works:**
- Different file types have different optimal processing methods
- Graceful degradation when preferred API unavailable
- Cost optimization (use cheaper API when quality is equivalent)

**When to use:** When processing mixed file types or when API reliability is uncertain.

### Pattern 3: Retry Logic with Multiple Strategies

**What it is:** Multiple HTTP bypass strategies for downloading images from protected URLs.

**CoPilot implementation:**
```python
# From tonerprice-image-processor/http.py
strategies = [
    self._strategy_basic,           # Enhanced headers
    self._strategy_with_referrer,   # Domain-based referrer
    self._strategy_with_delay,      # Rate limiting
    self._strategy_with_rotated_ua, # User agent rotation
    self._strategy_with_google_referrer,
    self._strategy_mobile,          # Mobile headers
    self._strategy_browser,         # Full browser headers
    self._strategy_with_proxy       # Proxy rotation
]

for strategy in strategies:
    for retry in range(max_retries):
        try:
            response = strategy(url)
            if response.status_code == 200:
                return response
        except Exception as e:
            self.logger.warning(f"Strategy failed: {e}")
            time.sleep(delay)
```

**Why it works:**
- Handles 403 Forbidden, 404, timeouts, rate limits
- Automatic fallback through progressively sophisticated strategies
- Random delays prevent detection as bot
- Production-grade resilience for unreliable sources

**Industry best practice (2026):** [Production-grade error handling](https://medium.com/the-pythonworld/production-grade-error-handling-in-python-a-practical-guide-3e871e1ad70e) emphasizes retry logic with exponential backoff and circuit breakers.

**When to use:** When downloading images from external URLs (especially e-commerce sites).

### Pattern 4: Error Aggregation

**What it is:** Continue processing all images even when some fail, then report all errors at the end.

**CoPilot implementation:**
```python
# From tonerprice-image-processor
processing_results = {}
for entry in csv_data:
    try:
        result = self._process_single_image(entry, output_path)
        if result['success']:
            self.processed_images.append(result)
        else:
            self.failed_images.append({
                'brand': entry['brand'],
                'model_name': entry['model_name'],
                'error': result.get('error', 'Unknown error')
            })
    except Exception as e:
        self.failed_images.append({
            'brand': entry['brand'],
            'model_name': entry['model_name'],
            'error': str(e)
        })

# Generate summary CSV of all failures for re-processing
self.csv_generator.generate_failed_products_csv(self.failed_images)
```

**Why it works:**
- Don't stop on first failure (important for large batches)
- Collect all failures for analysis and bulk re-processing
- Clear separation of successes and failures
- Easy to re-run just the failed items

**Industry best practice (2026):** Error aggregation is a core pattern in [production Python error handling](https://www.kdnuggets.com/5-error-handling-patterns-in-python-beyond-try-except).

**When to use:** Always for batch processing. Never fail the entire pipeline for one bad image.

### Pattern 5: Screenshot Capture for Debugging

**What it is:** When image downloads fail (403, 404), automatically capture a screenshot of the error page.

**CoPilot implementation:**
```python
# From tonerprice-image-processor
try:
    image_bytes = self.http_client.download_image(image_url, brand, model_name)
except Exception as e:
    self.logger.warning(f"Download failed. Capturing screenshot...")
    self.screenshot_capture.capture_forbidden_page(
        image_url, brand, model_name, skip_if_exists=True
    )
    raise
```

**Why it works:**
- Visual documentation of what went wrong
- Helps identify patterns (blocked domains, broken links, paywalls)
- Useful for reporting to website owners or clients
- Screenshots saved as `{brand}_{model}.png` in `screenshots/` directory

**When to use:** When downloading from external URLs where failures need investigation.

### Pattern 6: GCS Upload Verification

**What it is:** Always verify files exist in cloud storage before generating URLs or marking as complete.

**CoPilot implementation:**
```python
# From tonerprice-image-processor/gcs.py
def generate_csv_from_gcs(self, csv_path: str):
    hosted_urls = {}
    for entry in csv_data:
        brand_model_name = f"{entry['brand']}_{entry['model_name']}"
        gcs_filename = f"{self.prefix}/{brand_model_name}.png"

        # Only include if file actually exists in GCS
        if self.gcs_uploader.object_exists(gcs_filename):
            hosted_url = f"https://storage.googleapis.com/{bucket}/{gcs_filename}"
            hosted_urls[brand_model_name] = hosted_url
            self.logger.info(f"Found {brand_model_name} in GCS")
        else:
            self.logger.info(f"Skipping {brand_model_name} - not uploaded to GCS")
```

**Why it works:**
- Prevents broken links in output CSVs
- Catches upload failures before they reach production
- Clear logging shows which files are found locally vs uploaded
- URL encoding handles spaces and special characters properly

**When to use:** Always when generating URLs for uploaded files. Never assume upload succeeded.

### Pattern 7: AI Classification with Cost Tracking

**What it is:** Use AI vision models for classification while tracking costs per image.

**CoPilot implementation:**
```python
# From marks-jewelers-box-images
class JewelryClassifier:
    def classify_jewelry(self, image_path: Path) -> str:
        img = Image.open(image_path)

        prompt = """Classify this jewelry into ONE category:
        - bracelet, earrings, necklace, ring
        Respond with ONLY the category name."""

        response = self.client.models.generate_content(
            model='gemini-2.5-flash-image',  # Nano Banana - fast & cheap
            contents=[prompt, img],
            config=types.GenerateContentConfig(response_modalities=['TEXT'])
        )

        classification = response.parts[0].text.strip().lower()

        # Track cost
        if self.cost_tracker:
            self.cost_tracker.log_classification_call(
                model='gemini-2.5-flash-image',
                success=True,
                tokens_input=response.usage_metadata.prompt_token_count,
                tokens_output=response.usage_metadata.candidates_token_count
            )

        return classification
```

**Why it works:**
- Simple, clear prompts get accurate results
- Cost tracking helps manage API budgets
- Token counts logged for analysis
- Fast, cheap models (gemini-2.5-flash-image) for simple classification
- Premium models (gemini-3-pro-image-preview) for generation tasks

**Industry best practice (2026):** [AI image classification best practices](https://labelyourdata.com/articles/image-classification-models) emphasize using appropriate model tiers for each task.

**When to use:** When you need to classify, tag, or route images based on content.

### Pattern 8: Integrated AI Workflows (Cost Optimization)

**What it is:** Combine multiple AI tasks into a single API call to save 50% on costs and time.

**CoPilot implementation:**
```python
# From marks-jewelers-box-images
# OLD: Two separate API calls (Phase 1 + Phase 2)
# placement_result = generate_content(prompt="Place jewelry in box")
# background_result = generate_content(prompt="Replace background")
# Cost: $0.2724 per jewelry, 2x API latency

# NEW: Integrated single API call
prompt = """Task 1: Place this jewelry realistically in the box.
Task 2: Replace the background with a seamless forever background texture.

Combine both tasks in ONE output image."""

result = self.client.models.generate_content(
    model='gemini-3-pro-image-preview',
    contents=[prompt, jewelry_img, box_img]
)
# Cost: $0.1362 per jewelry (50% savings), 50% faster
```

**Why it works:**
- Single API call instead of sequential calls
- Unified lighting and composition (no intermediate artifacts)
- 50% cost reduction
- 50% faster processing
- Better quality from holistic processing

**Industry best practice (2026):** [Batch processing optimization](https://blog.laozhang.ai/en/posts/nano-banana-pro-batch-api-cost-optimization) shows 79% savings with batch APIs.

**When to use:** When multiple AI tasks can be logically combined (placement + background, enhancement + shadow generation).

### Pattern 9: Type-Specific Processing Rules

**What it is:** Apply different processing logic based on classified content type.

**CoPilot implementation:**
```python
# From marks-jewelers-product-image-enhancer
def route_processing(self, jewelry_type: str, metal_type: str):
    # Type-specific routing
    if jewelry_type == 'ring' and metal_type == 'yellow gold':
        return self._traditional_processing()  # Preserve design
    elif jewelry_type == 'earring':
        # Remove posts first
        cleaned = self._remove_earring_posts(image)
        return self._ai_enhancement(cleaned)
    else:
        return self._ai_enhancement(image)

# Type-specific shadow parameters
SHADOW_PARAMS = {
    'ring': {'darkness': 0.15, 'blur_x': 6.0, 'dy': 2},
    'earring': {'darkness': 0.12, 'blur_x': 5.0, 'dy': 2},
    'necklace': {'darkness': 0.12, 'blur_x': 5.0, 'dy': 3}
}
```

**Why it works:**
- Different content requires different approaches
- Classification informs optimal processing path
- Quality varies by type (e.g., jewelry posts need special handling)
- Preserves critical features while enhancing others

**When to use:** When processing diverse content types with different quality requirements.

### Pattern 10: Batch Processing with Parallel Execution

**What it is:** Process multiple images concurrently while respecting rate limits.

**CoPilot implementation:**
```python
# Industry best practice for 2026
from joblib import Parallel, delayed
import time
import random

def process_with_throttle(image_path, throttle_seconds):
    # Random delay to avoid rate limiting
    time.sleep(random.uniform(0.5, throttle_seconds))
    return process_single_image(image_path)

# Process in parallel with controlled rate
results = Parallel(n_jobs=8, backend='loky')(
    delayed(process_with_throttle)(img, throttle=2)
    for img in image_paths
)
```

**Why it works:**
- 3-8x speedup with parallel processing (8 cores typical)
- Random delays prevent API rate limit detection
- Joblib handles exceptions gracefully
- Process pools bypass Python GIL for CPU-bound work

**Industry best practice (2026):** [Batch processing with Joblib](https://johal.in/python-batch-processing-with-joblib-parallel-loky-backends-scheduling-2026/) shows 8x speedups for large batches.

**When to use:** When processing 100+ images with CPU-bound operations (enhancement, validation).

### Pattern 11: Incremental Progress Saving

**What it is:** Save progress every N images so you can resume on failure.

**CoPilot implementation:**
```python
# From tonerprice-image-processor/scraper.py
SAVE_EVERY = int(os.getenv('SAVE_EVERY', '5'))

for i, entry in enumerate(csv_data):
    result = process_image(entry)
    results.append(result)

    # Save progress incrementally
    if (i + 1) % SAVE_EVERY == 0:
        save_results_to_csv(results, output_path)
        logger.info(f"Progress saved: {i + 1}/{len(csv_data)}")

# Final save
save_results_to_csv(results, output_path)
```

**Why it works:**
- Don't lose hours of progress if pipeline crashes
- Resume from last checkpoint instead of starting over
- Configurable save frequency balances safety vs I/O overhead
- Critical for long-running batches (1000s of images)

**When to use:** For any batch processing that takes more than a few minutes.

### Pattern 12: Comprehensive Image Validation

**What it is:** Validate multiple quality dimensions before accepting processed images.

**CoPilot implementation:**
```python
# From tonerprice-image-processor/validator.py
class ImageValidator:
    def validate(self, image: Image.Image) -> Dict[str, Any]:
        errors = []
        warnings = []

        # Size validation
        if width < self.min_width or height < self.min_height:
            errors.append(f"Too small: {width}x{height}")

        # Transparency validation (for background removal)
        if not self._check_transparency(image):
            warnings.append("No transparency detected")

        # Quality validation
        contrast = np.std(np.array(image))
        if contrast < 10:
            errors.append("Very low contrast")

        # Blur detection
        laplacian_var = np.var(cv2.Laplacian(gray, cv2.CV_64F))
        if laplacian_var < 100:
            errors.append("Image may be blurry")

        # Artifact detection
        if edge_ratio > 0.1:
            warnings.append("May have jagged edges")

        return {
            'is_valid': len(errors) == 0,
            'errors': errors,
            'warnings': warnings
        }
```

**Why it works:**
- Catches quality issues before they reach production
- Separates hard errors from soft warnings
- Quantitative metrics (contrast, blur) are objective
- Transparency check confirms background removal worked

**When to use:** Always for production pipelines. Quality validation prevents bad images downstream.

## Architecture Recommendations

Based on your answers to the discovery questions, I'll recommend one of these architectures:

### Architecture A: Simple Batch Processor
**Best for:** One-time or periodic processing of 10s-100s of images from local directory

```
Input Directory
    ↓
Load Images
    ↓
For Each Image:
  1. Enhance (brightness, contrast, resize)
  2. Validate quality
  3. Save to output directory
    ↓
Generate summary report
```

**Technology stack:**
- Pillow for image manipulation
- OpenCV for enhancement
- Local file I/O
- Sequential processing (no parallelization needed)

**Estimated setup time:** 1-2 hours

---

### Architecture B: CSV-Driven Cloud Pipeline
**Best for:** Processing 100s-1000s of images from URLs, uploading to cloud storage

```
CSV Input (brand, model, image_url)
    ↓
For Each Row:
  1. Download image (with retry strategies)
  2. Process (background removal, enhancement)
  3. Validate quality
  4. Upload to GCS/S3
  5. Verify upload succeeded
    ↓
Generate Output CSV (brand, model, hosted_url)
Generate Failed Items CSV for re-processing
```

**Technology stack:**
- Pandas for CSV processing
- Requests with retry logic
- Replicate/remove.bg for background removal
- GCS/S3 SDK for upload
- Error aggregation pattern

**Estimated setup time:** 4-6 hours

**Key modules:**
- `CSVProcessor`: Read/write CSVs
- `ImageDownloader`: Download with retry strategies
- `ImageProcessor`: Enhancement, background removal
- `ImageValidator`: Quality checks
- `CloudUploader`: Upload with verification
- `CSVGenerator`: Output CSVs with hosted URLs

---

### Architecture C: AI-Powered Classification Pipeline
**Best for:** Processing diverse images that need routing based on AI classification

```
Input Images
    ↓
AI Classification (Gemini/OpenAI Vision)
    ↓
Route to Type-Specific Processing:
  - Type A → Background removal + enhancement
  - Type B → AI generation + composition
  - Type C → Traditional processing
    ↓
Validate & Upload
    ↓
Generate results with metadata
Track costs per image type
```

**Technology stack:**
- Google GenAI / OpenAI SDK
- Type-specific processing modules
- Cost tracking system
- Metadata storage (JSON or database)

**Estimated setup time:** 8-12 hours

**Key modules:**
- `AIClassifier`: Classify images with cost tracking
- `ProcessingRouter`: Route to type-specific processors
- `TypeAProcessor`, `TypeBProcessor`, etc.
- `CostTracker`: Log API costs
- `MetadataStore`: Store classification results

---

### Architecture D: High-Volume Parallel Pipeline
**Best for:** Processing 1000s-100,000s of images with performance optimization

```
CSV Input
    ↓
Parallel Processing (8 workers):
  Worker 1-8: Download → Process → Upload
    ↓
Incremental progress saving (every 50 images)
    ↓
Error aggregation & retry queue
    ↓
Final summary & cost report
```

**Technology stack:**
- Joblib for parallelization
- Redis/database for progress tracking
- Separate retry queue for failures
- Monitoring & alerting

**Estimated setup time:** 16-24 hours

**Key modules:**
- `ParallelProcessor`: Joblib-based parallel execution
- `ProgressTracker`: Track completion status
- `RetryQueue`: Failed items for re-processing
- `RateLimiter`: Respect API limits
- `MonitoringSystem`: Track throughput, errors

---

### Architecture E: Serverless Event-Driven Pipeline
**Best for:** Real-time processing as images are uploaded, auto-scaling

```
Image Upload (S3, GCS)
    ↓
Cloud Function Triggered
    ↓
Download → Process → Validate → Upload
    ↓
Publish result to queue/database
    ↓
Optional: Trigger downstream workflows
```

**Technology stack:**
- AWS Lambda / Google Cloud Functions
- S3/GCS event triggers
- Queue system (SQS, Pub/Sub)
- Serverless-friendly libraries (no heavy dependencies)

**Estimated setup time:** 24-40 hours (includes cloud setup)

**Key modules:**
- `CloudFunctionHandler`: Entry point
- `LightweightProcessor`: Optimized for cold starts
- `EventPublisher`: Publish results
- `DeadLetterQueue`: Handle failures

---

## Scaffolding Steps

Based on your selected architecture, I'll create the complete pipeline structure. Here's the general approach:

### Step 1: Project Structure

```
image-pipeline/
├── config.py                    # Configuration & environment variables
├── requirements.txt             # Python dependencies
├── .env.example                 # Example environment variables
├── README.md                    # Documentation
├── main.py                      # Entry point / CLI
├── pipeline/
│   ├── __init__.py
│   ├── processor.py             # Main pipeline orchestration
│   ├── downloader.py            # Image download with retry
│   ├── enhancer.py              # Image enhancement (Pillow, OpenCV)
│   ├── background.py            # Background removal
│   ├── classifier.py            # AI classification (optional)
│   ├── validator.py             # Quality validation
│   ├── uploader.py              # Cloud upload with verification
│   ├── csv_io.py                # CSV reading/writing
│   └── cost_tracker.py          # Cost tracking (optional)
├── tests/
│   ├── test_processor.py
│   ├── test_validator.py
│   └── sample_images/           # Test images
├── downloads/                   # Downloaded images (auto-created)
├── processed/                   # Processed images (auto-created)
├── screenshots/                 # Error screenshots (auto-created)
├── csv_outputs/                 # Output CSVs (auto-created)
└── logs/                        # Log files (auto-created)
```

### Step 2: Core Configuration

```python
# config.py
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

class Config:
    # API Keys
    REPLICATE_API_TOKEN = os.getenv('REPLICATE_API_TOKEN')
    REMOVEBG_API_KEY = os.getenv('REMOVEBG_API_KEY')
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

    # Cloud Storage
    GCS_BUCKET_NAME = os.getenv('GCS_BUCKET_NAME')
    GCS_CREDENTIALS_PATH = os.getenv('GCS_CREDENTIALS_PATH')
    GCS_PREFIX = os.getenv('GCS_PREFIX', 'processed_images')

    # Processing Settings
    MIN_WIDTH = int(os.getenv('MIN_WIDTH', '800'))
    MIN_HEIGHT = int(os.getenv('MIN_HEIGHT', '800'))
    MAX_FILE_SIZE_MB = int(os.getenv('MAX_FILE_SIZE_MB', '5'))

    # Performance Settings
    THROTTLE_SECONDS = float(os.getenv('THROTTLE_SECONDS', '2.0'))
    SAVE_EVERY = int(os.getenv('SAVE_EVERY', '5'))
    REQUEST_TIMEOUT = int(os.getenv('REQUEST_TIMEOUT', '30'))
    MAX_RETRIES = int(os.getenv('MAX_RETRIES', '3'))

    # Directories
    DOWNLOAD_DIR = Path('downloads')
    PROCESSED_DIR = Path('processed')
    SCREENSHOT_DIR = Path('screenshots')
    CSV_OUTPUT_DIR = Path('csv_outputs')
    LOG_DIR = Path('logs')

    @classmethod
    def validate(cls):
        """Validate required configuration."""
        errors = []
        if not cls.REPLICATE_API_TOKEN:
            errors.append("REPLICATE_API_TOKEN is required")
        # Add more validation as needed
        if errors:
            raise ValueError(f"Configuration errors: {', '.join(errors)}")
```

### Step 3: Image Processor Module

```python
# pipeline/enhancer.py
from PIL import Image, ImageEnhance
import cv2
import numpy as np
from typing import Optional
import logging

class ImageEnhancer:
    """Enhance images: brightness, contrast, sharpness, resize."""

    def __init__(self, min_width=800, min_height=800):
        self.logger = logging.getLogger(__name__)
        self.min_width = min_width
        self.min_height = min_height

    def enhance(self, image: Image.Image,
                brightness: float = 1.1,
                contrast: float = 1.2,
                sharpness: float = 1.0) -> Image.Image:
        """Apply enhancement to image.

        Args:
            image: Input PIL Image
            brightness: Brightness multiplier (1.0 = no change)
            contrast: Contrast multiplier (1.0 = no change)
            sharpness: Sharpness multiplier (1.0 = no change)

        Returns:
            Enhanced PIL Image
        """
        try:
            self.logger.info("Enhancing image")

            # Convert to RGB if needed
            if image.mode != 'RGB':
                image = image.convert('RGB')

            # Apply Gaussian blur for noise reduction
            img_array = np.array(image)
            img_array = cv2.GaussianBlur(img_array, (3, 3), 0)

            # Unsharp mask for sharpness
            gaussian = cv2.GaussianBlur(img_array, (0, 0), 2.0)
            img_array = cv2.addWeighted(img_array, 1.5, gaussian, -0.5, 0)

            enhanced = Image.fromarray(img_array)

            # Brightness enhancement
            if brightness != 1.0:
                enhancer = ImageEnhance.Brightness(enhanced)
                enhanced = enhancer.enhance(brightness)

            # Contrast enhancement
            if contrast != 1.0:
                enhancer = ImageEnhance.Contrast(enhanced)
                enhanced = enhancer.enhance(contrast)

            # Sharpness enhancement
            if sharpness != 1.0:
                enhancer = ImageEnhance.Sharpness(enhanced)
                enhanced = enhancer.enhance(sharpness)

            return enhanced

        except Exception as e:
            self.logger.error(f"Enhancement failed: {str(e)}")
            return image  # Return original on failure

    def resize_if_needed(self, image: Image.Image) -> Image.Image:
        """Resize image to meet minimum dimensions."""
        width, height = image.size

        if width < self.min_width or height < self.min_height:
            ratio = max(self.min_width / width, self.min_height / height)
            new_width = int(width * ratio)
            new_height = int(height * ratio)

            self.logger.info(f"Resizing from {width}x{height} to {new_width}x{new_height}")
            image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)

        return image
```

### Step 4: Background Removal Module

```python
# pipeline/background.py
import os
import replicate
from PIL import Image
from io import BytesIO
import requests
import logging

class BackgroundRemover:
    """Remove backgrounds using Replicate API or remove.bg."""

    def __init__(self, api_token: Optional[str] = None,
                 removebg_key: Optional[str] = None):
        self.logger = logging.getLogger(__name__)
        self.replicate_token = api_token or os.getenv('REPLICATE_API_TOKEN')
        self.removebg_key = removebg_key or os.getenv('REMOVEBG_API_KEY')

        if self.replicate_token:
            replicate.api_token = self.replicate_token

    def remove_background(self, image: Image.Image,
                         file_extension: str = '.png') -> Image.Image:
        """Remove background from image.

        Args:
            image: Input PIL Image
            file_extension: Original file extension (determines API choice)

        Returns:
            Image with transparent background (RGBA)
        """
        # TIF files → remove.bg (best for jewelry, products)
        if file_extension.lower() == '.tif' and self.removebg_key:
            return self._remove_bg_api(image)

        # JPG/PNG → Replicate ISNet model (best for fine details)
        return self._remove_bg_replicate(image)

    def _remove_bg_replicate(self, image: Image.Image) -> Image.Image:
        """Remove background using Replicate API."""
        try:
            self.logger.info("Removing background with Replicate")

            # Save to BytesIO
            buffer = BytesIO()
            image.save(buffer, format='PNG')
            buffer.seek(0)

            # Run Replicate model
            output = replicate.run(
                "cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003",
                input={"image": buffer}
            )

            # Download result
            output_url = str(output)
            response = requests.get(output_url, timeout=30)
            response.raise_for_status()

            result = Image.open(BytesIO(response.content))

            # Ensure RGBA
            if result.mode != 'RGBA':
                result = result.convert('RGBA')

            return result

        except Exception as e:
            self.logger.error(f"Replicate background removal failed: {str(e)}")
            raise

    def _remove_bg_api(self, image: Image.Image) -> Image.Image:
        """Remove background using remove.bg API."""
        try:
            self.logger.info("Removing background with remove.bg")

            # Save to BytesIO
            buffer = BytesIO()
            image.save(buffer, format='PNG')
            buffer.seek(0)

            # Call remove.bg API
            response = requests.post(
                'https://api.remove.bg/v1.0/removebg',
                files={'image_file': buffer},
                data={'size': 'auto'},
                headers={'X-Api-Key': self.removebg_key},
                timeout=30
            )
            response.raise_for_status()

            result = Image.open(BytesIO(response.content))

            # Ensure RGBA
            if result.mode != 'RGBA':
                result = result.convert('RGBA')

            return result

        except Exception as e:
            self.logger.error(f"remove.bg API failed: {str(e)}")
            raise
```

### Step 5: Image Validator Module

```python
# pipeline/validator.py
from PIL import Image
import numpy as np
import cv2
from typing import Dict, Any, List
import logging

class ImageValidator:
    """Validate image quality: size, transparency, clarity, artifacts."""

    def __init__(self, min_width=800, min_height=800, max_file_size_mb=5):
        self.logger = logging.getLogger(__name__)
        self.min_width = min_width
        self.min_height = min_height
        self.max_file_size_mb = max_file_size_mb

    def validate(self, image: Image.Image) -> Dict[str, Any]:
        """Comprehensive image validation.

        Returns:
            {
                'is_valid': bool,
                'errors': List[str],
                'warnings': List[str],
                'metrics': {...}
            }
        """
        errors: List[str] = []
        warnings: List[str] = []

        width, height = image.size

        # Size validation
        if width < self.min_width or height < self.min_height:
            errors.append(
                f"Image too small: {width}x{height} "
                f"(minimum: {self.min_width}x{self.min_height})"
            )

        # Transparency check (for background-removed images)
        has_transparency = self._check_transparency(image)
        if not has_transparency and image.mode == 'RGBA':
            warnings.append("No transparency detected - background may not be removed")

        # Quality checks
        img_array = np.array(image)

        # Contrast check
        if image.mode == 'RGBA':
            rgb_array = img_array[:, :, :3]
        else:
            rgb_array = img_array

        contrast = np.std(rgb_array)
        if contrast < 10:
            errors.append("Very low contrast - image may be corrupted")

        # Blur check
        gray = np.mean(rgb_array, axis=2).astype(np.uint8)
        laplacian_var = np.var(cv2.Laplacian(gray, cv2.CV_64F))
        if laplacian_var < 100:
            warnings.append("Image may be blurry")

        # Artifact check (jagged edges)
        if image.mode == 'RGBA':
            alpha = img_array[:, :, 3]
            edges = cv2.Canny(alpha, 50, 150)
            edge_ratio = np.sum(edges > 0) / (width * height)
            if edge_ratio > 0.1:
                warnings.append("Image may have jagged edges")

        return {
            'is_valid': len(errors) == 0,
            'errors': errors,
            'warnings': warnings,
            'metrics': {
                'width': width,
                'height': height,
                'mode': image.mode,
                'has_transparency': has_transparency,
                'contrast': float(contrast),
                'blur_score': float(laplacian_var)
            }
        }

    def _check_transparency(self, image: Image.Image) -> bool:
        """Check if image has transparent pixels."""
        if image.mode != 'RGBA':
            return False

        img_array = np.array(image)
        alpha_channel = img_array[:, :, 3]
        return np.any(alpha_channel < 255)
```

### Step 6: CSV Processor Module

```python
# pipeline/csv_io.py
import pandas as pd
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any
import logging

class CSVProcessor:
    """Read and write CSV files for pipeline I/O."""

    def __init__(self):
        self.logger = logging.getLogger(__name__)

    def read_input_csv(self, csv_path: str) -> List[Dict[str, str]]:
        """Read input CSV with required columns.

        Expected columns: brand, model_name, image_url

        Returns:
            List of dicts with CSV data
        """
        try:
            df = pd.read_csv(csv_path)

            # Validate required columns
            required = ['brand', 'model_name', 'image_url']
            missing = [col for col in required if col not in df.columns]
            if missing:
                raise ValueError(f"Missing required columns: {missing}")

            # Remove rows with empty image_url
            df = df.dropna(subset=['image_url'])

            self.logger.info(f"Loaded {len(df)} rows from {csv_path}")

            return df.to_dict('records')

        except Exception as e:
            self.logger.error(f"Failed to read CSV: {str(e)}")
            raise

    def write_results_csv(self, results: List[Dict[str, Any]],
                          output_dir: Path,
                          prefix: str = 'results') -> str:
        """Write processing results to CSV.

        Args:
            results: List of result dicts
            output_dir: Output directory
            prefix: Filename prefix

        Returns:
            Path to written CSV
        """
        try:
            output_dir.mkdir(parents=True, exist_ok=True)

            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"{prefix}_{timestamp}.csv"
            output_path = output_dir / filename

            df = pd.DataFrame(results)
            df.to_csv(output_path, index=False)

            self.logger.info(f"Wrote {len(df)} results to {output_path}")

            return str(output_path)

        except Exception as e:
            self.logger.error(f"Failed to write CSV: {str(e)}")
            raise

    def write_hosted_urls_csv(self, hosted_urls: Dict[str, str],
                               output_dir: Path) -> str:
        """Write brand/model → hosted URL mapping CSV.

        Args:
            hosted_urls: Dict of {brand_model_name: hosted_url}
            output_dir: Output directory

        Returns:
            Path to written CSV
        """
        try:
            rows = []
            for brand_model_name, url in hosted_urls.items():
                # Split brand_model_name back to brand and model
                parts = brand_model_name.split('_', 1)
                if len(parts) == 2:
                    brand, model = parts
                else:
                    brand = brand_model_name
                    model = ''

                rows.append({
                    'brand': brand,
                    'model_name': model,
                    'hosted_url': url
                })

            return self.write_results_csv(
                rows, output_dir, prefix='brand_model_url_mapping'
            )

        except Exception as e:
            self.logger.error(f"Failed to write hosted URLs CSV: {str(e)}")
            raise
```

### Step 7: Main Pipeline Orchestrator

```python
# pipeline/processor.py
from pathlib import Path
from typing import Optional, Dict, Any, List
import logging

from .enhancer import ImageEnhancer
from .background import BackgroundRemover
from .validator import ImageValidator
from .csv_io import CSVProcessor

class ImagePipeline:
    """Main pipeline orchestrator."""

    def __init__(self, config):
        self.config = config
        self.logger = logging.getLogger(__name__)

        # Initialize modules
        self.enhancer = ImageEnhancer(
            min_width=config.MIN_WIDTH,
            min_height=config.MIN_HEIGHT
        )
        self.background_remover = BackgroundRemover()
        self.validator = ImageValidator(
            min_width=config.MIN_WIDTH,
            min_height=config.MIN_HEIGHT,
            max_file_size_mb=config.MAX_FILE_SIZE_MB
        )
        self.csv_processor = CSVProcessor()

        # Track results
        self.processed_images: List[Dict] = []
        self.failed_images: List[Dict] = []

    def process_from_csv(self, csv_path: str,
                         start_index: int = 0,
                         limit: Optional[int] = None) -> Dict[str, Any]:
        """Process images from CSV input.

        Args:
            csv_path: Path to input CSV
            start_index: Start processing from this index
            limit: Process at most this many images

        Returns:
            Summary dict with results
        """
        # Read CSV
        csv_data = self.csv_processor.read_input_csv(csv_path)

        # Apply start/limit
        total = len(csv_data)
        end_index = total if limit is None else min(start_index + limit, total)
        csv_data = csv_data[start_index:end_index]

        self.logger.info(
            f"Processing {len(csv_data)} images "
            f"(index {start_index} to {end_index-1} of {total} total)"
        )

        # Process each image
        for entry in csv_data:
            try:
                result = self._process_single_image(entry)
                if result['success']:
                    self.processed_images.append(result)
                else:
                    self.failed_images.append(result)
            except Exception as e:
                self.logger.error(
                    f"Failed to process {entry.get('brand')} "
                    f"{entry.get('model_name')}: {str(e)}"
                )
                self.failed_images.append({
                    'brand': entry.get('brand'),
                    'model_name': entry.get('model_name'),
                    'image_url': entry.get('image_url'),
                    'error': str(e),
                    'success': False
                })

        return {
            'total_processed': len(self.processed_images),
            'total_failed': len(self.failed_images),
            'processed': self.processed_images,
            'failed': self.failed_images
        }

    def _process_single_image(self, entry: Dict[str, str]) -> Dict[str, Any]:
        """Process a single image.

        Args:
            entry: Dict with 'brand', 'model_name', 'image_url'

        Returns:
            Result dict
        """
        brand = entry['brand']
        model_name = entry['model_name']
        image_url = entry['image_url']

        self.logger.info(f"Processing: {brand} {model_name}")

        try:
            # TODO: Download image from URL
            # TODO: Enhance image
            # TODO: Remove background
            # TODO: Validate result
            # TODO: Save processed image

            # Placeholder result
            return {
                'brand': brand,
                'model_name': model_name,
                'image_url': image_url,
                'success': True,
                'processed_path': f"processed/{brand}_{model_name}.png"
            }

        except Exception as e:
            self.logger.error(f"Processing failed: {str(e)}")
            return {
                'brand': brand,
                'model_name': model_name,
                'image_url': image_url,
                'error': str(e),
                'success': False
            }
```

### Step 8: CLI Entry Point

```python
# main.py
import typer
import logging
from pathlib import Path
from rich.console import Console
from rich.logging import RichHandler

from config import Config
from pipeline.processor import ImagePipeline

app = typer.Typer()
console = Console()

def setup_logging(log_level: str = "INFO"):
    """Configure logging."""
    Config.LOG_DIR.mkdir(parents=True, exist_ok=True)

    # File handler
    from datetime import datetime
    log_file = Config.LOG_DIR / f"pipeline_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"

    logging.basicConfig(
        level=log_level,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[
            RichHandler(console=console, rich_tracebacks=True),
            logging.FileHandler(log_file)
        ]
    )

@app.command()
def process(
    input_csv: Path = typer.Option(..., help="Input CSV path"),
    start_index: int = typer.Option(0, help="Start index"),
    limit: int = typer.Option(None, help="Max images to process"),
    log_level: str = typer.Option("INFO", help="Log level")
):
    """Process images from CSV input."""
    setup_logging(log_level)

    try:
        # Validate config
        Config.validate()

        # Initialize pipeline
        pipeline = ImagePipeline(Config)

        # Process images
        console.print(f"[bold]Processing images from {input_csv}[/bold]")
        results = pipeline.process_from_csv(
            str(input_csv),
            start_index=start_index,
            limit=limit
        )

        # Print summary
        console.print(f"\n[bold green]✓ Processed: {results['total_processed']}[/bold green]")
        console.print(f"[bold red]✗ Failed: {results['total_failed']}[/bold red]")

    except Exception as e:
        console.print(f"[bold red]Error: {str(e)}[/bold red]")
        raise typer.Exit(1)

if __name__ == "__main__":
    app()
```

### Step 9: Requirements File

```
# requirements.txt
# Core dependencies
Pillow>=10.0.0
opencv-python>=4.8.0
numpy>=1.24.0
pandas>=2.1.0
requests>=2.31.0

# Cloud storage (optional - uncomment if needed)
# google-cloud-storage>=2.10.0
# boto3>=1.28.0

# AI APIs (optional - uncomment if needed)
# replicate>=0.25.0
# google-genai>=0.2.0
# openai>=1.0.0

# CLI & utilities
typer[all]>=0.12.0
rich>=13.7.0
python-dotenv>=1.0.0

# Performance (optional - uncomment for parallel processing)
# joblib>=1.3.0

# Screenshot capture (optional - uncomment if needed)
# selenium>=4.15.0
```

### Step 10: Environment Variables Template

```bash
# .env.example
# Copy to .env and fill in your values

# API Keys
REPLICATE_API_TOKEN=your_replicate_token_here
REMOVEBG_API_KEY=your_removebg_key_here
GEMINI_API_KEY=your_gemini_key_here

# Cloud Storage (Google Cloud Storage)
GCS_BUCKET_NAME=your_bucket_name
GCS_CREDENTIALS_PATH=/path/to/credentials.json
GCS_PREFIX=processed_images

# Cloud Storage (AWS S3) - alternative to GCS
# AWS_ACCESS_KEY_ID=your_access_key
# AWS_SECRET_ACCESS_KEY=your_secret_key
# S3_BUCKET_NAME=your_bucket_name
# S3_PREFIX=processed_images

# Processing Settings
MIN_WIDTH=800
MIN_HEIGHT=800
MAX_FILE_SIZE_MB=5

# Performance Settings
THROTTLE_SECONDS=2.0
SAVE_EVERY=5
REQUEST_TIMEOUT=30
MAX_RETRIES=3

# Proxy List (optional, comma-separated)
# PROXY_LIST=http://proxy1:8080,http://proxy2:8080
```

## Testing Strategy

### Unit Tests

```python
# tests/test_validator.py
import pytest
from PIL import Image
import numpy as np
from pipeline.validator import ImageValidator

def test_validate_size():
    """Test size validation."""
    validator = ImageValidator(min_width=800, min_height=800)

    # Valid size
    img = Image.new('RGB', (1000, 1000))
    result = validator.validate(img)
    assert result['is_valid'] == True

    # Too small
    img = Image.new('RGB', (500, 500))
    result = validator.validate(img)
    assert result['is_valid'] == False
    assert any('too small' in err.lower() for err in result['errors'])

def test_transparency_detection():
    """Test transparency detection."""
    validator = ImageValidator()

    # No transparency
    img = Image.new('RGBA', (1000, 1000), (255, 255, 255, 255))
    result = validator.validate(img)
    assert result['metrics']['has_transparency'] == False

    # Has transparency
    img = Image.new('RGBA', (1000, 1000), (255, 255, 255, 128))
    result = validator.validate(img)
    assert result['metrics']['has_transparency'] == True
```

### Integration Tests

```python
# tests/test_pipeline.py
import pytest
from pathlib import Path
from pipeline.processor import ImagePipeline
from config import Config

def test_process_sample_images():
    """Test processing sample images."""
    pipeline = ImagePipeline(Config)

    # Use sample images
    results = pipeline.process_from_csv(
        'tests/sample_input.csv',
        limit=3
    )

    assert results['total_processed'] >= 0
    assert 'failed' in results
    assert 'processed' in results
```

### Sample Images for Testing

Create a `tests/sample_images/` directory with:
- `valid_image.png` - Normal image (1000x1000)
- `small_image.png` - Too small (400x400)
- `transparent_image.png` - Image with transparency
- `corrupt_image.png` - Intentionally corrupted file

### Quality Metrics

Track these metrics for your pipeline:
- **Success Rate**: `processed / (processed + failed)`
- **Average Processing Time**: Time per image
- **Validation Pass Rate**: Images passing quality checks
- **API Cost Per Image**: Total API costs / images processed
- **Error Distribution**: Most common error types

## Next Steps

After I create the scaffolding:

1. **Test with sample images** (5-10 images) to validate the pipeline
2. **Add missing modules** based on your specific needs (AI classification, cloud upload, etc.)
3. **Run a pilot batch** (50-100 images) to measure performance
4. **Optimize bottlenecks** (parallel processing, caching, API selection)
5. **Set up monitoring** (error alerts, cost tracking, throughput metrics)
6. **Document edge cases** (failed images, special handling rules)
7. **Create runbooks** (how to re-run failures, how to resume interrupted batches)

## Common Pitfalls to Avoid

Based on CoPilot's experience:

1. **Don't skip validation** - Always validate processed images before uploading
2. **Don't assume uploads succeed** - Always verify files exist in cloud storage
3. **Don't stop on first failure** - Use error aggregation to process entire batch
4. **Don't ignore rate limits** - Add throttling to avoid API bans
5. **Don't lose progress** - Save incrementally every N images
6. **Don't use generic exceptions** - Log detailed error context for debugging
7. **Don't forget URL encoding** - Properly encode spaces and special characters in URLs
8. **Don't skip cost tracking** - API costs add up quickly at scale

## Resources

Industry best practices for 2026:

- [Computer Vision Pipeline Optimization (GPU Computing)](https://www.runpod.io/articles/guides/computer-vision-pipeline-optimization-accelerating-image-processing-workflows-with-gpu-computing)
- [Building a Serverless Image Processing Pipeline on AWS](https://medium.com/@ikbenezer/building-a-serverless-image-processing-pipeline-on-aws-a-complete-guide-6897e586cd43)
- [Image Classification Models: Top 2026 Picks](https://labelyourdata.com/articles/image-classification-models)
- [Production-Grade Error Handling in Python](https://medium.com/the-pythonworld/production-grade-error-handling-in-python-a-practical-guide-3e871e1ad70e)
- [Python Batch Processing with Joblib (2026)](https://johal.in/python-batch-processing-with-joblib-parallel-loky-backends-scheduling-2026/)
- [Nano Banana Pro Batch API Cost Optimization](https://blog.laozhang.ai/en/posts/nano-banana-pro-batch-api-cost-optimization)

## Ready to Build?

Tell me:
1. Which architecture fits your needs? (A, B, C, D, or E)
2. Answers to the discovery questions above
3. Any specific requirements or constraints

I'll create the complete pipeline scaffolding with all modules, tests, and documentation ready to use.
