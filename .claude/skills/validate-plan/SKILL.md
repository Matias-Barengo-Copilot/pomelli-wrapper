---
name: validate-plan
description: Validate that an implementation plan contains all required sections. Use before coding to ensure plan completeness.
argument-hint: "[plan-file-path]"
allowed-tools: Read, Glob
---

# Validate Implementation Plan

Check that an implementation plan file contains all required sections per team standards.

## Arguments

Plan file path: `$ARGUMENTS`

If no argument provided, ask for the plan file path or search for recent plan files.

## Required sections

A valid implementation plan must contain:

1. **Title** - A short title matching the task
2. **Summary of intended approach** - How the task will be implemented (bullets)
3. **Relevant code areas** - Files, modules, services, layers expected to change
4. **Execution steps** - Numbered sequence of work
5. **Validation plan** - Build/lint/typecheck, automated tests, manual checks
6. **Assumptions** - What the plan depends on
7. **Risks** - Failure points, review concerns, AI assumption risks
8. **Escalation points** - Conditions requiring stop and escalate
9. **PR reporting requirements** - Statement about deviation documentation

## Validation checks

For each section, verify:
- [ ] Section exists
- [ ] Section is not empty
- [ ] Section has substantive content

Additional quality checks:
- [ ] Execution steps are numbered
- [ ] Execution steps are concrete and actionable
- [ ] Validation plan includes at least one automated check
- [ ] Validation plan includes manual validation where appropriate
- [ ] Escalation points are specific conditions
- [ ] Plan does not just repeat the spec

## Output format

```
# Plan Validation: <filename>

## Required Sections
- [x] Title: Present
- [x] Summary of intended approach: Present
- [ ] Execution steps: MISSING
...

## Quality Checks
- [x] Execution steps are numbered
- [ ] Escalation points specific: Too vague
...

## Issues Found
1. Missing "Execution steps" section
2. Escalation points say "escalate if needed" - not specific enough

## Recommendation
[ ] Ready for implementation
[x] Needs revision - address issues above
```
