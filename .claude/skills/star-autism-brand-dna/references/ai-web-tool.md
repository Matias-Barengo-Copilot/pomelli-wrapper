# STAR AI Web Tool — Surface Guide

The core pattern for every AI-powered tool STAR builds:
unit planners, PPT generators, illustration generators, lesson builders, objective writers, etc.

---

## The Core Layout

Every STAR AI tool follows the same shell:

```
┌─────────────────────────────────────────────────┐
│  NAV: Logo + Tool Name                   Help  │  64px sticky
├─────────────────────────────────────────────────┤
│  TOOL HEADER: Title + short description         │  ~80px
├──────────────────┬──────────────────────────────┤
│                  │                              │
│   INPUT PANEL    │     OUTPUT PANEL             │
│   (left/top)     │     (right/bottom)           │
│                  │                              │
│   Form fields    │   Preview of generated       │
│   + options      │   content                    │
│                  │                              │
│   [Generate →]   │   [Download] [Copy]          │
│                  │                              │
└──────────────────┴──────────────────────────────┘
```

- **Desktop (1024px+)**: Side-by-side — input left (~420px), output right (fills remaining)
- **Tablet (768–1024px)**: Side-by-side with narrower input (~340px)
- **Mobile (<768px)**: Stacked — input top, output below (output scrolls into view on generate)

---

## Tool Header

```
Background:    var(--color-surface), border-bottom: 1px solid var(--color-border)
Padding:       var(--space-3) var(--space-4)
Left:          Tool icon (24px outline) + Tool name (Nunito 700 22px) +
               short descriptor (Open Sans 400 14px muted) below
Right:         Optional "How to use" ghost button
```

Example:
```
📋 Unit Planner
   Build standards-aligned unit plans in seconds
```

---

## Input Panel

```
Background:    var(--color-surface)
Border-right:  1px solid var(--color-border) (desktop)
Padding:       var(--space-4)
Overflow:      scroll if inputs are long
```

### Input Panel Structure

1. **Section label** (if grouped): Open Sans 600 uppercase 11px tracking-wide, muted — e.g. "ABOUT THE STUDENT"
2. **Form fields**: stacked vertically, 16px gap between fields
3. **Primary CTA**: full-width amber "Generate [Output]" button at the bottom
4. **Reset link**: ghost "Start over" text link below CTA

### Field Types by Use Case

| Field | Use for |
|---|---|
| Short text input (44px) | Grade level, subject, student name, topic |
| Textarea (min 100px) | Learning objectives, notes, custom instructions, describe an illustration |
| Select dropdown | Standard options: grade band, lesson duration, skill level, output format |
| Checkbox group | Select multiple: standards to address, skills to include |
| Radio / pill toggle | Mutually exclusive options: difficulty, tone, style |
| Slider | Numerical values: number of slides, lesson length in minutes |

### Smart Defaults
- Pre-fill grade level if it can be inferred from context
- Dropdowns should show the most common option selected by default
- Include placeholder text that shows a real example, not "Enter text here"
  - ✓ "e.g. Identify coins by name and value"
  - ✗ "Enter your learning objective"

---

## Output Panel

```
Background:    var(--color-bg)
Padding:       var(--space-4)
Overflow:      scroll
```

### Output Panel States

**Empty (before first generation)**
```
Centered empty state:
- Outline icon matching the tool type (48px, --color-primary-light)
- Heading: "Your [output] will appear here"
- Body: One-sentence tip, e.g. "Fill in the details on the left and hit Generate."
- No CTA button in the empty state — the input panel's CTA is enough
```

**Loading (generating)**
```
Show skeleton loaders shaped like the expected output:
- PPT Generator: gray rounded rectangles mimicking slide thumbnails
- Unit Planner: gray lines mimicking a document with sections
- Illustration: gray square placeholder
Animated: subtle pulse opacity 0.5 → 1 → 0.5, 1.5s loop
Show progress text below: "Generating your unit plan… (this takes ~15 seconds)"
```

**Success (output ready)**
```
Display output inline — never redirect to a new page
Output area styling:
  - White card (--color-surface), --radius-lg, --shadow-sm
  - Padded 24px internally
  - Nunito headings, Open Sans body
  - Section dividers: 1px solid --color-border

Action bar at top-right of output:
  [📋 Copy]  [⬇ Download]  [🔄 Regenerate]
  Ghost buttons, 36px height, with icons
```

**Error**
```
Error card, --color-error-light bg, --color-error left border (4px)
Icon: ⚠️ outline, 20px
Message: Specific — "We couldn't generate this plan. Try shortening your objective."
Action: [Try Again] amber button
```

---

## Output Formatting by Tool Type

### Unit Planner output
```
Sections (in order): Unit Overview → Standards Addressed → Learning Objectives →
Lesson Sequence → Assessment Ideas → Materials Needed
Each section: Nunito 700 16px header + Open Sans body content
Downloadable as: .docx or .pdf
```

### PPT Generator output
```
Show slide thumbnails in a 2-column grid
Each thumbnail: white card, aspect-ratio 16/9, slide number bottom-left
Clicking a thumbnail opens a preview modal (full width)
Download: .pptx file
Regenerate individual slide: hover shows "↻ Redo this slide" overlay
```

### Illustration Generator output
```
Show generated image centered in output panel
Image dimensions: up to 512×512px displayed, full-res on download
Below image: prompt used (italic, muted) + [Download PNG] + [Describe Another →]
If using placeholder/AI API: show within a styled frame with STAR blue border
```

### Lesson Builder / Objective Writer output
```
Plain structured text in a styled document card
Copyable sections — each section has a small [📋] copy icon on hover
Full [Copy All] + [Download .docx] in the action bar
```

---

## Shared Interaction Patterns

### Regenerate
- Always available after generation — "↻ Regenerate" ghost button in output action bar
- Regenerating shows the skeleton loader again over the existing output (don't clear it abruptly)

### Copy to Clipboard
- One-click copy on any text block
- Button icon changes to ✓ for 2 seconds, then reverts
- Toast: "Copied to clipboard" — success style, bottom-right, 3s

### Download
- Trigger file download directly — no intermediate page
- Filename: `star-[tool-name]-[date].ext` e.g. `star-unit-planner-2025-03-25.docx`
- Toast: "Downloading your file…" on click

### History / Recent Outputs (if implemented)
- Sidebar or expandable panel: last 5 generations, labeled by date + first line of input
- Click to restore inputs and output
- "Clear history" ghost link at bottom

---

## Tool Hub / Home Page (if building an index of tools)

When building a page that lists all STAR tools:

```
Layout:        3-column card grid (desktop), 2-column (tablet), 1-column (mobile)
Card content:  Tool icon (40px) + Tool name (Nunito 700 18px) + 
               1-sentence description + [Open Tool →] amber ghost button
Card hover:    --shadow-md + translateY(-2px)
Section above: "STAR AI Tools" heading + subtitle about the suite
```
