import type { Plugin } from "vite";

/**
 *
 * @returns
 */
export function VitePlugin(): Plugin {
  return {
    name: "vite-plugin-emilgramdk-web",
    config: (config, { command }) => {
      const isProd = command === "build";

      return {
        esbuild: {
          drop: isProd ? ["console", "debugger"] : [],
        },
      };
    },
  };
}
