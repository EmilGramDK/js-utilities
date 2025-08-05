import type { Plugin, PluginOption } from "vite";
import MKCert from "vite-plugin-mkcert";
import TSPaths from "vite-tsconfig-paths";
import { LoggerPlugin } from "./logger";
import { WebPlugin } from "./plugin";

type PluginOptions = {
  ssl?: boolean;
  tsPaths?: boolean;
  logger?: boolean;
};

/**
 * This Vite Plugin returns an array of plugins based on the provided options.
 * - `ssl`: Enables SSL support using MKCert.
 * - `tsPaths`: Enables TypeScript path aliasing.
 * - `logger`: Enables console logging will be transfered to the terminal.
 */
const VitePlugin = (options?: PluginOptions): Array<Plugin | PluginOption> => {
  const { ssl = true, logger = true, tsPaths = true } = options || {};

  const plugins: Array<Plugin | PluginOption> = [WebPlugin()];

  if (ssl) plugins.push(MKCert());
  if (logger) plugins.push(LoggerPlugin());
  if (tsPaths) plugins.push(TSPaths());

  return plugins;
};

// eslint-disable-next-line unicorn/no-named-default
export { VitePlugin as default, type PluginOptions };
