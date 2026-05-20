import type { RunManifest, RunSummary } from "./types";

export async function startRun(brandUrl: string): Promise<{ runId: string }> {
  const res = await fetch("/api/runs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ brandUrl }),
  });
  const data = await res.json() as { runId?: string; error?: string };
  if (!res.ok) throw new Error(data.error ?? "Failed to start run");
  return data as { runId: string };
}

export async function getRun(runId: string): Promise<RunManifest> {
  const res = await fetch(`/api/runs/${runId}`);
  if (!res.ok) throw new Error("Run not found");
  return res.json() as Promise<RunManifest>;
}

export async function listRuns(): Promise<RunSummary[]> {
  const res = await fetch("/api/runs");
  if (!res.ok) throw new Error("Failed to fetch runs");
  return res.json() as Promise<RunSummary[]>;
}

export function assetUrl(runId: string, sectionName: string, file: string): string {
  return `/api/runs/${runId}/file/sections/${sectionName}/${file.replace(/\\/g, "/")}`;
}

export async function checkSession(): Promise<{ active: boolean }> {
  const res = await fetch("/api/session");
  return res.json() as Promise<{ active: boolean }>;
}

export async function startLogin(): Promise<void> {
  const res = await fetch("/api/login/start", { method: "POST" });
  if (!res.ok) throw new Error("Failed to start login");
}

export async function confirmLogin(): Promise<void> {
  const res = await fetch("/api/login/confirm", { method: "POST" });
  if (!res.ok) throw new Error("Failed to confirm login");
}

export async function pollSession(intervalMs = 2000, maxAttempts = 30): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, intervalMs));
    const { active } = await checkSession();
    if (active) return true;
  }
  return false;
}
