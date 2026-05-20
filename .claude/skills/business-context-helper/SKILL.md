---
name: business-context-helper
description: Generate business context documentation for clients, products, or accounts. Use when starting new projects, onboarding engineers, documenting client info, defining target users, or understanding business goals. Gathers info from ClickUp, web search, and PM interviews. Covers company overview, target users, business goals, success metrics, domain terminology, communication preferences. Run before PRDs and specs for better context. Triggers on business context, client documentation, company info, target users, business goals, account setup, client onboarding, domain knowledge, project context.
argument-hint: "[company-name or account-name]"
allowed-tools: Read, Write, WebSearch, ClickUp(*)
---

# Business Context Helper

Generate comprehensive business context documentation by intelligently gathering information from ClickUp (if available), searching the web for company info, and asking targeted questions to fill gaps.

## When to Use

- Starting a new client project and need to document business context
- Existing project lacks business context documentation
- PM needs to onboard engineers on client background
- Engineers need to understand "why are we building this?"
- Account/project context has changed and needs updating

## Arguments

Company or account name (optional): `$ARGUMENTS`
- If provided (e.g., "Marks Jewelers"), use this to search
- If not provided, ask during the process

## Process

### Step 1: Get Company/Account Name

**If not provided as argument:**
"What is the company or account name we're documenting business context for?"

Store this as the search term.

### Step 2: Gather Information Automatically

Try to gather as much information as possible before asking questions.

#### A. Check ClickUp (if MCP available)

**Only if ClickUp MCP is enabled:**

Try to find the account or project in ClickUp:

```
1. Search for spaces/folders/lists matching the company name
2. Look for:
   - Space descriptions
   - Folder descriptions with client overview
   - Task lists with project goals
   - Custom fields with client info
   - Any "Overview" or "Context" documents
3. Extract:
   - Client description
   - Project goals
   - Target users (if mentioned)
   - Key stakeholders
   - Current priorities
```

**If ClickUp MCP is not available:** Skip this step and note "ClickUp integration not available - relying on web search and manual input"

#### B. Search Online for Company Information

Use WebSearch to gather public information:

**Search 1: Company overview**
Query: `"[Company Name]" company overview business`

Look for:
- Company website
- LinkedIn company page
- Crunchbase or similar business profiles
- Industry and sector
- Company size
- Geographic presence

**Search 2: What they do**
Query: `"[Company Name]" products services what they do`

Look for:
- Main products or services
- Target market
- Value proposition
- Business model

**Search 3: Recent news (if relevant)**
Query: `"[Company Name]" news 2026 OR 2025`

Look for:
- Recent developments
- Growth stage (startup, established, enterprise)
- Major initiatives

#### C. Synthesize Findings

After ClickUp search (if available) and web searches, create a preliminary business context outline with:

**What we know:**
- Company name, industry, size
- What they do (products/services)
- Information from ClickUp (if found)
- Any other gathered details

**What we need to clarify:**
- List specific gaps (target users, business goals, terminology, etc.)

### Step 3: Ask Targeted Questions

Based on gaps identified, ask targeted questions **one at a time**. Skip questions if you already have the answer from ClickUp or web search.

#### Core Information

**1. Confirm company overview (if unclear from search):**
"I found that [Company Name] is [description from search]. Is this accurate? Anything to add or correct?"

**2. What's their industry/sector?**
"What industry or sector is this company in?"
(Examples: E-commerce, Healthcare, SaaS, Manufacturing, Education, Finance)

**3. Company size (if not found):**
"What's the company size? (Rough employee count or revenue tier is fine)"

**4. What do they do? (if unclear from search):**
"In 2-3 sentences, what does this company do? What products or services do they offer?"

#### Target Users

**5. Who are the primary users of what we're building?**
"Who are the primary users? (Job titles, roles, or demographics)"

Examples:
- B2C: Consumers, shoppers, patients, students
- B2B: Sales reps, managers, accountants, HR staff

**6. What problems do they have?**
"What specific problems or pain points do these users have that we're solving?"

**7. How do they use the product?**
"In what context do users interact with this product? (Desktop at work? Mobile on-the-go? Intermittent vs daily use?)"

#### Business Goals

**8. What are the primary business goals for this project?**
"What are the top 2-3 business goals for this project?"

Examples:
- Increase user retention by X%
- Reduce support ticket volume
- Expand to enterprise customers
- Improve conversion rate
- Automate manual processes

**9. How do we measure success?**
"What metrics will we track to measure success?"

Examples:
- Monthly Active Users (MAU)
- Customer Satisfaction Score (CSAT)
- Revenue per customer
- Time to complete task
- Error rate reduction

#### Domain Knowledge

**10. Are there domain-specific terms or jargon engineers should know?**
"Are there any domain-specific terms, acronyms, or jargon that engineers should understand?"

Examples:
- E-commerce: SKU, AOV (Average Order Value), Cart abandonment
- Healthcare: EHR (Electronic Health Record), HIPAA, Patient portal
- Finance: KYC (Know Your Customer), AML (Anti-Money Laundering)

Ask for 3-5 key terms with definitions.

#### Current Priorities

**11. What's currently high priority?**
"What features, initiatives, or tasks are currently high priority?"

Get 1-3 items that are urgent/important right now.

**12. What's on the roadmap but not urgent?**
"What's on the roadmap for later? (Medium priority or backlog items)"

Get 1-2 items for context.

#### Communication & Process

**13. Who's the primary contact?**
"Who is the primary contact for this project? (Name and role)"

**14. How does the client communicate?**
"What are the preferred communication channels and response time expectations?"

Examples:
- Slack for quick questions (respond within 2 hours)
- Email for formal updates (respond within 24 hours)
- ClickUp for task management
- Weekly check-in meetings

**15. How does review/approval work?**
"How does the review and approval process work for this project?"

Examples:
- PM reviews internally first, then presents to client
- Client stakeholder reviews directly
- Design mockups required before implementation
- Demo in staging before production deploy

#### Additional Context

**16. Any important context engineers should know?**
"Is there anything else important for engineers to know? Red flags to avoid? Cultural considerations? Specific preferences?"

Examples:
- "Client is very responsive - expects quick turnarounds"
- "Never mention competitor X in communications"
- "They're very detail-oriented - provide thorough documentation"
- "Prefer visual demos over written updates"

### Step 4: Generate business-context.md

After gathering all information, generate the business-context.md file:

```markdown
# Business Context - [Company Name]

**Owner:** [PM name if provided, otherwise "PM"]
**Last Updated:** [Current date]

> **Quick Reference:** [One sentence summary of what this company does and why we're working with them]

---

## Client Overview

### Who They Are
- **Company Name:** [Name]
- **Industry:** [Industry/sector]
- **Company Size:** [Employees or revenue tier]
- **Location:** [Geographic presence]
- **Website:** [If found from search]

### What They Do
[2-3 sentences about the client's business - from web search and/or interview]

### Background
[Any additional context from ClickUp, web search, or interview - company history, growth stage, market position]

---

## Target Users

### Primary Users
- **Who:** [Job titles, roles, or demographics]
- **Pain Points:** [What problems do they have?]
- **Usage Context:** [How/when do they use the product?]

### Secondary Users
[If applicable - otherwise note "N/A"]
- **Who:** [If applicable]
- **Needs:** [Their specific needs]

---

## Business Goals & Success Metrics

### Primary Goals
1. [Goal 1]
2. [Goal 2]
3. [Goal 3]

### How We Measure Success
- **[Metric 1]:** [Target or current baseline]
- **[Metric 2]:** [Target or current baseline]
- **[Metric 3]:** [Target or current baseline]

---

## Key Terminology

Domain-specific terms engineers should understand:

| Term | Definition | Example Usage |
|------|------------|---------------|
| [Term 1] | [Definition] | [Where it appears in the product] |
| [Term 2] | [Definition] | [Where it appears in the product] |
| [Term 3] | [Definition] | [Where it appears in the product] |

[If no domain-specific terms: "No specialized domain terminology - uses standard industry terms"]

---

## Current Priorities

### High Priority (Now)
1. [Feature/initiative 1]
2. [Feature/initiative 2]

### Medium Priority (Soon)
1. [Feature/initiative]

### Backlog (Later)
1. [Nice to have items]

---

## Communication & Process

### Primary Contact
- **Name:** [Name]
- **Role:** [Role/title]
- **Contact:** [Email, Slack, etc. if provided]

### Communication Channels
- **[Channel 1]:** [Usage and response time expectation]
- **[Channel 2]:** [Usage and response time expectation]
- **[Meetings]:** [Frequency and format]

### Review & Approval Process
[How features and changes get reviewed and approved]

1. [Step 1]
2. [Step 2]
3. [Step 3]

### Important Context
[Any specific communication preferences, red flags, cultural considerations]

- [Context point 1]
- [Context point 2]

---

## Information Sources

**Gathered from:**
- [✓] ClickUp: [Space/Folder names if found, or "Not available"]
- [✓] Web search: [Company website, LinkedIn, other sources]
- [✓] Interview: [PM/Engineer name]

**Links:**
- [Company website if found]
- [ClickUp space/overview link if applicable]
- [LinkedIn company page if found]

---

## Notes for Engineers

**Why this matters:**
Understanding the client's business context helps you:
- Make better technical decisions aligned with business goals
- Communicate effectively using their terminology
- Prioritize work that delivers real business value
- Ask informed questions during planning

**When to reference this:**
- Before starting new features (does this align with business goals?)
- When writing specs (am I using correct terminology?)
- During client meetings (who's who and what are they trying to achieve?)
- When prioritizing bugs or technical debt (what's the business impact?)

---

*Business context documented via `/business-context-helper` skill*
*Last updated: [Current date]*
*Next review: [Suggest reviewing quarterly or when priorities shift significantly]*
```

### Step 5: Save and Commit

1. **Ask where to save:**
   "I've generated your business-context.md file. Where would you like me to save it?"

   Suggest:
   - `.claude/context/business-context.md` (recommended for account-level context)
   - `accounts/[account-name]/business-context.md` (if using account structure)
   - `business-context.md` (at project root)

2. **Write the file**

3. **Confirm and offer commit:**
   "business-context.md created at [path]. Review and customize as needed."

4. **Ask:** "Would you like me to commit this to git? (y/n)"

5. **If yes, commit:**
   ```bash
   git add [path]/business-context.md
   git commit -m "docs: add business context documentation via business-context-helper

   - Client overview and background
   - Target users and pain points
   - Business goals and success metrics
   - Key terminology
   - Current priorities
   - Communication process

   Sources: ClickUp [if used], web search, PM interview

   Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
   ```

---

## Important Notes

### ClickUp Integration

**If ClickUp MCP is available:**
- Search for spaces/folders/lists matching the company name
- Look for overview or context documents
- Extract any relevant client information
- Note what was found in the final document

**If ClickUp MCP is NOT available:**
- Skip ClickUp search gracefully
- Note "ClickUp integration not available" in sources
- Rely on web search and manual interview

**How to check if ClickUp is available:**
You'll know from your available tools. If ClickUp tools are not in your toolkit, skip ClickUp steps.

### Web Search Tips

- Search for official company website first (most reliable)
- Cross-reference information from multiple sources
- Recent news can provide context on company stage/priorities
- LinkedIn company pages often have good overviews
- Crunchbase for startups/funding info

### Question Strategy

- **Skip questions you can answer from gathered data**
- **Ask one question at a time** - don't overwhelm
- **Show what you found and ask for confirmation** rather than asking from scratch
- **Be flexible** - if user says "not sure" or "we'll define that later", note "To be determined"
- **Focus on actionable information** engineers will actually use

### Quality Bar

**Good business context documentation:**
- Answers "who is the client and what do they do?" clearly
- Defines target users and their pain points
- Establishes measurable business goals
- Documents domain terminology engineers will encounter
- Provides communication guidelines and expectations
- Includes source attribution (where info came from)

**Bad business context documentation:**
- Vague descriptions ("they're a tech company")
- No clear business goals or success metrics
- Missing target user information
- No domain terminology (or assumes everyone knows it)
- Unclear communication process
- No sources cited

---

## Examples

### Example 1: E-commerce Company

**Scenario:** PM documenting context for a jewelry e-commerce client

**ClickUp found:**
- Space: "Marks Jewelers"
- Description: "Family-owned jewelry store expanding to e-commerce"
- Goals from tasks: "Increase online sales", "Improve product discovery"

**Web search found:**
- Industry: Retail - Fine Jewelry
- Company size: ~50 employees, regional presence
- Products: Engagement rings, watches, custom jewelry

**Questions filled gaps:**
- Target users: Engaged couples (primary), gift shoppers (secondary)
- Pain points: Hard to visualize jewelry online, trust concerns
- Success metrics: Conversion rate, average order value
- Key terms: SKU, product variant, engraving customization

**Result:** Comprehensive business-context.md documenting family-owned jewelry retailer expanding online, targeting engaged couples, focused on improving product visualization and trust.

### Example 2: B2B SaaS Startup

**Scenario:** Engineer documenting context for a new client project

**ClickUp:** Not available

**Web search found:**
- Crunchbase: Series A startup, HR tech
- Company size: ~30 employees
- Product: AI-powered resume parsing and candidate matching

**Questions filled gaps:**
- Target users: Recruiters and HR managers at mid-size companies
- Pain points: Manual resume screening takes hours
- Success metrics: Time saved per hire, candidate quality scores
- Key terms: ATS (Applicant Tracking System), parsing accuracy, candidate matching score
- Priority: Improve parsing accuracy for technical resumes

**Result:** Business-context.md documenting Series A HR tech startup, targeting recruiters, focused on AI resume parsing, with current priority on technical resume accuracy.

---

## Tips for PMs

- Run this skill at project kickoff to establish shared understanding
- Update business-context.md when client priorities shift significantly
- Reference this doc during sprint planning to keep work aligned with business goals
- Share with new engineers joining the project for quick onboarding

## Tips for Engineers

- Read business-context.md before starting new features
- Reference key terminology when writing user-facing text
- Use business goals to justify technical decisions in specs
- Ask PM to update if context seems stale or unclear

---

## Related Skills

- `/design-helper` - Document design system and brand guidelines
- `/onboarding-docs` - Generate technical onboarding documentation
- `/spec-generator` - Create feature specs (references business context)
- `/team-init` - Initialize CLAUDE.md for new projects

---

*Skill created to capture business context efficiently using ClickUp, web search, and targeted interviews*
