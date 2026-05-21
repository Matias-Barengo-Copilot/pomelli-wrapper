import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import type { RunManifest } from "../runner.js";

let _client: SupabaseClient | null = null;

function sb(): SupabaseClient | null {
  if (_client) return _client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  _client = createClient(url, key);
  return _client;
}

const bucket = () => process.env.SUPABASE_BUCKET ?? "runs";

function allFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...allFiles(full));
    else results.push(full);
  }
  return results;
}

function mime(filePath: string): string {
  const map: Record<string, string> = {
    ".png":  "image/png",
    ".jpg":  "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".gif":  "image/gif",
    ".svg":  "image/svg+xml",
    ".json": "application/json",
    ".md":   "text/markdown; charset=utf-8",
    ".txt":  "text/plain; charset=utf-8",
  };
  return map[path.extname(filePath).toLowerCase()] ?? "application/octet-stream";
}

/** Upload all files in runDir to `{runId}/…` in Supabase Storage. No-op if Supabase is not configured. */
export async function uploadRun(
  runDir: string,
  runId: string,
  log: (m: string) => void = () => {},
): Promise<void> {
  const client = sb();
  if (!client) return;

  const files = allFiles(runDir);
  log(`[supabase] uploading ${files.length} file(s) for ${runId}…`);

  await Promise.all(
    files.map(async (filePath) => {
      const rel  = path.relative(runDir, filePath).replace(/\\/g, "/");
      const dest = `${runId}/${rel}`;
      const buf  = fs.readFileSync(filePath);
      const { error } = await client.storage
        .from(bucket())
        .upload(dest, buf, { contentType: mime(filePath), upsert: true });
      if (error) log(`[supabase] ⚠ ${rel}: ${error.message}`);
    }),
  );

  log(`[supabase] ✓ upload complete`);
}

/** Return the public URL for a file inside a run. Returns null if Supabase is not configured. */
export function publicUrl(runId: string, subPath: string): string | null {
  const client = sb();
  if (!client) return null;
  const { data } = client.storage.from(bucket()).getPublicUrl(`${runId}/${subPath}`);
  return data.publicUrl ?? null;
}

/** List all run IDs stored in Supabase (top-level "folders" in the bucket). */
export async function listRuns(): Promise<string[]> {
  const client = sb();
  if (!client) return [];
  const { data, error } = await client.storage
    .from(bucket())
    .list("", { limit: 200, sortBy: { column: "name", order: "desc" } });
  if (error || !data) return [];
  // Directories (runs) have id === null in Supabase Storage
  return data.filter(item => item.id === null).map(item => item.name);
}

/** Download and parse a manifest.json from Supabase. Returns null on error. */
export async function fetchManifest(runId: string): Promise<RunManifest | null> {
  const client = sb();
  if (!client) return null;
  const { data, error } = await client.storage
    .from(bucket())
    .download(`${runId}/manifest.json`);
  if (error || !data) return null;
  try {
    return JSON.parse(await data.text()) as RunManifest;
  } catch {
    return null;
  }
}
