---
name: clickup
description: Update ClickUp tasks - mark as done, add comments, link PRs, track time. Use when completing work or updating task status.
argument-hint: "[task-id] [done|update|comment|start|stop]"
---

# ClickUp Task Management

Update ClickUp tasks when completing work or changing status.

## Arguments

Arguments: `$ARGUMENTS`

Parse:
- First argument: task ID (e.g., `86ewtc30m`)
- Second argument (optional): action
  - `done` (default) - Mark task in review + add summary + link PR
  - `update` - Update task status
  - `comment` - Add a comment
  - `start` - Start time tracking
  - `stop` - Stop time tracking

If no task ID provided, ask the user or attempt to find from:
- Current branch name (if it contains a task ID)
- Recent PR description

## Main workflow: Task completion (`done`)

When work is completed, run this workflow:

1. **Get current PR** (if exists)
   ```bash
   gh pr view --json url,title,number
   ```

2. **Update task status** to "in review"
   - Use `clickup_update_task` with `status: "in review"`

3. **Add completion comment** with:
   - Brief summary of what was done
   - Link to PR (if available)
   - Any notes about the implementation

   Comment format:
   ```
   ## Work Completed

   **Summary:** [Brief description of changes]

   **PR:** [PR URL if available]

   **Changes:**
   - [Key change 1]
   - [Key change 2]

   **Notes:** [Any implementation notes, deviations, or follow-ups]
   ```

4. **Confirm** the update was successful

## Other actions

### update
Change task status:
- `backlog` → `to do` → `in progress` → `in review` → `done`

### comment
Add a standalone comment to the task.

### start
Start time tracking on the task.

### stop
Stop time tracking (works on any running timer).

## Reference

For workspace IDs, team members, and detailed MCP tool usage, see [reference.md](reference.md).

## Quick reference: Common task IDs

Ask user or check reference.md for project-specific task IDs.

## Example usage

```
/clickup 86ewtc30m done
```

This will:
1. Update task 86ewtc30m to "in review"
2. Add a comment with work summary
3. Link the current PR if on a feature branch
