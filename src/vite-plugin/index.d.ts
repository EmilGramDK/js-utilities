/* eslint-disable no-restricted-syntax */
import type { Plugin, PluginOption } from "vite";

export type PluginOptions = {
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
export default function VitePlugin(options?: PluginOptions): Array<Plugin | PluginOption>;
