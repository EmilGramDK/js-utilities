/**
 * Browser code for logging plugin
 * Handles logging of messages from the browser to a remote server
 *
 * Code generated with ChatGPT
 */

const ENDPOINT = "/__log";

// ---- stringifyAny: robust, DOM-aware, circular-safe ---------------------------------
export function stringifyAny(value) {
  // Fast paths for primitives
  if (value === null) return "null";
  const t = typeof value;
  if (t === "string") return value;
  if (t === "number") {
    if (Number.isNaN(value)) return "NaN";
    if (!Number.isFinite(value)) return value > 0 ? "Infinity" : "-Infinity";
    return String(value);
  }
  if (t === "boolean") return String(value);
  if (t === "bigint") return `${value}n`;
  if (t === "undefined") return "undefined";
  if (t === "symbol") return String(value);
  if (t === "function") return `[Function ${value.name || "anonymous"}]`;

  // DOM / XML nodes
  const hasDOM = typeof Node !== "undefined" && typeof XMLSerializer !== "undefined";
  if (hasDOM && value instanceof Node) {
    try {
      return new XMLSerializer().serializeToString(value);
    } catch {
      // best-effort fallback
      return `[DOM ${value.nodeName}]`;
    }
  }

  // Errors
  if (value instanceof Error) {
    return safeJSON({
      ...value,
      ...(value.cause ? { cause: toSerializable(value.cause) } : {}),
    });
  }

  // Dates, RegExp, URL
  if (value instanceof Date)
    return Number.isNaN(value.getTime()) ? "Invalid Date" : value.toISOString();
  if (value instanceof RegExp) return value.toString();
  if (value instanceof URL) return value.toString();

  // Binary / Typed arrays
  if (value instanceof ArrayBuffer) return `[ArrayBuffer ${value.byteLength} bytes]`;
  if (ArrayBuffer.isView(value)) {
    const ta = value;
    return safeJSON({
      type: ta.constructor.name,
      length: ta.length ?? ta.byteLength,
      preview: Array.prototype.slice.call(ta, 0, 32),
    });
  }

  // Blob / File
  if (typeof Blob !== "undefined" && value instanceof Blob) {
    const maybeFile = value;
    const name = typeof maybeFile.name === "string" ? maybeFile.name : undefined;
    return `[${name ? "File" : "Blob"} ${name || ""} ${value.size} bytes ${value.type || "application/octet-stream"}]`;
  }

  // FormData
  if (typeof FormData !== "undefined" && value instanceof FormData) {
    const obj = {};
    for (const [k, v] of value.entries()) {
      const s = stringifyAny(v);
      if (!obj[k]) obj[k] = [];
      obj[k].push(s);
    }
    return safeJSON({ formData: obj });
  }

  // Map / Set
  if (value instanceof Map) {
    return safeJSON({
      type: "Map",
      size: value.size,
      entries: [...value.entries()]
        .slice(0, 100)
        .map(([k, v]) => [stringifyAny(k), toSerializable(v)]),
    });
  }
  if (value instanceof Set) {
    return safeJSON({
      type: "Set",
      size: value.size,
      values: [...value.values()].slice(0, 100).map((v) => toSerializable(v)),
    });
  }

  // Request / Response (fetch)
  if (typeof Request !== "undefined" && value instanceof Request) {
    return safeJSON({
      type: "Request",
      method: value.method,
      url: value.url,
      headers: [...value.headers.entries()],
    });
  }
  if (typeof Response !== "undefined" && value instanceof Response) {
    return safeJSON({
      type: "Response",
      status: value.status,
      ok: value.ok,
      url: value.url,
      headers: [...value.headers.entries()],
    });
  }

  // Generic objects / arrays with circular-safety
  return safeJSON(value);
}

// Convert unknown to JSON-serializable with circular handling.
function toSerializable(input, seen = new WeakSeot()) {
  if (input === null) return "null";
  const t = typeof input;
  if (t === "object") {
    const obj = input;
    if (seen.has(obj)) return "[Circular]";
    seen.add(obj);

    // Arrays
    if (Array.isArray(obj)) return obj.map((v) => toSerializable(v, seen));

    // Plain object-ish: copy enumerable props
    const out = {};
    for (const key of Object.keys(obj)) {
      out[key] = toSerializable(obj[key], seen);
    }
    return out;
  }

  // Primitives & special cases funnel through stringifyAny for consistency
  switch (t) {
    case "bigint": {
      return `${input}n`;
    }
    case "function": {
      return `[Function ${input.name || "anonymous"}]`;
    }
    case "symbol": {
      return String(input);
    }
    default: {
      return input;
    }
  }
}

function safeJSON(value) {
  try {
    return JSON.stringify(toSerializable(value), undefined, 2);
  } catch {
    return "[Unserializable]";
  }
}

// ---- per-method processors -----------------------------------------------------------

function processForLog(args) {
  return {
    type: "log",
    level: "log",
    ts: new Date().toISOString(),
    ua: typeof navigator === "undefined" ? undefined : navigator.userAgent,
    url: typeof location === "undefined" ? undefined : location.href,
    args,
    argsSerialized: args.map(stringifyAny),
  };
}

function processForInfo(args) {
  return {
    ...processForLog(args),
    type: "info",
    level: "info",
  };
}

function processForDebug(args) {
  return {
    ...processForLog(args),
    type: "debug",
    level: "debug",
  };
}

function processForWarn(args) {
  return {
    ...processForLog(args),
    type: "warn",
    level: "warn",
  };
}

function processForError(args) {
  const errors = [];
  for (const a of args) {
    if (a instanceof Error) {
      const cause = a.cause;
      errors.push({
        name: a.name,
        message: a.message,
        stack: a.stack,
        cause: cause ? toSerializable(cause) : undefined,
      });
    }
  }
  return {
    type: "error",
    level: "error",
    ts: new Date().toISOString(),
    ua: typeof navigator === "undefined" ? undefined : navigator.userAgent,
    url: typeof location === "undefined" ? undefined : location.href,
    args,
    argsSerialized: args.map(stringifyAny),
    errors,
  };
}

function processForTable(args) {
  const first = args[0];
  const table = toTable(first);
  return {
    type: "table",
    level: "table",
    ts: new Date().toISOString(),
    ua: typeof navigator === "undefined" ? undefined : navigator.userAgent,
    url: typeof location === "undefined" ? undefined : location.href,
    table,
    summary: `${table.rows.length} row(s), ${table.columns.length} column(s)`,
  };
}

// Produce tabular view similar to console.table’s expectations
function toTable(value) {
  const rows = [];
  if (Array.isArray(value)) {
    for (const item of value) {
      if (item && typeof item === "object") {
        rows.push({ ...item });
      } else {
        rows.push({ value: item });
      }
    }
  } else if (value && typeof value === "object") {
    // Object => keys as rows
    for (const [k, v] of Object.entries(value)) {
      if (v && typeof v === "object" && !Array.isArray(v)) {
        rows.push({ key: k, ...v });
      } else {
        rows.push({ key: k, value: v });
      }
    }
  } else {
    rows.push({ value });
  }
  const columnSet = new Set();
  for (const r of rows) {
    for (const k of Object.keys(r)) {
      columnSet.add(k);
    }
  }
  const columns = [...columnSet];
  return { columns, rows };
}

// ---- transport ----------------------------------------------------------------------

async function send(payload) {
  try {
    // keepalive helps during unload/navigation
    await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify(payload),
    });
  } catch {
    // ignore transport errors
  }
}

// ---- patching -----------------------------------------------------------------------

const __alreadyPatched__ = Symbol.for("__remote_console_patched__");

export function patchConsole(endpoint = ENDPOINT) {
  if (window[__alreadyPatched__]) return;
  window[__alreadyPatched__] = true;
  window.REMOTE_LOG_ENDPOINT = endpoint;

  const original = {
    log: console.log.bind(console),
    info: console.info.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
    debug: console.debug.bind(console),
    table: console.table.bind(console),
  };

  function wrap(method, handler) {
    console[method] = (...args) => {
      original[method](...args);
      void handler(args);
    };
  }

  wrap("log", async (args) => send(processForLog(args)));
  wrap("info", async (args) => send(processForInfo(args)));
  wrap("debug", async (args) => send(processForDebug(args)));
  wrap("warn", async (args) => send(processForWarn(args)));
  wrap("error", async (args) => send(processForError(args)));
  wrap("table", async (args) => send(processForTable(args)));
}
