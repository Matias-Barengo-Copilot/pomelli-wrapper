import { mkdirSync, writeFileSync, appendFileSync } from "fs";
import { join } from "path";
import { OUTPUTS_DIR } from "../lib/constants.js";

export function buildRunDir(runId: string): string {
  return join(OUTPUTS_DIR, runId);
}

export function buildSectionDir(runId: string, sectionName: string): string {
  return join(buildRunDir(runId), "sections", sectionName);
}

export function createRunDirs(runId: string): void {
  mkdirSync(join(buildRunDir(runId), "sections"), { recursive: true });
}

export function createSectionDirs(runId: string, sectionName: string): void {
  mkdirSync(join(buildSectionDir(runId, sectionName), "assets"), { recursive: true });
}

export function writeJsonFile(path: string, data: unknown): void {
  writeFileSync(path, JSON.stringify(data, null, 2), "utf-8");
}

export function appendTraceLine(runId: string, entry: unknown): void {
  const tracePath = join(buildRunDir(runId), "agent-trace.jsonl");
  appendFileSync(tracePath, JSON.stringify(entry) + "\n", "utf-8");
}
