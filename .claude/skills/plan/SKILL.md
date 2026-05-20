---
name: plan
description: Generate implementation plans from technical specs defining execution steps, task order, dependencies, and estimates. Use after spec is written to break work into concrete steps. Covers task breakdown, sequencing, file changes, testing steps, risk mitigation. Third step after PRD and spec in workflow. Triggers on implementation plan, execution plan, task breakdown, work plan, development plan, create plan, write plan, need a plan.
argument-hint: "[spec-file-path]"
allowed-tools: Read, Glob, Grep
---

# Generate Implementation Plan

Create an implementation plan that explains **how the task will be executed**.

The plan should translate the spec into a practical sequence of engineering steps. It should not restate the full spec.

## Arguments

Spec file: `$ARGUMENTS`

If a spec file path is provided, read it first.
If not provided, ask for the spec file path or the spec content.

## Required sections

Generate a plan with these exact sections:

### 1. Title
A short title matching the task.

### 2. Summary of intended approach
In a few bullets, describe how the task will be implemented.

### 3. Relevant code areas
List the files, modules, services, or layers expected to change.

Use Glob and Grep to explore the codebase and identify:
- Existing files that will be modified
- New files that will be created
- Related files for reference

### 4. Execution steps
Provide the intended sequence of work. Use numbered steps. Keep steps concrete and implementation-oriented.

### 5. Validation plan
List the checks that will be run to confirm correctness:
- Build/typecheck/lint commands if relevant
- Automated tests to run or add
- Manual checks to perform
- Regression checks if applicable

### 6. Assumptions
List assumptions that the plan depends on.

### 7. Risks
List likely failure points, review concerns, or areas where AI may make bad assumptions.

### 8. Escalation points
List conditions under which the engineer should stop and escalate instead of continuing.

### 9. PR reporting requirements
The PR must include:
- A summary of actual implementation
- A section called "Separation from implementation plan"
- Justification for each meaningful deviation
- Automated validation performed
- Additional manual validation performed

## Output format

```markdown
# Implementation Plan: <title>

## Summary of intended approach
- ...

## Relevant code areas
- ...

## Execution steps
1. ...
2. ...
3. ...

## Validation plan
- Build / lint / typecheck: ...
- Automated tests: ...
- Manual validation: ...

## Assumptions
- ...

## Risks
- ...

## Escalation points
- Escalate if ...

## PR reporting requirements
The PR must include:
- A summary of actual implementation
- A section called "Separation from implementation plan"
- Justification for each meaningful deviation
- Automated validation performed
- Additional manual validation performed
```

## Quality bar

The implementation plan is good if:
- It is executable
- It is scoped
- It makes the intended approach legible before coding starts
- It makes later deviations easy to compare and review
- It improves consistency across engineers

The implementation plan is bad if:
- It just repeats the spec
- It is too vague to follow
- It hides assumptions
- It ignores validation
- It makes review harder instead of easier
