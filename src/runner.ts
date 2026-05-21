import "dotenv/config";
import { chromium } from "playwright";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

import {
  POMELLI_URL,
  VALID_SECTIONS,
  type PlaSection,
  deleteBrandIfPresent,
  driveToReadyState,
  navigateToBusinessDnaOverview,
  waitForAngular,
} from "./navigate/pomelli.js";
import { extractOverview, overviewToMarkdown, type BrandOverview } from "./capture/extract-overview.js";
import { captureSection, type SectionCapture } from "./capture/capture-section.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const DEFAULT_SESSION_PATH = path.resolve(__dirname, "../google-session.json");
export const DEFAULT_OUTPUTS_DIR  = path.resolve(__dirname, "../outputs");

export interface RunManifest {
  schemaVersion: "2.0";
  runId: string;
  brandUrl: string;
  startedAt: string;
  completedAt: string;
  status: "completed" | "partial" | "failed";
  error: string | null;
  overview: BrandOverview | null;
  sections: SectionCapture[];
}

// "website" is excluded from auto-runs — it enters an indefinite generation state.
// Users can still pass it explicitly via --sections website.
export const DEFAULT_SECTIONS = (VALID_SECTIONS as readonly PlaSection[]).filter(s => s !== "website");

export interface RunWrapOptions {
  brandUrl: string;
  sections?: PlaSection[];
  outBase?: string;
  headless?: boolean;
  sessionPath?: string;
  log?: (msg: string) => void;
}

function makeRunDir(outBase: string) {
  const runId  = `run-${new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)}`;
  const runDir = path.join(outBase, runId);
  fs.mkdirSync(path.join(runDir, "sections"), { recursive: true });
  return { runId, runDir };
}

function ts() { return new Date().toISOString().slice(11, 23); }

export async function runWrap(opts: RunWrapOptions): Promise<RunManifest> {
  const {
    brandUrl,
    sections    = [...DEFAULT_SECTIONS],
    outBase     = DEFAULT_OUTPUTS_DIR,
    headless    = true,
    sessionPath = DEFAULT_SESSION_PATH,
    log         = () => {},
  } = opts;

  const { runId, runDir } = makeRunDir(outBase);
  const startedAt = new Date().toISOString();

  log("=== Pomelli Wrapper ===");
  log(`Run ID:   ${runId}`);
  log(`Brand:    ${brandUrl}`);
  log(`Sections: ${sections.join(", ")}`);
  log(`Output:   ${runDir}`);
  log(`Mode:     ${headless ? "headless" : "headed"}\n`);

  const browser = await chromium.launch({ headless, slowMo: headless ? 0 : 80 });
  const context = await browser.newContext({
    storageState: sessionPath,
    // Explicit desktop viewport — ensures Pomelli renders the full sidebar nav
    // (Angular Material sidenav collapses below ~960px)
    viewport: { width: 1440, height: 900 },
  });
  const page    = await context.newPage();

  const captures: SectionCapture[] = [];
  let overview: BrandOverview | null = null;
  let status: "completed" | "partial" | "failed" = "failed";
  let errorMsg: string | null = null;

  try {
    // ── Step 1: Navigate ────────────────────────────────────────────────────
    log(`[1] Navigating to Pomelli… (${POMELLI_URL})`);
    await page.goto(POMELLI_URL, { waitUntil: "domcontentloaded", timeout: 30_000 });

    const landedUrl = page.url();
    log(`  [${ts()}] landed at: ${landedUrl}`);
    if (landedUrl.includes("accounts.google.com"))
      throw new Error("Session expired — run `npm run login` to refresh.");

    log(`  [${ts()}] waiting for Angular bootstrap…`);
    await waitForAngular(page);
    log(`  [${ts()}] ✓ Angular ready, session active`);

    // ── Step 2: Delete existing brand ───────────────────────────────────────
    log(`\n[2] Checking for existing brand…`);
    const hadBrand = await deleteBrandIfPresent(page, log);
    log(`  [${ts()}] ${hadBrand ? "✓ previous brand deleted — starting fresh" : "no prior brand found"}`);

    // ── Step 3: Drive to section_selection ──────────────────────────────────
    log(`\n[3] Driving to section selection…`);
    const readyState  = await driveToReadyState(page, brandUrl, log);
    const useNavForAll = readyState !== "section_selection";
    log(`  [${ts()}] readyState: ${readyState} — useNavForAll: ${useNavForAll}`);

    if (useNavForAll) {
      log(`  [${ts()}] cached session — navigating to Business DNA Overview…`);
      await navigateToBusinessDnaOverview(page, log);
    }

    // ── Step 4: Extract Business DNA overview ────────────────────────────────
    log(`\n[4] Extracting Business DNA overview…`);
    overview = await extractOverview(page);
    fs.writeFileSync(path.join(runDir, "brand-overview.json"), JSON.stringify(overview, null, 2));
    fs.writeFileSync(path.join(runDir, "brand-overview.md"), overviewToMarkdown(overview, brandUrl));
    log(`  [${ts()}] brand name: ${overview.brandName || "(empty)"}`);
    log(`  [${ts()}] colors:    ${overview.colors.join(", ") || "none"}`);
    log(`  [${ts()}] ✓ overview saved`);

    // ── Step 5: Capture each section ────────────────────────────────────────
    // Per-section errors are caught individually so one slow/broken section
    // cannot crash the entire run. captureSection's finally block ensures
    // route interception is always cleaned up before we continue.
    log(`\n[5] Capturing ${sections.length} section(s): ${sections.join(", ")}`);

    for (let i = 0; i < sections.length; i++) {
      const section    = sections[i];
      const sectionDir = path.join(runDir, "sections", section);
      fs.mkdirSync(path.join(sectionDir, "assets"), { recursive: true });

      log(`\n  ── section ${i + 1}/${sections.length}: "${section}" ──`);
      const useNav = i > 0 || useNavForAll;
      log(`  [${ts()}] capture mode: ${useNav ? "sidebar nav" : "section_selection card"}`);

      try {
        const capture = await captureSection(page, section, sectionDir, log, useNav);
        captures.push(capture);
        log(`  [${ts()}] ✓ section "${section}" done — ${capture.assetCount} asset(s)`);
      } catch (sectionErr) {
        const msg = sectionErr instanceof Error ? sectionErr.message : String(sectionErr);
        log(`  [${ts()}] ✗ section "${section}" failed (continuing): ${msg}`);
      }
    }

    // ── Step 6: Exploration (when any section produced 0 assets) ────────────
    const EXPLORE_ORDER    = ["dna-catalog", "dna-assets", "campaigns", "photoshoot", "brand-book"];
    const EXPLORE_TIMEOUT  = 90_000;
    const capturedNames    = new Set<string>(sections);
    const zeroAssets       = captures.filter(c => c.assetCount === 0).map(c => c.name);

    if (zeroAssets.length > 0) {
      const toExplore = EXPLORE_ORDER.filter(s => !capturedNames.has(s));
      log(`\n[6] Sidebar exploration — ${zeroAssets.join(", ")} had 0 assets`);
      log(`  [${ts()}] exploring ${toExplore.length} target(s): ${toExplore.join(", ")} (90s timeout each)`);

      for (const section of toExplore) {
        const sectionDir = path.join(runDir, "sections", section);
        fs.mkdirSync(path.join(sectionDir, "assets"), { recursive: true });
        log(`\n  ── exploration: "${section}" ──`);
        try {
          const timeout = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`exploration timeout (${EXPLORE_TIMEOUT / 1000}s)`)), EXPLORE_TIMEOUT),
          );
          const capture = await Promise.race([
            captureSection(page, section, sectionDir, log, true),
            timeout,
          ]);
          captures.push(capture);
          log(`  [${ts()}] ✓ exploration "${section}" — ${capture.assetCount} asset(s)`);
        } catch (exploreErr) {
          log(`  [${ts()}] ✗ exploration "${section}" failed: ${exploreErr instanceof Error ? exploreErr.message : exploreErr}`);
        }
      }
    }

    status = "completed";
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : String(err);
    log(`\n  [${ts()}] ✗ ERROR: ${errorMsg}`);
    status = captures.length > 0 ? "partial" : "failed";
    const ssPath = path.join(runDir, "failure.png");
    await page.screenshot({ path: ssPath, fullPage: false }).catch(() => {});
  } finally {
    log(`\n  [${ts()}] closing browser…`);
    await context.close();
    await browser.close();
    log(`  [${ts()}] browser closed`);
  }

  const completedAt = new Date().toISOString();
  const manifest: RunManifest = {
    schemaVersion: "2.0",
    runId,
    brandUrl,
    startedAt,
    completedAt,
    status,
    error: errorMsg,
    overview,
    sections: captures,
  };
  fs.writeFileSync(path.join(runDir, "manifest.json"), JSON.stringify(manifest, null, 2));
  log(`  [${ts()}] manifest saved → ${path.join(runDir, "manifest.json")}`);

  return manifest;
}
