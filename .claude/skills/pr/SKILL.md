---
name: pr
description: Generate a PR description following the team's required format. Use when creating or updating a pull request.
argument-hint: "[spec-file] [plan-file]"
allowed-tools: Read, Grep, Glob, Bash(git *)
---

# Generate PR Description

Generate a pull request description following the team's required PR format.

## Context to gather

1. Run `git diff develop...HEAD` or `git diff main...HEAD` to see all changes in this branch
2. Run `git log develop..HEAD --oneline` or `git log main..HEAD --oneline` to see commits
3. If spec and plan files are provided as arguments, read them
4. If not provided, ask the user for the spec and implementation plan file paths

## Required PR sections

Generate markdown with these exact sections:

### 1. Task references
- Spec file: (path to spec)
- Implementation plan file: (path to plan)

### 2. Objective
What was the intended outcome? (from spec)

### 3. Planned approach
Summarize the implementation plan briefly.

### 4. Actual implementation
What was actually changed? List the key changes made.

### 5. Separation from implementation plan
Document every meaningful deviation from the implementation plan.

Use this format for each deviation:
- **Planned:** ...
- **Actual:** ...
- **Why changed:** ...
- **Risk introduced or reduced:** ...

If no deviations, state "No meaningful deviations from the implementation plan."

### 6. Validation performed
List:
- Automated tests run
- Build/lint/typecheck commands run
- Manual tests performed

### 7. Additional manual testing
If additional manual tests were performed beyond the plan:
- **Test:** ...
- **Reason:** ...
- **Outcome:** ...

### 8. Risks / follow-ups
Anything unresolved, fragile, or worth watching after merge.

### 9. Process usefulness rating
- **Spec usefulness (1-5):**
- **Implementation plan usefulness (1-5):**

And briefly explain:
- What in the docs saved time
- What in the docs was missing
- Whether the docs reduced review effort

## Output

Output the PR description in markdown format, ready to paste into a GitHub PR.

---

## Reminder for Reviewer

After generating the PR description, include this note at the end:

```
---
**📝 Reviewer Note:** Per team workflow guidelines, delete the plan file (`plan.md` or `task.md`) when approving this merge. The spec file should remain in `specs/` as permanent documentation.
```

This follows the document lifecycle defined in WORKFLOWS.md:
- **Specs** = permanent (keep forever as feature documentation)
- **Plans/Tasks** = temporary (delete after merge - they're scaffolding, not documentation)
