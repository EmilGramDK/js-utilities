import type { Plugin } from "vite";
import type { WebPluginOptions } from ".";

export const WebPlugin = ({ dropConsole }: WebPluginOptions): Plugin => ({
  name: "vite-plugin-emilgramdk",
  config: (_config, { command }) => {
    const isProd = command === "build";
    const shouldDrop = isProd && dropConsole;

    return {
      esbuild: {
        drop: shouldDrop ? ["console", "debugger"] : [],
      },
    };
  },
});
