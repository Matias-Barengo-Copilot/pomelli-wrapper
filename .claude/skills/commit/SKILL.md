---
name: commit
description: Generate a commit message following the team's type(scope) format. Use when committing changes.
allowed-tools: Bash(git *)
---

# Generate Commit Message

Generate a commit message following the team's required format.

## Gather context

1. Run `git status` to see what files are staged
2. Run `git diff --cached` to see the staged changes
3. If nothing is staged, run `git diff` to see unstaged changes

## Commit message format

Use this structure:

```
type(scope): short description

- Detail 1
- Detail 2

Resolves #ticket-id
```

### Types

- `feat` - new feature
- `fix` - bug fix
- `refactor` - code change that neither fixes a bug nor adds a feature
- `docs` - documentation only
- `test` - adding or updating tests
- `chore` - maintenance tasks, dependencies, configs
- `style` - formatting, whitespace (no code change)
- `perf` - performance improvement

### Rules

- Subject line: imperative mood, lowercase, no period, max 50 chars
- Scope: the module, component, or area affected
- Body: explain what and why (not how)
- Reference ticket/issue if applicable

## Examples

```
feat(auth): implement user registration

- Add registration form and validation
- Integrate authentication service
- Update user model and schema

Resolves #42
```

```
fix(navigation): resolve crash on back button press

- Handle null state in navigation stack
- Add defensive check before pop operation

Resolves #128
```

```
refactor(api): extract validation logic to separate module

- Move input validation to validators/
- Update all endpoints to use new validators
- No behavior change
```

## Output

Output the commit message ready to use. If user confirms, offer to run the commit command.
