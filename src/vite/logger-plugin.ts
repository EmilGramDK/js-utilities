/* eslint-disable quotes */
/* eslint-disable complexity */
import type { Connect, PluginOption } from "vite";
import type { IncomingMessage, ServerResponse } from "node:http";

/** Types that mirror the new browser payloads */
type ConsoleMethod = "log" | "info" | "warn" | "error" | "debug" | "table";

interface BaseLogPayload {
  type: ConsoleMethod;
  level: ConsoleMethod;
  ts: string; // ISO
  ua?: string;
  url?: string;
}

interface CommonLogPayload extends BaseLogPayload {
  args: Array<unknown>;
  argsSerialized: Array<string>;
}

interface ErrorItem {
  name: string;
  message: string;
  stack?: string;
  cause?: unknown;
}

interface ErrorLogPayload extends BaseLogPayload {
  args: Array<unknown>;
  argsSerialized: Array<string>;
  errors: Array<ErrorItem>;
}

interface TableLogPayload extends BaseLogPayload {
  table: {
    columns: Array<string>;
    rows: Array<Record<string, unknown>>;
  };
  summary: string;
}

type AnyPayload = CommonLogPayload | ErrorLogPayload | TableLogPayload;

const ENDPOINT = "/__log";
const MAX_BODY_BYTES = 1_000_000; // 1MB cap to avoid log-floods

export const LoggerPlugin = (): PluginOption => ({
  name: "vite-plugin-console-logger",
  apply: "serve",

  configureServer(server) {
    server.middlewares.use(ENDPOINT, middleware);
  },

  transformIndexHtml(html, ctx) {
    if (!ctx?.server) return html;
    const snippet = `<script type="module">
      import { patchConsole } from "/node_modules/@emilgramdk/web/dist/vite-plugin/browser.js";
      patchConsole("${ENDPOINT}");</script>`.trim();
    return html.replace("</body>", `${snippet}\n</body>`);
  },
});

/** Main middleware that reads JSON and routes to specialized printers */
const middleware = async (req: Connect.IncomingMessage, res: ServerResponse<IncomingMessage>) => {
  if (req.method !== "POST") {
    res.statusCode = 405;
    return res.end();
  }

  try {
    const payload = await parseBody(req);
    printPayload(payload);
  } catch (error) {
    // keep noise minimal but visible
    console.error("\u001B[31m[logger] Invalid payload:", error, "\u001B[39m");
  }
  res.statusCode = 204;
  return res.end();
};

/** Parse body with a size cap and JSON validation */
function parseBody(req: Connect.IncomingMessage): Promise<AnyPayload> {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks: Array<Buffer> = [];
    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error("Payload too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      try {
        const bodyStr = Buffer.concat(chunks).toString("utf8");
        const json = JSON.parse(bodyStr) as Partial<AnyPayload>;
        if (!json || typeof json !== "object") throw new Error("Not an object");

        // minimal structural validation
        const { type, level, ts } = json as AnyPayload;
        if (!type || !level || !ts) throw new Error("Missing required fields");

        resolve(json as AnyPayload);
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

/** Dispatch to per-type print functions */
function printPayload(payload: AnyPayload): void {
  const prefix = colorize(`[${formatType(payload.type)}]`, colorForType(payload.type));
  // include url: const meta = dim(` ${payload.ts} ${payload.url || ""}`);
  const meta = dim(` ${payload.ts} `);

  switch (payload.type) {
    case "table": {
      printTable(prefix, meta, payload as TableLogPayload);
      break;
    }
    case "error": {
      printError(prefix, meta, payload as ErrorLogPayload);
      break;
    }
    default: {
      printCommon(prefix, meta, payload as CommonLogPayload);
      break;
    }
  }
}

function formatType(type: string) {
  return type.toUpperCase() + " ".repeat(10 - type.length);
}

/** Common printer (log/info/debug/warn) uses argsSerialized for fidelity */
function printCommon(prefix: string, meta: string, p: CommonLogPayload): void {
  const lines = p.argsSerialized?.length ? p.argsSerialized : ["(no args)"];

  console[p.type](prefix + meta, ...lines.map(smartParseForNode));
}

/** Error printer: show serialized args and structured errors (name/message/stack) */
function printError(prefix: string, meta: string, p: ErrorLogPayload): void {
  // First, echo the user-visible args
  const lines = p.argsSerialized?.length ? p.argsSerialized : [];
  if (lines.length > 0) {
    console.error(prefix + meta, ...lines.map(smartParseForNode));
  } else {
    console.error(prefix + meta);
  }

  // Then print error objects with stacks, each framed
  for (const err of p.errors || []) {
    const header = colorize(`  ${err.name}: ${err.message}`, 31);

    console.error(header);
    if (err.stack) {
      console.error(dim(err.stack));
    }
    if (err.cause !== undefined) {
      console.error(dim("  cause:"), smartParseForNode(stringifySafe(err.cause)));
    }
  }
}

/** Table printer: use console.table when possible */
function printTable(prefix: string, meta: string, p: TableLogPayload): void {
  console.log(prefix + meta, dim(` ${p.summary}`));

  console.table(p.table?.rows ?? []);
}

/** Utilities */

function stringifySafe(v: unknown): string {
  try {
    return typeof v === "string" ? v : JSON.stringify(v, undefined, 2);
  } catch {
    return "[Unserializable]";
  }
}

/**
 * The client already sent strings, but many are JSON;
 * try to parse JSON-ish strings for nicer Node printing, else return raw.
 */
function smartParseForNode(s: string): unknown {
  if (typeof s !== "string") return s;
  const trimmed = s.trim();
  if (!trimmed) return s;

  // Heuristic: likely JSON object/array
  const first = trimmed[0];
  const last = trimmed.at(-1);
  const looksJson =
    (first === "{" && last === "}") ||
    (first === "[" && last === "]") ||
    // also catch quoted primitives, numbers, booleans
    first === '"' ||
    first === "'" ||
    first === "-" ||
    (first >= "0" && first <= "9");

  if (!looksJson) return s;

  try {
    // tolerant: handle single quotes by replacing with double quotes if it seems like a JSON-lite string
    if (first === "'" && last === "'") {
      const candidate = trimmed.slice(1, -1).replaceAll('"', String.raw`\"`);
      return JSON.parse(`"${candidate}"`);
    }
    return JSON.parse(trimmed);
  } catch {
    return s;
  }
}

/** ANSI helpers */
function colorForType(t: ConsoleMethod): number {
  switch (t) {
    case "error": {
      return 31;
    } // red
    case "warn": {
      return 33;
    } // yellow
    case "info": {
      return 36;
    } // cyan
    case "debug": {
      return 90;
    } // gray
    case "table": {
      return 35;
    } // magenta
    default: {
      return 32;
    } // green
  }
}

function colorize(s: string, code: number): string {
  return `\u001B[${code}m${s}\u001B[39m`;
}

function dim(s: string): string {
  return `\u001B[2m${s}\u001B[22m`;
}
