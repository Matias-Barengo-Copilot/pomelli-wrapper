export type RunStatus = "running" | "completed" | "needs_human" | "needs_reauth" | "failed";
export type ErrorType = "captcha" | "session_expired" | "pomelli_error" | "timeout" | "unknown";
export type SectionName = "business_dna" | "campaign" | "photoshoot" | "animate";

export interface AssetRecord {
  id: string;
  type: "image" | "video" | "unknown";
  filename: string;
  source_url: string;
  mime_type: string;
  width: number | null;
  height: number | null;
  size_bytes: number;
  sha256: string | null;
}

export interface SectionRecord {
  name: SectionName;
  captured_at: string;
  screenshot: string;
  dom_html: string | null;
  assets: AssetRecord[];
}

export interface AgentUsage {
  model: string;
  beta: string;
  iterations: number;
  tokens: { input: number; output: number };
  estimated_cost_usd: number;
}

export interface RunManifest {
  schema_version: "1.0";
  run_id: string;
  source_url: string;
  started_at: string;
  finished_at: string | null;
  status: RunStatus;
  error: string | null;
  agent: AgentUsage;
  sections: SectionRecord[];
  final_screenshot: string | null;
  agent_trace: string;
}

export class AgentDoneSignal extends Error {
  constructor(public readonly summary: string) {
    super("done");
    this.name = "AgentDoneSignal";
  }
}

export class AgentErrorSignal extends Error {
  constructor(
    public readonly errorType: ErrorType,
    public readonly detail: string
  ) {
    super(detail);
    this.name = "AgentErrorSignal";
  }
}
