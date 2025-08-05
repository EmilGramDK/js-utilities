import MKCert from "vite-plugin-mkcert";
import TSPaths from "vite-tsconfig-paths";
import { LoggerPlugin } from "./logger.js";
import { WebPlugin } from "./plugin.js";

export default function VitePlugin(options) {
  const { ssl = true, logger = true, tsPaths = true, dropConsole = true } = options || {};

  const plugins = [WebPlugin({ dropConsole })];

  if (ssl) plugins.push(MKCert());
  if (logger) plugins.push(LoggerPlugin());
  if (tsPaths) plugins.push(TSPaths());

  return plugins;
}
