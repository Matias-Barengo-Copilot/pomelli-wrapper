# Pomelli DOM Map

Confirmed selectors from live DOM exploration (2026-05-20).  
Sources: `scripts/explore-sidebar.ts` → `docs/sidebar-dump.html` + `docs/sidebar-elements.txt`

---

## State Machine

| State | Detection condition | Notes |
|---|---|---|
| `welcome_popup` | `button[cdkfocusinitial]` present | Appears on every full page reload — reads "Hi! We're experiencing high demand…" |
| `onboarding` | `button.continue-button:not(.mobile-only-cta)` AND `input.url-input` absent | Let's go! CTA |
| `url_input` | `input.url-input` present | Checked BEFORE onboarding (submit button also has `.continue-button`) |
| `generating_dna` | Body text includes `"This may take a few minutes"` | 5–15 min first time |
| `dna_summary` | `button.bottom-button` present | One-time card after first DNA generation |
| `section_selection` | `.option-card` present | Modal with 4 section cards |
| `content_ready` | None of the above | DNA overview (has `button.bottom-button`) or section page (does not) |

> **`button.bottom-button` is one-time.** After clicking it and selecting a section, it never reappears in the same brand session. For sections 2+, use sidebar nav clicks.

---

## Onboarding Selectors

| Element | Selector | Notes |
|---|---|---|
| Popup dismiss | `button[cdkfocusinitial]` | Angular CDK attribute on dialog first-focus button |
| Let's go! | `button.continue-button:not(.mobile-only-cta)` | Two in DOM — mobile one has `.mobile-only-cta` |
| URL input | `input.url-input` | placeholder="www.example.com" |
| DNA summary Let's go | `button.bottom-button` | One-time only |

---

## Sidebar Nav Structure

```
nav.nav-container[.expanded when open]
  div.nav-panel
    div.header
      button.nav-button                            ← hamburger (mat-icon "menu")
      button.expand-button                         ← toggle sidebar open/close
    div.nav-items
      div.nav-group.has-flyout[tabindex="0"]       ← Business DNA (special)
        div.nav-item
          span.material-symbols-outlined           ← icon "genetics"
          div.label.title-medium.on-surface-variant ← "Business DNA"
          div.flyout                               ← hover flyout (sub-pages)
        div.sub-items
          div.nav-item.sub-item → "Overview"
          div.nav-item.sub-item → "Catalog"
          div.nav-item.sub-item → "Assets"
      div.nav-item                                 ← Campaigns
        span.google-symbols                        ← "smart_campaign"
        span.tooltip.body-small                    ← "Campaigns" (hover tooltip)
        div.label.title-medium.on-surface-variant  ← "Campaigns"
      div.nav-item                                 ← Photoshoot
      div.nav-item                                 ← Brand Book  (+ span.nav-badge.new)
      div.nav-item                                 ← Websites    (+ span.nav-badge.new)
```

### Key findings

- Nav items are **`div.nav-item`** — NOT `<a>`, `<button>`, or `<mat-list-item>`
- **No tabindex, no role, no href** → require `{ force: true }` in Playwright clicks
- Business DNA uses **`div.nav-group.has-flyout`** (parent wrapper with `tabindex="0"`)
- Section labels live in **`div.label.title-medium.on-surface-variant`**
- **"Websites"** is the nav label for the `website` section key

### Sidebar expand/collapse

| State | Detection | Toggle |
|---|---|---|
| Expanded | `nav.nav-container.expanded` count > 0 | `button.expand-button` |
| Collapsed | `nav.nav-container.expanded` count = 0 | `button.expand-button` |

Expanded state: button shows `right_panel_open` + tooltip "Close sidebar".  
Collapsed state: button shows `google_labs` icon.

---

## Section Selection Modal

Appears **once** after `button.bottom-button` click (first DNA generation only).

```typescript
page.locator(".option-card")
  .filter({ has: page.locator(".title-medium", { hasText: "Campaigns" }) })
  .first().click({ timeout: 10_000 })
```

---

## Nav Click Pattern (sections 2+)

```typescript
// 1. Expand sidebar
const isExpanded = await page.locator("nav.nav-container.expanded").count() > 0;
if (!isExpanded) {
  await page.locator("button.expand-button").first().click({ timeout: 5_000 });
  await sleep(700);
}

// 2. Click section (force: true — plain div, not natively actionable)
await page.locator("div.nav-item:not(.sub-item)")
  .filter({ has: page.locator("div.label", { hasText: "Photoshoot" }) })
  .first()
  .click({ force: true, timeout: 10_000 });
```

**Business DNA nav group** (to return to DNA overview from a section page):
```typescript
await page.locator("div.nav-group.has-flyout")
  .first()
  .click({ force: true, timeout: 5_000 });
```

---

## Section Label Mapping

| Code key | Nav `div.label` text | option-card `.title-medium` |
|---|---|---|
| `campaigns` | `Campaigns` | `Campaigns` |
| `photoshoot` | `Photoshoot` | `Photoshoot` |
| `website` | `Websites` | `Website` |
| `brand-book` | `Brand Book` | `Brand Book` |

---

## Asset URL Patterns

| Pattern | Notes |
|---|---|
| `pomelli_downloads` | `labs.google.com/pomelli_downloads/accounts/<id>/...` — primary download URL |
| `aiusercontent.com` | AI-generated image CDN |
| `generativelanguage.googleapis.com` | Raw generation endpoint |

Route interception regex: `/pomelli_downloads|aiusercontent\.com|generativelanguage\.googleapis\.com/`

---

## Full Page Reload Warning

`page.goto(POMELLI_URL)` triggers full Angular bootstrap → **"high demand" popup appears every time**. After dismissal, Pomelli restores the last section (`content_ready`, no `button.bottom-button`).

**Never reload between sections.** Use sidebar nav clicks (Angular client-side routing) instead — no popup, no restart.
