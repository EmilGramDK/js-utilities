export const WebPlugin = (options) => ({
  name: "vite-plugin-emilgramdk",
  config: (config, { command }) => {
    const isProd = command === "build";
    const shouldDrop = isProd && options?.dropConsole;

    return {
      esbuild: {
        drop: shouldDrop ? ["console", "debugger"] : [],
      },
    };
  },
});
