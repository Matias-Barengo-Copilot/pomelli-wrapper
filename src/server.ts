import "dotenv/config";
import express from "express";
import cors from "cors";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { EventEmitter } from "events";
import { spawn, type ChildProcess } from "child_process";

import { VALID_SECTIONS, type PlaSection } from "./navigate/pomelli.js";
import { runWrap, DEFAULT_SESSION_PATH, DEFAULT_OUTPUTS_DIR, DEFAULT_SECTIONS, type RunManifest } from "./runner.js";
import { uploadRun, publicUrl, listRuns, fetchManifest } from "./lib/supabase-storage.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLIENT_DIST = path.resolve(__dirname, "../client/dist");
const OUTPUTS_DIR = process.env.OUTPUTS_DIR
  ? path.resolve(process.env.OUTPUTS_DIR)
  : DEFAULT_OUTPUTS_DIR;

// ── Decode Google session from env var (production/Render) ─────────────────
// Set GOOGLE_SESSION_B64 = base64-encoded contents of google-session.json
if (process.env.GOOGLE_SESSION_B64 && !fs.existsSync(DEFAULT_SESSION_PATH)) {
  try {
    fs.writeFileSync(
      DEFAULT_SESSION_PATH,
      Buffer.from(process.env.GOOGLE_SESSION_B64, "base64").toString("utf-8"),
    );
    console.log("[startup] google-session.json decoded from GOOGLE_SESSION_B64");
  } catch (err) {
    console.error("[startup] Failed to decode GOOGLE_SESSION_B64:", err);
  }
}

// ── Login process state ────────────────────────────────────────────────────

let loginChild: ChildProcess | null = null;

// ── In-memory active run state ─────────────────────────────────────────────

interface ActiveRun {
  runId: string;
  status: "running" | "completed" | "partial" | "failed";
  logs: string[];
  emitter: EventEmitter;
  manifest?: RunManifest;
}

let activeRun: ActiveRun | null = null;

// ── App ────────────────────────────────────────────────────────────────────

const app = express();
app.use(cors());
app.use(express.json());

// ── GET /api/health — cold-start probe ────────────────────────────────────

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

// ── POST /api/runs — start a run ───────────────────────────────────────────

app.post("/api/runs", (req, res) => {
  if (activeRun?.status === "running") {
    res.status(409).json({
      error: "A run is already in progress",
      runId: activeRun.runId,
    });
    return;
  }

  const { brandUrl, sections } = req.body as { brandUrl?: string; sections?: string[] };

  if (!brandUrl) {
    res.status(400).json({ error: "brandUrl is required" });
    return;
  }
  try { new URL(brandUrl); } catch {
    res.status(400).json({ error: "Invalid URL" });
    return;
  }

  if (!fs.existsSync(DEFAULT_SESSION_PATH)) {
    res.status(503).json({
      error: "Session not found — run `npm run login` first.",
    });
    return;
  }

  const resolvedSections: PlaSection[] = sections
    ? (sections.filter(s => (VALID_SECTIONS as readonly string[]).includes(s)) as PlaSection[])
    : [...DEFAULT_SECTIONS];

  const emitter = new EventEmitter();
  emitter.setMaxListeners(50);

  // We don't know the runId yet — runner generates it. Use a temp placeholder.
  // After runWrap resolves we update it. For the SSE subscription, clients poll
  // by runId returned from this endpoint, which we get from the manifest.
  const pendingRun: ActiveRun = {
    runId: "pending",
    status: "running",
    logs: [],
    emitter,
  };
  activeRun = pendingRun;

  const appendLog = (line: string) => {
    pendingRun.logs.push(line);
    emitter.emit("log", line);
  };

  void runWrap({
    brandUrl,
    sections: resolvedSections,
    outBase: OUTPUTS_DIR,
    headless: true,
    sessionPath: DEFAULT_SESSION_PATH,
    log: appendLog,
  }).then(async manifest => {
    pendingRun.runId    = manifest.runId;
    pendingRun.status   = manifest.status;
    pendingRun.manifest = manifest;
    // Upload to Supabase before emitting done so the client can access files immediately
    if (process.env.SUPABASE_URL) {
      const runDir = path.join(OUTPUTS_DIR, manifest.runId);
      await uploadRun(runDir, manifest.runId, appendLog).catch(err => {
        appendLog(`[supabase] upload error: ${err instanceof Error ? err.message : err}`);
      });
    }
    emitter.emit("done", { status: manifest.status, runId: manifest.runId });
  }).catch(err => {
    const msg = err instanceof Error ? err.message : String(err);
    appendLog(`FATAL: ${msg}`);
    pendingRun.status = "failed";
    emitter.emit("done", { status: "failed", runId: pendingRun.runId });
  });

  // We need to return a runId immediately, but runWrap generates it internally.
  // We use a special "current" alias that the client can use to poll for status.
  // The SSE endpoint resolves "current" to the active run.
  res.json({ runId: "current" });
});

// ── GET /api/runs/:runId/stream — SSE log stream ───────────────────────────

app.get("/api/runs/:runId/stream", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const send = (type: string, data: Record<string, unknown>) => {
    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify({ type, ...data })}\n\n`);
    }
  };

  const { runId } = req.params;
  const run = (runId === "current" || (activeRun && activeRun.runId === runId))
    ? activeRun
    : null;

  if (!run) {
    // Past run — check local disk first, then Supabase
    const manifestPath = path.join(OUTPUTS_DIR, runId, "manifest.json");
    if (fs.existsSync(manifestPath)) {
      try {
        const m = JSON.parse(fs.readFileSync(manifestPath, "utf-8")) as RunManifest;
        send("done", { status: m.status, runId: m.runId });
      } catch {
        send("error", { message: "Corrupt manifest" });
      }
    } else if (process.env.SUPABASE_URL) {
      const m = await fetchManifest(runId);
      if (m) send("done", { status: m.status, runId: m.runId });
      else    send("error", { message: "Run not found" });
    } else {
      send("error", { message: "Run not found" });
    }
    res.end();
    return;
  }

  // Replay buffered logs for reconnecting clients
  for (const line of run.logs) {
    send("log", { line });
  }

  if (run.status !== "running") {
    send("done", { status: run.status, runId: run.runId });
    res.end();
    return;
  }

  const onLog  = (line: string)                            => send("log",  { line });
  const onDone = ({ status, runId: id }: { status: string; runId: string }) =>
    { send("done", { status, runId: id }); res.end(); cleanup(); };

  const cleanup = () => {
    run.emitter.off("log",  onLog);
    run.emitter.off("done", onDone);
  };

  run.emitter.on("log",  onLog);
  run.emitter.on("done", onDone);
  req.on("close", cleanup);
});

// ── GET /api/runs/:runId — manifest ───────────────────────────────────────

app.get("/api/runs/:runId", async (req, res) => {
  const { runId } = req.params;

  if (runId === "current" && activeRun?.manifest) {
    res.json(activeRun.manifest);
    return;
  }

  if (activeRun?.runId === runId && activeRun.manifest) {
    res.json(activeRun.manifest);
    return;
  }

  const manifestPath = path.join(OUTPUTS_DIR, runId, "manifest.json");
  if (fs.existsSync(manifestPath)) {
    try {
      res.json(JSON.parse(fs.readFileSync(manifestPath, "utf-8")));
      return;
    } catch {
      // fall through to Supabase
    }
  }

  if (process.env.SUPABASE_URL) {
    const m = await fetchManifest(runId);
    if (m) { res.json(m); return; }
  }

  res.status(404).json({ error: "Run not found" });
});

// ── GET /api/runs — list past runs ────────────────────────────────────────

app.get("/api/runs", async (_req, res) => {
  // Production (Render): filesystem is ephemeral, read history from Supabase
  if (process.env.SUPABASE_URL) {
    try {
      const runIds   = await listRuns();
      const manifests = await Promise.all(runIds.map(id => fetchManifest(id)));
      const summaries = manifests
        .flatMap(m => {
          if (!m?.runId || !m.brandUrl) return [];
          const totalAssets = (m.sections ?? []).reduce((n, s) => n + (s.assetCount ?? 0), 0);
          return [{
            runId:       m.runId,
            brandUrl:    m.brandUrl,
            brandName:   m.overview?.brandName ?? null,
            startedAt:   m.startedAt,
            completedAt: m.completedAt,
            status:      m.status,
            totalAssets,
          }];
        })
        .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
      res.json(summaries);
      return;
    } catch {
      // Fall through to local disk on Supabase error
    }
  }

  // Dev / local: read from disk
  if (!fs.existsSync(OUTPUTS_DIR)) {
    res.json([]);
    return;
  }

  const dirs = fs.readdirSync(OUTPUTS_DIR)
    .filter(d => d.startsWith("run-"))
    .sort()
    .reverse();

  const summaries = dirs.flatMap(dir => {
    const manifestPath = path.join(OUTPUTS_DIR, dir, "manifest.json");
    if (!fs.existsSync(manifestPath)) return [];
    try {
      const m = JSON.parse(fs.readFileSync(manifestPath, "utf-8")) as RunManifest;
      if (!m.runId || !m.brandUrl) return [];
      const totalAssets = (m.sections ?? []).reduce((n, s) => n + (s.assetCount ?? 0), 0);
      return [{
        runId:       m.runId,
        brandUrl:    m.brandUrl,
        brandName:   m.overview?.brandName ?? null,
        startedAt:   m.startedAt,
        completedAt: m.completedAt,
        status:      m.status,
        totalAssets,
      }];
    } catch {
      return [];
    }
  });

  res.json(summaries);
});

// ── GET /api/runs/:runId/file/* — serve asset files ───────────────────────
// Express 5 (path-to-regexp v8) requires named wildcards: *filePath

app.get("/api/runs/:runId/file/*filePath", (req, res) => {
  const { runId } = req.params;
  const filePath = req.params as unknown as { filePath: string | string[] };
  const subPath  = Array.isArray(filePath.filePath)
    ? filePath.filePath.join("/")
    : (filePath.filePath ?? "");

  // Normalize slashes and split to prevent path traversal
  const parts       = subPath.replace(/\\/g, "/").split("/").filter(p => p && p !== ".." && p !== ".");
  const resolvedBase = path.resolve(OUTPUTS_DIR);
  const resolvedFile = path.resolve(OUTPUTS_DIR, runId, ...parts);

  if (!resolvedFile.startsWith(resolvedBase + path.sep) && resolvedFile !== resolvedBase) {
    res.status(403).json({ error: "Access denied" });
    return;
  }

  // In production, redirect to Supabase public URL
  if (process.env.SUPABASE_URL) {
    const url = publicUrl(runId, parts.join("/"));
    if (url) { res.redirect(302, url); return; }
  }

  if (!fs.existsSync(resolvedFile)) {
    res.status(404).json({ error: "File not found" });
    return;
  }

  res.sendFile(resolvedFile);
});

// ── GET /api/session — check session file presence ────────────────────────

app.get("/api/session", (_req, res) => {
  res.json({ active: fs.existsSync(DEFAULT_SESSION_PATH) });
});

// ── POST /api/login/start — spawn headed Chrome login process ─────────────

app.post("/api/login/start", (_req, res) => {
  if (loginChild && !loginChild.killed) {
    res.json({ ok: true, alreadyRunning: true });
    return;
  }
  try {
    loginChild = spawn("npx", ["tsx", "src/cli/login.ts"], {
      stdio: ["pipe", "inherit", "inherit"],
      shell: true,
      cwd: path.resolve(__dirname, ".."),
    });
    loginChild.on("exit", () => { loginChild = null; });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to start login process" });
  }
});

// ── POST /api/login/confirm — press Enter in the login process ────────────

app.post("/api/login/confirm", (_req, res) => {
  if (!loginChild || loginChild.killed) {
    res.status(400).json({ error: "No active login session" });
    return;
  }
  try {
    loginChild.stdin?.write("\n");
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to confirm login" });
  }
});

// ── Static serving (production) ────────────────────────────────────────────

if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
  // Express 5 catch-all: named wildcard
  app.get("/{*catchAll}", (_req, res) => {
    res.sendFile(path.join(CLIENT_DIST, "index.html"));
  });
}

// ── Start ──────────────────────────────────────────────────────────────────

const isDev = !fs.existsSync(CLIENT_DIST);
const PORT  = parseInt(process.env.PORT ?? (isDev ? "3001" : "3000"), 10);

app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
  if (isDev) console.log(`[server] dev mode — Vite frontend expected on http://localhost:3000`);
  else       console.log(`[server] serving client from ${CLIENT_DIST}`);
});
