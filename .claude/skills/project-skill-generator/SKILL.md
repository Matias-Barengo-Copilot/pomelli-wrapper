---
name: project-skill-generator
description: Generate new project builder skills by analyzing company repositories and researching best practices. Meta-skill that creates other skills. Use when you want to codify a common project pattern into a reusable skill. Clones company repos, analyzes patterns, researches online, generates comprehensive builder skill with questions and architecture recommendations. Available types rag-chatbot, seo-pipeline, image-pipeline, admin-dashboard, fastapi-backend, document-ocr. Triggers on generate skill, create skill, new skill, skill generator, codify pattern, project template.
argument-hint: "[project-type]"
allowed-tools: Read, Bash(gh *), Bash(git clone*), Task
---

# Project Skill Generator

Generates a new skill for a specific project type by analyzing company repos and researching best practices.

**Available project types:**
- `rag-chatbot` - RAG chatbot with LLM integration, vector DB, retrieval
- `seo-pipeline` - SEO content generation and optimization workers
- `image-pipeline` - AI-powered image processing and enhancement
- `admin-dashboard` - Next.js/TypeScript admin panel with CRUD
- `fastapi-backend` - Python FastAPI service with DB and auth
- `document-ocr` - Document classification and OCR processing

## Process

1. **Get project type from user**
   - If provided as argument, use it
   - If not, ask which type they want to generate a skill for

2. **Clone representative repos**
   - Use `gh repo list CoPilot-Innovations` to find matching repos
   - Clone 1-2 best examples to temp directory
   - Prefer repos with good README and recent activity

3. **Dispatch analysis subagent**
   - Use Task tool with subagent_type="general-purpose"
   - Provide the subagent with:
     - Path to cloned repos
     - Project type
     - Instructions to analyze and create skill
   - Use the prompt template from `project-skill-generator/prompts/[project-type]-analyzer.md`

4. **Review and save skill**
   - Subagent creates the skill file
   - Save to `skills/[category]/[project-type]/SKILL.md`
   - Category: `python` for Python projects, `node` for TypeScript, `ai` for ML/AI focus
   - Commit the new skill

## Example Repos for Each Type

**rag-chatbot:**
- marks-jewelers-chatbot (TypeScript)
- nova-chatbot (Python)
- allpoints-chatbot-2025 (Python)
- hr-ai-assistant (Python)

**seo-pipeline:**
- ai-seo-agentic-framework (TypeScript)
- tonerprice-seo-optimization (Python)
- nova-seo-optimization (Python)

**image-pipeline:**
- tonerprice-image-processor (Python)
- marks-jewelers-product-image-enhancer (Python)
- marks-jewelers-box-images (Python)

**admin-dashboard:**
- go-growAdminPanel (TypeScript)
- OGI-Admin-Dashboard (TypeScript)
- halo-aru-dashboard-prod (TypeScript)

**fastapi-backend:**
- ares-mockup-backend (Python)
- star-illustration-backend (Python)
- ogi-specs-api (Python)

**document-ocr:**
- OGI-Document-Spec-Classifier (Python)
- halo-title-ocr (Python)
- resume-parser (Python)

## Implementation Steps

### Step 1: Get Project Type

```python
if args:
    project_type = args
else:
    # Ask user
    options = [
        "rag-chatbot",
        "seo-pipeline",
        "image-pipeline",
        "admin-dashboard",
        "fastapi-backend",
        "document-ocr"
    ]
    # Use AskUserQuestion to get selection
```

### Step 2: Clone Example Repos

```bash
# Create temp dir
mkdir -p /tmp/skill-gen-{project_type}
cd /tmp/skill-gen-{project_type}

# Clone 1-2 best examples
gh repo clone CoPilot-Innovations/{repo_name_1}
gh repo clone CoPilot-Innovations/{repo_name_2}
```

### Step 3: Dispatch Analyzer Subagent

```python
Task(
    subagent_type="general-purpose",
    prompt=f"""
Read the analyzer prompt at:
{repo_root}/skills/core/project-skill-generator/prompts/{project_type}-analyzer.md

Follow it exactly to:
1. Analyze the repos at /tmp/skill-gen-{project_type}
2. Research best practices online
3. Create a comprehensive skill file
4. Save to the specified location

The repos contain real CoPilot Innovations projects - analyze their patterns carefully.
""",
    description=f"Generate {project_type} builder skill"
)
```

### Step 4: Review and Commit

```bash
# Review the generated skill
cat skills/{category}/{project_type}-builder/SKILL.md

# Commit
git add skills/{category}/{project_type}-builder/
git commit -m "feat: add {project_type}-builder skill generated from company repos"
```

### Step 5: Clean Up

```bash
# Remove temp repos
rm -rf /tmp/skill-gen-{project_type}
```

## Example Usage

```
User: /project-skill-generator rag-chatbot