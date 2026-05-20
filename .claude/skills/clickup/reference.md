# ClickUp MCP Integration Reference

Detailed reference for ClickUp MCP integration with Claude Code.

---

## Workspace Structure

```
Workspace (CoPilot Innovations)
└── Space (Client/Project Group - e.g., "MJ", "MyBeauty IQ")
    └── Folder (Specific Product/Initiative)
        └── List (Product Backlog)
            └── Tasks (Epics, User Stories, Subtasks)
```

---

## Task Hierarchy & Types

```
Epic (Parent Task)
└── User Story (Subtask of Epic)
    └── Task (Subtask of User Story)
```

### Naming Conventions

- **Epics**: Short descriptive names (e.g., "Ticket Purchase & Payments")
- **User Stories**: `As a [Role], "I want [feature] So that [benefit]."`
- **Tasks**: Action-oriented names (e.g., "Purchase a class ticket")

### Statuses

1. `backlog` - Not yet planned
2. `to do` - Planned for sprint
3. `in progress` - Currently being worked
4. `in review` - Awaiting review/QA
5. `done`/`closed` - Completed

---

## Key IDs

### Spaces

| Space | ID |
|-------|-----|
| MJ | 90189930388 |
| MyBeauty IQ | 901810012073 |
| STAR Autism Support | 90189990746 |
| LAB Golf | 90189930764 |
| GoGrow | 90189896298 |

### Common Lists (Product Backlogs)

| Project | List ID |
|---------|---------|
| MBIQ App | 901816307133 |
| MJ SEO Optimization | 901816087070 |
| MJ Product Images Enhancer | 901816087069 |
| MJ Jewelry Box Images | 901816106355 |

### Team Members

| Name | Email | ID |
|------|-------|-----|
| Ana Carolina Toso | carolina@copilotinnovations.com | 186160671 |
| Ansar Javed | ansar@copilotinnovations.com | 107692430 |
| Sania Ahmad | sania@copilotinnovations.com | 300821833 |
| Laiba Shakil | laiba@copilotinnovations.com | 107689292 |
| Junaid Akhtar | junaid@copilotinnovations.com | 107691977 |
| Alfredo Gomez | alfredo@copilotinnovations.com | 107691973 |

---

## MCP Tool Reference

### Task Operations

| Tool | Purpose |
|------|---------|
| `clickup_get_task` | Get full task details |
| `clickup_create_task` | Create new task |
| `clickup_update_task` | Update task properties |
| `clickup_search` | Search tasks across workspace |

### Comments

| Tool | Purpose |
|------|---------|
| `clickup_get_task_comments` | View task comments |
| `clickup_create_task_comment` | Add comment to task |

### Time Tracking

| Tool | Purpose |
|------|---------|
| `clickup_start_time_tracking` | Start timer on task |
| `clickup_stop_time_tracking` | Stop running timer |
| `clickup_add_time_entry` | Add manual time entry |
| `clickup_get_task_time_entries` | View time entries |

### Workspace

| Tool | Purpose |
|------|---------|
| `clickup_get_workspace_hierarchy` | View spaces/folders/lists |
| `clickup_get_workspace_members` | List team members |
| `clickup_find_member_by_name` | Find member by name/email |
| `clickup_resolve_assignees` | Resolve emails to IDs |

### Files

| Tool | Purpose |
|------|---------|
| `clickup_attach_task_file` | Attach file to task |

---

## Common Operations

### Search for Tasks

```
clickup_search with filters:
- location.projects: ["space_id"]
- task_statuses: ["in_progress", "in_review"]
- assignees: ["user_id"]
```

### Create Task

Required:
- `name` - Task title
- `list_id` - Product Backlog list ID

Optional:
- `description` / `markdown_description`
- `assignees` - Array of user IDs or emails
- `priority` - "urgent", "high", "normal", "low"
- `due_date` - Format: "YYYY-MM-DD"
- `parent` - Task ID (for subtasks)

### Update Task

Updateable fields:
- `status` - New status name
- `assignees` - Array of user IDs/emails
- `name`, `description`
- `priority`, `due_date`, `start_date`

---

## Tips

- **Use task IDs directly** when known - faster than searching
- **Assignees can be emails** - no need to look up user IDs
- **Use "me"** to assign to yourself: `assignees: ["me"]`
- **Dates use your timezone** - just use "YYYY-MM-DD" format

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Task not found" | Verify task ID; try searching by name |
| "Invalid status" | Check available statuses for that list |
| "Assignee not found" | Use exact email or run `clickup_resolve_assignees` |
| "List not found" | Use `clickup_get_list` with list name first |
