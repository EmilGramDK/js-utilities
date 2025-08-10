import { defineConfig } from "tsup";
// import { raw } from "esbuild-raw-plugin";

export default defineConfig({
  esbuildPlugins: [
    // raw()
  ],
  entry: {
    "vite-plugin/index": "./src/vite/index.ts",
    "vite-plugin/browser": "./src/vite/logger-browser.ts",
  },
  format: ["esm"],
  skipNodeModulesBundle: true,
  minify: true,
  dts: true,
  sourcemap: true,
  clean: true,
});
