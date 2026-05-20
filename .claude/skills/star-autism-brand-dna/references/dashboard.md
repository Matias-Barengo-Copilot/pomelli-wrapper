# STAR Autism Support — Dashboard / Educator Portal Guide

For admin panels, progress trackers, district management views, and multi-tool portals.

---

## Shell Layout

```
Sidebar:       Fixed left, 256px — Logo top, nav middle, user bottom
Top bar:       Page title (Nunito 700 20px) left, actions right
Content:       Scrollable, 24–32px padding, max-width 1280px
Background:    var(--color-bg)
Mobile:        Bottom tab bar (max 5 items) or hamburger drawer
```

## Sidebar

```
Active item:   --color-primary-light bg, 3px left border --color-primary,
               text --color-primary 600 weight
Inactive:      --color-text-secondary, hover → --color-primary-light bg
Section labels: Open Sans 600 uppercase 11px tracking-widest, muted
               e.g. "STUDENTS" / "CURRICULUM" / "REPORTS"
```

---

## Stat Cards (KPI row)

```
Layout:        4 across desktop, 2×2 tablet, 1 column mobile
Content:       Label (13px muted) → Value (Nunito 800 2rem --color-primary) → Trend (↑↓)
Border-top:    4px solid var(--color-primary) per card
Positive trend: --color-success, Negative: muted red (not alarming — educational context)
```

## Progress Charts

```
Primary series:   --color-primary
Secondary:        --color-cta (amber)
Tertiary:         --color-primary-mid
Never use red for neutral data — only for actual errors
Chart types:      Line → progress over time | Bar → comparison | Donut → completion %
Empty state:      Placeholder illustration + message + action
```

## Student / Data Tables

```
Header:        Open Sans 600 13px uppercase, muted, sticky
Row height:    52px | Alternating: even rows --color-surface-alt
Hover:         --color-primary-light at 40% opacity
Actions:       On row hover, right-aligned — outline icons only
Destructive:   Always in a confirm modal — never one-click
Pagination:    "Showing 1–20 of 84 students", prev/next + page numbers
```

## Goal / IEP Progress Cards

```
Content:       Student name (Nunito 700) → Goal title → Progress bar → % → Last updated
Progress bar:  8px height, 4px radius
               ≥80%: --color-success fill
               40–79%: --color-cta (amber) fill
               <40%: --color-warning fill
               Never raw red — discouraging for educators
```

## Forms & Filters

```
Filter bar:    Horizontal above content — dropdowns, date range, search
Field labels:  Always above inputs
Input height:  44px
Save:          Sticky bottom bar on long forms
Validation:    Inline below field, specific message
```

## Empty & Loading States

```
Loading:       Skeleton screens — match content shape, never blank flash
Empty:         Icon + heading + explanation + CTA
               "No students added yet" → "Add Your First Student"
Error:         Specific message + retry — never generic "Something went wrong"
```

## Educator-Specific Rules

- Bulk actions: multi-select + bulk assign/export/archive
- Quick access: today's tasks max 1 click from anywhere
- Print/export: progress reports and IEP data always exportable
- Auto-save on forms with a subtle "Saved" indicator
- Timestamps: always show when data was last updated
- Data labels: plain language — "Goals Met" not "Completion Rate"
