import { join } from "path";
import { writeJsonFile, buildRunDir } from "./local.js";
import type { RunManifest, RunStatus, SectionRecord, AgentUsage } from "../lib/types.js";
import { MODEL, COMPUTER_USE_BETA, INPUT_PRICE_PER_TOKEN, OUTPUT_PRICE_PER_TOKEN } from "../lib/constants.js";

export function buildInitialManifest(runId: string, sourceUrl: string): RunManifest {
  return {
    schema_version: "1.0",
    run_id: runId,
    source_url: sourceUrl,
    started_at: new Date().toISOString(),
    finished_at: null,
    status: "running",
    error: null,
    agent: {
      model: MODEL,
      beta: COMPUTER_USE_BETA,
      iterations: 0,
      tokens: { input: 0, output: 0 },
      estimated_cost_usd: 0,
    },
    sections: [],
    final_screenshot: null,
    agent_trace: `${runId}/agent-trace.jsonl`,
  };
}

export function computeUsage(
  iterations: number,
  totalInputTokens: number,
  totalOutputTokens: number
): AgentUsage {
  return {
    model: MODEL,
    beta: COMPUTER_USE_BETA,
    iterations,
    tokens: { input: totalInputTokens, output: totalOutputTokens },
    estimated_cost_usd:
      Math.round(
        (totalInputTokens * INPUT_PRICE_PER_TOKEN + totalOutputTokens * OUTPUT_PRICE_PER_TOKEN) * 100
      ) / 100,
  };
}

export function writeManifest(runId: string, manifest: RunManifest): void {
  const path = join(buildRunDir(runId), "manifest.json");
  writeJsonFile(path, manifest);
}
