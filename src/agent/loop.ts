import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "fs";
import { join } from "path";
import { allTools } from "./tools.js";
import { executeComputerAction, type ToolResult } from "./actions.js";
import { recordSection } from "../capture/record-section.js";
import { appendTraceLine } from "../storage/local.js";
import { logger } from "../lib/logger.js";
import { runPreflight } from "./preflight.js";
import {
  MODEL,
  COMPUTER_USE_BETA,
  MAX_ITERATIONS,
  RUN_TIMEOUT_MS,
} from "../lib/constants.js";
import {
  AgentDoneSignal,
  AgentErrorSignal,
  type SectionName,
  type RunManifest,
} from "../lib/types.js";

const STEP = "loop";

export interface LoopResult {
  sections: RunManifest["sections"];
  usage: { input: number; output: number };
  iterations: number;
  finalScreenshotPath: string | null;
}

export async function runAgentLoop(
  runId: string,
  sourceUrl: string,
  manifest: RunManifest
): Promise<LoopResult> {
  // ── Pre-flight: handle navigation, popup, URL entry, and analysis wait via CDP ──
  const preflight = await runPreflight(sourceUrl);
  appendTraceLine(runId, { type: "preflight", result: preflight });

  // Build the first user message based on what preflight achieved
  let firstMessage: string;
  if (preflight.status === "sections_ready") {
    firstMessage =
      "Preflight complete. Pomelli has finished analyzing the brand and all sections are now visible. " +
      "Take a screenshot to confirm, then navigate each section in order (Business DNA → Campaigns → Photoshoot → Animate) " +
      "and call record_section when each one is fully loaded.";
  } else if (preflight.status === "partial") {
    firstMessage =
      `Preflight partially completed. Status: ${preflight.message}. ` +
      `Take a screenshot to see the current state, then continue from where preflight left off.`;
  } else {
    firstMessage =
      `Preflight failed: ${(preflight as { status: "failed"; message: string }).message}. ` +
      `Take a screenshot to assess the current state and proceed from the beginning.`;
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const systemPrompt = readFileSync(join("prompts", "agent.md"), "utf-8");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const messages: any[] = [
    { role: "user", content: firstMessage },
  ];

  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let iterations = 0;
  const startedAt = Date.now();


  while (iterations < MAX_ITERATIONS) {
    if (Date.now() - startedAt > RUN_TIMEOUT_MS) {
      throw new AgentErrorSignal("timeout", `Run exceeded ${RUN_TIMEOUT_MS / 60000} minutes`);
    }

    iterations++;
    logger.info(STEP, "calling API", { iteration: iterations, messages: messages.length });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await (client.beta.messages as any).create({
      model: MODEL,
      max_tokens: 4096,
      system: systemPrompt,
      tools: allTools,
      messages,
      betas: [COMPUTER_USE_BETA],
    });

    totalInputTokens += response.usage?.input_tokens ?? 0;
    totalOutputTokens += response.usage?.output_tokens ?? 0;

    appendTraceLine(runId, {
      type: "api_response",
      iteration: iterations,
      stop_reason: response.stop_reason,
      usage: response.usage,
      content_types: response.content.map((b: { type: string }) => b.type),
    });

    // Add assistant message to history
    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason === "end_turn") {
      logger.info(STEP, "end_turn without tool call — loop complete");
      break;
    }

    // Process all tool_use blocks in this response
    const toolResults: ToolResult[] = [];
    let shouldStop = false;

    for (const block of response.content) {
      if (block.type !== "tool_use") continue;

      const { id: toolUseId, name, input } = block;
      logger.info(STEP, "tool_use", { name, toolUseId });
      appendTraceLine(runId, { type: "tool_use", iteration: iterations, name, input });

      if (name === "computer") {
        const result = await executeComputerAction(toolUseId, input);
        toolResults.push(result);
      } else if (name === "record_section") {
        const sectionName = (input as { name: SectionName }).name;
        try {
          const section = await recordSection(runId, sectionName);
          manifest.sections.push(section);
          toolResults.push({
            type: "tool_result",
            tool_use_id: toolUseId,
            content: `Section "${sectionName}" recorded. Assets: ${section.assets.length}. Screenshot: ${section.screenshot}`,
          });
        } catch (e) {
          toolResults.push({
            type: "tool_result",
            tool_use_id: toolUseId,
            content: `record_section failed: ${e instanceof Error ? e.message : String(e)}`,
            is_error: true,
          });
        }
      } else if (name === "done") {
        toolResults.push({
          type: "tool_result",
          tool_use_id: toolUseId,
          content: "Done acknowledged.",
        });
        shouldStop = true;
        throw new AgentDoneSignal((input as { summary: string }).summary);
      } else if (name === "report_error") {
        const { type: errorType, message } = input as { type: string; message: string };
        toolResults.push({
          type: "tool_result",
          tool_use_id: toolUseId,
          content: "Error acknowledged.",
        });
        shouldStop = true;
        throw new AgentErrorSignal(errorType as AgentErrorSignal["errorType"], message);
      }
    }

    if (toolResults.length > 0) {
      messages.push({ role: "user", content: toolResults });
    }

    if (shouldStop) break;
  }

  if (iterations >= MAX_ITERATIONS) {
    throw new AgentErrorSignal("timeout", `Reached max iterations (${MAX_ITERATIONS})`);
  }

  return {
    sections: manifest.sections,
    usage: { input: totalInputTokens, output: totalOutputTokens },
    iterations,
    finalScreenshotPath: null,
  };
}

