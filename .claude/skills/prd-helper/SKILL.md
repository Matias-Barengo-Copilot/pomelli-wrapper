---
name: prd-helper
description: Create comprehensive Product Requirements Documents (PRDs) for new features or products. Use when planning features, defining requirements, documenting user stories, setting success metrics, or before engineering specs. Integrates with ClickUp tasks and business context. Covers problem statements, functional requirements, success metrics, timelines, risks. First step in workflow before /spec and /plan. Triggers on PRD, product requirements, feature planning, user stories, product definition, requirements gathering, PM documentation, feature spec, product planning, requirements doc.
argument-hint: "[feature-name]"
allowed-tools: Read, Write, AskUserQuestion, WebSearch, ClickUp(*), Bash(git *)
---

# PRD Helper

Generate comprehensive Product Requirements Documents (PRDs) through intelligent discovery, context gathering, and targeted questions. This is the **first step** in the CoPilot workflow before engineers create specs.

## Workflow Position

```
PRD → Spec → Plan → Implementation
 ↑
YOU ARE HERE
```

**PRD (this skill):** Product definition - what we're building and why
**Spec (/spec):** Technical specification - how we'll build it
**Plan (/plan):** Implementation plan - steps to execute
**Implementation:** Engineers build it

## When to Use

- **Before starting any new feature or product**
- When PM needs to define requirements for engineering
- When stakeholders have an idea that needs structure
- Before creating technical specs (use PRD as input for /spec)
- When you need buy-in on product direction before engineering time

## Who Uses This

- **Primary:** Product Managers, Product Owners
- **Secondary:** Engineers who need to define product requirements
- **Stakeholders:** Anyone planning a new feature/product

## Arguments

Feature or product name (optional): `$ARGUMENTS`
- Example: `/prd-helper user-authentication`
- If not provided, will ask during discovery

---

## Process

### Step 1: Initialize

**Get feature/product name:**

If provided as argument:
- Use it as the working title
- Can be refined during discovery

If not provided:
- "What feature or product are you creating a PRD for?"
- "Provide a working name (can refine later)"

Store as `feature_name` (e.g., "user-authentication", "dashboard-analytics")

**Set context:**
Display: "Creating PRD for: **[feature_name]**. This will be the foundation for engineering specs and implementation."

---

### Step 2: Gather Existing Context

Before asking questions, check for existing context to inform the PRD.

#### A. Check for Business Context

Look for business-context.md in common locations:
- `.claude/context/business-context.md`
- `business-context.md`
- `accounts/[account-name]/business-context.md`

**If found:**
- Read it
- Extract: company overview, target users, business goals, terminology
- Note: "Found business context - will use to inform PRD"

**If not found:**
- Note: "No business context found - will ask more foundational questions"
- Suggest: "Consider running `/business-context-helper` first for better PRDs"

#### B. Check ClickUp (if MCP available)

**Only if ClickUp MCP is enabled:**

Try to find related tasks, lists, or docs:

1. Search for tasks/lists mentioning `feature_name`
2. Look for:
   - Existing feature requests
   - User feedback
   - Related project docs
   - Stakeholder comments
   - Priority/timeline info

3. Extract relevant context:
   - Why this is needed (from task descriptions)
   - Who requested it
   - Any existing user stories or requirements
   - Priority level
   - Timeline constraints

**If ClickUp MCP not available:**
- Skip gracefully
- Note: "ClickUp not available - relying on manual input"

#### C. Synthesize Gathered Context

After checking business-context.md and ClickUp, display:

**What we know:**
- [Company/product context from business-context.md if found]
- [Feature context from ClickUp if found]
- [Any other gathered information]

**What we need to clarify:**
- [List gaps - will ask questions about these]

---

### Step 3: Discovery Questions

Ask targeted questions **one at a time** to build the PRD. Skip questions if you already have the answer from context.

Use `AskUserQuestion` with multiple choice options where applicable for faster input.

#### Problem & Opportunity

**Q1: What problem does this solve?**

"What specific problem or pain point does [feature_name] solve?"

Expected answer: 2-4 sentences describing the core problem.

**Q2: Who experiences this problem?**

Use AskUserQuestion with options:
- Question: "Who primarily experiences this problem?"
- Options:
  - "End users/customers"
  - "Internal team members"
  - "Administrators/managers"
  - "Third-party integrators"

Follow-up: "Can you describe this user persona in 1-2 sentences?"

**Q3: How are they solving it today?**

"What's the current workaround or alternative solution (if any)?"

This helps understand:
- Baseline to improve upon
- Migration considerations
- Competitive context

**Q4: What's the opportunity/impact?**

Use AskUserQuestion:
- Question: "What's the expected impact of solving this?"
- Options:
  - "Increase revenue/conversions"
  - "Reduce costs/support burden"
  - "Improve user satisfaction/retention"
  - "Enable new capabilities/market"
  - "Reduce technical debt/risk"

Follow-up: "Can you quantify or estimate the impact?"

#### User Stories & Use Cases

**Q5: What are the key user stories?**

"Describe 2-4 key user stories in the format: 'As a [user], I want to [action], so that [benefit]'"

Examples to show:
- As a customer, I want to reset my password, so that I can regain access if I forget it
- As an admin, I want to view user activity logs, so that I can troubleshoot issues

**Q6: What does success look like for the user?**

"Describe the ideal user experience - what does a successful interaction look like?"

This helps define acceptance criteria later.

#### Success Metrics

**Q7: How will we measure success?**

"What metrics will we track to determine if this feature is successful?"

Prompt for 2-4 metrics with targets:
- User adoption: X% of users use feature within first month
- Performance: Reduces task time by X%
- Business: Increases conversion by X%
- Quality: Reduces support tickets by X%

#### Requirements

**Q8: What are the must-have features?**

"List the core functional requirements - what MUST this feature do?"

Get 3-7 must-have capabilities.

Example:
- User must be able to reset password via email
- System must enforce password complexity rules
- User must be able to log in with new password immediately

**Q9: What are the nice-to-have features?**

"What features would be valuable but aren't critical for v1?"

Get 2-5 nice-to-have items for future consideration.

**Q10: What's explicitly out of scope?**

"What will we NOT build (at least not in v1)?"

This prevents scope creep and sets expectations.

Example:
- Social login (OAuth) - future phase
- Biometric authentication - not in scope
- Password sharing across accounts - security risk, won't build

#### Technical & Non-Functional Requirements

**Q11: What are the performance expectations?**

Use AskUserQuestion:
- Question: "What are the performance requirements?"
- Options:
  - "Standard (1-3 second load times)"
  - "Fast (<1 second load times)"
  - "Real-time (<100ms)"
  - "No specific requirement"

Follow-up if applicable: "Any specific load/scale requirements? (e.g., concurrent users, data volume)"

**Q12: Are there security or compliance requirements?**

Use AskUserQuestion:
- Question: "Are there security or compliance requirements?"
- Options:
  - "Standard security practices"
  - "GDPR/privacy compliance required"
  - "HIPAA/healthcare compliance"
  - "SOC2/enterprise security"
  - "PCI/payment security"
  - "No special requirements"

**Q13: What platforms/devices must be supported?**

Use AskUserQuestion (multiSelect: true):
- Question: "Which platforms must be supported?"
- Options:
  - "Web (desktop browsers)"
  - "Mobile web (responsive)"
  - "iOS native app"
  - "Android native app"
  - "API only (no UI)"

**Q14: Are there integration requirements?**

"Does this feature need to integrate with any external systems, APIs, or third-party services?"

Examples: Stripe, SendGrid, Shopify, internal APIs, etc.

#### Timeline & Constraints

**Q15: What's the timeline?**

Use AskUserQuestion:
- Question: "What's the expected timeline?"
- Options:
  - "Urgent (<2 weeks)"
  - "Standard sprint (2-4 weeks)"
  - "Multi-sprint (1-2 months)"
  - "Long-term (3+ months)"
  - "No specific deadline"

Follow-up: "Are there any hard deadlines or milestone dates?"

**Q16: Are there dependencies or blockers?**

"Does this feature depend on any other features, infrastructure, or external factors?"

Examples:
- Needs new database schema migration
- Waiting for third-party API access
- Depends on Feature X being completed first

#### Risks & Mitigation

**Q17: What are the main risks?**

"What could go wrong or cause delays with this feature?"

Get 2-4 key risks. For each risk, ask: "How can we mitigate this?"

Examples:
- Risk: Third-party API might be unreliable
  - Mitigation: Build fallback/retry logic, implement caching
- Risk: Complex migration from old auth system
  - Mitigation: Phased rollout, maintain backward compatibility

#### Open Questions

**Q18: What's still unclear?**

"What questions or unknowns remain that need to be resolved before/during implementation?"

Examples:
- Need to validate approach with security team
- Unclear if backend capacity can handle expected load
- Need design mockups for UI

---

### Step 4: Generate PRD Document

After gathering all information, generate a comprehensive PRD using this template:

```markdown
# Product Requirements Document: [Feature Name]

**Status:** Draft
**Owner:** [PM name or "PM"]
**Created:** [Current date]
**Last Updated:** [Current date]
**Target Release:** [Timeline from Q15]

---

## Executive Summary

[2-3 sentence summary covering: what we're building, who it's for, and why it matters]

**Quick Stats:**
- **Target Users:** [User type from Q2]
- **Expected Impact:** [Impact from Q4]
- **Timeline:** [Timeline from Q15]
- **Priority:** [High/Medium/Low based on context]

---

## Problem Statement

### The Problem
[Detailed description from Q1]

### Who's Affected
[User persona description from Q2]

### Current State
[Current workaround/solution from Q3]

### Opportunity
[Impact description from Q4]

**Success will mean:**
- [Metric 1 from Q7]
- [Metric 2 from Q7]
- [Metric 3 from Q7]

---

## User Stories & Use Cases

### Primary User Stories

[User stories from Q5 in format:]

1. **As a** [user type], **I want to** [action], **so that** [benefit]
   - **Acceptance Criteria:**
     - [Derived from must-have requirements and success description]
     - [Multiple bullet points]

2. **As a** [user type], **I want to** [action], **so that** [benefit]
   - **Acceptance Criteria:**
     - [Specific, testable criteria]

[Repeat for each user story]

### User Journey

[Ideal user experience from Q6 - describe step by step]

1. User [action]
2. System [response]
3. User [next action]
4. Outcome: [successful state]

---

## Success Metrics

### Primary Metrics

| Metric | Target | Measurement Method | Timeline |
|--------|--------|-------------------|----------|
| [Metric from Q7] | [Target] | [How to measure] | [When to measure] |
| [Metric from Q7] | [Target] | [How to measure] | [When to measure] |

### Secondary Metrics
- [Other metrics to track]

---

## Functional Requirements

### Must-Have (v1)

[Requirements from Q8:]

**REQ-1:** [Requirement title]
- **Description:** [What it does]
- **Acceptance Criteria:**
  - [Testable criterion]
  - [Testable criterion]
- **Priority:** MUST HAVE

**REQ-2:** [Requirement title]
- **Description:** [What it does]
- **Acceptance Criteria:**
  - [Testable criterion]
- **Priority:** MUST HAVE

[Repeat for all must-haves from Q8]

### Nice-to-Have (Future)

[Requirements from Q9:]

**REQ-F1:** [Future requirement]
- **Description:** [What it does]
- **Rationale:** [Why it's valuable but not v1]
- **Priority:** NICE TO HAVE

[Repeat for all nice-to-haves]

### Explicitly Out of Scope

[Items from Q10:]

- ❌ **[Out of scope item]** - [Reason why]
- ❌ **[Out of scope item]** - [Reason why]

---

## Non-Functional Requirements

### Performance
[Requirements from Q11]

- Response time: [Target]
- Concurrent users: [Target if specified]
- Data volume: [Capacity requirements]

### Security & Compliance
[Requirements from Q12]

- [Security requirement 1]
- [Compliance requirement if applicable]
- [Data protection considerations]

### Platform Support
[Platforms from Q13]

- ✅ [Platform 1]
- ✅ [Platform 2]
- ✅ [Platform 3]

### Integrations
[Integrations from Q14 if applicable]

- **[Integration name]:** [Purpose and requirements]
- **[Integration name]:** [Purpose and requirements]

---

## Technical Considerations

[This section provides context for engineers who will create specs]

### Known Technical Constraints
[From gathered context, Q16, business context, etc.]

- [Constraint 1]
- [Constraint 2]

### Integration Points
[From Q14 and technical knowledge]

- [System/API integration details]

### Data Requirements
[If applicable - what data needs to be stored/processed]

- [Data type 1]
- [Data type 2]

### Suggested Approach
[If PM has preferences on implementation approach - optional]

*Note: Engineering team will provide detailed technical spec based on this PRD*

---

## Timeline & Milestones

**Target Release:** [Timeline from Q15]

### Key Milestones

| Milestone | Target Date | Owner | Status |
|-----------|-------------|-------|--------|
| PRD Approval | [Date] | PM | Draft |
| Technical Spec | [+1 week] | Engineering | Not Started |
| Design Mockups | [+1 week] | Design | Not Started |
| Development Start | [+2 weeks] | Engineering | Not Started |
| Internal Testing | [+X weeks] | QA | Not Started |
| Launch | [Target date] | PM | Not Started |

[Adjust based on Q15 timeline]

### Hard Deadlines
[From Q15 follow-up if applicable]

- [Deadline 1 and reason]
- [Deadline 2 and reason]

---

## Dependencies & Prerequisites

### Dependencies
[From Q16]

**Blocking:**
- [Dependency that must be resolved before starting]

**Non-blocking:**
- [Dependency that can be worked around or done in parallel]

### Prerequisites
[What needs to be in place before development]

- [ ] PRD approved by stakeholders
- [ ] Technical spec completed and reviewed
- [ ] Design mockups completed (if UI changes)
- [ ] [Other prerequisites from context]

---

## Risks & Mitigation

[From Q17]

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|-----------|--------|---------------------|
| [Risk 1] | High/Med/Low | High/Med/Low | [Mitigation from Q17] |
| [Risk 2] | High/Med/Low | High/Med/Low | [Mitigation from Q17] |

---

## Open Questions

[From Q18]

- [ ] **[Question 1]** - Owner: [Who will answer] - Target: [When]
- [ ] **[Question 2]** - Owner: [Who will answer] - Target: [When]
- [ ] **[Question 3]** - Owner: [Who will answer] - Target: [When]

---

## Stakeholder Review

### Approvers

- [ ] **Product Manager:** [Name] - Approval Date: _______
- [ ] **Engineering Lead:** [Name] - Approval Date: _______
- [ ] **Design Lead:** [Name] (if applicable) - Approval Date: _______
- [ ] **Client/Stakeholder:** [Name] (if applicable) - Approval Date: _______

### Review Notes

[Space for feedback during review process]

---

## Related Documents

**Context:**
- Business Context: [Link to business-context.md if exists]
- [ClickUp Task/Doc link if applicable]

**Next Steps:**
- Technical Spec: [Will be created via /spec using this PRD]
- Implementation Plan: [Will be created via /plan]

---

## Revision History

| Date | Version | Author | Changes |
|------|---------|--------|---------|
| [Current date] | 1.0 | [PM name] | Initial draft via /prd-helper |

---

## Information Sources

**Gathered from:**
- [✓/✗] Business Context: [Path or "Not found"]
- [✓/✗] ClickUp: [Task/doc links or "Not available"]
- [✓] PM Interview: [PM name]
- [✓] Discovery Questions: [Completion date]

---

*PRD generated via `/prd-helper` skill*
*Next step: Create technical spec with `/spec [feature-name]`*
```

---

### Step 5: Save PRD

**Ask where to save:**

"I've generated your PRD for **[feature_name]**. Where would you like me to save it?"

**Suggest:**
- `specs/[feature-name]-prd.md` (recommended)
- `prds/[feature-name].md` (if using separate PRD folder)
- `.claude/prds/[feature-name].md`

**Write the file.**

**Display summary:**
```
✅ PRD created at [path]

Summary:
- Problem: [One sentence]
- Users: [User type]
- Must-haves: [Count] requirements
- Success metrics: [Count] defined
- Timeline: [Timeline]
- Status: Draft - awaiting stakeholder approval

Next steps:
1. Review and refine PRD as needed
2. Get stakeholder approvals
3. Create technical spec: /spec [feature-name]
4. Create implementation plan: /plan
```

---

### Step 6: Export to ClickUp (Optional)

**If ClickUp MCP is available:**

Ask: "Would you like to export this PRD to ClickUp? (y/n)"

**If yes:**
- "Which ClickUp list should I add this to?" (or auto-suggest based on context)
- Create ClickUp task or doc with:
  - Title: "PRD: [feature_name]"
  - Description: Link to PRD file + executive summary
  - Custom fields: Timeline, Priority, Status (Draft)
  - Checklist from stakeholder approvals section

Display: "✅ Created ClickUp task: [link]"

**If no or ClickUp not available:**
- Skip gracefully

---

### Step 7: Git Commit (Optional)

Ask: "Would you like me to commit this PRD to git? (y/n)"

**If yes:**

```bash
git add [prd-path]
git commit -m "docs(prd): add product requirements for [feature-name]

Problem: [One sentence from Q1]
Target users: [User type from Q2]
Timeline: [Timeline from Q15]

Must-have requirements:
- [Req 1 summary]
- [Req 2 summary]
- [Req 3 summary]

Success metrics:
- [Metric 1]
- [Metric 2]

Status: Draft - awaiting stakeholder approval

Next steps: Create technical spec via /spec

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

Display: "✅ Committed PRD to git"

**If no:**
- Skip commit

---

## Quality Guidelines

### Good PRD Indicators

✅ **Clear problem statement** - Anyone can understand the "why"
✅ **Specific user stories** - Actionable with clear acceptance criteria
✅ **Measurable success** - Concrete metrics with targets
✅ **Complete requirements** - Must-haves are comprehensive
✅ **Realistic scope** - Out-of-scope is explicitly defined
✅ **Risk awareness** - Key risks identified with mitigation
✅ **Actionable next steps** - Engineers know how to proceed

### Red Flags

❌ Vague problem statement ("make it better")
❌ No measurable success criteria
❌ Unclear user stories or missing acceptance criteria
❌ Scope creep (too many must-haves)
❌ No timeline or unrealistic timeline
❌ Missing non-functional requirements (performance, security)
❌ No risk identification

---

## Tips for Product Managers

### Before Running This Skill

- **Run `/business-context-helper` first** if you haven't already - it provides valuable context for better PRDs
- **Gather user feedback** or data to inform your answers
- **Talk to stakeholders** about priorities and constraints
- **Check ClickUp** for existing related tasks/docs

### During Discovery

- **Be specific** - Vague answers lead to vague requirements
- **Think about edge cases** - What could go wrong?
- **Set realistic scope** - Better to ship v1 and iterate
- **Include engineers** in the process if complex technically

### After PRD Creation

1. **Review and refine** - This is a draft, improve it
2. **Get stakeholder buy-in** - Circulate for approval
3. **Update ClickUp** with timeline and priorities
4. **Hand off to engineering** with `/spec [feature-name]`
5. **Keep it updated** - PRD is a living document during development

---

## Tips for Engineers

### Using This Skill

- **Engineers can run this too** if PM hasn't created a PRD
- **Start with PRD before spec** - Understand the "why" before the "how"
- **Ask clarifying questions** during discovery - Better questions = better PRD
- **Reference PRD when creating spec** - Use it as the foundation

### After PRD Creation

1. **Review the PRD** - Does it make sense technically?
2. **Flag risks or concerns** early - Update the risks section
3. **Create technical spec** using `/spec [feature-name]` referencing this PRD
4. **Keep PRD and spec in sync** - If requirements change, update both

---

## Integration with Other Skills

### Before PRD

- **`/business-context-helper`** - Understand the client/product context
- **ClickUp research** - Check for existing feature requests/feedback

### After PRD

- **`/spec [feature-name]`** - Create technical specification based on PRD
  - Use PRD as input for detailed technical planning
  - Reference PRD requirements in spec

- **`/plan`** - Create implementation plan
  - Use spec as input
  - PRD provides context on priorities

- **`/design-helper`** - If UI changes needed
  - Reference PRD user stories and journey

---

## Examples

### Example 1: User Authentication Feature

**Input:** `/prd-helper user-authentication`

**Context Found:**
- Business context: B2C e-commerce, 50K users, targeting engaged couples
- ClickUp: Multiple support tickets about password reset issues

**Discovery Highlights:**
- Problem: Users can't recover accounts if they forget password
- Users: Customers who create accounts for order tracking
- Impact: 15% of support tickets are password-related
- Must-haves: Email-based reset, password complexity rules, immediate login
- Out of scope: Social login (OAuth), biometric auth
- Timeline: 2-3 weeks
- Metrics: Reduce password-related support tickets by 80%

**Output:** Comprehensive 8-page PRD with user stories, acceptance criteria, security requirements, and risk mitigation strategies

**Next Step:** Engineer runs `/spec user-authentication` to create technical spec

---

### Example 2: Analytics Dashboard

**Input:** `/prd-helper analytics-dashboard`

**Context Found:**
- Business context: SaaS platform, B2B, targeting sales managers
- ClickUp: Dashboard redesign project with client feedback

**Discovery Highlights:**
- Problem: Managers can't track team performance effectively
- Users: Sales managers at mid-market companies
- Impact: Enable data-driven decisions, reduce reporting time by 60%
- Must-haves: Real-time metrics, exportable reports, role-based views
- Nice-to-haves: Predictive analytics, custom dashboards
- Performance: <1 second load time, handle 100 concurrent users
- Timeline: 6-8 weeks (complex)
- Metrics: Manager adoption rate, time saved per report, decision confidence score

**Output:** Detailed PRD with data visualization requirements, performance benchmarks, and phased rollout plan

**Next Step:** Design creates mockups, engineering creates spec

---

## FAQ

**Q: Do I always need a PRD before building?**
A: For significant features, yes. For tiny bug fixes or trivial changes, you can skip directly to `/spec` or `/plan`.

**Q: Can engineers create PRDs?**
A: Yes! If PM hasn't created one, engineers can run this skill. Ideally, loop in PM to review.

**Q: What if requirements change during development?**
A: Update the PRD and bump the version. Keep it as a living document. Notify stakeholders of changes.

**Q: How is PRD different from Spec?**
A: PRD = **what** and **why** (product perspective). Spec = **how** (technical perspective). PRD is input for Spec.

**Q: Should PRD be deleted after implementation?**
A: **No!** PRDs are permanent documentation (like specs). They explain why features were built. Keep in `specs/` or `prds/` directory per WORKFLOWS.md.

**Q: Can I use this for internal tools/features?**
A: Absolutely. The process works for any feature - client-facing or internal.

---

## Related Skills

- **`/business-context-helper`** - Document client/product context (run before PRD)
- **`/spec`** - Create technical specifications (run after PRD approval)
- **`/plan`** - Create implementation plans (run after spec)
- **`/design-helper`** - Document design system (if UI work needed)
- **`/clickup`** - Manage ClickUp tasks and docs

---

*Skill created to streamline product requirement gathering and documentation using CoPilot's proven workflow*
