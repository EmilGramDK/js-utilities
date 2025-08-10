/* eslint-disable no-restricted-syntax */
import type { Plugin, PluginOption } from "vite";
import MKCert from "vite-plugin-mkcert";
import TSPaths from "vite-tsconfig-paths";
import { LoggerPlugin } from "./logger";
import { WebPlugin } from "./plugin";

export type WebPluginOptions = {
  ssl?: boolean;
  tsPaths?: boolean;
  logger?: boolean;
  dropConsole?: boolean;
};

/**
 * This Vite Plugin returns an array of plugins based on the provided options.
 * - `ssl`: Enables SSL support using MKCert.
 * - `tsPaths`: Enables TypeScript path aliasing.
 * - `logger`: Enables console logging will be transfered to the terminal.
 * - `dropConsole`: removes console and debugger statements in production builds.
 */
export default function VitePlugin(options: WebPluginOptions): Array<Plugin | PluginOption> {
  const { ssl = true, logger = true, tsPaths = true, dropConsole = true } = options || {};

  const plugins: Array<Plugin | PluginOption> = [WebPlugin({ dropConsole })];

  if (ssl) plugins.push(MKCert());
  if (logger) plugins.push(LoggerPlugin());
  if (tsPaths) plugins.push(TSPaths());

  return plugins;
}
