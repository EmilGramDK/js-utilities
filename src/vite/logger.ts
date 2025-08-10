import type { Connect } from "vite";
import type { ServerResponse, IncomingMessage } from "node:http";
import type { Plugin } from "vite";

export const LoggerPlugin = (): Plugin => ({
  name: "vite-plugin-emilgramdk-logger",
  configureServer(server) {
    server.middlewares.use("/__log", middleware);
  },
  transformIndexHtml(html, { server }) {
    if (!server) return html;
    return transformHTML(html);
  },
});

const transformHTML = (html: string) => {
  return html.replace("</body>", `<script>${loggerStr}</script></body>`);
};

const middleware = async (req: Connect.IncomingMessage, res: ServerResponse<IncomingMessage>) => {
  if (req.method !== "POST") return res.end();

  try {
    const { data, type } = await parseBody(req);
    const pre = type === "table" ? "\n" : "[LOG] » ";
    process.stdout.write(`\u001B[35m ${pre}`);
    console[type as "log"](...data);
    process.stdout.write("\u001B[39m");
  } catch (error) {
    console.error("[Terminal] Error logging message:", error);
  }
  return res.end();
};

const parseBody = (
  req: Connect.IncomingMessage,
): Promise<{ data: Array<unknown>; type: string }> => {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        const json = JSON.parse(body);
        if (!json || !json.data || !json.type) {
          throw new Error("Invalid JSON structure");
        }
        resolve(json);
      } catch (error) {
        reject(error);
      }
    });
  });
};

const loggerStr = `
  const methods = ["log", "info", "warn", "error", "debug", "table"];
  const originalConsole = {};
  for (const method of methods) {
    originalConsole[method] = console[method];
    console[method] = function (...args) {
      originalConsole[method](...args);
      fetch("/__log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: method,
          data: args,
        }),
      }).catch(() => {});
    };
  }`;
