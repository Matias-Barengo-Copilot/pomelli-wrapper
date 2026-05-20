# Project Skill Generator System

This skill system automatically generates new project-type skills by analyzing your company's repositories and researching best practices online.

## What It Does

When you run `/project-skill-generator [type]`, Claude will:

1. **Clone representative repos** from CoPilot-Innovations
2. **Analyze them** to identify common patterns, tech stacks, and approaches
3. **Research best practices** online for that project type
4. **Generate a new skill** that asks targeted questions and provides architecture recommendations
5. **Save the skill** to the appropriate category folder

## Available Project Types

Based on analysis of 100+ CoPilot-Innovations repos, these are your most common project patterns:

| Type | Description | Example Repos | Count |
|------|-------------|---------------|-------|
| `rag-chatbot` | RAG chatbot with LLM integration, vector DB, retrieval | marks-jewelers-chatbot, nova-chatbot, hr-ai-assistant | 20+ |
| `seo-pipeline` | SEO content generation and optimization workers | ai-seo-agentic-framework, tonerprice-seo-optimization | 8+ |
| `image-pipeline` | AI-powered image processing and enhancement | tonerprice-image-processor, marks-jewelers-product-image-enhancer | 10+ |
| `admin-dashboard` | Next.js/TypeScript admin panel with CRUD operations | go-growAdminPanel, OGI-Admin-Dashboard | 8+ |
| `fastapi-backend` | Python FastAPI service with DB, auth, API endpoints | ares-mockup-backend, star-illustration-backend, ogi-specs-api | 15+ |
| `document-ocr` | Document classification and OCR processing | OGI-Document-Spec-Classifier, halo-title-ocr, resume-parser | 6+ |

## How It Works

### 1. You invoke the skill

```bash
/project-skill-generator rag-chatbot
```

### 2. Claude clones example repos

```bash
cd /tmp/skill-gen-rag-chatbot
gh repo clone CoPilot-Innovations/marks-jewelers-chatbot
gh repo clone CoPilot-Innovations/nova-chatbot
```

### 3. Claude dispatches an analyzer subagent

The subagent reads the analyzer prompt template (e.g., `prompts/rag-chatbot-analyzer.md`) which tells it:

- What to analyze in the repos (tech stack, patterns, architecture)
- What to research online (best practices, 2026 patterns)
- How to structure the generated skill (questions, recommendations, scaffolding)

### 4. The subagent creates the new skill

The analyzer subagent:
- Reads through the cloned repos
- Identifies common patterns (Which vector DB? Which LLM? How is auth done?)
- Searches for best practices online
- Generates 10-18 targeted questions to ask users
- Creates architecture recommendations based on requirements
- Documents CoPilot's proven patterns with examples
- Writes scaffolding steps

### 5. The skill is saved and committed

```
skills/
  ai/
    rag-chatbot-builder/
      SKILL.md          # The generated skill
  python/
    fastapi-backend-builder/
      SKILL.md
    image-pipeline-builder/
      SKILL.md
  node/
    admin-dashboard-builder/
      SKILL.md
```

## Using the Generated Skills

Once generated, you can use these skills to build new projects:

```bash
/rag-chatbot-builder
```

Claude will:
1. Ask you targeted questions about your project
2. Recommend architecture based on your answers
3. Show you proven patterns from CoPilot projects
4. Scaffold the project structure
5. Set up testing and deployment

## Analyzer Prompts

The analyzer prompts (in `prompts/`) tell the subagent exactly what to analyze and how to create the skill. Each prompt:

- Lists what to look for in repos (tech stack, patterns, approaches)
- Specifies what to research online (best practices, guides)
- Provides the skill template structure
- Defines question categories
- Specifies output location

## Adding New Project Types

To add a new project type:

1. Identify 2-3 representative repos from CoPilot-Innovations
2. Create `prompts/[new-type]-analyzer.md` following existing patterns
3. Add the type to the main `SKILL.md` file
4. Run `/project-skill-generator [new-type]`

## Benefits

1. **Codifies tribal knowledge** - Patterns from successful projects become reusable
2. **Reduces decision paralysis** - Clear recommendations based on requirements
3. **Faster project starts** - Questions → Recommendations → Scaffolding
4. **Consistent quality** - New projects follow proven patterns
5. **Self-documenting** - Skills explain why certain tech choices were made
6. **Always current** - Research online for 2026 best practices

## Example: RAG Chatbot Builder

After running `/project-skill-generator rag-chatbot`, you get a skill that:

**Asks questions like:**
- What domain is this chatbot for?
- What data sources will it retrieve from?
- How many concurrent users?
- What's your budget for vector DB?
- What tone should responses have?

**Recommends architecture:**
- "For <10K docs + free tier → Use Chroma (local)"
- "For 100K+ docs + production → Use Pinecone"
- "For strict accuracy needs → Use Claude with citation"
- "For cost optimization → Use GPT-4o-mini with fallback"

**Shows CoPilot patterns:**
- "Pattern: Multi-step retrieval (marks-jewelers-chatbot)"
- "Pattern: Conversation memory with Redis (nova-chatbot)"
- "Pattern: Feedback loop with thumbs up/down (allpoints-chatbot-2025)"

**Scaffolds the project:**
- Directory structure
- Vector DB setup
- Embedding pipeline
- Retrieval function
- Prompt templates
- Eval harness

## Technical Notes

- Uses `gh` CLI to clone repos (requires GitHub auth)
- Uses `Task` tool with `subagent_type="general-purpose"`
- Uses `WebSearch` for best practices research
- Analyzer subagents run with full read access to cloned repos
- Temp repos cleaned up after generation

## Future Enhancements

- **Multi-repo synthesis** - Analyze more than 2 repos for richer patterns
- **Pattern extraction** - Automatically identify and document code patterns
- **Template generation** - Generate starter templates alongside skills
- **Metrics inclusion** - Document performance characteristics from production
- **Video tutorials** - Generate video walkthrough of using the skill
