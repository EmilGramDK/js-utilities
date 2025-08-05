import MKCert from "vite-plugin-mkcert";
import TSPaths from "vite-tsconfig-paths";
import { LoggerPlugin } from "./logger";
import { WebPlugin } from "./plugin";

/**
 * This Vite Plugin returns an array of plugins based on the provided options.
 * - `ssl`: Enables SSL support using MKCert.
 * - `tsPaths`: Enables TypeScript path aliasing.
 * - `logger`: Enables console logging will be transfered to the terminal.
 */
export default function VitePlugin(options) {
  const { ssl = true, logger = true, tsPaths = true } = options || {};

  const plugins = [WebPlugin()];

  if (ssl) plugins.push(MKCert());
  if (logger) plugins.push(LoggerPlugin());
  if (tsPaths) plugins.push(TSPaths());

  return plugins;
}
