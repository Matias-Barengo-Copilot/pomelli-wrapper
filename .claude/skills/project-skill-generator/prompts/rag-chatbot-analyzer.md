# RAG Chatbot Skill Generator Prompt

You are analyzing CoPilot Innovations' RAG chatbot repositories to create a reusable skill that helps engineers build new RAG chatbot projects.

## Your Task

1. **Analyze the provided repos** (cloned to your working directory)
   - Read README, requirements.txt/package.json, main code files
   - Identify common patterns:
     - Which LLM provider (OpenAI, Anthropic, Google)?
     - Which vector DB (Pinecone, Weaviate, Chroma)?
     - Which embedding model?
     - How is retrieval implemented?
     - How are prompts structured?
     - What's the tech stack (FastAPI + React? Pure Python? TypeScript?)
     - How is context chunking done?
     - How is conversation history managed?
     - What evaluation/feedback mechanisms exist?

2. **Research best practices online** (use WebSearch)
   - Search for "RAG chatbot best practices 2026"
   - Search for "vector database selection guide"
   - Search for "LLM prompt engineering for RAG"
   - Search for "conversation memory patterns"
   - Search for "RAG evaluation metrics"

3. **Synthesize into a skill structure**
   - Create questions to ask the user about their RAG chatbot project
   - Questions should cover:
     - Domain/use case
     - Data sources (docs, website, knowledge base?)
     - User expectations (accuracy, speed, tone)
     - Scale requirements (users, documents)
     - Integration needs (embed in web? standalone? API?)
     - Budget constraints (free tier? enterprise?)

4. **Generate the skill file**
   - Use the template below
   - Fill in the questions section with 10-15 carefully crafted questions
   - Fill in the architecture recommendations section based on analysis
   - Include a "Common Patterns from CoPilot Projects" section with examples

## Skill Template

```markdown
---
name: rag-chatbot-builder
description: Build a new RAG chatbot project through guided questions and architecture recommendations
allowed-tools: Read, Write, Edit, Bash(npm *), Bash(pip *), Bash(git *)
---

# RAG Chatbot Project Builder

Guides you through building a production-ready RAG chatbot by asking targeted questions and recommending architecture based on CoPilot's proven patterns.

## Process

### 1. Understanding Your Use Case

[QUESTIONS SECTION - You generate these]
Ask the user these questions one at a time:

1. **Domain**: What domain is this chatbot for? (e.g., customer support, internal knowledge base, sales assistant)
2. **Data sources**: What data will it retrieve from? (PDFs, website, Notion, Confluence, custom docs)
3. **[Add 8-13 more questions based on your analysis]**

### 2. Architecture Recommendations

Based on answers, recommend:

**Vector Database:**
- If [condition]: Use Pinecone because [reason]
- If [condition]: Use Chroma because [reason]
[Add based on your analysis]

**LLM Provider:**
- If [condition]: Use Claude because [reason]
- If [condition]: Use GPT-4 because [reason]
[Add based on your analysis]

**Tech Stack:**
- If [condition]: FastAPI + React because [reason]
- If [condition]: Pure Python + Streamlit because [reason]
[Add based on your analysis]

### 3. Common Patterns from CoPilot Projects

[EXAMPLES SECTION - You fill this in]

**Pattern 1: [Name]**
- Used in: [repo names]
- When to use: [description]
- Implementation: [brief code example or description]

**Pattern 2: [Name]**
[Same structure]

### 4. Project Scaffolding

After recommendations approved:
1. Create directory structure
2. Set up vector DB connection
3. Create base prompt templates
4. Set up embedding pipeline
5. Create basic retrieval function
6. Set up conversation memory
7. Create evaluation harness
8. Add example data ingestion script

### 5. Testing Strategy

[TEST STRATEGY - Based on your analysis]
- Unit tests for retrieval
- Eval set for answer quality
- Load testing for scale
[Add more based on analysis]

## Next Steps

After scaffolding:
- Run ingestion pipeline on sample data
- Test retrieval quality
- Refine prompts based on results
- Set up feedback loop
```

## Output

Write the completed skill to: `skills/ai/rag-chatbot-builder/SKILL.md`

Make sure every section is filled in with specific, actionable content based on your analysis and research.
