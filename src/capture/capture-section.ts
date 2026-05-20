import type { Page, Route, Response } from "playwright";
import * as fs from "fs";
import * as path from "path";
import {
  selectSection,
  navigateToSectionViaNav,
  navigateToBusinessDnaSubTab,
  type PlaSection,
} from "../navigate/pomelli.js";

export interface AssetEntry {
  index: number;
  url: string;
  file: string;       // relative to sectionDir
  contentType: string;
  sizeBytes: number;
}

export interface SectionCapture {
  name: string;   // PlaSection or exploration target ("dna-catalog", "dna-assets")
  capturedAt: string;
  screenshotFile: string;  // relative to sectionDir
  assetCount: number;
  assets: AssetEntry[];
}

// Matches Pomelli-generated asset URLs (pomelli_downloads, AI image hosts)
const ASSET_RE = /pomelli_downloads|aiusercontent\.com|generativelanguage\.googleapis\.com/;

function extFromContentType(ct: string): string {
  if (ct.includes("webp")) return ".webp";
  if (ct.includes("png"))  return ".png";
  if (ct.includes("jpeg") || ct.includes("jpg")) return ".jpg";
  if (ct.includes("gif"))  return ".gif";
  if (ct.includes("svg"))  return ".svg";
  return ".bin";
}

function ts() { return new Date().toISOString().slice(11, 23); }
function shortUrl(url: string): string {
  try { return new URL(url).pathname.slice(0, 80); } catch { return url.slice(0, 80); }
}

/**
 * Captures a Pomelli section or Business DNA sub-tab:
 *   - section = PlaSection ("campaigns", "photoshoot", etc.): captures a main section.
 *     - useNav=false: expects page at section_selection, clicks the option card.
 *     - useNav=true:  navigates via sidebar div.nav-item.
 *   - section = "dna-catalog" | "dna-assets": navigates to the Business DNA Catalog/Assets
 *     sub-tab and captures whatever assets are rendered there.
 *
 * Sets up route interception BEFORE navigating so assets loaded on render are caught.
 * Writes screenshot + assets to sectionDir, returns SectionCapture.
 */
export async function captureSection(
  page: Page,
  section: string,  // PlaSection | "dna-catalog" | "dna-assets"
  sectionDir: string,
  log: (msg: string) => void = () => {},
  useNav = false,
): Promise<SectionCapture> {
  const assetsDir = path.join(sectionDir, "assets");
  fs.mkdirSync(assetsDir, { recursive: true });

  const collected: { url: string; buffer: Buffer; contentType: string }[] = [];
  const seenUrls = new Set<string>();

  // ── Response log (ALL URLs) ────────────────────────────────────────────────
  const responseLog: string[] = [];
  const responseListener = (res: Response) => {
    responseLog.push(`${res.status()} ${res.url()}`);
  };
  page.on("response", responseListener);
  log(`  [${ts()}] response logger attached`);

  // ── Asset route interception (set up BEFORE navigation) ───────────────────
  log(`  [${ts()}] registering route interception: ${ASSET_RE.source}`);
  const routeHandler = async (route: Route) => {
    const url = route.request().url();
    try {
      const resp = await route.fetch();
      const buffer = await resp.body();
      const contentType = resp.headers()["content-type"] ?? "application/octet-stream";
      const kb = (buffer.length / 1024).toFixed(1);
      if (!seenUrls.has(url)) {
        seenUrls.add(url);
        collected.push({ url, buffer, contentType });
        log(`  [${ts()}] ↓ intercepted [${contentType}] ${kb}KB — ${shortUrl(url)}`);
      } else {
        log(`  [${ts()}] ↓ duplicate skipped — ${shortUrl(url)}`);
      }
      await route.fulfill({ response: resp });
    } catch (err) {
      log(`  [${ts()}] ⚠ route fetch error (${err instanceof Error ? err.message : err}) — ${shortUrl(url)}`);
      await route.continue().catch(() => {});
    }
  };
  await page.route(ASSET_RE, routeHandler);

  // Hoisted so the finally block can write the file even if the try throws
  let domImageSources: string[] = [];

  // ── Navigate to section ────────────────────────────────────────────────────
  try {
    if (section === "dna-catalog" || section === "dna-assets") {
      const subTab = section === "dna-catalog" ? "Catalog" : "Assets";
      log(`  [${ts()}] navigation mode: Business DNA sub-tab ("${subTab}")`);
      await navigateToBusinessDnaSubTab(page, subTab, log);
    } else if (useNav) {
      log(`  [${ts()}] navigation mode: sidebar nav (div.nav-item)`);
      await navigateToSectionViaNav(page, section as PlaSection, log);
    } else {
      log(`  [${ts()}] navigation mode: section_selection card (.option-card)`);
      await selectSection(page, section as PlaSection, log);
    }

    // Scroll to trigger intersection-observer / lazy-loaded images
    log(`  [${ts()}] scrolling to trigger lazy-loaded images…`);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await new Promise<void>(r => setTimeout(r, 1000));
    await page.evaluate(() => window.scrollTo(0, 0));

    // Wait for all pending network requests to finish
    log(`  [${ts()}] waiting for network idle (up to 30s)…`);
    await page.waitForLoadState("networkidle", { timeout: 30_000 }).catch(() => {
      log(`  [${ts()}] networkidle timed out — continuing`);
    });

    // Small buffer after network idle for any delayed renders
    log(`  [${ts()}] 5s buffer after network idle…`);
    await new Promise<void>(r => setTimeout(r, 5_000));
    log(`  [${ts()}] settle done — ${collected.length} asset(s) intercepted`);

    // Collect all <img> src and CSS background-image URLs for diagnostics
    domImageSources = await page.evaluate((): string[] => {
      const sources: string[] = [];
      document.querySelectorAll("img[src]").forEach(img => {
        const src = (img as HTMLImageElement).src;
        if (src && !src.startsWith("data:")) sources.push(`IMG   ${src}`);
      });
      document.querySelectorAll("*").forEach(el => {
        const bg = window.getComputedStyle(el).backgroundImage;
        if (bg && bg !== "none" && !bg.includes("gradient") && bg.includes("url(")) {
          const match = bg.match(/url\(["']?([^"')]+)["']?\)/);
          if (match) sources.push(`CSS   ${match[1]}`);
        }
      });
      return sources;
    }).catch(() => []);
    log(`  [${ts()}] DOM image sources: ${domImageSources.length}`);
  } finally {
    await page.unroute(ASSET_RE, routeHandler);
    page.off("response", responseListener);
    log(`  [${ts()}] route interception stopped — total responses: ${responseLog.length}`);

    const responseUrlsPath = path.join(sectionDir, "response-urls.txt");
    fs.writeFileSync(responseUrlsPath, responseLog.join("\n"));
    log(`  [${ts()}] response log → ${responseUrlsPath}`);

    const domImagePath = path.join(sectionDir, "dom-image-sources.txt");
    fs.writeFileSync(domImagePath, domImageSources.join("\n"));
    log(`  [${ts()}] DOM image sources → ${domImagePath} (${domImageSources.length} entries)`);
  }

  // ── Screenshot ────────────────────────────────────────────────────────────
  const screenshotFile = "screenshot.png";
  const screenshotPath = path.join(sectionDir, screenshotFile);
  log(`  [${ts()}] taking screenshot → ${screenshotPath}`);
  await page.screenshot({ path: screenshotPath, fullPage: false });
  log(`  [${ts()}] ✓ screenshot saved`);

  // ── Write assets ──────────────────────────────────────────────────────────
  if (collected.length === 0) {
    log(`  [${ts()}] ⚠ no assets matched ASSET_RE — check response-urls.txt for actual URLs`);
  }

  const assets: AssetEntry[] = [];
  for (let i = 0; i < collected.length; i++) {
    const { url, buffer, contentType } = collected[i];
    const ext = extFromContentType(contentType);
    const fname = `${String(i + 1).padStart(3, "0")}${ext}`;
    fs.writeFileSync(path.join(assetsDir, fname), buffer);
    const kb = (buffer.length / 1024).toFixed(1);
    log(`  [${ts()}] saved ${fname} (${kb}KB, ${contentType})`);
    assets.push({
      index: i + 1,
      url,
      file: path.join("assets", fname),
      contentType,
      sizeBytes: buffer.length,
    });
  }

  log(`  [${ts()}] ✓ section "${section}" complete — ${assets.length} asset(s)`);
  return {
    name: section,
    capturedAt: new Date().toISOString(),
    screenshotFile,
    assetCount: assets.length,
    assets,
  };
}
