export const MODEL = "claude-sonnet-4-6";
export const COMPUTER_USE_BETA = "computer-use-2025-11-24";

export const DISPLAY_WIDTH = parseInt(process.env.DISPLAY_WIDTH ?? "1280", 10);
export const DISPLAY_HEIGHT = parseInt(process.env.DISPLAY_HEIGHT ?? "800", 10);
export const MAX_ITERATIONS = parseInt(process.env.MAX_ITERATIONS ?? "200", 10);
export const CONTAINER_NAME = process.env.CONTAINER_NAME ?? "pomelli-computer";
export const OUTPUTS_DIR = process.env.OUTPUTS_DIR ?? "outputs";
export const POMELLI_URL = "https://labs.google.com/pomelli";

// Claude 3.7 Sonnet approximate pricing
export const INPUT_PRICE_PER_TOKEN = 3.0 / 1_000_000;
export const OUTPUT_PRICE_PER_TOKEN = 15.0 / 1_000_000;

export const RUN_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes hard stop
