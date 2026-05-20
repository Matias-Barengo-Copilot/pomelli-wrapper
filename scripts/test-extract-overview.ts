/**
 * test-extract-overview.ts
 *
 * Drives Pomelli to the Business DNA overview and runs extractOverview().
 * Saves results to outputs/brand-overview.json and docs/brand-overview.md.
 *
 * Usage:
 *   npx tsx scripts/test-extract-overview.ts --url https://yourbrand.com
 *   npx tsx scripts/test-extract-overview.ts --url https://yourbrand.com --headless
 */

import { chromium, type Page, type BrowserContext } from "playwright";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { extractOverview, overviewToMarkdown } from "../src/capture/extract-overview.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SESSION_PATH = path.resolve(__dirname, "../google-session.json");
const OUT_DIR      = path.resolve(__dirname, "../outputs");
const DOCS_DIR     = path.resolve(__dirname, "../docs");
const POMELLI_URL  = "https://labs.google.com/pomelli/";

const HEADED = !process.argv.includes("--headless");

// ── CLI args ──────────────────────────────────────────────────────────────────

function getBrandUrl(): string {
  const idx = process.argv.indexOf("--url");
  if (idx === -1 || !process.argv[idx + 1]) {
    console.error("Usage: npx tsx scripts/test-extract-overview.ts --url <brand-url>");
    process.exit(1);
  }
  return process.argv[idx + 1];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

// ── State detection (mirrors spike-playwright.ts) ─────────────────────────────

type PomeliState =
  | "welcome_popup"
  | "onboarding"
  | "url_input"
  | "generating_dna"
  | "dna_summary"
  | "section_selection"
  | "content_ready"
  | "unknown";

async function detectState(page: Page): Promise<PomeliState> {
  return page.evaluate((): PomeliState => {
    const text = document.body?.innerText ?? "";
    if (document.querySelector("button[cdkfocusinitial]"))            return "welcome_popup";
    if (document.querySelector("input.url-input"))                    return "url_input";
    if (document.querySelector("button.continue-button:not(.mobile-only-cta)")) return "onboarding";
    if (text.includes("This may take a few minutes"))                 return "generating_dna";
    if (document.querySelector(".option-card"))                       return "section_selection";
    if (document.querySelector("button.bottom-button"))               return "dna_summary";
    return "content_ready";
  });
}

async function handleOnboarding(page: Page): Promise<void> {
  try {
    await page.locator("button[cdkfocusinitial]").first().click({ timeout: 10_000 });
    console.log("  ✓ Clicked 'Okay' (welcome popup)");
    await sleep(600);
  } catch { /* not present */ }

  const urlInputVisible = await page.locator("input.url-input").count() > 0;
  if (!urlInputVisible) {
    try {
      await page.locator("button.continue-button:not(.mobile-only-cta)").first().click({ timeout: 10_000 });
      console.log("  ✓ Clicked 'Let\\'s go!' (onboarding)");
      await sleep(600);
    } catch { /* not present */ }
  }
}

async function enterBrandUrl(page: Page, brandUrl: string): Promise<void> {
  await page.locator("input.url-input").first().fill(brandUrl);
  await page.keyboard.press("Enter");
  console.log(`  ✓ Entered: ${brandUrl}`);
}

/**
 * Drive Pomelli to the DNA overview (content_ready or section_selection).
 * We do NOT select a section — we want the Business DNA data visible on screen.
 */
async function driveToOverview(page: Page): Promise<void> {
  const deadline = Date.now() + 10 * 60 * 1000; // 10 min max
  let lastState: PomeliState = "unknown";

  while (Date.now() < deadline) {
    const state = await detectState(page);

    if (state !== lastState) {
      console.log(`  State: ${state}`);
      lastState = state;
    }

    switch (state) {
      case "generating_dna":
        process.stdout.write(".");
        await sleep(8000);
        break;

      case "dna_summary":
        await page.locator("button.bottom-button").first().click({ timeout: 10_000 });
        console.log("\n  ✓ Clicked 'Let\\'s go' (DNA summary)");
        await sleep(1500);
        break;

      // Both of these states have the Business DNA content in the DOM.
      // section_selection is a modal overlay — the underlying page is still readable.
      case "section_selection":
      case "content_ready":
        console.log("  ✓ Business DNA content available");
        return;

      case "url_input":
        throw new Error("URL input reappeared — brand URL was rejected");

      default:
        process.stdout.write("?");
        await sleep(5000);
    }
  }

  throw new Error("Timed out waiting for Business DNA to load");
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const brandUrl = getBrandUrl();
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(DOCS_DIR, { recursive: true });

  if (!fs.existsSync(SESSION_PATH)) {
    console.error(`No session at ${SESSION_PATH} — run \`npm run login\` first.`);
    process.exit(1);
  }

  console.log("=== Test: extractOverview ===");
  console.log(`Brand: ${brandUrl}`);
  console.log(`Mode:  ${HEADED ? "headed" : "headless"}\n`);

  const browser = await chromium.launch({ headless: !HEADED, slowMo: HEADED ? 80 : 0 });
  let context: BrowserContext | null = null;
  let page: Page | null = null;

  try {
    context = await browser.newContext({ storageState: SESSION_PATH });
    page = await context.newPage();

    // 1. Navigate
    console.log("[1/4] Navigating to Pomelli…");
    await page.goto(POMELLI_URL, { waitUntil: "domcontentloaded", timeout: 30_000 });

    const url = page.url();
    if (url.includes("accounts.google.com") || url.includes("google.com/signin"))
      throw new Error("Session expired — run `npm run login` to refresh.");
    console.log("  ✓ Session active");

    await page.waitForFunction(
      () => document.querySelectorAll("button").length > 0,
      { timeout: 15_000 }
    );

    // 2. Handle onboarding
    console.log("[2/4] Handling onboarding…");
    const initialState = await detectState(page);
    console.log(`  Initial state: ${initialState}`);
    if (["welcome_popup", "onboarding", "unknown"].includes(initialState)) {
      await handleOnboarding(page);
    }

    // 3. Enter brand URL if needed
    const preUrlState = await detectState(page);
    if (preUrlState === "url_input") {
      console.log("[3/4] Entering brand URL…");
      await enterBrandUrl(page, brandUrl);
    } else {
      console.log(`[3/4] Skipping URL entry (state: ${preUrlState})`);
    }

    // 4. Drive to overview
    console.log("[4/4] Waiting for Business DNA overview…");
    await driveToOverview(page);

    // Extra settle time so Angular finishes rendering the data cards
    await sleep(2000);

    // Extract
    console.log("\n[extract] Running extractOverview…");
    const overview = await extractOverview(page);
    console.log("  ✓ Extracted");
    console.log(JSON.stringify(overview, null, 2));

    // Save JSON
    const jsonPath = path.join(OUT_DIR, "brand-overview.json");
    fs.writeFileSync(jsonPath, JSON.stringify(overview, null, 2));
    console.log(`\n  Saved: ${jsonPath}`);

    // Save markdown
    const md = overviewToMarkdown(overview, brandUrl);
    const mdPath = path.join(DOCS_DIR, "brand-overview.md");
    fs.writeFileSync(mdPath, md);
    console.log(`  Saved: ${mdPath}`);

    console.log("\n=== PASSED ===");
  } catch (err) {
    if (page) {
      const ss = path.join(OUT_DIR, "extract-overview-failure.png");
      await page.screenshot({ path: ss, fullPage: false }).catch(() => {});
      console.error(`  Screenshot: ${ss}`);
    }
    throw err;
  } finally {
    await context?.close();
    await browser.close();
  }
}

main().catch(err => {
  console.error("\n=== FAILED ===");
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
