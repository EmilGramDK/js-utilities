export const WebPlugin = () => ({
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
