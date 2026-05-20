/**
 * explore-delete-brand.ts
 *
 * Maps the DOM controls needed to delete / reset an existing Pomelli brand
 * so we can implement deleteBrandIfPresent() with confirmed selectors.
 *
 * Outputs:
 *   docs/delete-brand-dump.html  — full outerHTML of the DNA overview page content
 *   docs/delete-brand-report.txt — every button + actionable element on the page
 *
 * Usage:
 *   npm run explore-delete
 *
 * Requires an active brand session (run `npm run wrap` first to create one).
 */

import { chromium } from "playwright";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const SESSION_PATH = path.resolve(__dirname, "../google-session.json");
const DOCS_DIR     = path.resolve(__dirname, "../docs");
const POMELLI_URL  = "https://labs.google.com/pomelli/";

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
    if (await page.locator("button[cdkfocusinitial]").count() > 0) {
      console.log("Dismissing popup…");
      await page.locator("button[cdkfocusinitial]").first().click({ timeout: 5_000 });
      await sleep(700);
    }

    // Expand sidebar and navigate to Business DNA Overview
    console.log("Expanding sidebar…");
    const isExpanded = await page.locator("nav.nav-container.expanded").count() > 0;
    if (!isExpanded) {
      await page.locator("button.expand-button").first().click({ timeout: 5_000 });
      await sleep(800);
    }

    console.log("Clicking Business DNA nav group…");
    await page.locator("div.nav-group.has-flyout").first().click({ force: true, timeout: 5_000 });
    await sleep(500);

    console.log("Clicking Business DNA Overview sub-item…");
    await page.locator("div.nav-item.sub-item", { hasText: "Overview" }).first().click({ force: true, timeout: 5_000 });
    await sleep(2000);

    // ── 1. Dump full page content HTML ──────────────────────────────────────────
    console.log("Dumping page content HTML…");
    const pageHtml: string = await page.evaluate(() => {
      const el =
        document.querySelector(".page-content") as HTMLElement ??
        document.querySelector(".page-container") as HTMLElement ??
        document.querySelector("main") as HTMLElement ??
        document.body;
      return el?.outerHTML?.slice(0, 200_000) ?? "(empty)";
    });

    const htmlPath = path.join(DOCS_DIR, "delete-brand-dump.html");
    fs.writeFileSync(htmlPath, pageHtml);
    console.log(`  ✓ page HTML saved → ${htmlPath}`);

    // ── 2. Report ALL buttons on the page ───────────────────────────────────────
    console.log("Collecting all buttons…");
    const buttonReport: string = await page.evaluate(() => {
      const rows: string[] = [];
      document.querySelectorAll("button").forEach((btn, i) => {
        const text    = btn.innerText?.trim().replace(/\n/g, " ") ?? "";
        const classes = btn.className ?? "";
        const ariaL   = btn.getAttribute("aria-label") ?? "";
        rows.push(`[${String(i).padStart(3, "0")}] text: "${text.slice(0, 80)}" | aria-label: "${ariaL}" | classes: "${classes.slice(0, 120)}"`);
      });
      return rows.join("\n");
    });

    // ── 3. Report every mat-mdc-menu-trigger and what opens on click ─────────────
    console.log("Clicking every mat-mdc-menu-trigger button to capture menu items…");
    const menuTriggerCount: number = await page.evaluate(() =>
      document.querySelectorAll("button.mat-mdc-menu-trigger").length,
    );
    console.log(`  found ${menuTriggerCount} mat-mdc-menu-trigger button(s)`);

    const menuReports: string[] = [];
    for (let i = 0; i < menuTriggerCount; i++) {
      const btnText: string = await page.evaluate((idx) => {
        const btns = document.querySelectorAll("button.mat-mdc-menu-trigger");
        return (btns[idx] as HTMLElement)?.innerText?.trim().replace(/\n/g, " ") ?? "(unknown)";
      }, i);

      console.log(`  clicking menu trigger ${i}: "${btnText}"…`);
      await page.locator("button.mat-mdc-menu-trigger").nth(i).click({ timeout: 5_000 }).catch(() => {});
      await sleep(400);

      // Capture menu items rendered in overlay
      const menuItems: string = await page.evaluate(() => {
        const items = document.querySelectorAll(".mat-mdc-menu-item, [role='menuitem']");
        if (items.length === 0) return "(no menu items found)";
        return Array.from(items).map(el =>
          `    • "${(el as HTMLElement).innerText?.trim().replace(/\n/g, " ") ?? ""}"`
        ).join("\n");
      });

      menuReports.push(`\n### Menu trigger ${i}: "${btnText}"\n${menuItems}`);

      // Close menu
      await page.keyboard.press("Escape");
      await sleep(300);
    }

    // ── 4. Report elements containing delete/reset keywords ──────────────────────
    console.log("Scanning for delete/reset/new-brand text in DOM…");
    const deleteElements: string = await page.evaluate(() => {
      const keywords = /delete|reset|remove|start over|new brand|delete_forever/i;
      const rows: string[] = [];
      document.querySelectorAll("button, [role='button'], mat-icon, span.material-symbols-outlined, span.google-symbols").forEach(el => {
        const text = (el as HTMLElement).innerText?.trim() ?? "";
        if (!keywords.test(text)) return;
        const tag = el.tagName.toLowerCase();
        const cls = el.className && typeof el.className === "string" ? el.className.trim() : "";
        rows.push(`  tag: ${tag} | text: "${text.slice(0, 80)}" | classes: "${cls.slice(0, 120)}"`);
      });
      return rows.join("\n") || "  (none found)";
    });

    // ── Write report ─────────────────────────────────────────────────────────────
    const report = [
      "=== Delete Brand DOM Report ===\n",
      "## All Buttons\n",
      buttonReport,
      "\n\n## Mat Menu Trigger Results\n",
      menuReports.join("\n"),
      "\n\n## Elements with delete/reset keywords\n",
      deleteElements,
    ].join("\n");

    const reportPath = path.join(DOCS_DIR, "delete-brand-report.txt");
    fs.writeFileSync(reportPath, report);
    console.log(`  ✓ report saved → ${reportPath}`);

    console.log("\n=== Done — share docs/delete-brand-report.txt ===");
  } finally {
    await context.close();
    await browser.close();
  }
}

main().catch(err => {
  console.error("FAILED:", err instanceof Error ? err.message : err);
  process.exit(1);
});
