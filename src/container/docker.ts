import { exec, execFile } from "child_process";
import { promisify } from "util";
import { readFile } from "fs/promises";
import { join } from "path";
import { CONTAINER_NAME } from "../lib/constants.js";
import { logger } from "../lib/logger.js";

const execAsync = promisify(exec);
const execFileAsync = promisify(execFile);
const MAX_BUFFER = 20 * 1024 * 1024; // 20 MB for screenshot base64

const STEP = "docker";

// execFileInContainer bypasses the Windows shell (cmd.exe) entirely by using
// execFile — the bash command string goes straight to docker without any
// cmd.exe quote-mangling.
async function execFileInContainer(bashCommand: string): Promise<string> {
  const { stdout } = await execFileAsync(
    "docker",
    ["exec", CONTAINER_NAME, "bash", "-c", bashCommand],
    { maxBuffer: MAX_BUFFER }
  );
  return stdout;
}

export async function isContainerRunning(): Promise<boolean> {
  try {
    const { stdout } = await execAsync(
      `docker inspect -f "{{.State.Running}}" ${CONTAINER_NAME}`
    );
    return stdout.trim() === "true";
  } catch {
    return false;
  }
}

export async function execInContainer(command: string): Promise<string> {
  const { stdout, stderr } = await execAsync(
    `docker exec ${CONTAINER_NAME} bash -c ${JSON.stringify(command)}`,
    { maxBuffer: MAX_BUFFER }
  );
  if (stderr) logger.warn(STEP, "stderr", { cmd: command.substring(0, 60), stderr: stderr.substring(0, 200) });
  return stdout;
}

export async function copyFromContainer(containerPath: string, localPath: string): Promise<void> {
  await execAsync(`docker cp ${CONTAINER_NAME}:${containerPath} ${localPath}`);
}

export async function takeScreenshotBase64(): Promise<string> {
  await execInContainer("DISPLAY=:1 scrot -z /tmp/pomelli_ss.png");
  const b64 = await execInContainer("base64 -w 0 /tmp/pomelli_ss.png");
  return b64.trim();
}

export async function saveScreenshotToFile(localPath: string): Promise<void> {
  await execInContainer("DISPLAY=:1 scrot -z /tmp/pomelli_ss.png");
  await copyFromContainer("/tmp/pomelli_ss.png", localPath);
}

export async function mouseMove(x: number, y: number): Promise<void> {
  await execInContainer(`DISPLAY=:1 xdotool mousemove --sync ${x} ${y}`);
}

export async function mouseClick(x: number, y: number, button = 1): Promise<void> {
  await execInContainer(`DISPLAY=:1 xdotool mousemove --sync ${x} ${y} click ${button}`);
}

export async function mouseDoubleClick(x: number, y: number): Promise<void> {
  await execInContainer(`DISPLAY=:1 xdotool mousemove --sync ${x} ${y} click --repeat 2 --delay 100 1`);
}

export async function mouseDrag(x1: number, y1: number, x2: number, y2: number): Promise<void> {
  await execInContainer(
    `DISPLAY=:1 xdotool mousemove --sync ${x1} ${y1} mousedown 1 mousemove --sync ${x2} ${y2} mouseup 1`
  );
}

export async function typeText(text: string): Promise<void> {
  // xdotool type can have issues with special chars; use --clearmodifiers for safety
  await execInContainer(`DISPLAY=:1 xdotool type --clearmodifiers --delay 30 ${JSON.stringify(text)}`);
}

export async function pressKey(key: string): Promise<void> {
  await execInContainer(`DISPLAY=:1 xdotool key --clearmodifiers ${key}`);
}

export async function scroll(x: number, y: number, direction: "up" | "down" | "left" | "right", count = 3): Promise<void> {
  const button = direction === "up" ? 4 : direction === "down" ? 5 : direction === "left" ? 6 : 7;
  const clicks = Array(count).fill(`click ${button}`).join(" ");
  await execInContainer(`DISPLAY=:1 xdotool mousemove --sync ${x} ${y} ${clicks}`);
}

/**
 * Click an element in the current Firefox tab via CDP (puppeteer-core).
 * Connects to Firefox's remote debugging port (exposed via socat on CDP_HOST:9222).
 * Falls back to text-content search when the CSS selector yields nothing.
 *
 * This replaces the previous javascript:-URL-in-address-bar approach, which
 * modern Firefox blocks as a phishing prevention measure.
 */
export async function clickElementInBrowser(selectorOrText: string): Promise<void> {
  // Dynamic import to avoid loading puppeteer-core on every action
  const puppeteer = await import("puppeteer-core");
  const cdpHost = process.env.CDP_HOST ?? "localhost";
  const cdpPort = process.env.CDP_PORT ?? "9222";

  let browser: import("puppeteer-core").Browser | null = null;
  try {
    browser = await puppeteer.connect({
      browserURL: `http://${cdpHost}:${cdpPort}`,
      defaultViewport: null,
    });

    const pages = await browser.pages();
    const page = pages[0];
    if (!page) throw new Error("No open page found in Firefox via CDP");

    const result: string = await page.evaluate((q: string) => {
      let el: Element | null = document.querySelector(q);
      if (!el) {
        const candidates = document.querySelectorAll("button,a,[role=button],[role=link]");
        for (const c of candidates) {
          if (c.textContent?.trim().includes(q)) {
            el = c;
            break;
          }
        }
      }
      if (el) {
        el.scrollIntoView({ block: "center" });
        (el as HTMLElement).click();
        return `clicked:${el.tagName}`;
      }
      return "not_found";
    }, selectorOrText);

    if (result === "not_found") {
      throw new Error(`Element not found: ${selectorOrText}`);
    }
    logger.info(STEP, "click_element via CDP", { selector: selectorOrText, result });
  } finally {
    // disconnect (not close) — leave Firefox running
    browser?.disconnect();
  }
}
