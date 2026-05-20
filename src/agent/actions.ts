import {
  takeScreenshotBase64,
  mouseClick,
  mouseDoubleClick,
  mouseMove,
  mouseDrag,
  typeText,
  pressKey,
  scroll,
} from "../container/docker.js";

export interface ComputerAction {
  action: string;
  coordinate?: [number, number];
  start_coordinate?: [number, number];
  end_coordinate?: [number, number];
  text?: string;
  direction?: "up" | "down" | "left" | "right";
  num_scrolls?: number;
}

export interface ToolResult {
  type: "tool_result";
  tool_use_id: string;
  content: string | Array<{ type: "image"; source: { type: "base64"; media_type: "image/png"; data: string } }>;
  is_error?: boolean;
}

export async function executeComputerAction(
  toolUseId: string,
  input: ComputerAction
): Promise<ToolResult> {
  try {
    const [x, y] = input.coordinate ?? [0, 0];

    switch (input.action) {
      case "screenshot": {
        const data = await takeScreenshotBase64();
        return {
          type: "tool_result",
          tool_use_id: toolUseId,
          content: [{ type: "image", source: { type: "base64", media_type: "image/png", data } }],
        };
      }

      case "left_click":
        await mouseClick(x, y, 1);
        return ok(toolUseId);

      case "right_click":
        await mouseClick(x, y, 3);
        return ok(toolUseId);

      case "middle_click":
        await mouseClick(x, y, 2);
        return ok(toolUseId);

      case "double_click":
        await mouseDoubleClick(x, y);
        return ok(toolUseId);

      case "mouse_move":
        await mouseMove(x, y);
        return ok(toolUseId);

      case "left_click_drag": {
        const [x1, y1] = input.start_coordinate ?? [0, 0];
        const [x2, y2] = input.end_coordinate ?? [0, 0];
        await mouseDrag(x1, y1, x2, y2);
        return ok(toolUseId);
      }

      case "type":
        await typeText(input.text ?? "");
        return ok(toolUseId);

      case "key":
        await pressKey(input.text ?? "");
        return ok(toolUseId);

      case "scroll":
        await scroll(x, y, input.direction ?? "down", input.num_scrolls ?? 3);
        return ok(toolUseId);

      case "cursor_position":
        return ok(toolUseId, `Cursor position reporting not implemented; coordinates were ${x},${y}`);

      default:
        return err(toolUseId, `Unknown action: ${input.action}`);
    }
  } catch (e) {
    return err(toolUseId, `Action failed: ${e instanceof Error ? e.message : String(e)}`);
  }
}

function ok(toolUseId: string, message = "OK"): ToolResult {
  return { type: "tool_result", tool_use_id: toolUseId, content: message };
}

function err(toolUseId: string, message: string): ToolResult {
  return { type: "tool_result", tool_use_id: toolUseId, content: message, is_error: true };
}
