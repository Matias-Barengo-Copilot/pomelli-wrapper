---
name: star-autism-brand-dna
description: >
  Brand DNA and design system for STAR Autism Support. Use this skill whenever building
  ANY tool, page, component, or artifact for STAR Autism Support — including AI-powered
  web tools (illustration generators, PPT generators, unit planners, lesson builders,
  curriculum tools), landing pages, dashboards, educator portals, marketing pages, email
  templates, or any UI component. Triggers on: "build a tool for STAR", "create a unit
  planner", "make a PPT generator", "design the STAR dashboard", "build a landing page for
  STAR", "write copy for STAR", or any request involving STAR Autism Support products.
  Always read this skill BEFORE writing a single line of code or copy for STAR.
---

# STAR Autism Support — Brand DNA

Single source of truth for all digital tools and content built for STAR Autism Support.
Every artifact — regardless of surface — must be consistent with this document.

---

## Who STAR Is

STAR Autism Support provides evidence-based curricula, training, and resources for
educating students with autism — early childhood through post-secondary. Their users are
special education teachers, ABA specialists, and school district administrators.

STAR is building a suite of small, focused AI-powered web tools to help educators work
faster and smarter: unit planners, PPT generators, illustration tools, lesson builders,
and more. Each tool is standalone but must feel like it belongs to the same family.

---

## Brand Personality & Voice

| Attribute | Value |
|---|---|
| Tone | Warm, authoritative, mission-driven — never clinical or cold |
| Voice | Trustworthy, evidence-based, hopeful, practical |
| We sound like | A seasoned special education expert who genuinely cares |
| We never sound like | Corporate EdTech, overly academic, preachy, or salesy |

### Writing Rules
- Lead with outcomes and student impact, not product features
- Plain language — educators are busy; be direct and scannable
- CTAs use action verb + clear outcome: "Generate Unit Plan" not "Submit"
- Celebrate progress — make achievement and output visible
- Error messages: specific and kind — "We couldn't generate that. Try simplifying your prompt."
- Empty states: encouraging, not blank — always tell the user what to do next
- Avoid jargon unless it's terms educators already use (IEP, ABA, grade level, objective)

---

## Design Tokens

Paste these CSS custom properties at the top of every web tool:

```css
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&family=Open+Sans:wght@400;500;600&display=swap');

:root {
  /* Brand Colors */
  --color-primary:        #1A5276;   /* Deep trust blue — headers, nav, key UI */
  --color-primary-mid:    #2E86C1;   /* Medium blue — links, hover, icon accents */
  --color-primary-light:  #D6EAF8;   /* Light blue — tinted backgrounds, badges */
  --color-cta:            #F39C12;   /* Warm amber — ALL primary CTAs */
  --color-cta-hover:      #D68910;   /* Amber hover */
  --color-cta-text:       #1C2833;   /* Dark text on amber buttons (contrast) */

  /* Backgrounds & Surfaces */
  --color-bg:             #F8FBFF;   /* App background */
  --color-surface:        #FFFFFF;   /* Cards, panels, inputs */
  --color-surface-alt:    #EBF5FB;   /* Alternate rows, subtle section tints */
  --color-surface-hover:  #DDEEFF;   /* Hover state on interactive surfaces */

  /* Text */
  --color-text-primary:   #1C2833;
  --color-text-secondary: #5D6D7E;
  --color-text-inverse:   #FFFFFF;
  --color-text-placeholder: #AAB7C4;

  /* Borders */
  --color-border:         #D6EAF8;
  --color-border-strong:  #AED6F1;

  /* Semantic */
  --color-success:        #1E8449;
  --color-success-light:  #D5F5E3;
  --color-warning:        #B7770D;
  --color-warning-light:  #FDEBD0;
  --color-error:          #922B21;
  --color-error-light:    #FADBD8;

  /* Typography */
  --font-heading: 'Nunito', 'Trebuchet MS', sans-serif;
  --font-body:    'Open Sans', 'Helvetica Neue', sans-serif;

  /* Type Scale */
  --text-xs:    0.75rem;    /* 12px */
  --text-sm:    0.875rem;   /* 14px */
  --text-base:  1rem;       /* 16px */
  --text-lg:    1.125rem;   /* 18px */
  --text-xl:    1.25rem;    /* 20px */
  --text-2xl:   1.5rem;     /* 24px */
  --text-3xl:   1.875rem;   /* 30px */
  --text-4xl:   2.25rem;    /* 36px */

  /* Spacing (8px grid) */
  --space-1:  0.5rem;
  --space-2:  1rem;
  --space-3:  1.5rem;
  --space-4:  2rem;
  --space-6:  3rem;
  --space-8:  4rem;
  --space-12: 6rem;

  /* Radii */
  --radius-sm:  6px;
  --radius-md:  10px;
  --radius-lg:  16px;
  --radius-xl:  24px;

  /* Shadows */
  --shadow-sm:    0 1px 4px rgba(26, 82, 118, 0.08);
  --shadow-md:    0 2px 12px rgba(26, 82, 118, 0.10);
  --shadow-lg:    0 4px 24px rgba(26, 82, 118, 0.13);
  --shadow-focus: 0 0 0 3px rgba(46, 134, 193, 0.20);

  /* Transitions */
  --transition-fast:   150ms ease;
  --transition-normal: 250ms ease;
}
```

---

## Component Rules

### Buttons

- **Primary CTA — always amber (`--color-cta`)**. One per screen section maximum.
- **Secondary** — blue outline (`--color-primary` border, transparent bg)
- **Ghost** — text-only in `--color-primary-mid`, for low-priority actions
- `border-radius: var(--radius-md)` — never pill shape
- Label always uses an action verb: "Generate", "Download", "Create", "Save", "Copy"
- Loading state: replace label with spinner + "Generating…" — never disable silently

### Cards

- Background: `var(--color-surface)`, border: `1px solid var(--color-border)`
- `border-radius: var(--radius-lg)`, padding: `var(--space-3)`, shadow: `var(--shadow-sm)`
- Interactive cards get hover: `var(--shadow-md)` + `translateY(-2px)`

### Form Inputs & Textareas

- Height: `44px` for single-line inputs
- Border: `1.5px solid var(--color-border-strong)`, focus: `--shadow-focus` ring
- Labels sit **above** the input — never placeholder-only
- Textareas: `min-height: 100px`, `resize: vertical`
- Show character count on any prompt field with a limit
- Validation: below field, `var(--color-error)`, `var(--text-sm)`

### Top Navigation (all tools share this)

- Height `64px`, `var(--color-surface)`, `border-bottom: 1px solid var(--color-border)`, sticky
- Left: STAR logo + tool name (e.g. "Unit Planner · STAR Autism Support")
- Right: Help link (ghost) + primary CTA if applicable
- On tablet (768px): logo + tool name only

### AI Generation States (critical for all STAR tools)

- **Skeleton loaders**: animated gray pulse matching the shape of the expected output
- **In-button spinner**: only during async actions, with updated label ("Generating…")
- **Progress bar**: for multi-step generation — 4px, `--color-primary-mid`, animated
- **Success toast**: bottom-right, `--color-success-light` bg, `--color-success` left border
- **Error toast**: `--color-error-light` bg, `--color-error` left border, with retry action

### Empty States

- Centered, max-width `420px`, outline icon `48px` in `--color-primary-light`
- Heading: Nunito 700 20px. Body: Open Sans 15px muted. CTA: amber button below.
- Always tell users what to do: "Your unit plan will appear here" → "Generate My First Plan"

---

## UX Principles for STAR Web Tools

1. **One tool, one job** — Each tool does one thing well. Keep the UI focused and minimal.

2. **Prompt → Preview → Download** — The core loop for every AI tool. Input goes in, result is previewed inline, then exported. Never make users wait to find out if it worked.

3. **Educator-speed design** — Reduce steps. Pre-fill sensible defaults. Smart dropdown suggestions. One-click copy/download on all outputs.

4. **Accessibility-aware** — Calm, structured, high-contrast UI. No jarring animations. WCAG AA minimum contrast everywhere.

5. **Evidence of quality** — Subtle signals of reliability: "Based on STAR's ABA curriculum", grade level badges, research-backed labels. These matter to educators.

6. **Graceful AI failures** — Always show a friendly, specific error with a retry option. Never a blank screen or a raw API error.

7. **Responsive** — Must work at 768px (school tablets) and 1280px+ (teacher desktops). 375px should not break.

---

## Surface Guides

When building a specific surface, read the relevant reference file first:

| Building... | Read |
|---|---|
| AI-powered web tool (unit planner, PPT generator, illustration tool, etc.) | `references/ai-web-tool.md` |
| Landing / marketing page | `references/landing-page.md` |
| Dashboard / educator portal with data | `references/dashboard.md` |
| Email or copy only | Apply voice/tone rules above — no layout file needed |

---

## Consistency Checklist

Before delivering any STAR artifact:

- [ ] CSS tokens imported — no hardcoded hex or font values
- [ ] Nunito for headings, Open Sans for body and UI text
- [ ] Primary CTA is amber — one per section
- [ ] Every button uses an action verb
- [ ] Loading, empty, and error states all implemented
- [ ] Copy leads with outcomes in educator language
- [ ] At least one STAR credibility signal visible
- [ ] Layout works at 768px and 1280px
- [ ] Focus states visible for keyboard navigation
