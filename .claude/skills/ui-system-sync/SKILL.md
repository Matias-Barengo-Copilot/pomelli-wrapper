---
name: ui-system-sync
description: Extract the visual system from the Employee Growth Path / Copilot UI reference app and apply it to another project for visual consistency. Use when onboarding a new internal app to the shared design language.
argument-hint: "[target-project-path] (optional: path or repo of the app to unify)"
---

# ui-system-sync

## When to use / When NOT to use

**Use when:**
- Aligning a new internal tool or app to the Copilot / Employee Growth Path visual language
- Auditing an existing internal app for UI drift
- Migrating a project into the shared design system incrementally
- Creating a lightweight design token layer for a greenfield project

**Do NOT use when:**
- Rewriting architecture for aesthetic reasons
- The target project has no UI (CLI, background service, API-only)
- Full design system migration is out of scope for the task
- Copying proprietary components verbatim from the reference repo

---

## Modes of operation

This skill operates in two sequential phases. Always complete Phase 1 before Phase 2.

---

### Phase 1 — EXTRACTION (reference app)

**Objective:** Build a verified UI System Map from the Employee Growth Path reference app.

#### Step 1.1 — Identify the stack

Read the following files in this exact order:
- `package.json` → confirm Next.js version, Tailwind version, shadcn/ui, Radix, lucide-react
- `app/globals.css` or `src/globals.css` → CSS custom properties, `@theme` block, base resets, CSS variable values
- `lib/ui/feedback-reference.ts` → authoritative token strings for form controls, buttons, dialogs, inputs
- `lib/ui/reference-surfaces.ts` → authoritative token strings for page shells, cards, typography rhythm
- `lib/ui/badge-variants.ts` → badge variant definitions
- `components/ui/button.tsx` → all button variants and size definitions
- `components/ui/card.tsx` → card anatomy (padding, radius, shadow)
- `components/ui/input.tsx` → input variants
- `components/dashboard/layout/DashboardLayout.tsx` → outer shell structure

Do NOT infer tokens from component class usage alone. Always read the authoritative config files first.

#### Step 1.2 — Extract design tokens

Produce a JSON token map (see § Token Format below).

#### Step 1.3 — Inventory components and surfaces

Produce three lists:
1. **Base components** — name, file, primary role
2. **Layout patterns** — page shells, sidebar, main content wrapper
3. **Named token surfaces** — surfaces from `lib/ui/` with their exact string values

#### Step 1.4 — Output: UI System Map

Deliver this table before proceeding to Phase 2:

| Token category | Key | Value | Source |
|---|---|---|---|
| radius | base | 0.75rem | globals.css `--radius` |
| radius | sm | ~0.5rem | `calc(--radius - 4px)` |
| radius | md | ~0.625rem | `calc(--radius - 2px)` |
| radius | lg | 0.75rem | `--radius-lg` |
| radius | xl | ~1rem | `calc(--radius + 4px)` |
| radius | 2xl | ~1.25rem | `calc(--radius + 8px)` |
| radius | 3xl | ~1.5rem | `calc(--radius + 12px)` |
| radius | 4xl | ~1.75rem | `calc(--radius + 16px)` |
| radius | card | 2rem (`rounded-[2rem]`) | reference-surfaces.ts |
| radius | modal | 2.5rem (`rounded-[2.5rem]`) | feedback-reference.ts |
| color | background | oklch(1 0 0) = #ffffff | globals.css |
| color | app-shell | #FDFDFF | DashboardLayout.tsx |
| color | foreground | oklch(0.145 0 0) ≈ slate-900 | globals.css |
| color | accent (CSS var) | #F17E64 (coral) | globals.css |
| color | action-primary | indigo-600 (#4f46e5) | button.tsx / feedbackReference |
| color | action-primary-hover | indigo-700 (#4338ca) | button.tsx |
| color | border-default | oklch(0.922 0 0) ≈ slate-200 | globals.css |
| color | border-subtle | slate-100 (#f1f5f9) | reference-surfaces.ts |
| color | muted-bg | oklch(0.97 0 0) ≈ slate-50 | globals.css |
| color | muted-fg | oklch(0.556 0 0) ≈ slate-500 | globals.css |
| color | sidebar-bg | oklch(0.985 0 0) ≈ near-white | globals.css |
| color | destructive | oklch(0.577 0.245 27.325) ≈ red-600 | globals.css |
| spacing | page-shell | `space-y-8 p-4 md:p-6` | reference-surfaces.ts |
| spacing | main-content | `px-3 py-4 sm:px-6 lg:px-8 sm:py-6` | DashboardLayout.tsx |
| spacing | max-width | max-w-7xl (outer) / max-w-6xl (constrained) | DashboardLayout / reference-surfaces |
| spacing | card-padding | px-6, py-6 | card.tsx |
| spacing | card-gap | gap-6 | card.tsx |
| shadow | card-default | shadow-sm | card.tsx / reference-surfaces |
| shadow | card-hover | shadow-md | card.tsx |
| shadow | button-primary | shadow-lg shadow-indigo-600/20 | button.tsx |
| shadow | modal | shadow-2xl | feedback-reference.ts |
| font | sans | Geist Sans (`--font-geist-sans`) | globals.css |
| font | mono | Geist Mono (`--font-geist-mono`) | globals.css |

---

### Phase 2 — APPLICATION (target app)

**Objective:** Map and adapt the reference visual system to the target project.

#### Step 2.1 — Audit the target project

Read:
- `package.json` → identify stack (React, Vue, plain HTML, etc.)
- CSS entry point → identify existing tokens, variables, frameworks
- Primary layout component → understand spacing and structural patterns
- At least two pages/views → identify drift from reference

#### Step 2.2 — Generate the mapping table

```
Target concept → Reference equivalent → Adaptation strategy
```

| Target | Reference | Strategy |
|---|---|---|
| `.card` | `rounded-[2rem] border border-slate-100 bg-white shadow-sm` | Apply radius + border + shadow |
| `.btn-primary` | `referencePrimary` button variant | indigo-600 fill, rounded-2xl, shadow-lg |
| `border-radius: 4px` | `rounded-[2rem]` on cards | Replace with CSS var `--radius-card` |
| Hardcoded `orange-500` as accent | `#F17E64` coral | Replace — accent is coral, not orange |
| No design tokens | `@theme` block | Create `ui-system.css` token layer |

#### Step 2.3 — Define adaptation strategy by stack

**Tailwind project:**
1. Extend CSS with reference `@theme` / `--radius` variables
2. Align `globals.css` CSS custom properties to reference values
3. Replace hardcoded utilities with token-driven classes

**CSS-only project:**
1. Create `ui-system.css` as a token layer (see § CSS Variables Template below)
2. Define CSS custom properties matching reference tokens
3. Replace hardcoded values with `var(--token-name)` calls

**UI library project (MUI, Ant, Chakra, etc.):**
1. Create adapter wrappers matching reference component API
2. Override theme tokens in the library's theme provider
3. Do not modify library internals directly

#### Step 2.4 — Apply changes progressively

Apply in this exact order — do not skip or reorder layers:

1. **Layout shells** — page shell padding, sidebar width, main content max-width
2. **Typography** — font, heading scale, weights, tracking, leading
3. **Colors** — primary, action (indigo), accent (coral), border, background, text
4. **Components** — cards, buttons, inputs, badges, modals
5. **Pages** — full-page visual review against reference

---

## Reference visual system — complete specification

> This section is the single source of truth. All values are extracted directly from the reference codebase. Do not approximate or substitute without documenting the deviation.

---

### Colors

| Role | Tailwind / Hex | CSS Variable | Notes |
|---|---|---|---|
| Page background | `#ffffff` | `var(--background)` | oklch(1 0 0) |
| App shell background | `#FDFDFF` | — | `DashboardLayout` outer div |
| Default text | slate-900 ≈ `#0f172a` | `var(--foreground)` | oklch(0.145 0 0) |
| Muted text | slate-500 ≈ `#64748b` | `var(--muted-foreground)` | oklch(0.556 0 0) |
| Subtle muted text | slate-400 `#94a3b8` | — | micro-labels, descriptions |
| Accent (CSS var) | `#F17E64` (coral) | `var(--accent)` | NOT orange-500; used for sidebar chevron hover |
| Action primary | indigo-600 `#4f46e5` | — | CTAs, active states, links |
| Action primary hover | indigo-700 `#4338ca` | — | |
| Action focus ring | indigo-500/20–30 | — | `focus-visible:ring-indigo-500/20` |
| Border default | slate-200 ≈ `#e2e8f0` | `var(--border)` | oklch(0.922 0 0) |
| Border subtle | slate-100 `#f1f5f9` | — | card borders, component borders |
| Border strong | slate-200 `#e2e8f0` | — | sidebar, header separators |
| Muted surface | slate-50 `#f8fafc` | `var(--muted)` | oklch(0.97 0 0) |
| Input background | slate-50 `#f8fafc` | — | reference inputs before focus |
| Input focus background | white `#ffffff` | — | on `focus-visible` |
| Callout info surface | indigo-50/70 + indigo-100 border | — | `referenceCalloutInfo` |
| Destructive | red-600 ≈ oklch(0.577 0.245 27.325) | `var(--destructive)` | errors, delete |
| Sidebar background | near-white oklch(0.985 0 0) | `var(--sidebar)` | |
| Overlay (modal/sheet) | slate-900/40 + backdrop-blur-sm | — | `feedbackReference.dialogOverlay` |

**Semantic color pairings — do not mix:**
- Action surface = indigo-600 / white text
- Muted surface = slate-50 / slate-900 text
- Accent surface = coral `#F17E64` / white text (used sparingly)
- Destructive surface = rose-100 / rose-800 text (badges), red-600 (button)
- Success surface = emerald-100 / emerald-800 text
- Warning surface = amber-100 / amber-900 text

---

### Typography

Every text element must match one of the following defined styles. Do not use arbitrary font sizes outside this scale.

#### Font family

| Role | Value | Source |
|---|---|---|
| Sans (default) | `font-sans` → Geist Sans | `globals.css --font-geist-sans` |
| Mono | `font-mono` → Geist Mono | `globals.css --font-geist-mono` |

#### Type scale — headings

| Level | Tailwind classes | Usage |
|---|---|---|
| Page hero title | `text-3xl tracking-tight text-white` | Banner/hero sections with colored background |
| Profile / entity name | `text-2xl leading-tight tracking-tight text-slate-900` | Employee profile, entity detail pages |
| Dialog / modal title | `text-xl tracking-tight text-slate-900` | `feedbackReference.dialogTitle` |
| Card title (standard) | `text-base tracking-tight text-slate-900` | e.g. `CardTitle` in LocalHolidays |
| Card title (shadcn default) | `leading-none font-semibold` | `components/ui/card.tsx CardTitle` |
| Card description | `text-sm text-muted-foreground` | `components/ui/card.tsx CardDescription` |
| Dialog description | `text-xs text-slate-400 leading-relaxed` | `feedbackReference.dialogDescription` |

#### Type scale — body and labels

| Level | Tailwind classes | Usage |
|---|---|---|
| Body default | `text-sm text-slate-900` | Primary content text |
| Body secondary | `text-sm text-slate-500` | Supporting text, metadata |
| List item primary | `text-sm font-bold text-slate-900` | Bold list rows |
| List item secondary | `text-sm font-semibold text-slate-800` | Slightly less prominent list items |
| Small metadata | `text-xs text-slate-500` | Dates, counts, secondary meta |
| Back / navigation link | `text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline` | `referenceBackLink` |

#### Type scale — labels and micro-text

All micro-labels MUST be uppercase + tracking-widest. This is non-negotiable.

| Level | Tailwind classes | Usage |
|---|---|---|
| Card/panel section header | `text-xs font-black uppercase tracking-widest text-slate-400` | `referenceCardTitle` — icon + headline pair |
| Section panel title | `text-sm uppercase tracking-widest text-slate-400` | `referencePanelTitle` — "Basic Info", "About" |
| Micro-label (field / section) | `text-xs font-bold uppercase tracking-widest text-slate-400` | `referenceMicroLabel` |
| Form label | `text-[10px] uppercase tracking-widest text-slate-400` | `feedbackReference.formLabel` |
| Tiny label (inline) | `text-[10px] font-bold uppercase tracking-widest text-slate-400` | Used inline on page |
| Sidebar brand | `font-semibold text-black leading-tight` | "Copilot" / "Innovations" in sidebar header |

**Rule:** Never use `text-gray-*` for text colors. Always use `text-slate-*`.

---

### Spacing and layout

#### Dashboard shell structure

```
div.dashboard-layout — flex h-screen overflow-hidden bg-[#FDFDFF]
  ├── Sidebar — fixed, w-64 (expanded) / w-16 (collapsed)
  └── div — flex flex-1 flex-col overflow-hidden
        ├── Header — h-16 border-b border-slate-200 bg-white
        └── main — flex-1 overflow-y-auto pb-16 md:pb-0
              └── div — mx-auto max-w-7xl px-3 py-4 sm:px-6 lg:px-8 sm:py-6
                    └── {page content}
```

#### Page shell

Every dashboard page must open with:
```
<div className="space-y-8 p-4 md:p-6">  {/* referencePageShell */}
```

For wide/constrained pages (calendar, forms):
```
<div className="mx-auto w-full max-w-6xl">  {/* referenceConstrained */}
```

#### Spacing rules

| Context | Value | Rule |
|---|---|---|
| Section vertical gap | `space-y-8` | Between major page sections |
| Page internal padding | `p-4 md:p-6` | Page shell wrapper |
| Card internal padding | `px-6` + `py-6` | `CardContent`, `CardHeader`, `CardFooter` all use `px-6` |
| Card gap between parts | `gap-6` | `Card` flex container |
| Sidebar nav padding | `px-2 py-4` | Nav scroll area |
| Nav item spacing | `space-y-1` | `<ul>` in sidebar nav |
| Filter bar padding | `p-3 sm:p-4` | `referenceFilterBar` |
| Day row / compact row | `p-2 gap-2` | `referenceDayRow` |
| Empty state padding | `py-10` | `referenceEmptyState` |

**Prohibited patterns:**
- Do not use `p-2` or `gap-1` on page-level containers
- Do not use `mt-*/mb-*` when `space-y-*` applies to the parent
- Do not use `padding: 8px` in CSS when `p-2` is the equivalent — use tokens

---

### Border radius

| Context | Value | Class |
|---|---|---|
| Primary card / panel | 2rem | `rounded-[2rem]` |
| Modal / sheet panel | 2.5rem | `sm:rounded-[2.5rem]` / `rounded-t-[2.5rem]` |
| Reference button (CTA) | rounded-2xl | `rounded-2xl` |
| Nested card / sub-panel | rounded-2xl | `rounded-2xl` |
| Filter bar / search | rounded-[2rem] | `rounded-[2rem]` |
| Input field (reference) | rounded-2xl | `rounded-2xl` |
| Input field (default) | rounded-xl | `rounded-xl` |
| Standard button | rounded-xl | `rounded-xl` |
| Badge | rounded-xl | `rounded-xl` |
| Count badge | rounded-full | `rounded-full` |
| Empty state dashed | rounded-[2rem] | `rounded-[2rem]` |
| Sidebar toggle button | rounded-r-full | semicircle on edge |

**Rule:** Cards, modals, and panels must use large radius (2rem+). Buttons and inputs use rounded-xl minimum. Never use `rounded-md` or `rounded-lg` on cards or panels.

---

### Shadows

| Context | Value | Notes |
|---|---|---|
| Card default | `shadow-sm` | All cards at rest |
| Card hover | `shadow-md` | `hover:shadow-md transition-shadow duration-200` |
| Primary CTA button | `shadow-lg shadow-indigo-600/20` | Only on indigo-filled buttons |
| Secondary CTA button | `shadow-lg shadow-slate-900/5` | White + slate-border buttons |
| Muted control | `shadow-sm` | Pagination, icon buttons |
| Active control | `shadow-md shadow-indigo-600/15` | Selected state |
| Modal | `shadow-2xl` | Dialog panel |
| Sidebar toggle | `shadow-sm hover:shadow-md` | Semicircle collapse button |

**Rule:** Do not use `shadow-lg` on cards. Do not use `shadow-none` on interactive buttons. Deep shadows (`shadow-xl`, `shadow-2xl`) are reserved for modals only.

---

### Components — exact anatomy

#### Card

```html
<!-- Primary card (use referenceCard token or card.tsx) -->
<div class="rounded-[2rem] border border-slate-100 bg-white shadow-sm
            hover:shadow-md transition-shadow duration-200">
  <!-- CardHeader: px-6, grid layout for title + action -->
  <div class="px-6 py-6 grid auto-rows-min grid-rows-[auto_auto] items-start gap-2">
    <div class="leading-none font-semibold">Card Title</div>
    <div class="text-sm text-muted-foreground">Description</div>
  </div>
  <!-- CardContent: px-6 only (py comes from Card gap-6) -->
  <div class="px-6">{content}</div>
  <!-- CardFooter: px-6 -->
  <div class="px-6 flex items-center">{actions}</div>
</div>

<!-- Nested card / sub-panel -->
<div class="rounded-2xl border border-slate-100 bg-slate-50/70">{content}</div>
```

#### Button — all variants

```html
<!-- Base classes (always present): -->
<!-- inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium
     transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-50
     focus-visible:ring-[3px] focus-visible:ring-ring/50 -->

<!-- Primary CTA (referencePrimary) -->
<button class="bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-600/20
               hover:bg-indigo-700 focus-visible:ring-indigo-500/30
               px-6 py-3 text-sm">
  Save
</button>

<!-- Secondary CTA (referenceSecondary) -->
<button class="bg-white text-slate-900 border-2 border-slate-900 rounded-2xl
               shadow-lg shadow-slate-900/5 hover:bg-slate-50
               focus-visible:ring-slate-400/30 px-6 py-3 text-sm">
  Cancel
</button>

<!-- Muted control (referenceMuted — pagination, quiet controls) -->
<button class="bg-white text-slate-700 border border-slate-100 rounded-2xl
               shadow-sm hover:bg-slate-50 focus-visible:ring-indigo-500/25
               h-9 px-3 text-sm">
  2
</button>

<!-- Active / selected control (referenceActive) -->
<button class="bg-indigo-600 text-white border border-indigo-600 rounded-2xl
               shadow-md shadow-indigo-600/15 hover:bg-indigo-700
               focus-visible:ring-indigo-500/30 h-9 px-3 text-sm">
  3
</button>

<!-- Icon-only square (referenceIcon) -->
<button class="size-9 rounded-2xl border border-slate-100 bg-white text-slate-600
               hover:bg-slate-50 hover:text-indigo-600">
  <ChevronLeft />
</button>

<!-- Default shadcn button (non-reference pages) -->
<button class="bg-primary text-primary-foreground rounded-xl h-9 px-4 py-2 text-sm
               hover:bg-primary/90 shadow-md shadow-primary/20">
  Submit
</button>
```

**Rules:**
- Reference pages (feedback, directory, leave) must use `referencePrimary` / `referenceSecondary` variants
- Never use `rounded-md` or `rounded-lg` on reference-style buttons
- Focus rings are mandatory on all buttons — never `outline-none` without a replacement ring

#### Input — all variants

```html
<!-- Reference input (forms in modals / feedback) -->
<input class="min-h-12 w-full rounded-2xl border-transparent bg-slate-50
              px-4 py-3 text-sm text-slate-900
              placeholder:text-slate-400
              focus-visible:border-transparent focus-visible:bg-white
              focus-visible:ring-2 focus-visible:ring-indigo-500/20
              focus-visible:outline-none disabled:opacity-50" />

<!-- Reference textarea -->
<textarea class="min-h-[7.5rem] w-full resize-none rounded-2xl border-transparent
                 bg-slate-50 px-4 py-3 text-sm text-slate-900
                 placeholder:text-slate-400
                 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-indigo-500/20
                 focus-visible:outline-none disabled:opacity-50" />

<!-- Default input (non-reference forms) -->
<input class="h-9 w-full rounded-xl border border-input bg-transparent
              px-3 py-1 text-sm md:text-sm
              placeholder:text-muted-foreground
              focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-primary/10" />
```

**Rules:**
- Reference inputs start with `bg-slate-50`, transition to `bg-white` on focus
- Ring color is always `indigo-500/20` for reference inputs, `primary/10` for default inputs
- Never use `border-gray-*` or hardcoded `border-color` on inputs

#### Badge — full variant table

Base classes: `inline-flex items-center justify-center gap-1 rounded-xl border font-bold`

Sizes:
| Size | Classes |
|---|---|
| xs | `px-1.5 text-[10px]` |
| sm | `h-5 px-2 text-[11px] font-semibold` |
| md (default) | `px-2.5 py-0.5 text-xs` |
| lg | `px-4 py-2 text-sm uppercase tracking-wide` |

Variants (semantic — never approximate with ad-hoc colors):
| Variant | Background | Border | Text |
|---|---|---|---|
| default | indigo-600 | transparent | white |
| secondary | slate-100 | slate-200 | slate-800 |
| outline | white | slate-200 | slate-700 |
| success | emerald-100 | transparent | emerald-800 |
| destructive | rose-100 | transparent | rose-800 |
| warning | amber-100 | transparent | amber-900 |
| pending | indigo-50 | indigo-200 | indigo-900 |
| draft | slate-50 | slate-200 | slate-700 |
| cancelled | slate-100 | slate-200 | slate-600 |
| muted | slate-100 | transparent | slate-600 |
| count (pill) | indigo-600 | none | white — `rounded-full h-[18px] min-w-[18px]` |

**Rule:** Do not create one-off `bg-*/text-*` combinations on badges. Use a named variant. If a variant is missing, add it to `lib/ui/badge-variants.ts`.

#### Modal / Dialog

```html
<!-- Overlay -->
<div class="bg-slate-900/40 backdrop-blur-sm" />

<!-- Panel -->
<div class="gap-6 border-slate-100 bg-white text-slate-900
            shadow-2xl sm:rounded-[2.5rem]">
  <!-- Title -->
  <h2 class="text-xl tracking-tight text-slate-900">Modal Title</h2>
  <!-- Description -->
  <p class="text-xs text-slate-400 leading-relaxed">Supporting text</p>
  <!-- Form label inside modal -->
  <label class="text-[10px] uppercase tracking-widest text-slate-400">Field name</label>
</div>
```

#### Bottom Sheet / Drawer

```html
<!-- Overlay -->
<div class="bg-slate-900/40 backdrop-blur-sm" />
<!-- Content -->
<div class="rounded-t-[2.5rem] border-slate-100 bg-white" />
```

#### Select / Dropdown

```html
<!-- Trigger -->
<button class="rounded-2xl border border-slate-100 bg-white shadow-sm
               hover:bg-slate-50/80
               focus-visible:border-transparent focus-visible:ring-2
               focus-visible:ring-indigo-500/20
               data-[placeholder]:text-slate-400" />
<!-- Content panel -->
<div class="rounded-2xl border border-slate-100 shadow-lg" />
```

#### Table

```html
<!-- Header row -->
<tr class="border-b border-slate-100 bg-slate-50/90" />
<!-- Body row -->
<tr class="border-b border-slate-100 last:border-0
           transition-colors hover:bg-slate-50/80 cursor-pointer" />
```

#### Special surfaces

```html
<!-- Filter bar (search + selects) -->
<div class="rounded-[2rem] border border-slate-100 bg-white p-3 shadow-sm sm:p-4" />

<!-- Empty / zero state -->
<div class="rounded-[2rem] border-2 border-dashed border-slate-200
            bg-slate-50/50 py-10 text-center text-sm text-slate-500" />

<!-- Info callout / banner -->
<div class="rounded-2xl border border-indigo-100 bg-indigo-50/70 text-slate-800" />

<!-- Compact horizontal row (day chip, draft line) -->
<div class="flex items-center gap-2 rounded-2xl border border-slate-100
            bg-slate-50/80 p-2" />

<!-- Back / secondary navigation link -->
<a class="inline-flex items-center gap-1 text-sm font-medium
          text-indigo-600 hover:text-indigo-700 hover:underline" />
```

---

### Sidebar — complete anatomy

| Element | Value |
|---|---|
| Outer width expanded | `w-64` |
| Outer width collapsed | `w-16` |
| Background | `bg-white` |
| Right border | `border-r border-slate-200` |
| Transition | `transition-all duration-300 ease-in-out` |
| Header height | `h-16` |
| Header border | `border-b border-slate-200` |
| Logo size | `h-9 w-9` (expanded), `h-8 w-8 mx-auto` (collapsed) |
| Brand name | `font-semibold text-black leading-tight` |
| Nav scroll area | `px-2 py-4` |
| Nav list spacing | `space-y-1` |
| Collapse toggle | `w-5 h-10 bg-white border border-slate-200 rounded-r-full shadow-sm` |
| Collapse toggle hover | `hover:shadow-md` |
| Toggle icon hover color | `text-accent` (`#F17E64` coral) |

---

### Named surface tokens (from `lib/ui/`)

These are the authoritative import values. Use these constants directly in TSX instead of duplicating the strings.

```ts
import {
  referencePageShell,      // 'space-y-8 p-4 md:p-6'
  referenceConstrained,    // 'mx-auto w-full max-w-6xl'
  referenceCard,           // 'rounded-[2rem] border border-slate-100 bg-white shadow-sm'
  referenceCardTitle,      // 'flex items-center gap-3 text-xs font-black tracking-tight text-slate-400 uppercase tracking-widest'
  referenceMicroLabel,     // 'text-xs font-bold uppercase tracking-widest text-slate-400'
  referencePanelTitle,     // 'text-sm uppercase tracking-widest text-slate-400'
  referenceNestedCard,     // 'rounded-2xl border border-slate-100 bg-slate-50/70'
  referenceFilterBar,      // 'rounded-[2rem] border border-slate-100 bg-white p-3 shadow-sm sm:p-4'
  referenceDayRow,         // 'flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-2'
  referenceTableHead,      // 'border-b border-slate-100 bg-slate-50/90'
  referenceTableRow,       // 'border-b border-slate-100 last:border-0 transition-colors hover:bg-slate-50/80 cursor-pointer'
  referenceBackLink,       // 'inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline'
  referenceEmptyState,     // 'rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50/50 py-10 text-center text-sm text-slate-500'
  referenceCalloutInfo,    // 'rounded-2xl border border-indigo-100 bg-indigo-50/70 text-slate-800'
} from '@/lib/ui/reference-surfaces';

import { feedbackReference } from '@/lib/ui/feedback-reference';
// feedbackReference.buttonPrimary, .buttonSecondary, .controlSurface, .controlActive
// feedbackReference.inputField, .textareaField, .nativeSelect
// feedbackReference.formLabel, .selectTrigger, .selectContent
// feedbackReference.dialogOverlay, .dialogContent, .dialogTitle, .dialogDescription
// feedbackReference.sheetOverlay, .sheetContentBottom
```

---

### Design token format (JSON)

```json
{
  "radius": {
    "base": "0.75rem",
    "sm": "calc(0.75rem - 4px)",
    "md": "calc(0.75rem - 2px)",
    "lg": "0.75rem",
    "xl": "calc(0.75rem + 4px)",
    "2xl": "calc(0.75rem + 8px)",
    "3xl": "calc(0.75rem + 12px)",
    "4xl": "calc(0.75rem + 16px)",
    "card": "2rem",
    "modal": "2.5rem"
  },
  "colors": {
    "background": "oklch(1 0 0)",
    "app-shell": "#FDFDFF",
    "foreground": "oklch(0.145 0 0)",
    "accent-var": "#F17E64",
    "action-primary": "#4f46e5",
    "action-primary-hover": "#4338ca",
    "border-default": "oklch(0.922 0 0)",
    "border-subtle": "#f1f5f9",
    "muted-bg": "oklch(0.97 0 0)",
    "muted-fg": "oklch(0.556 0 0)",
    "destructive": "oklch(0.577 0.245 27.325)"
  },
  "spacing": {
    "page-shell": "space-y-8 p-4 md:p-6",
    "main-content-x": "px-3 sm:px-6 lg:px-8",
    "main-content-y": "py-4 sm:py-6",
    "max-width-outer": "max-w-7xl",
    "max-width-constrained": "max-w-6xl",
    "card-padding-x": "px-6",
    "card-padding-y": "py-6",
    "card-gap": "gap-6"
  },
  "shadow": {
    "card-default": "shadow-sm",
    "card-hover": "shadow-md",
    "button-primary": "shadow-lg shadow-indigo-600/20",
    "button-secondary": "shadow-lg shadow-slate-900/5",
    "modal": "shadow-2xl"
  },
  "typography": {
    "font-sans": "Geist Sans",
    "font-mono": "Geist Mono",
    "heading-hero": "text-3xl tracking-tight",
    "heading-entity": "text-2xl leading-tight tracking-tight",
    "heading-dialog": "text-xl tracking-tight",
    "heading-card": "text-base tracking-tight",
    "body": "text-sm",
    "body-bold": "text-sm font-bold",
    "label-micro": "text-[10px] uppercase tracking-widest",
    "label-section": "text-xs font-bold uppercase tracking-widest",
    "label-panel": "text-sm uppercase tracking-widest"
  }
}
```

---

## Step-by-step agent process

1. **Read** `globals.css`, `lib/ui/feedback-reference.ts`, `lib/ui/reference-surfaces.ts`, `lib/ui/badge-variants.ts`, `components/ui/button.tsx`, `components/ui/card.tsx`, `components/dashboard/layout/DashboardLayout.tsx`
2. **Verify** each token against the actual file content — do not use memory or approximation
3. **Extract** all design tokens into the JSON format above
4. **Inventory** base components, layout patterns, named surface tokens
5. **Audit** the target project: stack, entry CSS, layout, two sample pages
6. **Generate** the mapping table (target → reference → strategy)
7. **Create or update** the token layer in the target project
8. **Apply layout** — shells, max-width, sidebar structure, spacing
9. **Apply typography** — font, scale for each heading level, micro-labels
10. **Apply colors** — swap hardcoded values; correct accent (coral #F17E64, not orange-500); use indigo-600 for actions
11. **Apply component anatomy** — cards, buttons, inputs, badges, modals per spec above
12. **Apply surfaces** — tables, filter bars, empty states, callouts
13. **Review pages** — verify visual parity against specification
14. **Run validation checklist** (see below)

---

## CSS Variables Template (for CSS-only target projects)

```css
/* ui-system.css — add as first import */
:root {
  /* Base radius token */
  --radius: 0.75rem;
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --radius-2xl: calc(var(--radius) + 8px);
  --radius-3xl: calc(var(--radius) + 12px);
  --radius-4xl: calc(var(--radius) + 16px);
  --radius-card: 2rem;
  --radius-modal: 2.5rem;

  /* Colors */
  --color-bg: #ffffff;
  --color-app-shell: #FDFDFF;
  --color-fg: #0f172a;          /* slate-900 */
  --color-fg-muted: #64748b;    /* slate-500 */
  --color-fg-subtle: #94a3b8;   /* slate-400 */
  --color-accent: #F17E64;      /* coral — CSS --accent var */
  --color-action: #4f46e5;      /* indigo-600 — CTAs */
  --color-action-hover: #4338ca;/* indigo-700 */
  --color-action-ring: rgba(99, 102, 241, 0.2); /* indigo-500/20 */
  --color-border: #e2e8f0;      /* slate-200 */
  --color-border-subtle: #f1f5f9; /* slate-100 */
  --color-surface-muted: #f8fafc; /* slate-50 */
  --color-destructive: #dc2626;   /* red-600 */

  /* Shadows */
  --shadow-card: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-card-hover: 0 4px 6px -1px rgb(0 0 0 / 0.07);
  --shadow-button-primary: 0 10px 15px -3px rgba(79, 70, 229, 0.2);
  --shadow-modal: 0 25px 50px -12px rgb(0 0 0 / 0.25);
}

/* Card */
.card {
  border-radius: var(--radius-card);
  border: 1px solid var(--color-border-subtle);
  background: var(--color-bg);
  box-shadow: var(--shadow-card);
  padding: 1.5rem;
  transition: box-shadow 200ms;
}
.card:hover { box-shadow: var(--shadow-card-hover); }

/* Button — primary */
.btn-primary {
  background: var(--color-action);
  color: #fff;
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-button-primary);
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background 150ms;
}
.btn-primary:hover { background: var(--color-action-hover); }
.btn-primary:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--color-action-ring);
}

/* Input — reference style */
.input-reference {
  min-height: 3rem;
  width: 100%;
  border-radius: var(--radius-2xl);
  border: 1px solid transparent;
  background: var(--color-surface-muted);
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: var(--color-fg);
  transition: background 150ms, box-shadow 150ms;
}
.input-reference::placeholder { color: var(--color-fg-subtle); }
.input-reference:focus-visible {
  outline: none;
  background: var(--color-bg);
  box-shadow: 0 0 0 2px var(--color-action-ring);
}

/* Micro-label */
.label-micro {
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-fg-subtle);
}
```

---

## Visual parity checklist

### Layout
- [ ] Page shell uses `space-y-8 p-4 md:p-6` (not arbitrary padding)
- [ ] Main content wrapper uses `max-w-7xl` (outer) or `max-w-6xl` (constrained)
- [ ] App shell background is `#FDFDFF`, not pure white
- [ ] Sidebar is white (`bg-white`) with `border-r border-slate-200`
- [ ] Dashboard layout is `flex h-screen overflow-hidden`

### Typography
- [ ] Page hero titles use `text-3xl tracking-tight`
- [ ] Entity headings use `text-2xl leading-tight tracking-tight text-slate-900`
- [ ] Dialog titles use `text-xl tracking-tight text-slate-900`
- [ ] Card titles use `text-base tracking-tight text-slate-900` or `leading-none font-semibold`
- [ ] ALL micro-labels are uppercase + `tracking-widest` — no exceptions
- [ ] Form labels use `text-[10px] uppercase tracking-widest text-slate-400`
- [ ] No `text-gray-*` used — all text uses `text-slate-*`
- [ ] Font is Geist Sans / Geist Mono (not system fallback)

### Colors
- [ ] Accent CSS variable is `#F17E64` (coral), NOT orange-500
- [ ] Action color is indigo-600 `#4f46e5`
- [ ] Card borders use `border-slate-100` (NOT `border-slate-200` or `border-gray-200`)
- [ ] Sidebar/header separators use `border-slate-200`
- [ ] Muted surfaces use `bg-slate-50` (NOT `bg-gray-100` or similar)
- [ ] No hardcoded hex/rgb values outside the token layer
- [ ] No `text-gray-*` — use `text-slate-*` equivalents

### Cards
- [ ] Radius is `rounded-[2rem]` on primary cards
- [ ] Border is `border-slate-100`
- [ ] Shadow is `shadow-sm` at rest, `shadow-md` on hover
- [ ] Internal padding: `px-6` for header/content/footer, `py-6` on the card itself

### Buttons
- [ ] Primary CTAs use indigo-600 + `rounded-2xl` + `shadow-lg shadow-indigo-600/20`
- [ ] Secondary CTAs use white + `border-2 border-slate-900` + `rounded-2xl`
- [ ] All buttons have focus rings — never `outline-none` without a replacement
- [ ] Standard (non-reference) buttons use `rounded-xl` minimum

### Inputs
- [ ] Reference inputs use `bg-slate-50` → `bg-white` on focus
- [ ] Reference inputs use `rounded-2xl` with `border-transparent`
- [ ] Focus ring is `ring-indigo-500/20`
- [ ] Placeholder color is `text-slate-400`

### Badges
- [ ] Badges use a named variant from `badgeVariants` — no ad-hoc colors
- [ ] Count badges are `rounded-full bg-indigo-600 text-white`

### Interactive states
- [ ] All focusable elements have visible focus rings
- [ ] Hover states are subtle (`bg-slate-50`, `opacity-90`) — no harsh color jumps
- [ ] Disabled state uses `opacity-50 pointer-events-none`
- [ ] Table rows use `hover:bg-slate-50/80 cursor-pointer`

### Accessibility
- [ ] Focus rings visible and use indigo at minimum 20% opacity
- [ ] Color contrast ≥ 4.5:1 for body text (WCAG AA)
- [ ] Decorative elements have `aria-hidden`
- [ ] Interactive elements have `cursor-pointer`

### No mixed systems
- [ ] No Bootstrap classes alongside Tailwind
- [ ] No inline `style=` with hardcoded color/spacing values
- [ ] No `gray-*` colors (Tailwind's gray is a different hue than slate)

---

## Anti-patterns

| Anti-pattern | Correct approach |
|---|---|
| `bg-orange-500` as the accent | Accent is `#F17E64` (coral). Use `var(--accent)` |
| `rounded-lg` on cards | Cards must use `rounded-[2rem]` |
| `shadow-lg` on cards | Cards use `shadow-sm` / `shadow-md` on hover |
| `border-gray-200` | Use `border-slate-100` (subtle) or `border-slate-200` (strong) |
| `text-gray-500` | Use `text-slate-500` — gray and slate are different hues |
| `padding: 8px` on page shells | Page shell uses `p-4 md:p-6` = 1rem / 1.5rem |
| Micro-labels without uppercase | ALL micro-labels must be `uppercase tracking-widest` |
| One-off `bg-*/text-*` on badges | Use a named variant from `badgeVariants` |
| `outline-none` without ring replacement | Always provide a visible focus ring |
| Mixing reference and default Input variants | Pick one per form context; don't mix variants within a form |
| Copying full component files | Extract the pattern (token values, class strings); do not copy proprietary implementations |
| Applying all changes in one commit | Apply layer by layer and validate at each step |
| Inferring tokens from class usage | Always read `globals.css`, `lib/ui/feedback-reference.ts`, `lib/ui/reference-surfaces.ts` as the source of truth |

---

## Before / After examples

### Card

```html
<!-- Before -->
<div class="p-2 border rounded bg-white">
  <p class="text-sm text-gray-600">Content</p>
</div>

<!-- After -->
<div class="rounded-[2rem] border border-slate-100 bg-white shadow-sm
            hover:shadow-md transition-shadow duration-200">
  <div class="px-6 py-6 leading-none font-semibold">Card Title</div>
  <div class="px-6 text-sm text-slate-500">Content</div>
</div>
```

### Button

```html
<!-- Before -->
<button class="bg-blue-500 text-white px-4 py-2 rounded">Save</button>

<!-- After — reference primary -->
<button class="bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-600/20
               hover:bg-indigo-700 focus-visible:ring-indigo-500/30
               focus-visible:ring-[3px] px-6 py-3 text-sm font-medium
               transition-all cursor-pointer">
  Save
</button>
```

### Micro-label

```html
<!-- Before -->
<label class="text-xs text-gray-500">Field name</label>

<!-- After -->
<label class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
  Field name
</label>
```

### Input

```html
<!-- Before -->
<input class="border border-gray-300 rounded p-2 w-full" />

<!-- After — reference style -->
<input class="min-h-12 w-full rounded-2xl border-transparent bg-slate-50
              px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400
              focus-visible:bg-white focus-visible:ring-2
              focus-visible:ring-indigo-500/20 focus-visible:outline-none" />
```

---

## Validation

After applying changes, verify:

1. **Token coverage** — open `globals.css` and `lib/ui/` in the reference app; confirm every token used in the target is sourced from the spec, not approximated
2. **Typography completeness** — check all 7 text levels (hero, entity, dialog, card, body, body-bold, micro-label) are present and correctly styled
3. **Global consistency** — open 3+ pages; confirm spacing, radius, and color are uniform
4. **Responsive** — check at 375px (mobile), 768px (tablet), 1280px (desktop)
5. **Interactive states** — hover, focus, disabled for every button and input
6. **No visual regressions** — existing layouts must not break; only visual tokens change
7. **Accessibility** — focus rings visible, color contrast meets WCAG AA (4.5:1 for body text)
8. **No mixed systems** — no Bootstrap, no inline styles with hardcoded values, no `gray-*` colors

---

## Handling missing context

If any of the following are unavailable, stop and ask before proceeding:

| Missing | Ask for |
|---|---|
| `globals.css` | `app/globals.css` from reference app — required for base CSS variables |
| `lib/ui/feedback-reference.ts` | File content — required for button, input, dialog, select tokens |
| `lib/ui/reference-surfaces.ts` | File content — required for card, page shell, typography rhythm tokens |
| `lib/ui/badge-variants.ts` | File content — required for all badge variants |
| `components/ui/button.tsx` | File content — required for complete button variant spec |
| Target project stack | `package.json` from target project |
| Target project layout | Main layout component or page template |
| Visual reference | Screenshots or Figma link |

Do not proceed to Phase 2 without completing Phase 1 with real file reads.

---

## Legal limits

- Do not include secrets, API keys, or credentials from either project
- Do not copy full source files from private repositories
- Extract only abstract patterns: token values, spacing ratios, class name conventions
- Document which patterns were derived vs. directly copied if any file is reproduced
