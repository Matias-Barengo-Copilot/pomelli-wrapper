/**
 * explore-pomelli.ts
 *
 * Discovery script: navigates every section in Pomelli, extracts all text data
 * and assets, and writes docs/pomelli-map.md with the full findings.
 *
 * Usage:
 *   npx tsx scripts/explore-pomelli.ts --url https://yourbrand.com
 *   npx tsx scripts/explore-pomelli.ts --url https://yourbrand.com --headless
 *
 * Output:
 *   docs/pomelli-map.md        — full mapping document
 *   spike-output/explore/      — screenshots + downloaded assets per section
 */

import { chromium, type Page, type BrowserContext, type Response } from "playwright";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname    = path.dirname(fileURLToPath(import.meta.url));
const SESSION_PATH = path.resolve(__dirname, "../google-session.json");
const OUT_DIR      = path.resolve(__dirname, "../spike-output/explore");
const DOCS_DIR     = path.resolve(__dirname, "../docs");
const POMELLI_URL  = "https://labs.google.com/pomelli/";
const HEADED       = !process.argv.includes("--headless");

// ── CLI ───────────────────────────────────────────────────────────────────────

function getBrandUrl(): string {
  const idx = process.argv.indexOf("--url");
  if (idx === -1 || !process.argv[idx + 1]) {
    console.error("Usage: npx tsx scripts/explore-pomelli.ts --url <brand-url>");
    process.exit(1);
  }
  return process.argv[idx + 1];
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface SectionData {
  name: string;
  slug: string;
  subsections: SubsectionData[];
  screenshot: string;
  assets: AssetInfo[];
}

interface SubsectionData {
  name: string;
  pairs: { label: string; value: string }[];
  rawText: string;
}

interface AssetInfo {
  url: string;
  type: "img" | "css-bg" | "network";
  localFile?: string;
}

// ── Network interception ──────────────────────────────────────────────────────

const IMAGE_MIME_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml", "image/gif"];

function setupNetworkCapture(page: Page, captured: Map<string, Buffer>): void {
  page.on("response", async (res: Response) => {
    try {
      const ct = res.headers()["content-type"] ?? "";
      const url = res.url();
      if (
        IMAGE_MIME_TYPES.some(m => ct.includes(m)) &&
        !url.includes("gstatic.com/_/bettany") &&  // skip Pomelli UI chrome assets
        !url.includes("fonts.gstatic") &&
        !url.includes("accounts.google") &&
        !captured.has(url)
      ) {
        const buf = await res.body().catch(() => null);
        if (buf && buf.length > 2000) { // skip tiny icons
          captured.set(url, buf);
        }
      }
    } catch {
      // response may already be consumed — ignore
    }
  });
}

// ── State detection (reused from spike) ──────────────────────────────────────

type PomeliState =
  | "welcome_popup" | "onboarding" | "url_input" | "generating_dna"
  | "dna_summary" | "section_selection" | "content_ready" | "unknown";

async function detectState(page: Page): Promise<PomeliState> {
  return page.evaluate((): PomeliState => {
    const text = document.body?.innerText ?? "";
    if (document.querySelector("button[cdkfocusinitial]")) return "welcome_popup";
    if (document.querySelector("input.url-input"))          return "url_input";
    if (document.querySelector("button.continue-button:not(.mobile-only-cta)")) return "onboarding";
    if (text.includes("This may take a few minutes"))       return "generating_dna";
    if (document.querySelector(".option-card"))              return "section_selection";
    if (document.querySelector("button.bottom-button"))      return "dna_summary";
    return "content_ready";
  });
}

// ── Navigation to content_ready ───────────────────────────────────────────────

async function driveToAnySection(page: Page, brandUrl: string): Promise<void> {
  const deadline = Date.now() + 8 * 60 * 1000;

  while (Date.now() < deadline) {
    const state = await detectState(page);
    console.log(`  state: ${state}`);

    switch (state) {
      case "welcome_popup":
        await page.locator("button[cdkfocusinitial]").first().click({ timeout: 10_000 });
        await sleep(600);
        break;

      case "url_input":
        await page.locator("input.url-input").first().fill(brandUrl);
        await page.keyboard.press("Enter");
        console.log(`  ✓ Entered URL: ${brandUrl}`);
        await sleep(1000);
        break;

      case "onboarding":
        await page.locator("button.continue-button:not(.mobile-only-cta)").first().click({ timeout: 10_000 });
        await sleep(600);
        break;

      case "generating_dna":
        process.stdout.write(".");
        await sleep(8000);
        break;

      case "dna_summary":
        await page.locator("button.bottom-button").first().click({ timeout: 10_000 });
        console.log("\n  ✓ Clicked 'Let\\'s go' (DNA summary)");
        await sleep(1000);
        break;

      case "section_selection":
        // Pick the first available section to enter content_ready
        await page.locator(".option-card").first().click({ timeout: 10_000 });
        console.log("  ✓ Selected first section to enter content");
        await sleep(1500);
        break;

      case "content_ready":
        console.log("  ✓ Content ready — starting exploration");
        return;

      default:
        process.stdout.write("?");
        await sleep(5000);
    }
  }
  throw new Error("Timed out reaching content_ready state");
}

// ── Content extraction ────────────────────────────────────────────────────────

async function extractLabelValuePairs(page: Page): Promise<{ label: string; value: string }[]> {
  return page.evaluate(() => {
    const pairs: { label: string; value: string }[] = [];

    // Strategy 1: explicit .label + .value siblings
    document.querySelectorAll(".label").forEach(labelEl => {
      const valueEl = labelEl.nextElementSibling;
      if (valueEl) {
        pairs.push({
          label: labelEl.textContent?.trim() ?? "",
          value: valueEl.textContent?.trim() ?? "",
        });
      }
    });

    // Strategy 2: dt/dd pairs
    document.querySelectorAll("dt").forEach(dt => {
      const dd = dt.nextElementSibling;
      if (dd?.tagName === "DD") {
        pairs.push({ label: dt.textContent?.trim() ?? "", value: dd.textContent?.trim() ?? "" });
      }
    });

    // Strategy 3: title-medium + body-small siblings (Pomelli card pattern)
    document.querySelectorAll(".title-medium").forEach(title => {
      const body = title.nextElementSibling;
      if (body?.classList.contains("body-small") || body?.classList.contains("body-medium")) {
        pairs.push({
          label: title.textContent?.trim() ?? "",
          value: body.textContent?.trim() ?? "",
        });
      }
    });

    return pairs.filter(p => p.label && p.value);
  });
}

async function extractImageUrls(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const urls: string[] = [];

    // img src
    document.querySelectorAll("img[src]").forEach(img => {
      urls.push((img as HTMLImageElement).src);
    });

    // CSS background-image
    document.querySelectorAll(".page-content *").forEach(el => {
      const bg = getComputedStyle(el).backgroundImage;
      const match = bg.match(/url\(["']?(https?[^"')]+)["']?\)/);
      if (match) urls.push(match[1]);
    });

    return [...new Set(urls)].filter(src =>
      src.startsWith("http") &&
      !src.includes("data:") &&
      !src.includes("gstatic.com/_/bettany") &&
      !src.includes("fonts.gstatic") &&
      !src.includes("material.angular")
    );
  });
}

async function getRawPageText(page: Page): Promise<string> {
  return page.evaluate(() => {
    const el = document.querySelector(".page-content") as HTMLElement | null;
    return el?.innerText?.trim() ?? document.body?.innerText?.trim() ?? "";
  });
}

// ── Navigation map ────────────────────────────────────────────────────────────

interface NavItem { name: string; element: string; depth: number }

async function getNavItems(page: Page): Promise<NavItem[]> {
  return page.evaluate(() => {
    const items: { name: string; element: string; depth: number }[] = [];

    document.querySelectorAll(".nav-item, .sub-item, [class*='nav-item'], [class*='sub-item']").forEach(el => {
      const text = el.textContent?.trim() ?? "";
      if (!text || text.length > 60) return;
      const depth = el.classList.contains("sub-item") ? 2 : 1;
      // Unique selector
      const id = el.id ? `#${el.id}` : el.className.split(" ").filter(Boolean).map(c => `.${c}`).join("");
      items.push({ name: text, element: id, depth });
    });

    return items;
  });
}

// ── Section exploration ───────────────────────────────────────────────────────

async function exploreSection(
  page: Page,
  navItem: NavItem,
  capturedImages: Map<string, Buffer>
): Promise<SectionData> {
  const slug = slugify(navItem.name);
  const sectionDir = path.join(OUT_DIR, slug);
  fs.mkdirSync(sectionDir, { recursive: true });

  console.log(`\n  → [${navItem.name}]`);

  // Click nav item
  try {
    const el = page.locator(`${navItem.element}`).first();
    if (await el.count() > 0) {
      await el.click({ timeout: 5_000 });
      await sleep(2000);
    }
  } catch {
    console.log(`    ⚠ Could not click nav item: ${navItem.name}`);
  }

  // Screenshot
  const ssPath = path.join(sectionDir, "screenshot.png");
  await page.screenshot({ path: ssPath });

  // Extract text data
  const rawText = await getRawPageText(page);
  const pairs = await extractLabelValuePairs(page);

  // Extract images from DOM
  const domImageUrls = await extractImageUrls(page);

  // Collect network-captured images for this section
  const sectionAssets: AssetInfo[] = [];
  let assetIdx = 0;

  for (const [url, buf] of capturedImages) {
    const ext = url.includes(".svg") ? "svg" : url.includes(".png") ? "png" : "jpg";
    const localFile = path.join(sectionDir, `asset-${String(++assetIdx).padStart(3, "0")}.${ext}`);
    fs.writeFileSync(localFile, buf);
    sectionAssets.push({ url, type: "network", localFile });
  }

  // Add DOM-discovered URLs not yet captured via network
  for (const url of domImageUrls) {
    if (!capturedImages.has(url)) {
      sectionAssets.push({ url, type: "img" });
    }
  }

  // Clear captured for next section
  capturedImages.clear();

  return {
    name: navItem.name,
    slug,
    subsections: [{ name: "main", pairs, rawText }],
    screenshot: ssPath,
    assets: sectionAssets,
  };
}

// ── MD generation ─────────────────────────────────────────────────────────────

function generateMarkdown(brandUrl: string, sections: SectionData[]): string {
  const lines: string[] = [];
  const date = new Date().toISOString().slice(0, 10);

  lines.push(`# Pomelli Map — ${brandUrl}`);
  lines.push(`\n**Generated:** ${date}  `);
  lines.push(`**Tool:** explore-pomelli.ts  `);
  lines.push(`**Sections explored:** ${sections.length}\n`);
  lines.push("---\n");

  lines.push("## Table of Contents\n");
  sections.forEach((s, i) => {
    lines.push(`${i + 1}. [${s.name}](#${s.slug})`);
  });
  lines.push("");

  for (const section of sections) {
    lines.push(`---\n\n## ${section.name} {#${section.slug}}\n`);
    lines.push(`**Screenshot:** \`${path.relative(DOCS_DIR, section.screenshot)}\`\n`);

    // Text data
    for (const sub of section.subsections) {
      if (sub.pairs.length > 0) {
        lines.push("### Extracted Data\n");
        lines.push("| Label | Value |");
        lines.push("|---|---|");
        sub.pairs.forEach(p => {
          const val = p.value.replace(/\n/g, " ").slice(0, 200);
          lines.push(`| ${p.label} | ${val} |`);
        });
        lines.push("");
      }

      if (sub.rawText) {
        lines.push("### Raw Text\n");
        lines.push("```");
        lines.push(sub.rawText.slice(0, 1500));
        if (sub.rawText.length > 1500) lines.push("… (truncated)");
        lines.push("```\n");
      }
    }

    // Assets
    if (section.assets.length > 0) {
      lines.push(`### Assets (${section.assets.length})\n`);
      lines.push("| # | Type | URL | Local |");
      lines.push("|---|---|---|---|");
      section.assets.forEach((a, i) => {
        const local = a.localFile ? `\`${path.basename(a.localFile)}\`` : "—";
        const shortUrl = a.url.slice(0, 80) + (a.url.length > 80 ? "…" : "");
        lines.push(`| ${i + 1} | ${a.type} | ${shortUrl} | ${local} |`);
      });
      lines.push("");
    } else {
      lines.push("### Assets\n\n_None found._\n");
    }
  }

  lines.push("---\n");
  lines.push("## Selector Reference\n");
  lines.push("| Element | Confirmed Selector |");
  lines.push("|---|---|");
  lines.push("| Nav items | `.nav-item`, `.sub-item` |");
  lines.push("| Page content | `.page-container > .page-content` |");
  lines.push("| Label/value pairs | `.label` + next sibling, `.title-medium` + `.body-small` |");
  lines.push("| Images | `img[src]` + CSS `background-image` on `.page-content *` |");
  lines.push("");

  return lines.join("\n");
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

  console.log("=== Pomelli Explorer ===");
  console.log(`Brand: ${brandUrl}`);
  console.log(`Mode:  ${HEADED ? "headed" : "headless"}\n`);

  const browser = await chromium.launch({ headless: !HEADED, slowMo: HEADED ? 80 : 0 });
  let context: BrowserContext | null = null;
  let page: Page | null = null;

  try {
    context = await browser.newContext({ storageState: SESSION_PATH });
    page = await context.newPage();

    // Network capture — collects all image responses
    const capturedImages = new Map<string, Buffer>();
    setupNetworkCapture(page, capturedImages);

    // 1. Navigate and drive to content_ready
    console.log("[1/4] Navigating to Pomelli and reaching content…");
    await page.goto(POMELLI_URL, { waitUntil: "domcontentloaded", timeout: 30_000 });
    await page.waitForFunction(() => document.querySelectorAll("button").length > 0, { timeout: 15_000 });
    await driveToAnySection(page, brandUrl);

    // 2. Discover nav items
    console.log("\n[2/4] Mapping navigation…");
    await sleep(2000); // let nav render
    const navItems = await getNavItems(page);
    console.log(`  Found ${navItems.length} nav item(s):`);
    navItems.forEach(n => console.log(`    ${"  ".repeat(n.depth - 1)}- ${n.name}`));

    // 3. Explore each section
    console.log("\n[3/4] Exploring sections…");
    const sections: SectionData[] = [];

    if (navItems.length === 0) {
      // No nav items found — capture current page as a single section
      console.log("  No .nav-item found — capturing current view");
      capturedImages.clear();
      await sleep(3000);
      const slug = "main";
      const sectionDir = path.join(OUT_DIR, slug);
      fs.mkdirSync(sectionDir, { recursive: true });
      const ssPath = path.join(sectionDir, "screenshot.png");
      await page.screenshot({ path: ssPath });
      const rawText = await getRawPageText(page);
      const pairs = await extractLabelValuePairs(page);
      const domUrls = await extractImageUrls(page);
      sections.push({
        name: "Main",
        slug,
        subsections: [{ name: "main", pairs, rawText }],
        screenshot: ssPath,
        assets: domUrls.map(url => ({ url, type: "img" as const })),
      });
    } else {
      for (const navItem of navItems) {
        capturedImages.clear();
        await sleep(1000);
        const data = await exploreSection(page, navItem, capturedImages);
        sections.push(data);
      }
    }

    // 4. Generate MD
    console.log("\n[4/4] Generating docs/pomelli-map.md…");
    const md = generateMarkdown(brandUrl, sections);
    const mdPath = path.join(DOCS_DIR, "pomelli-map.md");
    fs.writeFileSync(mdPath, md, "utf-8");
    console.log(`  ✓ Saved: ${mdPath}`);

    const totalAssets = sections.reduce((n, s) => n + s.assets.length, 0);
    console.log(`\n=== EXPLORATION COMPLETE ===`);
    console.log(`Sections: ${sections.length} | Assets found: ${totalAssets}`);
    console.log(`Map:      ${mdPath}`);
    console.log(`Output:   ${OUT_DIR}`);
  } catch (err) {
    if (page) await page.screenshot({ path: path.join(OUT_DIR, "failure.png") }).catch(() => {});
    throw err;
  } finally {
    await context?.close();
    await browser.close();
  }
}

main().catch(err => {
  console.error("\n=== EXPLORATION FAILED ===");
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
