/**
 * npm run login
 *
 * Opens a visible Chromium window navigated to Pomelli. The user logs into
 * Google manually, then presses Enter in this terminal to export the session
 * as google-session.json via Playwright storageState.
 *
 * Run once per machine. Re-run when the session expires.
 */

import { chromium } from "playwright";
import * as readline from "readline";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SESSION_PATH = path.resolve(__dirname, "../../google-session.json");
const POMELLI_URL = "https://labs.google.com/pomelli/";

function waitForEnter(): Promise<void> {
  const rl = readline.createInterface({ input: process.stdin });
  return new Promise((resolve) => {
    rl.once("line", () => {
      rl.close();
      resolve();
    });
  });
}

async function main() {
  // Use the system-installed Chrome instead of Playwright's bundled Chromium.
  // Google blocks login on Playwright Chromium (detects it as an automated/unsafe browser).
  // Chrome has a trusted fingerprint and accepts Google login normally.
  const browser = await chromium.launch({
    headless: false,
    channel: "chrome",
    args: ["--disable-blink-features=AutomationControlled"],
    ignoreDefaultArgs: ["--enable-automation"],
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("Navigating to Pomelli…");
  await page.goto(POMELLI_URL, { waitUntil: "domcontentloaded" });

  console.log("\nLog into Google in the browser window that just opened.");
  console.log("When you can see Pomelli, press Enter here to save the session.\n");

  await waitForEnter();

  await context.storageState({ path: SESSION_PATH });
  console.log(`Session saved to: ${SESSION_PATH}`);

  await browser.close();
}

main().catch((err) => {
  console.error("Login failed:", err);
  process.exit(1);
});
