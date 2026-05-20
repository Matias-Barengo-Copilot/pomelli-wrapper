import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

import { VALID_SECTIONS, type PlaSection } from "./navigate/pomelli.js";
import { runWrap, DEFAULT_SESSION_PATH, DEFAULT_OUTPUTS_DIR } from "./runner.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Args ──────────────────────────────────────────────────────────────────────

function parseArgs() {
  const argv = process.argv.slice(2);
  const get  = (flag: string) => { const i = argv.indexOf(flag); return i !== -1 ? argv[i + 1] : undefined; };

  const brandUrl = get("--url");
  if (!brandUrl) {
    console.error("Usage: npm run wrap -- --url <brand-url> [--sections <s1,s2,...|all>] [--out <dir>] [--headless]");
    process.exit(1);
  }
  try { new URL(brandUrl!); } catch {
    console.error(`Invalid URL: ${brandUrl}`); process.exit(1);
  }

  const raw = get("--sections");
  const sections: PlaSection[] = (!raw || raw === "all")
    ? [...VALID_SECTIONS]
    : (raw.split(",").map(s => s.trim().toLowerCase()).filter(s =>
        (VALID_SECTIONS as readonly string[]).includes(s)
      ) as PlaSection[]);

  if (sections.length === 0) {
    console.error(`No valid sections. Valid: ${VALID_SECTIONS.join(", ")}`); process.exit(1);
  }

  return {
    brandUrl: brandUrl!,
    sections,
    outBase:  get("--out") ?? DEFAULT_OUTPUTS_DIR,
    headless: argv.includes("--headless"),
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const { brandUrl, sections, outBase, headless } = parseArgs();

  if (!fs.existsSync(DEFAULT_SESSION_PATH)) {
    console.error(`Session not found at ${DEFAULT_SESSION_PATH}. Run \`npm run login\` first.`);
    process.exit(1);
  }

  const manifest = await runWrap({
    brandUrl,
    sections,
    outBase,
    headless,
    sessionPath: DEFAULT_SESSION_PATH,
    log: (msg) => console.log(msg),
  });

  const durationSec = Math.round(
    (new Date(manifest.completedAt).getTime() - new Date(manifest.startedAt).getTime()) / 1000,
  );
  const totalAssets = manifest.sections.reduce((n, s) => n + s.assetCount, 0);

  console.log(`\n${"─".repeat(54)}`);
  console.log(`Status:   ${manifest.status}`);
  console.log(`Sections: ${manifest.sections.length}/${sections.length}`);
  console.log(`Assets:   ${totalAssets}`);
  console.log(`Duration: ${durationSec}s`);
  if (manifest.error) console.log(`Error:    ${manifest.error}`);
  console.log(`${"─".repeat(54)}\n`);

  process.exit(manifest.status === "completed" ? 0 : 1);
}

main().catch(err => {
  console.error(`[cli] fatal:`, err instanceof Error ? err.message : err);
  process.exit(1);
});
