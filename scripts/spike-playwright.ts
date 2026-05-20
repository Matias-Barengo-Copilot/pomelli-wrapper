/**
 * Phase 0 spike — validates Playwright can control Pomelli end-to-end.
 *
 * Usage:
 *   npm run spike -- --url https://yourbrand.com --sections campaigns,photoshoot
 *   npm run spike -- --url https://yourbrand.com --sections all
 *   npm run spike -- --url https://yourbrand.com --sections campaigns   (default if omitted)
 *
 * Flags:
 *   --headless   run without visible browser (default: headed)
 *   --inspect    add page.pause() at key steps (opens Playwright Inspector)
 *
 * Valid section names: campaigns, photoshoot, website, brand-book
 */

import { chromium, type Page, type BrowserContext } from "playwright";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SESSION_PATH   = path.resolve(__dirname, "../google-session.json");
const OUT_DIR        = path.resolve(__dirname, "../spike-output");
const POMELLI_URL    = "https://labs.google.com/pomelli/";
const SECTION_TIMEOUT_MS  = 5 * 60 * 1000; // 5 min per section generation
const ANALYSIS_TIMEOUT_MS = 5 * 60 * 1000; // 5 min for initial DNA analysis

const HEADED  = !process.argv.includes("--headless");
const INSPECT = process.argv.includes("--inspect");

// ── Section names exactly as they appear in Pomelli's option-card titles ─────
const VALID_SECTIONS = ["campaigns", "photoshoot", "website", "brand-book"] as const;
type SectionName = typeof VALID_SECTIONS[number];

const SECTION_TITLE_MAP: Record<SectionName, string> = {
  "campaigns":  "Campaigns",
  "photoshoot": "Photoshoot",
  "website":    "Website",
  "brand-book": "Brand Book",
};

// ── CLI args ──────────────────────────────────────────────────────────────────

function getBrandUrl(): string {
  const idx = process.argv.indexOf("--url");
  if (idx === -1 || !process.argv[idx + 1]) {
    console.error("Usage: npm run spike -- --url <brand-url> [--sections <s1,s2,...|all>]");
    process.exit(1);
  }
  return process.argv[idx + 1];
}

function getSections(): SectionName[] {
  const idx = process.argv.indexOf("--sections");
  if (idx === -1 || !process.argv[idx + 1]) return ["campaigns"]; // default
  const raw = process.argv[idx + 1];
  if (raw === "all") return [...VALID_SECTIONS];
  return raw.split(",").map(s => s.trim().toLowerCase()).filter(s =>
    VALID_SECTIONS.includes(s as SectionName)
  ) as SectionName[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function screenshotNow(page: Page, name: string): Promise<string> {
  const p = path.join(OUT_DIR, `${name}.png`);
  await page.screenshot({ path: p, fullPage: false });
  return p;
}

// ── State detection ───────────────────────────────────────────────────────────

type PomeliState =
  | "welcome_popup"      // "Welcome to Pomelli" dialog — Okay button
  | "onboarding"         // Let's go! CTA — button.continue-button:not(.mobile-only-cta)
  | "url_input"          // blank page with input.url-input
  | "generating_dna"     // "This may take a few minutes" visible — DNA being generated
  | "dna_summary"        // "Your Business DNA" card + button.bottom-button
  | "section_selection"  // modal with .option-card choices (Campaigns, Photoshoot, etc.)
  | "content_ready"      // section content rendered, no loading indicator
  | "unknown";

async function detectState(page: Page): Promise<PomeliState> {
  return page.evaluate((): PomeliState => {
    const text = document.body?.innerText ?? "";

    if (document.querySelector("button[cdkfocusinitial]"))
      return "welcome_popup";

    // url_input checked BEFORE onboarding — the submit button on the URL page
    // also has class continue-button, so we must prioritize the input detection
    if (document.querySelector("input.url-input"))
      return "url_input";

    if (document.querySelector("button.continue-button:not(.mobile-only-cta)"))
      return "onboarding";

    // Universal loading indicator — appears during DNA generation
    if (text.includes("This may take a few minutes"))
      return "generating_dna";

    // Section selection modal: option-card elements visible
    if (document.querySelector(".option-card"))
      return "section_selection";

    // DNA summary card with "Let's go" button
    if (document.querySelector("button.bottom-button"))
      return "dna_summary";

    // Content ready: no loading indicators, no option cards, no summary card
    return "content_ready";
  });
}

// ── Navigation steps ──────────────────────────────────────────────────────────

async function checkSession(page: Page): Promise<void> {
  const url = page.url();
  if (url.includes("accounts.google.com") || url.includes("google.com/signin"))
    throw new Error("Session expired — run `npm run login` to refresh.");
  console.log("  ✓ Session active");
}

async function handleOnboarding(page: Page): Promise<void> {
  // Step A: "Welcome to Pomelli" popup
  try {
    await page.locator("button[cdkfocusinitial]").first().click({ timeout: 10_000 });
    console.log("  ✓ Clicked 'Okay' (welcome popup)");
    await sleep(600);
  } catch {
    console.log("  ~ Okay popup not present");
  }

  // Step B: "Let's go!" onboarding CTA — only if url_input is NOT yet visible.
  // The URL input page also has a continue-button (submit), which we must NOT click here.
  const urlInputVisible = await page.locator("input.url-input").count() > 0;
  if (!urlInputVisible) {
    try {
      await page.locator("button.continue-button:not(.mobile-only-cta)").first().click({ timeout: 10_000 });
      console.log("  ✓ Clicked 'Let\\'s go!' (onboarding)");
      await sleep(600);
    } catch {
      console.log("  ~ Let\\'s go! not present");
    }
  } else {
    console.log("  ~ URL input already visible — skipping Let\\'s go! click");
  }
}

async function enterBrandUrl(page: Page, brandUrl: string): Promise<void> {
  if (INSPECT) await page.pause();
  await page.locator("input.url-input").first().fill(brandUrl);
  await page.keyboard.press("Enter");
  console.log(`  ✓ Entered: ${brandUrl}`);
}

async function selectSection(page: Page, section: SectionName): Promise<void> {
  const title = SECTION_TITLE_MAP[section];
  // Confirmed selector: .option-card containing .title-medium with the section name
  const card = page.locator(".option-card").filter({
    has: page.locator(".title-medium", { hasText: title }),
  });
  await card.first().click({ timeout: 10_000 });
  console.log(`  ✓ Selected section: ${title}`);
}

/**
 * Main state machine: drives Pomelli from any state to content_ready for each section.
 * Call after URL entry is done (or if already past URL entry).
 */
async function driveToContent(page: Page, sections: SectionName[]): Promise<void> {
  const deadline = Date.now() + ANALYSIS_TIMEOUT_MS + sections.length * SECTION_TIMEOUT_MS;
  let sectionsQueue = [...sections];
  let sectionWasSelected = false;
  let lastState: PomeliState = "unknown";

  while (Date.now() < deadline) {
    const state = await detectState(page);

    if (state !== lastState) {
      console.log(`\n  State: ${state}`);
      lastState = state;
    }

    switch (state) {
      case "generating_dna":
        process.stdout.write(".");
        await sleep(8000);
        break;

      case "dna_summary":
        await page.locator("button.bottom-button").first().click({ timeout: 10_000 });
        console.log("  ✓ Clicked 'Let\\'s go' (DNA summary)");
        await sleep(1000);
        break;

      case "section_selection": {
        if (sectionsQueue.length === 0) {
          console.log("  All sections processed.");
          return;
        }
        const next = sectionsQueue.shift()!;
        await selectSection(page, next);
        sectionWasSelected = true;
        await sleep(1500);
        break;
      }

      case "content_ready": {
        if (!sectionWasSelected) {
          // content_ready fired before we navigated to a section — still at DNA overview.
          // Navigate back to section selection via button.bottom-button if present,
          // otherwise reload to reset to a clean state.
          const hasBottomBtn = await page.locator("button.bottom-button").count() > 0;
          if (hasBottomBtn) {
            console.log("  content_ready before section — clicking DNA summary Let\\'s go");
            await page.locator("button.bottom-button").first().click({ timeout: 10_000 });
            await sleep(1000);
          } else {
            // No bottom button — reload to get back to url_input or dna_summary
            console.log("  content_ready before section — reloading to reset state");
            await page.reload({ waitUntil: "domcontentloaded" });
            await page.waitForFunction(
              () => document.querySelectorAll("button").length > 0,
              { timeout: 15_000 }
            );
          }
          break;
        }
        console.log("  ✓ Section content ready");
        await sleep(2000);
        return;
      }

      case "url_input":
        throw new Error("URL input reappeared — brand URL was rejected");

      default:
        process.stdout.write("?");
        await sleep(5000);
    }
  }

  throw new Error("Timed out waiting for content to be ready");
}

// ── Asset extraction ──────────────────────────────────────────────────────────

async function extractAssets(page: Page): Promise<string[]> {
  if (INSPECT) await page.pause();

  const result = await page.evaluate(() => {
    const imgUrls = Array.from(document.querySelectorAll("img[src]"))
      .map(img => (img as HTMLImageElement).src);

    const bgUrls: string[] = [];
    document.querySelectorAll("*").forEach(el => {
      const bg = getComputedStyle(el).backgroundImage;
      const match = bg.match(/url\(["']?(https?[^"')]+)["']?\)/);
      if (match) bgUrls.push(match[1]);
    });

    return { imgUrls, bgUrls };
  });

  console.log(`  img: ${result.imgUrls.length}, css-bg: ${result.bgUrls.length}`);

  return [...new Set([...result.imgUrls, ...result.bgUrls].filter(src =>
    src.startsWith("http") &&
    !src.includes("data:") &&
    !src.includes("material.angular") &&
    !src.includes("fonts.gstatic") &&
    !src.includes("gstatic.com/_/bettany") && // Pomelli UI assets, not brand assets
    (src.includes(".png") || src.includes(".jpg") || src.includes(".webp") ||
     src.includes(".svg") || src.includes("storage") ||
     src.includes("googleusercontent") || src.includes("lh3.google") ||
     src.includes("generativelanguage") || src.includes("aiusercontent"))
  ))];
}

async function downloadFile(url: string, dest: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status} ${url}`);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const brandUrl = getBrandUrl();
  const sections = getSections();
  fs.mkdirSync(OUT_DIR, { recursive: true });

  if (!fs.existsSync(SESSION_PATH)) {
    console.error(`No session at ${SESSION_PATH} — run \`npm run login\` first.`);
    process.exit(1);
  }

  const modeLabel = !HEADED ? "headless" : INSPECT ? "headed + Inspector" : "headed";
  console.log("=== Pomelli Playwright Spike ===");
  console.log(`Brand:    ${brandUrl}`);
  console.log(`Sections: ${sections.join(", ")}`);
  console.log(`Mode:     ${modeLabel}\n`);

  const browser = await chromium.launch({ headless: !HEADED, slowMo: HEADED ? 80 : 0 });
  let context: BrowserContext | null = null;
  let page: Page | null = null;

  try {
    context = await browser.newContext({ storageState: SESSION_PATH });
    page = await context.newPage();

    // 1. Navigate
    console.log("[1/5] Navigating to Pomelli…");
    await page.goto(POMELLI_URL, { waitUntil: "domcontentloaded", timeout: 30_000 });
    await checkSession(page);

    // Wait for Angular to bootstrap — at least one button must be in the DOM
    await page.waitForFunction(
      () => document.querySelectorAll("button").length > 0,
      { timeout: 15_000 }
    );
    await screenshotNow(page, "initial-state");

    // 2. Handle onboarding states (Okay → Let's go! → url_input)
    console.log("[2/5] Handling onboarding…");
    const initialState = await detectState(page);
    console.log(`  Initial state: ${initialState}`);
    if (["welcome_popup", "onboarding", "unknown"].includes(initialState)) {
      await handleOnboarding(page);
    }

    // 3. Enter brand URL — only if at url_input
    const preUrlState = await detectState(page);
    if (preUrlState === "url_input") {
      console.log("[3/5] Entering brand URL…");
      await enterBrandUrl(page, brandUrl);
    } else {
      console.log(`[3/5] Skipping URL entry (state: ${preUrlState})`);
    }

    // 4. Drive through generation + section selection + content ready
    // driveToContent handles all intermediate states including dna_summary → section_selection
    console.log("[4/5] Waiting for DNA generation and navigating sections…");
    await driveToContent(page, sections);

    // 5. Screenshot + asset extraction
    console.log("\n[5/5] Capturing assets…");
    const ssPath = await screenshotNow(page, "screenshot");
    console.log(`  Screenshot: ${ssPath}`);

    const urls = await extractAssets(page);
    console.log(`  Found ${urls.length} asset URL(s)`);

    if (urls.length === 0) {
      await screenshotNow(page, "no-assets-found");
      console.warn("  ⚠ No assets — check spike-output/no-assets-found.png");
    } else {
      for (let i = 0; i < Math.min(urls.length, 3); i++) {
        const dest = path.join(OUT_DIR, `asset-${String(i + 1).padStart(3, "0")}.jpg`);
        await downloadFile(urls[i], dest);
        console.log(`  ✓ ${path.basename(dest)}: ${urls[i]}`);
      }
    }

    console.log("\n=== SPIKE PASSED ===");
    console.log(`Output: ${OUT_DIR}`);
  } catch (err) {
    if (page) await screenshotNow(page, "failure").catch(() => {});
    throw err;
  } finally {
    await context?.close();
    await browser.close();
  }
}

main().catch(err => {
  console.error("\n=== SPIKE FAILED ===");
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
