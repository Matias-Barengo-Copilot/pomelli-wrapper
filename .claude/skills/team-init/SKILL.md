---
name: team-init
description: Interview engineer and generate project-specific CLAUDE.md tailored to stack and workflow. Use when starting new projects or when CLAUDE.md doesn't exist.
argument-hint: "[stack-hint]"
allowed-tools: Write, Read, Glob, Grep, AskUserQuestion
---

# Team Init - CLAUDE.md Generator

Generate a comprehensive, project-specific CLAUDE.md by interviewing the engineer about the project.

## When to Use

- Starting a new project
- Existing project has no CLAUDE.md
- Automatically triggered by setup.sh if no CLAUDE.md found

## Arguments

Stack hint (optional): `$ARGUMENTS`
- If provided (e.g., "fastapi", "nextjs"), skip stack question
- If not provided, ask all questions

## Interview Questions

Ask these questions one at a time:

### 1. Stack
**If not provided as argument:**
- What's your tech stack?
  - Python/FastAPI
  - Node/Next.js
  - Other (specify)

### 2. Project Purpose
- What does this project do?
- Who is it for?
- What problem does it solve?

### 3. Client/Domain
- Who is the client? (if applicable)
- What industry?
- Any domain-specific terminology Claude should understand?

### 4. Core User Flows
- What are the 2-3 most important user flows or use cases?

### 5. Database
- What database are you using?
- ORM/query library?

### 6. Authentication
- How does this project handle authentication?
  - JWT tokens
  - OAuth
  - Session-based
  - None yet
  - Other

### 7. Deployment
- Where will this deploy?
  - Docker
  - Serverless (AWS Lambda, etc.)
  - Traditional server
  - Not decided yet

### 8. Folder Structure
- Do you have a preferred folder structure/convention?
- Or should I suggest one based on the stack?

### 9. Known Antipatterns
- Are there specific approaches or libraries you've decided NOT to use?
- Any past decisions that were reversed?

## CLAUDE.md Generation

Based on answers, generate a comprehensive CLAUDE.md following this structure:

```markdown
# CLAUDE.md

## Project Purpose

[What/who/why from interview]

## Tech Stack

- **Language/Framework:** [from stack question]
- **Database:** [from database question]
- **Authentication:** [from auth question]
- **Deployment:** [from deployment question]

## Folder Structure

[Describe or suggest structure based on stack]

## Conventions

### Naming
- Files: [stack-specific convention]
- Functions/methods: [stack-specific convention]
- Variables: [stack-specific convention]

### Error Handling
[Stack-specific error handling pattern]

### Configuration
[How env vars/config managed]

### Logging
[Logging approach for this stack]

## What Not to Do

[Antipatterns from interview or stack-specific common mistakes]

## References

- ClickUp: [if project has one]
- Figma: [if applicable]
- External APIs: [if mentioned]
```

### Stack-Specific Sections

#### For Python/FastAPI:

Add these sections:

```markdown
## Python/FastAPI Conventions

### File Structure
```
project/
├── main.py           # FastAPI app initialization
├── routers/          # API route handlers
├── models/           # Database models (SQLAlchemy/Pydantic)
├── services/         # Business logic
├── utils/            # Shared utilities
└── tests/            # pytest tests
```

### Dependencies
- Use `requirements.txt` or `pyproject.toml`
- Pin major versions, allow minor/patch updates

### Testing
- Use pytest
- Test files: `test_*.py` or `*_test.py`
- Fixtures in `conftest.py`

### Linting
- Use Ruff: `ruff check .` and `ruff format .`
- Run before committing
```

#### For Node/Next.js:

Add these sections:

```markdown
## Node/Next.js Conventions

### File Structure
```
project/
├── pages/ or app/    # Next.js pages/routes
├── components/       # React components
├── lib/              # Business logic, utilities
├── styles/           # CSS/styling
├── public/           # Static assets
└── __tests__/        # Jest tests
```

### Dependencies
- Use npm or yarn (choose one)
- Lock file committed to repo

### Testing
- Use Jest + React Testing Library
- Test files: `*.test.js` or `*.test.tsx`
- Component tests co-located with components

### Linting
- ESLint + Prettier
- Run `npm run lint` before committing
```

## Output

1. Write CLAUDE.md to project root
2. Confirm with engineer:
   - "CLAUDE.md created at project root"
   - "Review and customize as needed"
   - "Committed to git? [y/N]"
3. If yes, create commit:
   ```bash
   git add CLAUDE.md
   git commit -m "docs: add project-specific CLAUDE.md via team-init"
   ```

## Notes

- Ask one question at a time
- Use engineer's actual answers (don't assume)
- If engineer says "not sure" or "not decided yet", note it as TBD in CLAUDE.md
- Tailor content to the specific stack - don't include generic boilerplate
