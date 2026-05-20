import WebSocket from "ws";
import { logger } from "../lib/logger.js";

const STEP = "dom-parser";
// Firefox WebDriver BiDi — WebSocket endpoint, not Chrome CDP
const BIDI_WS_URL = process.env.CDP_URL ?? "ws://localhost:9222/session";
const CONNECT_TIMEOUT_MS = 10_000;

export interface PageCookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  httpOnly: boolean;
  secure: boolean;
}

export interface DomCapture {
  html: string;
  cookies: PageCookie[];
  pageUrl: string;
}

// ── Minimal Firefox BiDi client ───────────────────────────────────────────────

interface BiDiMsg {
  id?: number;
  type?: "success" | "error" | "event";
  result?: unknown;
  error?: { message: string };
}

class FirefoxBiDi {
  private ws: WebSocket;
  private pending = new Map<number, { resolve: (v: unknown) => void; reject: (e: Error) => void }>();
  private nextId = 0;

  private constructor(ws: WebSocket) {
    this.ws = ws;
    ws.on("message", (raw: Buffer) => {
      const msg = JSON.parse(raw.toString()) as BiDiMsg;
      if (msg.id == null) return; // event — ignore
      const cb = this.pending.get(msg.id);
      if (!cb) return;
      this.pending.delete(msg.id);
      if (msg.type === "error") cb.reject(new Error(msg.error?.message ?? "BiDi error"));
      else cb.resolve(msg.result);
    });
  }

  static connect(url: string): Promise<FirefoxBiDi> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(url, [], {
        headers: { origin: "http://localhost:9222" },
      });
      const timer = setTimeout(() => {
        ws.terminate();
        reject(new Error(`BiDi connect timeout (${CONNECT_TIMEOUT_MS}ms) — is Firefox running?`));
      }, CONNECT_TIMEOUT_MS);
      ws.on("open", () => { clearTimeout(timer); resolve(new FirefoxBiDi(ws)); });
      ws.on("error", (err: Error) => { clearTimeout(timer); reject(err); });
    });
  }

  async send<T = unknown>(method: string, params: unknown = {}): Promise<T> {
    const id = ++this.nextId;
    return new Promise<T>((resolve, reject) => {
      this.pending.set(id, {
        resolve: (v) => resolve(v as T),
        reject,
      });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  close(): void {
    this.ws.close();
  }
}

// ── Types matching BiDi spec responses ───────────────────────────────────────

interface BrowsingContextTree {
  contexts: Array<{ context: string; url: string }>;
}

interface ScriptEvalResult {
  result: { type: string; value: unknown };
}

interface BiDiCookie {
  name: string;
  value: { type: string; value: string };
  domain: string;
  path: string;
  httpOnly: boolean;
  secure: boolean;
}

interface NetworkCookiesResult {
  cookies: BiDiCookie[];
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function captureCurrentPage(): Promise<DomCapture> {
  const bidi = await FirefoxBiDi.connect(BIDI_WS_URL);

  try {
    // BiDi requires an explicit session before any commands
    await bidi.send("session.new", { capabilities: {} });

    const tree = await bidi.send<BrowsingContextTree>("browsingContext.getTree", {});
    if (!tree.contexts.length) throw new Error("No browsing contexts — is Firefox running?");

    const { context: contextId, url: pageUrl } = tree.contexts[0];

    const htmlRes = await bidi.send<ScriptEvalResult>("script.evaluate", {
      expression: "document.documentElement.outerHTML",
      target: { context: contextId },
      awaitPromise: false,
    });
    const html = (htmlRes.result?.value as string) ?? "";

    let cookies: PageCookie[] = [];
    try {
      const cookieRes = await bidi.send<NetworkCookiesResult>("network.getCookies", {
        context: contextId,
      });
      cookies = cookieRes.cookies.map((c) => ({
        name: c.name,
        value: c.value.value,
        domain: c.domain,
        path: c.path,
        httpOnly: c.httpOnly,
        secure: c.secure,
      }));
    } catch {
      // Firefox may not yet implement network.getCookies — fall back to document.cookie (no HttpOnly)
      const cookieStrRes = await bidi.send<ScriptEvalResult>("script.evaluate", {
        expression: "document.cookie",
        target: { context: contextId },
        awaitPromise: false,
      });
      const cookieStr = (cookieStrRes.result?.value as string) ?? "";
      cookies = cookieStr.split(";").flatMap((pair) => {
        const [name, ...rest] = pair.trim().split("=");
        if (!name) return [];
        return [{ name: name.trim(), value: rest.join("=").trim(), domain: "", path: "/", httpOnly: false, secure: false }];
      });
      logger.warn(STEP, "network.getCookies not supported — using document.cookie (no HttpOnly cookies)", {
        cookieCount: cookies.length,
      });
    }

    logger.info(STEP, "DOM captured", { pageUrl, htmlBytes: html.length, cookieCount: cookies.length });
    return { html, cookies, pageUrl };
  } finally {
    // End session before closing — avoids "maximum sessions" error on next connect
    try { await bidi.send("session.end", {}); } catch { /* ignore if already gone */ }
    bidi.close();
  }
}
