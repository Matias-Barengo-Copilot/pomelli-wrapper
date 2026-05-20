# FastAPI Backend Skill Generator Prompt

You are analyzing CoPilot Innovations' FastAPI backend repositories to create a reusable skill that helps engineers build new FastAPI services.

## Your Task

1. **Analyze the provided repos**
   - Read structure, requirements.txt, main.py, routers, models
   - Identify common patterns:
     - Database (PostgreSQL, MySQL, MongoDB?)
     - ORM (SQLAlchemy, Tortoise, raw SQL?)
     - Auth strategy (JWT, OAuth, API keys?)
     - File structure (routers, models, schemas, utils?)
     - Middleware used (CORS, logging, error handling?)
     - Deployment (Docker, EC2, Cloud Run?)
     - Testing approach (pytest, integration tests?)
     - Documentation (Swagger/OpenAPI customization?)

2. **Research best practices online**
   - Search for "FastAPI project structure best practices 2026"
   - Search for "FastAPI authentication patterns"
   - Search for "FastAPI database connection pooling"
   - Search for "FastAPI production deployment"

3. **Create the skill**
   - Questions about: purpose, data model, auth needs, scale, deployment
   - Architecture recommendations based on requirements
   - Include CoPilot's proven patterns
   - Scaffolding steps

## Output

Write completed skill to: `skills/python/fastapi-backend-builder/SKILL.md`

Include:
- 10-15 targeted questions
- Architecture decision trees
- Common patterns from analyzed repos (with examples)
- Full project scaffolding steps
- Testing strategy
