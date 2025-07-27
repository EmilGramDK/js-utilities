import type { Config } from "prettier";

/**
 * Prettier configuration
 * @description This configuration is used to format the codebases consistently.
 */
export const prettierConfig: Config = {
  semi: true,
  singleQuote: false,
  tabWidth: 2,
  printWidth: 120,
  bracketSameLine: true,
  bracketSpacing: true,
  trailingComma: "all",
  overrides: [],
};
