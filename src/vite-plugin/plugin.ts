import type { Plugin } from "vite";

export const WebPlugin = (): Plugin => ({
  name: "vite-plugin-emilgramdk",
  config: (config, { command }) => {
    const isProd = command === "build";

    return {
      esbuild: {
        drop: isProd ? ["console", "debugger"] : [],
      },
    };
  },
});
