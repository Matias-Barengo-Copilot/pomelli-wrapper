# SEO Optimization Pipeline Skill Generator Prompt

You are analyzing CoPilot Innovations' SEO optimization repositories to create a reusable skill that helps engineers build new SEO pipelines.

## Your Task

1. **Analyze the provided repos**
   - Read structure, requirements.txt, main scripts
   - Identify common patterns:
     - Data sources (Shopify, website scraping, CMS?)
     - SEO tasks (title gen, meta desc, alt text, structured data?)
     - LLM usage (which models, prompt patterns?)
     - Content strategy (keywords, tone, length?)
     - Batch processing approach
     - Quality validation
     - Publishing mechanism (API, CSV, direct DB?)
     - Performance tracking

2. **Research best practices online**
   - Search for "AI-powered SEO optimization 2026"
   - Search for "SEO content generation best practices"
   - Search for "programmatic SEO patterns"
     - Search for "SEO validation and testing"

3. **Create the skill**
   - Questions about: platform, SEO goals, content type, scale, approval workflow
   - Architecture recommendations
   - Include CoPilot's prompt patterns for SEO
   - Scaffolding steps

## Output

Write completed skill to: `skills/python/seo-pipeline-builder/SKILL.md`

Include:
- 10-15 targeted questions
- Pipeline architecture (batch generation, validation, publishing)
- Common CoPilot SEO prompt patterns (with examples)
- Scaffolding steps
- Testing strategy (content quality, SEO score validation)
