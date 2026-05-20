type Level = "INFO" | "WARN" | "ERROR";

function log(level: Level, step: string, message: string, data?: Record<string, unknown>): void {
  const ts = new Date().toISOString();
  const base = `[${ts}] [${level}] [${step}] ${message}`;
  const suffix = data
    ? " — " + Object.entries(data).map(([k, v]) => `${k}: ${v}`).join(", ")
    : "";
  if (level === "ERROR") {
    console.error(base + suffix);
  } else {
    console.log(base + suffix);
  }
}

export const logger = {
  info: (step: string, message: string, data?: Record<string, unknown>) =>
    log("INFO", step, message, data),
  warn: (step: string, message: string, data?: Record<string, unknown>) =>
    log("WARN", step, message, data),
  error: (step: string, message: string, data?: Record<string, unknown>) =>
    log("ERROR", step, message, data),
};
