# Pomelli — Confirmed Playwright Selectors

**Status:** PENDING — fill in after running `npm run spike`.

---

## How to use this file

Run the spike with a headed browser (`headless: false` in spike-playwright.ts) and use
the Playwright Inspector or browser DevTools to confirm each selector below. Replace every
`TODO` with the actual selector and mark the row as **confirmed**.

---

## Onboarding — two sequential steps

### Step A: Welcome popup ("Welcome to Pomelli")

| Element | Selector | Status |
|---|---|---|
| Popup "Okay" button | `button[cdkfocusinitial]` | **confirmed** |

**Notes:** `mat-button` (flat style, no fill). Has `cdkfocusinitial` attribute (Angular CDK sets initial focus on dialog open). Text: ` Okay `. Shows numbered feature list (1 Build DNA, 2 Get Campaign ideas...).

### Step B: Onboarding CTA ("Let's go!")

| Element | Selector | Status |
|---|---|---|
| "Let's go!" button | `button.continue-button:not(.mobile-only-cta)` | **confirmed** |

**Notes:** There are TWO `button.continue-button` elements in the DOM — one with `.mobile-only-cta` (hidden on desktop, 0×0 size) and one without it (visible, 200×56, top≈698px). Must use `:not(.mobile-only-cta)` to target the visible desktop button. Appears after Step A (Okay) is dismissed.

---

## URL input

| Element | Selector | Status |
|---|---|---|
| Brand URL input field | `input.url-input` | **confirmed** |
| Submit | `Enter` keypress | **confirmed** |

**Notes:** `type="text"` (not `type="url"`) — that's why generic url-type selectors failed. Placeholder is `www.example.com`. Class `url-input` is Pomelli-custom. Both elements share `_ngcontent-ng-c2647866872` Angular attribute — ignore it, it changes per build.

---

## Analysis / generation state

| Signal | How to detect | Status |
|---|---|---|
| DNA still generating | `innerText` includes "This may take a few minutes" (`div.text.body-medium`) | **confirmed** |
| DNA summary ready | `button.bottom-button` present in DOM | **confirmed** |
| "Let's go" on summary | `button.bottom-button` — text " Let's go " (no `!`) | **confirmed** |
| Content ready | "This may take a few minutes" gone + no `.option-card` + no `button.bottom-button` | **confirmed** |

**Notes:** "This may take a few minutes" is the universal loading indicator for DNA generation. After it disappears, Pomelli shows the "Your Business DNA" summary card. Click `button.bottom-button` → section selection modal appears → click desired `.option-card` → content is immediately ready (no separate generation phase for sections).

---

## Section selection modal (after "Let's go" on DNA summary)

Appears after clicking `button.bottom-button`. Contains 4 option cards.

| Section | Selector | Title text | Status |
|---|---|---|---|
| Campaigns | `.option-card:has(.title-medium:text("Campaigns"))` | "Campaigns" | **confirmed** |
| Photoshoot | `.option-card:has(.title-medium:text("Photoshoot"))` | "Photoshoot" | **confirmed** |
| Website | `.option-card:has(.title-medium:text("Website"))` | "Website" | **confirmed** |
| Brand Book | `.option-card:has(.title-medium:text("Brand Book"))` | "Brand Book" | **confirmed** |

**Playwright filter pattern:**
```typescript
page.locator(".option-card").filter({ has: page.locator(".title-medium", { hasText: "Campaigns" }) })
```

**Notes:** All cards share class `.option-card`. Each has `.option-text > .title-medium` with the section name and `.option-preview` with a poster image + video preview.

---

## Section generation state

| Signal | How to detect | Status |
|---|---|---|
| Section still generating | `innerText` includes "This may take a few minutes" (`div.text.body-medium`) | **confirmed** |
| Section content ready | "This may take a few minutes" text is gone AND no other loading indicator | **confirmed** |

**Notes:** `div.text.body-medium` with text "This may take a few minutes" is the authoritative loading indicator for section generation. Wait for it to disappear (not just for specific content text to appear).

---

## Asset URLs

| Section | Asset container | Image selector | Notes |
|---|---|---|---|
| Business DNA | `TODO` | `TODO` | Logo, palette, typography |
| Campaigns | `TODO` | `TODO` | Campaign image cards |
| Photoshoot | `TODO` | `TODO` | Photoshoot renders |
| Animate | `TODO` | `TODO` | Video thumbnails or URLs |

**Notes:** _Fill in after spike._
