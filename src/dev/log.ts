import type { Connect, Plugin } from "vite";
import pc from "picocolors";

export function terminalPlugin(): Plugin {
  return {
    name: "terminal",
    configureServer(server) {
      server.middlewares.use("/__log", (req, res) => {
        if (req.method !== "POST") return res.end("Only POST requests are allowed");

        parseJsonBody(req)
          .then((json) => {
            const { data, type } = json;
            if (!data || !type) return res.end("Invalid data");

            console[type](data);
          })
          .catch((error) => {
            console.log(pc.red("[Terminal] Error parsing JSON:"), error);
          })
          .finally(() => {
            res.end();
          });
      });
    },
  };
}

function parseJsonBody(req: Connect.IncomingMessage): Promise<{ data: unknown; type: string }> {
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
}
