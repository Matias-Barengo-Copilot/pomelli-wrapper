import { load } from "cheerio";
import { createHash } from "crypto";
import { writeFileSync, mkdirSync } from "fs";
import { join, extname } from "path";
import { logger } from "../lib/logger.js";
import type { AssetRecord } from "../lib/types.js";
import type { PageCookie } from "./dom-parser.js";

const STEP = "asset-downloader";

const CONTENT_TYPE_TO_EXT: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "image/svg+xml": ".svg",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
};

interface DiscoveredUrl {
  url: string;
  type: "image" | "video" | "unknown";
}

export async function downloadSectionAssets(
  html: string,
  cookies: PageCookie[],
  assetsDir: string,
  pageUrl: string
): Promise<AssetRecord[]> {
  mkdirSync(assetsDir, { recursive: true });

  const discovered = discoverAssetUrls(html, pageUrl);
  if (!discovered.length) {
    logger.info(STEP, "no asset URLs found in DOM");
    return [];
  }

  const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");
  const results: AssetRecord[] = [];
  let counter = 0;

  for (const { url, type } of discovered) {
    counter++;
    const id = `asset_${String(counter).padStart(3, "0")}`;
    try {
      const record = await downloadOne(url, type, id, assetsDir, cookieHeader);
      results.push(record);
      logger.info(STEP, "downloaded", {
        id,
        type: record.type,
        size: record.size_bytes,
        url: url.substring(0, 80),
      });
    } catch (e) {
      logger.warn(STEP, "download failed — skipping", {
        url: url.substring(0, 80),
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  logger.info(STEP, "section assets complete", {
    found: discovered.length,
    downloaded: results.length,
    failed: discovered.length - results.length,
  });

  return results;
}

async function downloadOne(
  url: string,
  hint: DiscoveredUrl["type"],
  id: string,
  assetsDir: string,
  cookieHeader: string
): Promise<AssetRecord> {
  const res = await fetch(url, {
    headers: { Cookie: cookieHeader },
  });

  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);

  const contentType = res.headers.get("content-type") ?? "application/octet-stream";
  const buffer = Buffer.from(await res.arrayBuffer());
  const sha256 = createHash("sha256").update(buffer).digest("hex");
  const mimeType = contentType.split(";")[0].trim();

  const ext = CONTENT_TYPE_TO_EXT[mimeType] ?? extname(new URL(url).pathname) ?? ".bin";
  const filename = `${id}${ext}`;

  writeFileSync(join(assetsDir, filename), buffer);

  return {
    id,
    type: mimeType.startsWith("video/") ? "video" : mimeType.startsWith("image/") ? "image" : hint,
    filename: `assets/${filename}`,
    source_url: url,
    mime_type: mimeType,
    width: null,
    height: null,
    size_bytes: buffer.length,
    sha256,
  };
}

function discoverAssetUrls(html: string, pageUrl: string): DiscoveredUrl[] {
  const $ = load(html);
  const seen = new Set<string>();
  const results: DiscoveredUrl[] = [];

  const add = (rawUrl: string | undefined, type: DiscoveredUrl["type"]): void => {
    if (!rawUrl?.trim()) return;
    const resolved = resolveUrl(rawUrl.trim(), pageUrl);
    if (!resolved || seen.has(resolved)) return;
    if (!resolved.startsWith("https://") && !resolved.startsWith("http://")) return;
    seen.add(resolved);
    results.push({ url: resolved, type });
  };

  // Standard image tags
  $("img[src]").each((_, el) => add($(el).attr("src"), "image"));
  $("img[data-src]").each((_, el) => add($(el).attr("data-src"), "image"));

  // srcset — pick the last entry (highest resolution)
  $("img[srcset]").each((_, el) => {
    const srcset = $(el).attr("srcset") ?? "";
    const last = srcset.split(",").map((s) => s.trim().split(/\s+/)[0]).at(-1);
    add(last, "image");
  });

  // Video tags
  $("video[src]").each((_, el) => add($(el).attr("src"), "video"));
  $("source[src]").each((_, el) => {
    const type = $(el).attr("type") ?? "";
    add($(el).attr("src"), type.startsWith("video/") ? "video" : "image");
  });

  // CSS background-image inline styles
  $("[style]").each((_, el) => {
    const style = $(el).attr("style") ?? "";
    for (const match of style.matchAll(/url\(['"]?([^'")\s]+)['"]?\)/g)) {
      add(match[1], "image");
    }
  });

  return results;
}

function resolveUrl(raw: string, base: string): string | null {
  try {
    return new URL(raw, base).href;
  } catch {
    return null;
  }
}
