import type { RunManifest, RunSummary } from "./types";

// In production, VITE_API_URL points to the hosted Express backend.
// In dev, it's empty so Vite's proxy handles /api/* → localhost:3001.
const API = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";

export async function startRun(brandUrl: string): Promise<{ runId: string }> {
  const res = await fetch(`${API}/api/runs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ brandUrl }),
  });
  const data = await res.json() as { runId?: string; error?: string };
  if (!res.ok) throw new Error(data.error ?? "Failed to start run");
  return data as { runId: string };
}

export async function getRun(runId: string): Promise<RunManifest> {
  const res = await fetch(`${API}/api/runs/${runId}`);
  if (!res.ok) throw new Error("Run not found");
  return res.json() as Promise<RunManifest>;
}

export async function listRuns(): Promise<RunSummary[]> {
  const res = await fetch(`${API}/api/runs`);
  if (!res.ok) throw new Error("Failed to fetch runs");
  return res.json() as Promise<RunSummary[]>;
}

export function assetUrl(runId: string, sectionName: string, file: string): string {
  return `${API}/api/runs/${runId}/file/sections/${sectionName}/${file.replace(/\\/g, "/")}`;
}

export function streamUrl(runId: string): string {
  return `${API}/api/runs/${runId}/stream`;
}

export async function checkSession(): Promise<{ active: boolean }> {
  const res = await fetch(`${API}/api/session`);
  return res.json() as Promise<{ active: boolean }>;
}

export async function startLogin(): Promise<void> {
  const res = await fetch(`${API}/api/login/start`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to start login");
}

export async function confirmLogin(): Promise<void> {
  const res = await fetch(`${API}/api/login/confirm`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to confirm login");
}

/** Ping the health endpoint. Returns true if the server responds within timeoutMs. */
export async function pingHealth(timeoutMs = 3000): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(`${API}/api/health`, { signal: controller.signal });
    clearTimeout(timer);
    return res.ok;
  } catch {
    return false;
  }
}

export async function pollSession(intervalMs = 2000, maxAttempts = 30): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, intervalMs));
    const { active } = await checkSession();
    if (active) return true;
  }
  return false;
}
