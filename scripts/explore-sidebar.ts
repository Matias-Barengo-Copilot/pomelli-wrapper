/**
 * explore-sidebar.ts
 *
 * Navigates to the Pomelli campaigns page (where the sidebar is visible),
 * expands the sidebar, then dumps:
 *   1. The full sidebar outerHTML → docs/sidebar-dump.html
 *   2. A report of every element that contains each nav label →  docs/sidebar-elements.txt
 *
 * Usage:
 *   npx tsx scripts/explore-sidebar.ts
 */

import { chromium } from "playwright";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SESSION_PATH = path.resolve(__dirname, "../google-session.json");
const DOCS_DIR     = path.resolve(__dirname, "../docs");
const POMELLI_URL  = "https://labs.google.com/pomelli/";

const NAV_LABELS = ["Business DNA", "Campaigns", "Photoshoot", "Brand Book", "Websites"];

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  if (!fs.existsSync(SESSION_PATH)) {
    console.error("No session — run `npm run login` first.");
    process.exit(1);
  }
  fs.mkdirSync(DOCS_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: false, slowMo: 80 });
  const context = await browser.newContext({ storageState: SESSION_PATH });
  const page    = await context.newPage();

  try {
    console.log("Navigating to Pomelli…");
    await page.goto(POMELLI_URL, { waitUntil: "domcontentloaded", timeout: 30_000 });
    await page.waitForFunction(() => document.querySelectorAll("button").length > 0, { timeout: 15_000 });

    // Dismiss popup if present
    const popup = await page.locator("button[cdkfocusinitial]").count();
    if (popup > 0) {
      console.log("Dismissing popup…");
      await page.locator("button[cdkfocusinitial]").first().click({ timeout: 5_000 });
      await sleep(700);
    }

    // Expand sidebar
    console.log("Expanding sidebar (button.expand-button)…");
    const expandClicked = await page.locator("button.expand-button").first()
      .click({ timeout: 5_000 }).then(() => true).catch(() => false);
    console.log(`  expand button clicked: ${expandClicked}`);
    await sleep(1200);

    // ── 1. Dump sidebar HTML ──────────────────────────────────────────────────
    console.log("Dumping sidebar HTML…");
    const sidebarHtml: string = await page.evaluate(() => {
      // Try common sidebar selectors
      const candidates = [
        "mat-sidenav",
        "mat-drawer",
        "[class*='sidenav']",
        "[class*='sidebar']",
        "[class*='nav-container']",
        "nav",
        "aside",
      ];
      for (const sel of candidates) {
        const el = document.querySelector(sel);
        if (el) return `<!-- selector: ${sel} -->\n${el.outerHTML}`;
      }
      // Fallback: first 200 children of body
      return "<!-- no sidebar found — dumping body -->\n" + document.body.innerHTML.slice(0, 50_000);
    });

    const sidebarDumpPath = path.join(DOCS_DIR, "sidebar-dump.html");
    fs.writeFileSync(sidebarDumpPath, sidebarHtml);
    console.log(`  ✓ sidebar HTML saved → ${sidebarDumpPath}`);

    // ── 2. Find every element containing each nav label ───────────────────────
    console.log("Analysing nav label elements…");
    const report: string[] = ["=== Nav element analysis ===\n"];

    for (const label of NAV_LABELS) {
      const entries: string = await page.evaluate((lbl) => {
        const results: string[] = [];
        const all = document.querySelectorAll("*");

        all.forEach(el => {
          const text = (el as HTMLElement).innerText?.trim() ?? "";
          // Match elements whose trimmed innerText STARTS with the label or equals it closely
          if (!text.includes(lbl)) return;
          if (text.length > 200) return; // skip large containers

          const tag       = el.tagName.toLowerCase();
          const id        = el.id ? `#${el.id}` : "";
          const classes   = el.className && typeof el.className === "string"
            ? "." + el.className.trim().replace(/\s+/g, ".")
            : "";
          const href      = (el as HTMLAnchorElement).href ?? "";
          const role      = el.getAttribute("role") ?? "";
          const tabindex  = el.getAttribute("tabindex") ?? "";
          const clickable = el.getAttribute("ng-reflect-router-link") ??
                            el.getAttribute("routerlink") ??
                            el.getAttribute("(click)") ?? "";

          results.push(
            `  tag:      ${tag}${id}${classes}` +
            `\n  text:     ${JSON.stringify(text.slice(0, 120))}` +
            `\n  href:     ${href || "(none)"}` +
            `\n  role:     ${role || "(none)"}` +
            `\n  tabindex: ${tabindex || "(none)"}` +
            `\n  ng-reflect-router-link: ${clickable || "(none)"}` +
            `\n  ---`
          );
        });

        return results.slice(0, 6).join("\n"); // top 6 matches per label
      }, label);

      report.push(`\n### "${label}"\n${entries || "  (no elements found)"}`);
    }

    // ── 3. Also report all expand-button candidates ────────────────────────────
    const expandReport: string = await page.evaluate(() => {
      const results: string[] = [];
      document.querySelectorAll("button").forEach(btn => {
        const text    = btn.innerText?.trim() ?? "";
        const classes = btn.className ?? "";
        results.push(`  text: "${text}" | classes: "${classes}"`);
      });
      return results.slice(0, 30).join("\n");
    });
    report.push(`\n\n### All <button> elements (first 30)\n${expandReport}`);

    const reportPath = path.join(DOCS_DIR, "sidebar-elements.txt");
    fs.writeFileSync(reportPath, report.join("\n"));
    console.log(`  ✓ element report saved → ${reportPath}`);

    console.log("\n=== Done — share docs/sidebar-dump.html and docs/sidebar-elements.txt ===");
  } finally {
    await context.close();
    await browser.close();
  }
}

main().catch(err => {
  console.error("FAILED:", err instanceof Error ? err.message : err);
  process.exit(1);
});
