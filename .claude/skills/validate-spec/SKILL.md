---
name: validate-spec
description: Validate that a spec file contains all required sections. Use before implementation to ensure spec completeness.
argument-hint: "[spec-file-path]"
allowed-tools: Read, Glob
---

# Validate Spec

Check that a task spec file contains all required sections per team standards.

## Arguments

Spec file path: `$ARGUMENTS`

If no argument provided, ask for the spec file path or search for recent spec files.

## Required sections

A valid spec must contain:

1. **Title** - A short, clear task title
2. **Objective** - What problem is being solved, why it matters, desired outcome
3. **Scope** - What is included (features, fixes, modules, flows, behavior)
4. **Out of scope** - What must not be changed
5. **Context / affected areas** - Files, directories, modules, services, endpoints
6. **Constraints** - API shape, schema, compatibility, architecture requirements
7. **Acceptance criteria** - Concrete, testable outcomes in checklist format
8. **Testing requirements** - Automated tests, integration tests, manual validation
9. **Out-of-scope protocol** - Statement about deviations and escalation
10. **Open questions / assumptions** - Unresolved items, explicit assumptions

## Validation checks

For each section, verify:
- [ ] Section exists
- [ ] Section is not empty
- [ ] Section has substantive content (not just placeholder text)

Additional quality checks:
- [ ] Acceptance criteria are in checklist format (`- [ ]`)
- [ ] Acceptance criteria are testable (specific, not vague)
- [ ] Out of scope is explicitly defined
- [ ] Constraints are specific

## Output format

```
# Spec Validation: <filename>

## Required Sections
- [x] Title: Present
- [x] Objective: Present
- [ ] Scope: MISSING
...

## Quality Checks
- [x] Acceptance criteria in checklist format
- [ ] Acceptance criteria testable: Some criteria are vague
...

## Issues Found
1. Missing "Scope" section
2. Acceptance criteria "system works correctly" is not testable

## Recommendation
[ ] Ready for implementation
[x] Needs revision - address issues above
```
