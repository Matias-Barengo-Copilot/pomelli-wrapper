---
name: complexity-gauge
description: Assess whether a task is light or heavy with reasoning. Teaches engineers (especially juniors) to think about complexity the right way. Use when unsure about task scope.
argument-hint: "[task-description]"
allowed-tools: Read, Grep, Glob, AskUserQuestion
---

# Complexity Gauge

Determine if a task is "light" (direct implementation) or "heavy" (needs spec/plan) and explain WHY.

## Purpose

Help engineers (especially juniors) understand task complexity through reasoning, not just intuition.

## When to Use

- Unsure if a task needs a spec/plan
- Want to validate complexity judgment
- Teaching juniors how to assess complexity

## Arguments

Task description (optional): `$ARGUMENTS`
- If provided, analyze it
- If not, ask for task description

## Assessment Questions

Ask these to gather context:

### 1. Task Description
**If not provided as argument:**
"Describe the task in 1-2 sentences."

### 2. Codebase Familiarity
"How familiar are you with the code area this touches?"
- Very familiar - I've worked here before
- Somewhat familiar - I've read this code
- Unfamiliar - Haven't seen this part
- Unknown - Don't know where this lives yet

### 3. Scope Estimate
"How many files will this change?"
- 1 file
- 2-3 files
- 4-6 files
- 7+ files or don't know

### 4. Dependencies
"Does this task depend on or affect other systems/services?"
- No - isolated change
- Maybe - might touch shared code
- Yes - multiple systems involved

### 5. Known Requirements
"How clear are the requirements?"
- Very clear - I know exactly what to build
- Mostly clear - few open questions
- Unclear - several ambiguities
- Very unclear - need to figure out the approach

## Complexity Assessment

Based on answers, provide:

### Complexity: [LIGHT or HEAVY]

**Reasoning:**

Explain WHY using these factors:

1. **Uncertainty:**
   - Low uncertainty → lean light
   - High uncertainty → lean heavy
   - Unknown area → heavy

2. **Blast Radius:**
   - Single file, isolated → light
   - Shared code, multiple systems → heavy
   - Example: "This touches auth middleware used by 12 routes - blast radius is wide"

3. **Familiarity:**
   - You've worked here before → light
   - Haven't seen this code → heavy
   - Example: "Unfamiliarity increases risk of missing edge cases"

4. **Requirements Clarity:**
   - Crystal clear what to build → light
   - Ambiguities or open questions → heavy
   - Example: "The spec doesn't define error handling - need to decide approach"

### Recommendation:

**If LIGHT:**
- Proceed with direct implementation
- Keep scope tight
- Test thoroughly
- Run `/review` before PR

**If HEAVY:**
- Write a spec using `/spec` or `/spec-generator`
- Generate implementation plan with `/plan`
- Validate plan with `/validate-plan`
- Implement incrementally

## Teaching Notes

The goal is not just to give an answer - it's to teach WHY complexity matters:

- **Complexity is about risk, not time.** A 2-line fix in unfamiliar, high-blast-radius code is HEAVY.
- **"When in doubt, treat it as heavy."** The cost of writing a quick spec for something simple is 10 minutes. The cost of diving into something complex without a plan is hours of wasted tokens and messy code.
- **Context matters.** Same task can be light for a senior who's worked in that area, heavy for a junior who hasn't.

## Output Format

```
# Complexity Assessment

**Task:** [One-line task description]

**Complexity:** LIGHT | HEAVY

## Reasoning

**Uncertainty:** [Low/Medium/High and why]

**Blast Radius:** [Narrow/Medium/Wide and why]

**Familiarity:** [High/Medium/Low and why]

**Requirements:** [Clear/Somewhat Clear/Unclear and why]

## Recommendation

[Light or Heavy workflow recommendation]

## Why This Matters

[Specific teaching point about why this task landed where it did]
```

## Examples

### Example 1: Light Task

**Task:** Add a "copy" button to the existing user profile component

**Complexity:** LIGHT

**Reasoning:**
- **Uncertainty:** Low - clear what to build
- **Blast Radius:** Narrow - single component, no shared code
- **Familiarity:** High - you mentioned working on this component before
- **Requirements:** Clear - just add a button that copies text

**Recommendation:** Proceed with implementation. Add the button, wire up copy functionality, test manually.

**Why This Matters:** This is isolated, well-understood work with low risk. Writing a spec would be overhead without benefit.

---

### Example 2: Heavy Task

**Task:** Update the authentication flow to support SSO

**Complexity:** HEAVY

**Reasoning:**
- **Uncertainty:** High - SSO involves OAuth flows, token handling, multiple decisions
- **Blast Radius:** Wide - auth middleware affects entire app, 30+ routes depend on it
- **Familiarity:** Low - you haven't worked with the auth system before
- **Requirements:** Unclear - which SSO provider? How to handle existing users? What about API tokens?

**Recommendation:** Write a spec defining SSO provider, migration plan for existing users, API compatibility. Then create implementation plan.

**Why This Matters:** Authentication is high-stakes. Wide blast radius means bugs affect many users. Unfamiliarity + ambiguity = high risk of missing critical edge cases. A spec catches these upfront.
