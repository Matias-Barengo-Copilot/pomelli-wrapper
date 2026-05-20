---
name: spec-generator
description: Generate technical specifications through guided interview questions (structured alternative to rambler-friendly /spec). Use when you prefer step-by-step questions over free-form description. Asks about requirements, success criteria, edge cases, dependencies, testing. Good for engineers who want structure. Same output as /spec but interview-based. Triggers on guided spec, spec questions, structured spec, interview spec, step by step spec.
argument-hint: "[task-name-or-description]"
allowed-tools: Write, Read, Glob, Grep, AskUserQuestion
---

# Guided Spec Generator

Create a task spec by answering structured questions one at a time. This is the guided alternative to the free-form `/spec` skill for engineers who prefer step-by-step interviews.

## When to Use

- You prefer a structured, question-by-question approach
- You want help thinking through all aspects of a task
- You want to avoid decision paralysis from blank-page syndrome
- You need a spec but don't know where to start

## Arguments

Task name or description (optional): `$ARGUMENTS`

If provided, use this to set context for the first question. If not provided, start with asking for the task name.

## Interview Flow

Ask questions one at a time in this order. For each question:
1. Ask a clear, focused question
2. Wait for the answer
3. Acknowledge the answer briefly
4. Move to the next question

**Do not ask all questions at once.** The interview approach is effective because it helps the engineer think through each aspect separately.

### Question 1: Title

**If argument provided:** "Great! So the task is about: `$ARGUMENTS`. Let me refine this into a title. How would you briefly describe what this task accomplishes? (2-5 words is ideal)"

**If no argument:** "Let's start with the task title. What are you trying to accomplish with this task? (2-5 words is ideal)"

**Guidance:** A good title is specific ("Fix authentication flow for OAuth providers") not vague ("Auth stuff"). It should be a noun phrase that describes the outcome, not an action ("OAuth integration" not "Integrate OAuth").

---

### Question 2: Objective

"Now let's understand the why. **What problem are you solving?** And why does it matter?"

**Guidance:** This should explain:
- What's broken, missing, or suboptimal today
- Why fixing it matters (user impact, business impact, code health, etc.)
- What success looks like

Good: "Users get stuck in the auth flow when they revoke OAuth consent. This blocks onboarding and creates support tickets. We need a graceful fallback."

Bad: "We need to improve auth."

---

### Question 3: Scope

"Let's define what you're changing. **What is included in this task?** List the features, fixes, modules, flows, or user-visible behaviors you're adding or changing."

**Guidance:** Be concrete. Include:
- New endpoints or components
- Existing flows being modified
- Data model changes
- User-facing changes
- Integration points

Format as a list. Good: "- Add OAuth revocation handler; - Update auth flow UI; - Add database migration for consent_revoked status"

Bad: "Authentication stuff"

---

### Question 4: Out of Scope

"What is **NOT** in scope for this task? What should we explicitly avoid changing?"

**Guidance:** This prevents scope creep. Examples:
- "We won't refactor the entire auth module"
- "We won't change the JWT token format"
- "We won't migrate existing users to new consent model"
- "We won't add new UI themes"

If nothing comes to mind, that's okay—just note "None identified at spec time."

---

### Question 5: Context / Affected Areas

"**Which files, directories, modules, or services** will this task touch? List the affected areas."

**Guidance:** Include:
- Files or directories that will be modified
- Services or microservices involved
- Database tables or schemas
- External APIs or integrations
- Components or pages
- Endpoints

If you don't know exact files yet, list likely areas. Example: "- /src/auth/oauth.ts; - /src/components/LoginFlow.tsx; - /db/migrations; - External: Google OAuth API"

---

### Question 6: Constraints

"**What constraints should guide this work?** Things like 'preserve API shape', 'avoid breaking changes', 'follow existing patterns', etc."

**Guidance:** Constraints are rules that bound the solution. Examples:
- "Must maintain backward compatibility"
- "Cannot change existing user table schema"
- "Must use existing error handling patterns"
- "Deploy must not require database downtime"
- "Must follow existing security audit patterns"

If nothing specific, note "None beyond standard engineering practices."

---

### Question 7: Acceptance Criteria

"**How will we know this is done?** What must be true when this task is complete? List specific, testable outcomes."

**Guidance:** Use checklist format. Criteria should be:
- Specific: "User can revoke OAuth consent in settings" not "Auth works"
- Testable: You could write a test for it
- Acceptance-focused: "When user clicks revoke, their OAuth token is deleted" not "Code is clean"

Example format:
- [ ] User can access OAuth revocation UI in settings
- [ ] Clicking revoke invalidates the OAuth token in our database
- [ ] After revocation, logging in with that provider triggers new consent flow
- [ ] Existing tests still pass

---

### Question 8: Testing Requirements

"**What testing should happen before this is considered done?** What automated tests, integration tests, or manual validation do we need?"

**Guidance:** Think about:
- New unit tests (what behaviors need testing?)
- Integration tests (does this work with the full flow?)
- Regression tests (did we break anything?)
- Manual validation (steps a human should verify?)

Example: "- Automated: Unit tests for revocation handler, integration tests for full OAuth flow; - Manual: Test with real Google/GitHub OAuth providers, verify error cases"

---

### Question 9: Out-of-Scope Protocol

"**How should we handle scope changes during implementation?** Should minor deviations proceed, or do all deviations need escalation?"

**Guidance:** This establishes a decision rule upfront. Standard pattern:
- Minor necessary deviations may proceed if documented
- Material deviations require escalation before proceeding

Or customize based on your team's risk tolerance.

---

### Question 10: Open Questions / Assumptions

"**Are there any unknowns, decisions not yet made, or assumptions we're making?** List anything that might affect implementation."

**Guidance:** Examples:
- "Which OAuth providers do we support?" (assumed: Google, GitHub)
- "Should we notify users when OAuth is revoked?" (TBD)
- "How long do we retain consent logs?" (assumed: 90 days)

It's okay to have open questions—that's what this section is for.

---

## Output Format

After all 10 questions are answered, generate the spec in this exact markdown format:

```markdown
# Task Spec: <title>

## Objective

<answer from question 2>

## Scope

- <item 1>
- <item 2>
- ...

## Out of scope

- <item 1>
- <item 2>
- ...

## Context / affected areas

- <item 1>
- <item 2>
- ...

## Constraints

- <item 1>
- <item 2>
- ...

## Acceptance criteria

- [ ] <criterion 1>
- [ ] <criterion 2>
- ...

## Testing requirements

- Automated: <automated test description>
- Integration: <integration test description>
- Manual: <manual validation steps>

## Out-of-scope protocol

- Minor necessary deviations may proceed if documented.
- Material deviations require escalation before proceeding.

## Open questions / assumptions

- <question or assumption 1>
- <question or assumption 2>
- ...
```

Then ask: "Would you like me to refine any section before we save this spec?"

---

## Quality Bar

The resulting spec is good if:
- It is easy to understand quickly
- It reduces ambiguity
- It makes review easier
- It defines what "done" means
- It prevents avoidable scope creep

The spec is bad if:
- It is vague
- It leaves success undefined
- It quietly assumes product decisions that were never made
- Any section is empty or a placeholder

---

## Notes

- Ask one question at a time. Don't overwhelm the engineer.
- Use their actual answers—don't assume or fill in blanks.
- If they say "not sure" or "we'll figure it out", acknowledge it and note it as TBD in the spec.
- The goal is a spec that reduces ambiguity and defines success. If something is genuinely undecided, that's okay—document the assumption and move on.
- After generating the spec, offer to validate it using the `/validate-spec` skill if they want extra confidence.
