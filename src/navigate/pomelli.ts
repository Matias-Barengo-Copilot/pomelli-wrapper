import type { Page } from "playwright";

export const POMELLI_URL = "https://labs.google.com/pomelli/";

export const VALID_SECTIONS = ["campaigns", "photoshoot", "website", "brand-book"] as const;
export type PlaSection = typeof VALID_SECTIONS[number];

// Labels exactly as they appear in Pomelli's div.label elements
const SECTION_TITLE: Record<PlaSection, string> = {
  campaigns:    "Campaigns",
  photoshoot:   "Photoshoot",
  website:      "Websites",      // Pomelli nav label is "Websites", not "Website"
  "brand-book": "Brand Book",
};

export type PomeliState =
  | "welcome_popup"
  | "onboarding"
  | "url_input"
  | "generating_dna"
  | "dna_summary"
  | "section_selection"
  | "content_ready"
  | "unknown";

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }
function ts() { return new Date().toISOString().slice(11, 23); }

/** Read text from the topmost visible dialog/overlay, falling back to full body. */
async function readDialogText(page: Page): Promise<string> {
  return page.evaluate(() => {
    const el =
      document.querySelector("mat-dialog-container") as HTMLElement ??
      document.querySelector("[role='dialog']") as HTMLElement ??
      document.querySelector(".cdk-overlay-pane") as HTMLElement;
    return (el?.innerText ?? document.body?.innerText ?? "").trim();
  }).catch(() => "");
}

export async function detectState(page: Page): Promise<PomeliState> {
  return page.evaluate((): PomeliState => {
    const text = document.body?.innerText ?? "";
    if (document.querySelector("button[cdkfocusinitial]"))                        return "welcome_popup";
    if (document.querySelector("input.url-input"))                                return "url_input";
    if (document.querySelector("button.continue-button:not(.mobile-only-cta)"))  return "onboarding";
    if (text.includes("This may take a few minutes"))                             return "generating_dna";
    if (document.querySelector(".option-card"))                                   return "section_selection";
    if (document.querySelector("button.bottom-button"))                           return "dna_summary";
    return "content_ready";
  });
}

/** Wait for Angular to bootstrap (at least one button rendered). */
export async function waitForAngular(page: Page): Promise<void> {
  await page.waitForFunction(
    () => document.querySelectorAll("button").length > 0,
    { timeout: 15_000 },
  );
}

/**
 * Deletes the existing brand if one is present, returning to onboarding/url_input state.
 * Must be called after Angular is bootstrapped and any initial popup dismissed.
 *
 * Detection: any state other than "onboarding" or "url_input" means a brand exists.
 * Deletion: navigates to Business DNA Overview → clicks "button.bottom-button.secondary-surface"
 *           (the "delete_forever Reset" button confirmed by DOM exploration 2026-05-20).
 *
 * Returns true if a brand was deleted, false if no brand was present.
 */
export async function deleteBrandIfPresent(
  page: Page,
  log: (msg: string) => void = () => {},
): Promise<boolean> {
  // Dismiss any welcome popup before checking state
  if (await page.locator("button[cdkfocusinitial]").count() > 0) {
    const dialogText = await readDialogText(page);
    log(`  [${ts()}] popup detected — dismissing before brand check…`);
    log(`  [${ts()}] popup text: "${dialogText.replace(/\n/g, " ").slice(0, 160)}"`);
    if (/try again later|limit|quota|no more|exhausted|out of/i.test(dialogText)) {
      throw new Error(`Pomelli rate limit / quota reached: "${dialogText.slice(0, 300)}"`);
    }
    await page.locator("button[cdkfocusinitial]").first().click({ force: true, timeout: 10_000 });
    await sleep(600);
  }

  let state = await detectState(page);
  log(`  [${ts()}] current state: ${state}`);

  if (state === "onboarding" || state === "url_input") {
    log(`  [${ts()}] no existing brand — skipping deletion`);
    return false;
  }

  // DNA generation page has no sidebar — we can't navigate to Overview while it runs.
  if (state === "generating_dna") {
    log(`  [${ts()}] DNA generation in progress (or no sidebar) — waiting for it to complete…`);
    let dotsEmitted = false;
    const genDeadline = Date.now() + 15 * 60 * 1000;
    while (Date.now() < genDeadline) {
      const s = await detectState(page).catch(() => "unknown" as const);
      if (s !== "generating_dna" && await page.locator("button.expand-button").count() > 0) {
        if (dotsEmitted) process.stdout.write("\n");
        state = s;
        log(`  [${ts()}] generation done — now at "${state}"`);
        break;
      }
      process.stdout.write(".");
      dotsEmitted = true;
      await sleep(15_000);
    }
    if (state === "generating_dna") {
      throw new Error("Brand deletion timed out — DNA generation did not complete within 15 minutes");
    }
    if (state === "onboarding" || state === "url_input") {
      log(`  [${ts()}] no brand after generation — skipping deletion`);
      return false;
    }
  }

  // On the dna_summary page the left nav sidebar is not rendered — it only
  // appears after entering the main Pomelli app. Click "Let's go" first.
  if (state === "dna_summary") {
    log(`  [${ts()}] dna_summary — clicking Let's go to load sidebar nav…`);
    await page.locator("button.bottom-button").first().click({ timeout: 10_000 });
    await sleep(2000);
    state = await detectState(page);
    log(`  [${ts()}] state after Let's go: ${state}`);
  }

  log(`  [${ts()}] existing brand detected — navigating to DNA Overview to reset…`);
  await navigateToBusinessDnaOverview(page, log);

  // "delete_forever Reset" button — confirmed selector from DOM exploration
  log(`  [${ts()}] clicking Reset button (button.bottom-button.secondary-surface)…`);
  await page.locator("button.bottom-button.secondary-surface").first().click({ timeout: 10_000 });
  log(`  [${ts()}] ✓ Reset clicked`);
  await sleep(600);

  // Handle confirmation dialog — try CDK focus-initial first (Angular dialog pattern),
  // then fall back to any button with confirm/reset/yes text
  const cdkConfirm = page.locator("button[cdkfocusinitial]");
  const textConfirm = page.locator("button").filter({ hasText: /^(reset|confirm|yes|delete)$/i });

  if (await cdkConfirm.count() > 0) {
    log(`  [${ts()}] confirmation dialog (cdkfocusinitial) — confirming…`);
    await cdkConfirm.first().click({ timeout: 5_000 });
  } else if (await textConfirm.count() > 0) {
    const label = await textConfirm.first().textContent();
    log(`  [${ts()}] confirmation button "${label?.trim()}" — clicking…`);
    await textConfirm.first().click({ timeout: 5_000 });
  } else {
    log(`  [${ts()}] no confirmation dialog found — continuing`);
  }

  // Reset triggers a full hard-navigation — the JS execution context will be destroyed
  // mid-flight if we call page.evaluate() immediately. Wait for the navigation to
  // settle and Angular to re-bootstrap before polling state.
  log(`  [${ts()}] waiting for post-reset navigation…`);
  await page.waitForLoadState("domcontentloaded", { timeout: 20_000 }).catch(() => {});
  await waitForAngular(page);
  await sleep(800);

  // Wait until Pomelli returns to onboarding or url_input
  log(`  [${ts()}] waiting for onboarding state after reset…`);
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    const s = await detectState(page).catch(() => "unknown" as const);
    if (s === "onboarding" || s === "url_input") {
      log(`  [${ts()}] ✓ brand deleted — now at "${s}"`);
      return true;
    }
    if (s === "welcome_popup") {
      log(`  [${ts()}] popup appeared post-reset — dismissing…`);
      await page.locator("button[cdkfocusinitial]").first().click({ force: true, timeout: 5_000 }).catch(() => {});
      await sleep(500);
    } else {
      log(`  [${ts()}] state "${s}" — still waiting…`);
      await sleep(1000);
    }
  }

  throw new Error("Brand deletion timed out — Pomelli never returned to onboarding state");
}

/**
 * Navigates to a Business DNA sub-tab via sidebar.
 * Sub-tabs: "Overview" | "Catalog" | "Assets"
 * Exported so cli.ts and capture-section can navigate to any DNA sub-tab.
 */
export async function navigateToBusinessDnaSubTab(
  page: Page,
  subTab: "Overview" | "Catalog" | "Assets",
  log: (msg: string) => void = () => {},
): Promise<void> {
  await ensureSidebarExpanded(page, log);

  // Expand the Business DNA nav group (reveals sub-items: Overview, Catalog, Assets)
  log(`  [${ts()}] waiting for div.nav-group.has-flyout…`);
  await page.locator("div.nav-group.has-flyout").first().waitFor({ state: "visible", timeout: 10_000 });
  log(`  [${ts()}] clicking div.nav-group.has-flyout to expand Business DNA sub-items…`);
  await page.locator("div.nav-group.has-flyout").first().click({ force: true, timeout: 5_000 });
  await sleep(500);

  log(`  [${ts()}] clicking Business DNA "${subTab}" sub-item…`);
  await page
    .locator("div.nav-item.sub-item", { hasText: subTab })
    .first()
    .click({ force: true, timeout: 5_000 });

  // Wait for content to render
  await sleep(2000);
  log(`  [${ts()}] ✓ Business DNA ${subTab} loaded`);
}

/**
 * Navigates to the Business DNA "Overview" sub-page via sidebar.
 * Required before extractOverview() when coming from a section page (cached session).
 * Exported so cli.ts can call it independently of driveToReadyState.
 */
export async function navigateToBusinessDnaOverview(
  page: Page,
  log: (msg: string) => void = () => {},
): Promise<void> {
  return navigateToBusinessDnaSubTab(page, "Overview", log);
}

/** Expand the sidebar if it is currently collapsed. No-op if already expanded or no expand button exists. */
async function ensureSidebarExpanded(page: Page, log: (msg: string) => void): Promise<void> {
  const isExpanded      = await page.locator("nav.nav-container.expanded").count() > 0;
  const hasExpandButton = await page.locator("button.expand-button").count() > 0;
  log(`  [${ts()}] sidebar expanded: ${isExpanded}, expand button present: ${hasExpandButton}`);

  if (isExpanded || !hasExpandButton) {
    // Already open, or sidebar is always visible (headless/wide viewport — no toggle needed)
    log(`  [${ts()}] sidebar already open — skipping expand`);
    return;
  }

  log(`  [${ts()}] waiting for button.expand-button to appear…`);
  await page.locator("button.expand-button").first().waitFor({ state: "visible", timeout: 15_000 });
  await page.locator("button.expand-button").first().click({ force: true, timeout: 5_000 });
  await sleep(700);
  log(`  [${ts()}] ✓ sidebar expanded`);
}

/**
 * Drives from any post-login Pomelli state to either section_selection or content_ready.
 *
 * Returns:
 *   "section_selection" — landed on the section-card modal (fresh brand or first DNA run).
 *   "content_ready"     — landed on a section/DNA page (cached brand session; button.bottom-button
 *                         is one-time and will never reappear). Caller must use nav-for-all.
 *
 * Handles: welcome_popup → onboarding → url_input → generating_dna → dna_summary → section_selection.
 * For content_ready without button.bottom-button (cached brand):
 *   Tries to navigate to Business DNA via sidebar up to 2 times; if still content_ready → returns
 *   "content_ready" instead of throwing so caller can fall back to nav-for-all.
 */
export async function driveToReadyState(
  page: Page,
  brandUrl: string,
  log: (msg: string) => void = () => {},
  timeoutMs = 12 * 60 * 1000,
): Promise<"section_selection" | "content_ready"> {
  const deadline = Date.now() + timeoutMs;
  let lastState: PomeliState = "unknown";
  const repeatCount = new Map<PomeliState, number>();
  let dnaDotsEmitted = false;
  let contentReadyNavAttempts = 0;

  while (Date.now() < deadline) {
    const state = await detectState(page);

    if (state !== lastState) {
      if (dnaDotsEmitted) { process.stdout.write("\n"); dnaDotsEmitted = false; }
      log(`  [${ts()}] state → ${state}`);
      lastState = state;
      repeatCount.set(state, 0);
    }

    const count = (repeatCount.get(state) ?? 0) + 1;
    repeatCount.set(state, count);

    if (count > 1) log(`  [${ts()}] state "${state}" repeated (${count}x)`);

    // Hard stuck guard — never apply to generating_dna (legitimately repeats 40+ times)
    // or content_ready (has its own 2-attempt limit above).
    if (state !== "content_ready" && state !== "generating_dna" && count > 4) {
      const pageText = await page.evaluate(() => (document.body?.innerText ?? "").slice(0, 800)).catch(() => "");
      throw new Error(`Stuck in state "${state}" after ${count} attempts.\nPage text excerpt:\n${pageText}`);
    }

    switch (state) {
      case "welcome_popup": {
        const dialogText = await readDialogText(page);
        log(`  [${ts()}] popup text: "${dialogText.replace(/\n/g, " ").slice(0, 160)}"`);
        if (/try again later|limit|quota|no more|exhausted|out of/i.test(dialogText)) {
          throw new Error(`Pomelli rate limit / quota reached: "${dialogText.slice(0, 300)}"`);
        }
        log(`  [${ts()}] clicking button[cdkfocusinitial] (Okay / dismiss)…`);
        await page.locator("button[cdkfocusinitial]").first().click({ force: true, timeout: 10_000 });
        log(`  [${ts()}] ✓ popup dismissed`);
        await sleep(600);
        break;
      }

      case "onboarding": {
        const hasInput = await page.locator("input.url-input").count() > 0;
        if (hasInput) {
          log(`  [${ts()}] onboarding: url_input visible — skipping Let's go click`);
        } else {
          log(`  [${ts()}] clicking button.continue-button:not(.mobile-only-cta) (Let's go)…`);
          await page.locator("button.continue-button:not(.mobile-only-cta)").first().click({ timeout: 10_000 });
          log(`  [${ts()}] ✓ Let's go clicked`);
          await sleep(600);
        }
        break;
      }

      case "url_input":
        log(`  [${ts()}] filling input.url-input with: ${brandUrl}`);
        await page.locator("input.url-input").first().fill(brandUrl);
        log(`  [${ts()}] pressing Enter`);
        await page.keyboard.press("Enter");
        await sleep(1000);
        break;

      case "generating_dna":
        process.stdout.write(".");
        dnaDotsEmitted = true;
        await sleep(15_000);
        break;

      case "dna_summary":
        log(`  [${ts()}] clicking button.bottom-button (DNA summary Let's go)…`);
        await page.locator("button.bottom-button").first().click({ timeout: 10_000 });
        log(`  [${ts()}] ✓ clicked`);
        await sleep(1500);
        break;

      case "section_selection":
        log(`  [${ts()}] ✓ reached section_selection`);
        return "section_selection";

      case "content_ready": {
        const hasBottomBtn = await page.locator("button.bottom-button").count() > 0;
        log(`  [${ts()}] content_ready — button.bottom-button present: ${hasBottomBtn}`);

        if (hasBottomBtn) {
          log(`  [${ts()}] clicking button.bottom-button…`);
          await page.locator("button.bottom-button").first().click({ timeout: 10_000 });
          log(`  [${ts()}] ✓ clicked`);
          await sleep(1000);
        } else {
          // Cached brand session: button.bottom-button is one-time and won't reappear.
          // Try navigating to Business DNA up to 2 times to see if section_selection modal appears.
          // If it never does, return "content_ready" so caller uses nav-for-all.
          contentReadyNavAttempts++;
          log(`  [${ts()}] content_ready (no bottom-button) — nav attempt ${contentReadyNavAttempts}/2`);

          if (contentReadyNavAttempts > 2) {
            log(`  [${ts()}] ⚠ cached brand session confirmed — returning content_ready (nav-for-all mode)`);
            return "content_ready";
          }

          // Give the page a moment to finish rendering before looking for the sidebar
          await sleep(2000);
          await ensureSidebarExpanded(page, log);

          log(`  [${ts()}] clicking div.nav-group.has-flyout (Business DNA nav group)…`);
          const navClicked = await page
            .locator("div.nav-group.has-flyout")
            .first()
            .click({ force: true, timeout: 5_000 })
            .then(() => true)
            .catch(() => false);
          log(`  [${ts()}] Business DNA nav click: ${navClicked ? "✓ succeeded" : "✗ failed"}`);
          await sleep(1500);
        }
        break;
      }

      default:
        log(`  [${ts()}] unknown state — waiting 3s`);
        await sleep(3000);
    }
  }

  throw new Error(`Timed out waiting for ready state (${Math.round(timeoutMs / 1000)}s)`);
}

/**
 * Clicks the section card from the section_selection modal and waits until
 * the option-card modal disappears. Must be called at section_selection state.
 * Route interception must be set up before calling this.
 */
export async function selectSection(
  page: Page,
  section: PlaSection,
  log: (msg: string) => void = () => {},
  timeoutMs = 5 * 60 * 1000,
): Promise<void> {
  const title = SECTION_TITLE[section];
  log(`  [${ts()}] looking for .option-card with title "${title}"…`);

  const card = page.locator(".option-card").filter({
    has: page.locator(".title-medium", { hasText: title }),
  });

  const cardCount = await card.count();
  log(`  [${ts()}] found ${cardCount} matching card(s) — clicking first…`);
  await card.first().click({ timeout: 10_000 });
  log(`  [${ts()}] card clicked — waiting for .option-card to disappear…`);

  await page.waitForFunction(
    () => !document.querySelector(".option-card"),
    { timeout: timeoutMs },
  );
  log(`  [${ts()}] ✓ section modal gone — content rendering`);
}

/**
 * Navigates to a section using the sidebar nav (div.nav-item with force click).
 * Use this for sections 2+ in a multi-section run — avoids going back through
 * section_selection (which is only available once after initial DNA generation).
 *
 * Route interception must be set up before calling this.
 */
export async function navigateToSectionViaNav(
  page: Page,
  section: PlaSection,
  log: (msg: string) => void = () => {},
  timeoutMs = 120_000,
): Promise<void> {
  const title = SECTION_TITLE[section];

  await ensureSidebarExpanded(page, log);

  // Nav items are plain div.nav-item — not <a> or <button>.
  // Their label is in a child div.label. Use force:true to bypass actionability.
  log(`  [${ts()}] clicking div.nav-item for "${title}" (force: true)…`);
  const navItem = page
    .locator("div.nav-item:not(.sub-item)")
    .filter({ has: page.locator("div.label", { hasText: title }) });

  const count = await navItem.count();
  log(`  [${ts()}] found ${count} matching nav item(s)`);

  await navItem.first().click({ force: true, timeout: 10_000 });
  log(`  [${ts()}] ✓ nav item clicked — waiting for content…`);

  await sleep(1500);

  // Poll until content_ready (handles sections that need generation time)
  const deadline = Date.now() + timeoutMs;
  let dotsEmitted = false;
  while (Date.now() < deadline) {
    const state = await detectState(page);
    if (state === "content_ready") {
      if (dotsEmitted) process.stdout.write("\n");
      log(`  [${ts()}] ✓ section "${section}" content ready`);
      return;
    }
    if (state === "generating_dna") {
      process.stdout.write(".");
      dotsEmitted = true;
      await sleep(15_000);
    } else {
      await sleep(2000);
    }
  }
  throw new Error(`Timed out waiting for section "${section}" to load via nav (${Math.round(timeoutMs / 1000)}s)`);
}
