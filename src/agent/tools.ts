import { DISPLAY_WIDTH, DISPLAY_HEIGHT } from "../lib/constants.js";

export const computerTool = {
  type: "computer_20251124" as const,
  name: "computer",
  display_width_px: DISPLAY_WIDTH,
  display_height_px: DISPLAY_HEIGHT,
  display_number: 1,
};

export const recordSectionTool = {
  name: "record_section",
  description:
    "Call when a Pomelli section is fully loaded and all assets are visible. " +
    "The wrapper takes a screenshot, captures the DOM, and downloads all assets. " +
    "Do NOT call while a loading spinner is still active.",
  input_schema: {
    type: "object" as const,
    properties: {
      name: {
        type: "string",
        enum: ["business_dna", "campaign", "photoshoot", "animate"],
        description: "Name of the section being recorded",
      },
    },
    required: ["name"],
  },
};

export const doneTool = {
  name: "done",
  description: "Call when all available Pomelli sections have been recorded.",
  input_schema: {
    type: "object" as const,
    properties: {
      summary: {
        type: "string",
        description: "Brief summary of sections visited and any sections that were unavailable",
      },
    },
    required: ["summary"],
  },
};

export const reportErrorTool = {
  name: "report_error",
  description: "Call immediately when an unrecoverable error or block is encountered.",
  input_schema: {
    type: "object" as const,
    properties: {
      type: {
        type: "string",
        enum: ["captcha", "session_expired", "pomelli_error", "timeout", "unknown"],
      },
      message: {
        type: "string",
        description: "Description of what you observed",
      },
    },
    required: ["type", "message"],
  },
};

export const clickElementTool = {
  name: "click_element",
  description:
    "Click an element in the current browser tab by injecting JavaScript into the address bar. " +
    "Searches by CSS selector first, then by partial text content in buttons and links. " +
    "Use this instead of visual clicking when a button is hard to locate on screen. " +
    "After calling, always take a screenshot to verify the result. " +
    "Examples: '.continue-button', \"Let's go!\", 'Start over', '#submit-btn'.",
  input_schema: {
    type: "object" as const,
    properties: {
      selector: {
        type: "string",
        description:
          "CSS selector (e.g. '.continue-button') or text that appears inside the target button/link.",
      },
    },
    required: ["selector"],
  },
};

export const allTools = [computerTool, recordSectionTool, doneTool, reportErrorTool];
