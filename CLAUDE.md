# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

---

## What This Is

**Pomelli Wrapper** is an internal CLI tool that automates Pomelli (labs.google.com/pomelli) using **Playwright** (Chromium). Given a client brand URL, it navigates Pomelli, captures Business DNA overview data, triggers all available sections (Campaigns, Photoshoot, Websites, Brand Book), downloads every generated asset, and saves everything to a local `outputs/` folder with a `manifest.json`.

V1 is CLI-only, local-only, single-user. No web UI, no database, no auth.

> **Architecture note:** The `src/agent/` and `src/container/` directories contain the original Computer Use + Docker design (now deprecated). The active implementation uses Playwright: `src/navigate/`, `src/capture/`, `src/cli.ts`.

---

## Stack

- **Language:** TypeScript with `tsx` (no build step)
- **CLI entry:** `npm run wrap -- --url <brand-url>`
- **Browser:** Playwright (Chromium, headed by default)
- **Session:** `google-session.json` — saved by `npm run login`, gitignored
- **Storage:** Local disk only — `outputs/` directory, gitignored

---

## Commands

```bash
# One-time setup
npm install

# One-time Google login (opens browser, user logs in manually, saves session)
npm run login

# Run the wrapper
npm run wrap -- --url https://client.com
npm run wrap -- --url https://client.com --sections campaigns,photoshoot
npm run wrap -- --url https://client.com --sections all
npm run wrap -- --url https://client.com --headless

# Dev
npx tsc --noEmit    # type-check

# Exploration / diagnostics
npm run spike -- --url https://client.com --sections campaigns
npm run explore-sidebar   # maps sidebar DOM → docs/sidebar-dump.html + sidebar-elements.txt
npm run test-overview -- --url https://client.com  # tests Business DNA extraction
```

---

## Architecture

```
src/cli.ts                        ← main entry point
  └─ src/navigate/pomelli.ts      ← Pomelli state machine + navigation primitives
  └─ src/capture/extract-overview.ts  ← Business DNA text extraction
  └─ src/capture/capture-section.ts   ← route interception + asset download
```

### Flow

1. Navigate to `https://labs.google.com/pomelli/`
2. Dismiss "high demand" popup (`button[cdkfocusinitial]`) — appears on every full page load
3. Handle onboarding if first visit (Let's go! → URL input → DNA generation)
4. Drive to `section_selection` modal
5. Extract Business DNA overview (content is in DOM behind the modal)
6. **Section 1:** click `.option-card` card → wait for `content_ready` → capture
7. **Sections 2+:** click `div.nav-item` in sidebar (force: true) → wait for `content_ready` → capture
8. Write `manifest.json`

> `section_selection` modal is **one-time only** (appears once after DNA generation via `button.bottom-button`). For sections 2+, use sidebar nav clicks — do NOT reload the page (triggers popup again).

### Output layout

```
outputs/
  run-2026-05-20T14-30-22/
    manifest.json
    brand-overview.json
    brand-overview.md
    sections/
      campaigns/
        screenshot.png
        response-urls.txt    ← all URLs loaded during section render (for debugging)
        assets/001.webp …
      photoshoot/ …
```

---

## Pomelli DOM — Critical Selectors

**Full map:** `docs/pomelli-map.md` — always consult this before writing new selectors.

### State detection (in order)

```
button[cdkfocusinitial]                          → welcome_popup
input.url-input                                  → url_input  (before onboarding)
button.continue-button:not(.mobile-only-cta)     → onboarding
body text includes "This may take a few minutes" → generating_dna
.option-card                                     → section_selection
button.bottom-button                             → dna_summary
(none of the above)                              → content_ready
```

### Nav sidebar

- **Container:** `nav.nav-container` — has `.expanded` class when open
- **Toggle:** `button.expand-button`
- **Business DNA group:** `div.nav-group.has-flyout` (tabindex=0)
- **Section items:** `div.nav-item:not(.sub-item)` — label in child `div.label.title-medium`
- **ALL nav items are plain `<div>`** — not `<a>`, not `<button>`, not `<mat-list-item>`
- **Must use `{ force: true }`** in Playwright `.click()` calls on nav items

### Section label map

| Code key | `div.label` text | `.title-medium` in modal |
|---|---|---|
| `campaigns` | `Campaigns` | `Campaigns` |
| `photoshoot` | `Photoshoot` | `Photoshoot` |
| `website` | `Websites` | `Website` |
| `brand-book` | `Brand Book` | `Brand Book` |

### Asset URL patterns

`/pomelli_downloads|aiusercontent\.com|generativelanguage\.googleapis\.com/`

---

## Key Constraints

1. **Playwright, not Computer Use** — all navigation uses CSS selectors + Playwright. No xdotool, no Docker, no Anthropic API.
2. **Manual Google login** — never automate Google auth. `npm run login` opens the browser for manual login once.
3. **No full page reloads between sections** — `page.goto()` to Pomelli URL triggers the "high demand" popup on every call. Use sidebar nav clicks instead.
4. **`button.bottom-button` is one-time** — only appears after the initial DNA generation. Never try to navigate back to section_selection via this button on subsequent section captures.
5. **`google-session.json` never committed** — in `.gitignore`.
6. **Dedicated expendable Google account** — not a personal or team account.
7. **Google ToS risk** — accepted for internal R&D only, no external usage.
8. **`ANTHROPIC_API_KEY`** in `.env`, never committed (used if AI features are added later).

---

## Environment Variables

```
ANTHROPIC_API_KEY=    # Not currently used — reserved for future AI features
OUTPUTS_DIR=outputs   # Output directory (default: ./outputs)
```
