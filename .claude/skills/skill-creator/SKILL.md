---
name: skill-creator
description: Create new skills with proper structure and team conventions. Interview-driven approach for consistent skill development across engineers.
argument-hint: "[skill-name]"
allowed-tools: Write, Read, Glob, Grep, AskUserQuestion
---

# Skill Creator

Help engineers create new Claude Code skills that follow team conventions and best practices. This skill guides you through the process of creating a well-structured, effective skill.

## When to Use

- Creating a new custom skill for your team
- You have a repetitive workflow you want to codify
- You want to share a pattern across engineers
- You need a skill but aren't sure how to structure it

## Arguments

Skill name (optional): `$ARGUMENTS`

If provided, use this as the skill name. If not, ask for it in the interview.

## Critical for Scaling

This skill is essential for scaling skill development across engineers without architect bottlenecks. By following consistent patterns, engineers can create high-quality skills independently.

## Interview Flow

Ask questions one at a time to gather requirements. The goal is to understand what the skill should do before generating the SKILL.md file.

### Question 1: Skill Name

**If argument provided:** "Great! So we're creating a skill called `$ARGUMENTS`. This will be the command users run (e.g., `/skill-creator`). Confirm this is correct, or suggest a different name."

**If no argument:** "What should this skill be called? This is the command users will run (e.g., `/commit`, `/spec`, `/review-pr`). Use kebab-case like 'my-skill-name'."

**Guidance:**
- Use kebab-case (lowercase with hyphens)
- Keep it short and memorable
- Make it action-oriented or outcome-oriented
- Examples: `spec`, `plan`, `complexity-gauge`, `team-init`

---

### Question 2: Purpose

"**What problem does this skill solve?** Describe in 1-2 sentences what this skill does and why it's useful."

**Guidance:** This becomes the description in the YAML frontmatter. It should be:
- One clear sentence (two max)
- Action-oriented: what it does
- Context about when to use it

Good: "Generate a task spec from a description or issue. Use before implementation to define what must be true when done."

Bad: "Helps with specs."

---

### Question 3: When to Use

"**When should engineers use this skill?** List 2-4 specific situations where this skill is the right tool."

**Guidance:** Think about trigger conditions. Examples:
- "Starting a new feature"
- "Before writing code for a complex task"
- "When unsure about task scope"
- "After code review feedback"

---

### Question 4: Arguments

"**Does this skill take any arguments?** For example, a file path, task description, URL, etc. If yes, describe what arguments it accepts. If no, say 'none'."

**Guidance:**
- Arguments are passed like `/skill-name [argument]`
- Common patterns:
  - File paths: `[spec-file-path]`
  - Descriptions: `[task-description]`
  - URLs: `[issue-url]`
  - Optional hints: `[stack-hint]`
- If arguments are optional, note that

---

### Question 5: Skill Pattern

"**What pattern best describes this skill?**

1. **Interview-driven** - Ask user questions one at a time, then generate output (e.g., team-init, spec-generator, complexity-gauge)
2. **Instruction-based** - Take input and execute a defined process (e.g., spec, plan, validate-spec)
3. **Validation** - Check something against rules and report issues (e.g., validate-spec, validate-plan)
4. **Generation** - Transform input into structured output (e.g., spec, plan)

Choose the number that best fits, or describe a different pattern."

**Guidance:** This determines the structure of the skill instructions.

---

### Question 6: Core Steps or Questions

**If interview-driven:** "What questions should this skill ask the user? List them in order."

**If instruction-based or generation:** "What are the main steps this skill should execute? List them in order."

**If validation:** "What criteria should this skill check? List the validation rules."

**Guidance:** This becomes the main body of the skill. Be specific about:
- What information is gathered or processed
- What transformations happen
- What output is produced

---

### Question 7: Output Format

"**What should this skill output?**

- Markdown document?
- Validation report?
- Checklist?
- Files written to disk?
- Just instructions for Claude to follow?

Describe what the user sees or gets at the end."

**Guidance:** Many skills output markdown. If so, include an example template in the skill.

---

### Question 8: Required Tools

"**Which tools does this skill need?** Based on what you've described, here are likely tools:

- **Read** - Read files from the codebase
- **Write** - Create or overwrite files
- **Glob** - Find files by pattern
- **Grep** - Search file contents
- **Bash** - Run shell commands (git, npm, etc.)
- **AskUserQuestion** - Interactive questions during execution
- **WebFetch** - Fetch URLs or GitHub issues

Which of these does your skill need? Any others?"

**Guidance:** Only include tools the skill actually uses. Restricting tools makes skills more focused and safer.

---

### Question 9: Quality Bar (Optional)

"**How do we know if the output is good?** What makes a good result vs a bad result? (Optional, but recommended for generation/validation skills)"

**Guidance:** This becomes a "Quality Bar" or "Notes" section. Examples:
- "The spec is good if it reduces ambiguity and defines success"
- "The plan is good if it's executable and scoped"
- "The assessment is good if it teaches the engineer why complexity matters"

---

### Question 10: Examples (Optional)

"**Should this skill include examples?** If yes, describe 1-2 example scenarios that would help users understand how to use this skill. If no, say 'skip'."

**Guidance:** Examples are helpful for:
- Complex skills
- Skills with multiple patterns
- Skills that produce specific output formats

---

## Generate SKILL.md

After all questions are answered, generate the skill file using this template:

```markdown
---
name: <skill-name>
description: <one-line description from question 2>
argument-hint: "<argument format from question 4, or empty if none>"
allowed-tools: <comma-separated list from question 8>
---

# <Skill Title>

<Expanded description: what this skill does and why>

## When to Use

<Situations from question 3, formatted as bullet list>

## Arguments

<Argument description from question 4, or "No arguments required" if none>

---

<MAIN SKILL BODY - structure depends on pattern from question 5>

### For Interview-Driven Skills:

## Interview Questions

Ask these questions one at a time:

### 1. <First Question>
<Question text>
<Guidance for the answer>

### 2. <Second Question>
<Question text>
<Guidance for the answer>

...

---

### For Instruction-Based Skills:

## Steps

1. <Step 1>
   <Details>

2. <Step 2>
   <Details>

...

---

### For Validation Skills:

## Validation Checks

Check for:
- [ ] <Check 1>
- [ ] <Check 2>
...

---

## Output Format

<Template or description of what gets produced from question 7>

<If markdown output, show example:>

\```markdown
# <Example Output>

## Section 1
...

## Section 2
...
\```

---

## Quality Bar (if provided in question 9)

Good output:
- <Quality criterion 1>
- <Quality criterion 2>

Bad output:
- <Anti-pattern 1>
- <Anti-pattern 2>

---

## Examples (if provided in question 10)

### Example 1: <Scenario Name>

<Describe situation>

<Show input>

<Show output or behavior>

---

## Notes

<Any additional guidance, tips, or references to other skills>

<Common notes:>
- Ask one question at a time (for interview skills)
- Use engineer's actual answers - don't assume
- If answer is unclear, note as TBD
- Reference existing skills: /spec, /plan, /validate-spec, etc.
```

---

After generating the skill, ask:

1. "Where should I save this skill?"
   - Suggest: `claude-code-team/skills/core/<skill-name>/SKILL.md`
   - Or: `claude-code-team/skills/integrations/<skill-name>/SKILL.md` for integration-specific skills
   - Or: `claude-code-team/skills/workflows/<skill-name>/SKILL.md` for workflow-specific skills

2. "Would you like me to refine any section before saving?"

3. After writing: "Skill created at <path>. Would you like me to commit this? (y/n)"

---

## Skill Creation Best Practices

Share these tips with engineers creating skills:

### 1. Start with Use Cases First
Don't build skills in the abstract. Identify 2-3 concrete, repetitive workflows you observe in practice.

### 2. Write Effective Descriptions
Claude decides which skill to load based on the YAML frontmatter alone. Make the description specific enough that Claude can match it to user requests.

### 3. Keep It Focused
One skill = one workflow. Multiple focused skills compose better than one large multi-purpose skill.

### 4. Test with Realistic Prompts
The best way to validate a skill is to test it with real user prompts. Write prompts the way engineers actually talk, not formal commands.

### 5. Start Simple
When in doubt, start with Pattern A (instruction-based). You can always add complexity later. Simplifying an overly complex skill is harder.

### 6. Provide Templates
If your skill generates output, include a template or example format. This reduces ambiguity.

### 7. Be Context-Efficient
Claude only reads SKILL.md when the skill is invoked. Keep instructions clear but concise.

### 8. Reference Other Skills
Point to related skills as examples. For instance:
- Interview pattern: see `/team-init`, `/spec-generator`, `/complexity-gauge`
- Validation pattern: see `/validate-spec`, `/validate-plan`
- Generation pattern: see `/spec`, `/plan`

---

## Example Skills to Reference

When creating your skill, look at these examples in the repo:

### Interview-Driven Pattern
- **claude-code-team/skills/core/team-init/SKILL.md** - Multi-question interview that generates project docs
- **claude-code-team/skills/core/spec-generator/SKILL.md** - Guided spec creation through structured questions
- **claude-code-team/skills/core/complexity-gauge/SKILL.md** - Assessment skill that teaches through questions

### Instruction-Based Pattern
- **claude-code-team/skills/core/spec/SKILL.md** - Takes input, generates structured spec
- **claude-code-team/skills/core/plan/SKILL.md** - Reads spec, generates implementation plan

### Validation Pattern
- **claude-code-team/skills/core/validate-spec/SKILL.md** - Checks spec against required sections
- **claude-code-team/skills/core/validate-plan/SKILL.md** - Validates implementation plan completeness

---

## YAML Frontmatter Reference

Every SKILL.md must start with YAML frontmatter:

```yaml
---
name: skill-name
description: One-line description of what the skill does
argument-hint: "[what-user-provides]"
allowed-tools: Tool1, Tool2, Tool3
---
```

### Fields Explained

- **name** (required): Kebab-case skill name. This is the command users run.
- **description** (required): One-line summary. This is what Claude sees when deciding which skill to load. Be specific.
- **argument-hint** (optional): Shows users what arguments to pass. Use brackets for placeholder. Examples: `[task-description]`, `[spec-file-path]`, `[issue-url]`. Leave empty string if no arguments.
- **allowed-tools** (required): Comma-separated list of tools this skill can use. Only include what's needed.

### Common Tool Combinations

- **Read-only exploration**: `Read, Glob, Grep`
- **Interactive interview**: `Read, Glob, Grep, AskUserQuestion`
- **File generation**: `Write, Read, Glob, Grep`
- **Git operations**: `Read, Write, Bash (git commands)`
- **Issue/PR handling**: `Read, Grep, Bash (gh commands), WebFetch`

---

## Notes

- This skill uses an interview approach because creating skills requires understanding context and intent
- The goal is to make skill creation accessible to all engineers, not just architects
- Encourage engineers to start simple and iterate based on real usage
- Skills are more maintainable when they follow consistent patterns
- When in doubt, look at existing skills in the repo as templates

---

## Sources (for research conducted)

Research on Claude Code skill best practices informed this skill:
- [Extend Claude with skills - Claude Code Docs](https://code.claude.com/docs/en/skills)
- [How to create custom Skills | Claude Help Center](https://support.claude.com/en/articles/12512198-how-to-create-custom-skills)
- [Skill authoring best practices - Claude API Docs](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
