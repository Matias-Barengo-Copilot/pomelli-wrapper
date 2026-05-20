import { join } from "path";
import { writeFileSync } from "fs";
import { saveScreenshotToFile } from "../container/docker.js";
import { createSectionDirs, buildSectionDir } from "../storage/local.js";
import { captureCurrentPage } from "./dom-parser.js";
import { downloadSectionAssets } from "./asset-downloader.js";
import { logger } from "../lib/logger.js";
import type { SectionName, SectionRecord } from "../lib/types.js";

const STEP = "record-section";

export async function recordSection(runId: string, name: SectionName): Promise<SectionRecord> {
  logger.info(STEP, "recording section", { name });
  createSectionDirs(runId, name);

  const sectionDir = buildSectionDir(runId, name);

  // Screenshot is always attempted first — independent of CDP
  await saveScreenshotToFile(join(sectionDir, "screenshot.png"));
  logger.info(STEP, "screenshot saved");

  let domHtmlRelPath: string | null = null;
  let assets: SectionRecord["assets"] = [];

  try {
    const capture = await captureCurrentPage();

    writeFileSync(join(sectionDir, "dom.html"), capture.html, "utf-8");
    domHtmlRelPath = `sections/${name}/dom.html`;
    logger.info(STEP, "DOM saved", { bytes: capture.html.length });

    assets = await downloadSectionAssets(
      capture.html,
      capture.cookies,
      join(sectionDir, "assets"),
      capture.pageUrl
    );
    logger.info(STEP, "assets saved", { count: assets.length });
  } catch (e) {
    // CDP failure is non-fatal: section is still recorded with screenshot only
    logger.warn(STEP, "DOM/asset capture failed — screenshot only", {
      name,
      error: e instanceof Error ? e.message : String(e),
    });
  }

  return {
    name,
    captured_at: new Date().toISOString(),
    screenshot: `sections/${name}/screenshot.png`,
    dom_html: domHtmlRelPath,
    assets,
  };
}
