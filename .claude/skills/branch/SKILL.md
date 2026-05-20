---
name: branch
description: Create a properly named git branch following team conventions. Use when starting new work.
argument-hint: "[type] [name-or-ticket-id]"
disable-model-invocation: true
allowed-tools: Bash(git *)
---

# Create Branch

Create a git branch following the team's naming conventions.

## Branch naming format

- `feature/feature-name-or-ticket-id` - new functionality
- `bugfix/bug-name-or-ticket-id` - bug fixes
- `hotfix/hotfix-name-or-ticket-id` - urgent production fixes

## Usage

Arguments: `$ARGUMENTS`

If arguments provided, parse them:
- First argument: branch type (feature, bugfix, hotfix)
- Remaining arguments: branch name or ticket ID

If no arguments, ask the user:
1. What type of branch? (feature/bugfix/hotfix)
2. What name or ticket ID?

## Naming rules

- Use lowercase
- Use hyphens to separate words
- Include ticket ID if available
- Keep it descriptive but concise

## Examples

- `feature/add-login-button`
- `feature/JIRA-123-user-authentication`
- `bugfix/fix-navigation-crash`
- `bugfix/BUG-456`
- `hotfix/fix-production-crash`

## Steps

1. Parse or gather branch info
2. Construct branch name
3. Verify current branch: `git branch --show-current`
4. Check if on develop or main, warn if creating from other branch
5. Create and checkout: `git checkout -b <branch-name>`
6. Confirm success

## Output

Report the created branch name and remind user to push with:
```
git push -u origin <branch-name>
```
