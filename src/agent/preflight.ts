import puppeteer, { type Browser, type Page } from "puppeteer-core";
import { logger } from "../lib/logger.js";

const POMELLI_URL = "https://labs.google.com/pomelli/";
const STEP = "preflight";

function cdpUrl(): string {
  const host = process.env.CDP_HOST ?? "localhost";
  const port = process.env.CDP_PORT ?? "9222";
  return `http://${host}:${port}`;
}

async function getPage(browser: Browser): Promise<Page> {
  const pages = await browser.pages();
  if (pages.length === 0) throw new Error("No pages open in Firefox");
  return pages[pages.length - 1];
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// Try clicking by CSS selector, then by button text content — returns true if something was clicked
async function tryClick(
  page: Page,
  cssSelectors: string[],
  buttonTexts: string[],
  timeoutMs = 2000
): Promise<boolean> {
  for (const sel of cssSelectors) {
    try {
      const el = await page.waitForSelector(sel, { timeout: timeoutMs });
      if (el) {
        await el.click();
        logger.info(STEP, "clicked via CSS", { selector: sel });
        return true;
      }
    } catch {
      // not found — try next
    }
  }

  for (const text of buttonTexts) {
    const clicked: boolean = await page.evaluate((t: string) => {
      const candidates = document.querySelectorAll("button, a, [role='button'], [role='link']");
      for (const el of candidates) {
        if (el.textContent?.trim().includes(t)) {
          (el as HTMLElement).click();
          return true;
        }
      }
      return false;
    }, text);

    if (clicked) {
      logger.info(STEP, "clicked via text", { text });
      return true;
    }
  }

  return false;
}

// ── State detection ───────────────────────────────────────────────────────────

type PomeliState =
  | "onboarding"    // popup visible
  | "url_input"     // blank page with URL input
  | "analyzing"     // spinner / progress visible
  | "sections"      // section nav visible — ready to capture
  | "unknown";

async function detectState(page: Page): Promise<PomeliState> {
  return page.evaluate((): PomeliState => {
    const text = document.body?.innerText ?? "";

    // Onboarding popup
    if (
      document.querySelector("dialog, [role='dialog']") ||
      text.includes("Let's go") ||
      text.includes("Welcome to")
    ) {
      return "onboarding";
    }

    // Sections ready (sidebar icons or known section text visible)
    if (
      text.includes("Business DNA") ||
      text.includes("Campaigns") ||
      text.includes("Photoshoot") ||
      document.querySelector("[data-section], .section-tab, [aria-label*='DNA'], [aria-label*='Campaign']")
    ) {
      return "sections";
    }

    // Analyzing spinner
    if (
      document.querySelector("[class*='spinner'], [class*='loading'], [class*='progress'], [role='progressbar']") ||
      text.includes("Analyzing") ||
      text.includes("Loading")
    ) {
      return "analyzing";
    }

    // URL input visible
    const inputs = document.querySelectorAll("input:not([type='hidden'])");
    if (inputs.length > 0) return "url_input";

    return "unknown";
  });
}

// ── Steps ────────────────────────────────────────────────────────────────────

async function ensureOnPomelli(page: Page): Promise<void> {
  const url = page.url();
  if (url.includes("labs.google.com/pomelli")) {
    logger.info(STEP, "already on Pomelli", { url });
    return;
  }
  logger.info(STEP, "navigating to Pomelli");
  await page.goto(POMELLI_URL, { timeout: 30_000 });
  await sleep(2000);
}

async function removeBrandIfPresent(page: Page): Promise<void> {
  // Only attempt if page contains a ⋮ or settings menu (brand already loaded)
  const hasBrand = await page.evaluate(() => {
    const t = document.body?.innerText ?? "";
    return (
      !!document.querySelector("[aria-label*='more' i], [aria-label*='settings' i]") ||
      t.includes("Remove brand") ||
      t.includes("Start over")
    );
  });

  if (!hasBrand) return;

  logger.info(STEP, "brand loaded — removing");
  const menuClicked = await tryClick(
    page,
    ["[aria-label*='more' i]", "[aria-label*='settings' i]", "button:last-of-type"],
    ["⋮", "more", "settings"],
    2000
  );

  if (menuClicked) {
    await sleep(500);
    await tryClick(page, [], ["Remove brand", "Start over", "Reset"], 2000);
    await sleep(1000);
  }
}

async function dismissOnboarding(page: Page): Promise<boolean> {
  const dismissed = await tryClick(
    page,
    [".continue-button", "[data-action='continue']", "dialog button", "[role='dialog'] button"],
    ["Let's go!", "Get started", "Continue", "OK", "Got it"],
    3000
  );

  if (dismissed) {
    await sleep(800);
    logger.info(STEP, "onboarding popup dismissed");
  } else {
    logger.warn(STEP, "could not dismiss onboarding popup via CDP");
  }

  return dismissed;
}

async function enterBrandUrl(page: Page, brandUrl: string): Promise<boolean> {
  const selectors = [
    "input[type='url']",
    "input[type='text'][placeholder*='website' i]",
    "input[type='text'][placeholder*='url' i]",
    "input[type='text'][placeholder*='brand' i]",
    "input[type='search']",
    "input[type='text']",
    "input:not([type='hidden'])",
  ];

  for (const sel of selectors) {
    try {
      const el = await page.waitForSelector(sel, { timeout: 3000 });
      if (!el) continue;
      await el.click();
      await el.evaluate((node) => (node as HTMLInputElement).select());
      await el.type(brandUrl, { delay: 40 });
      logger.info(STEP, "entered brand URL", { selector: sel, brandUrl });
      return true;
    } catch {
      continue;
    }
  }

  logger.warn(STEP, "URL input not found");
  return false;
}

async function waitForSections(page: Page, timeoutMs = 180_000): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  logger.info(STEP, "waiting for sections to appear", { timeoutMs });

  while (Date.now() < deadline) {
    await sleep(5000);
    const state = await detectState(page);
    logger.info(STEP, "poll", { state });
    if (state === "sections") return true;
    if (state === "url_input") {
      // Analysis failed or URL was rejected
      logger.warn(STEP, "URL input reappeared — brand URL may have been rejected");
      return false;
    }
  }

  return false;
}

// ── Public entry point ────────────────────────────────────────────────────────

export type PreflightResult =
  | { status: "sections_ready" }
  | { status: "partial"; lastState: PomeliState; message: string }
  | { status: "failed"; message: string };

export async function runPreflight(brandUrl: string): Promise<PreflightResult> {
  logger.info(STEP, "=== PREFLIGHT START ===", { brandUrl });

  let browser: Browser | null = null;
  try {
    browser = await puppeteer.connect({
      browserURL: cdpUrl(),
      defaultViewport: null,
    });

    const page = await getPage(browser);

    // 1. Make sure we are on Pomelli
    await ensureOnPomelli(page);

    // 2. Remove any previously loaded brand
    await removeBrandIfPresent(page);

    // 3. Check current state
    let state = await detectState(page);
    logger.info(STEP, "initial state", { state });

    // 4. Dismiss onboarding popup if visible
    if (state === "onboarding") {
      const ok = await dismissOnboarding(page);
      if (!ok) {
        return {
          status: "partial",
          lastState: "onboarding",
          message: "Onboarding popup could not be dismissed via CDP — Computer Use will handle it",
        };
      }
      state = await detectState(page);
    }

    // 5. Enter brand URL
    if (state === "url_input" || state === "unknown") {
      const typed = await enterBrandUrl(page, brandUrl);
      if (!typed) {
        return {
          status: "partial",
          lastState: state,
          message: "URL input not found — Computer Use will handle URL entry",
        };
      }
      await page.keyboard.press("Enter");
      await sleep(1000);
      state = await detectState(page);
    }

    // 6. Sections already ready? (brand was previously loaded and we just removed it)
    if (state === "sections") {
      logger.info(STEP, "=== PREFLIGHT DONE — sections ready ===");
      return { status: "sections_ready" };
    }

    // 7. Wait for analysis to complete
    if (state === "analyzing" || state === "unknown") {
      const ready = await waitForSections(page);
      if (ready) {
        logger.info(STEP, "=== PREFLIGHT DONE — sections ready ===");
        return { status: "sections_ready" };
      }
      return {
        status: "partial",
        lastState: "analyzing",
        message: "Analysis still running after timeout — Computer Use will monitor and capture sections",
      };
    }

    return {
      status: "partial",
      lastState: state,
      message: `Unexpected state '${state}' after preflight — Computer Use will take over`,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error(STEP, "preflight error", { message });
    return { status: "failed", message };
  } finally {
    browser?.disconnect();
    logger.info(STEP, "CDP disconnected");
  }
}
