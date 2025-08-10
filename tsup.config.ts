import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/vite-plugin/index.js"],
  format: ["esm"],
  skipNodeModulesBundle: true,
  minify: true,
  dts: true,
  sourcemap: true,
  clean: true,
});
