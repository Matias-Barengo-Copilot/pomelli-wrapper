---
name: spec
description: Generate technical specifications from task descriptions, PRDs, or GitHub issues. Use before implementation to define what must be true when done. Quick spec generation for engineers (rambler-friendly). Covers success criteria, functional requirements, edge cases, testing approach. Second step after PRD in workflow. Triggers on spec, specification, technical spec, implementation spec, feature spec, task spec, write spec, create spec, need a spec.
argument-hint: "[task-description or issue-url]"
allowed-tools: Read, Glob, Grep, WebFetch, Bash(gh issue view *)
---

# Generate Task Spec

Create a task spec that defines **what must be true when the task is done**.

The spec should be specific enough to guide execution and validation, but concise enough to avoid bloated context.

## Arguments

Task input: `$ARGUMENTS`

If a GitHub issue URL or number is provided, fetch the issue details first.
If a description is provided, use it as the basis for the spec.
If nothing provided, ask the user to describe the task.

## Required sections

Generate a spec with these exact sections:

### 1. Title
A short, clear task title.

### 2. Objective
Explain:
- What problem is being solved
- Why it matters
- What outcome is desired

### 3. Scope
List what is included in this task. Be concrete:
- Features
- Fixes
- Modules
- Flows
- User-visible behavior
- Data behavior
- Integration points

### 4. Out of scope
List what must not be changed as part of this task. This prevents scope creep.

### 5. Context / affected areas
List relevant:
- Files
- Directories
- Modules
- Services
- Endpoints
- Components
- Data models
- External dependencies

If exact files are unknown, list likely areas.

### 6. Constraints
List important constraints such as:
- Preserve current API shape
- Avoid schema changes
- Maintain backward compatibility
- Do not refactor unrelated code
- Follow existing architecture pattern

### 7. Acceptance criteria
Write concrete, testable outcomes in checklist format:
- [ ] When X happens, Y occurs
- [ ] Invalid input Z returns the correct error behavior
- [ ] Existing behavior A remains unchanged

### 8. Testing requirements
State what validation is required:
- Automated tests expected
- Integration tests if needed
- Regression test if applicable
- Manual validation steps if needed

### 9. Out-of-scope protocol
- Minor necessary deviations may proceed if documented
- Material deviations require escalation before proceeding

### 10. Open questions / assumptions
List anything unresolved at spec time. Name assumptions explicitly.

## Output format

```markdown
# Task Spec: <title>

## Objective
...

## Scope
- ...

## Out of scope
- ...

## Context / affected areas
- ...

## Constraints
- ...

## Acceptance criteria
- [ ] ...

## Testing requirements
- Automated: ...
- Manual: ...

## Out-of-scope protocol
- Minor necessary deviations may proceed if documented.
- Material deviations require escalation before proceeding.

## Open questions / assumptions
- ...
```

## Quality bar

The spec is good if:
- It is easy to understand quickly
- It reduces ambiguity
- It makes review easier
- It defines what "done" means
- It prevents avoidable scope creep

The spec is bad if:
- It is vague
- It is overloaded with unnecessary detail
- It leaves success undefined
- It quietly assumes product decisions that were never made
