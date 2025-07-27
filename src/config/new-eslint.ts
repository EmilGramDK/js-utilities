import tseslint from "typescript-eslint";
import globals from "globals";

import pluginStylistic from "@stylistic/eslint-plugin";
import pluginImport from "eslint-plugin-import-x";
import pluginUnicorn from "eslint-plugin-unicorn";
import pluginSonarjs from "eslint-plugin-sonarjs";
import pluginSolid from "eslint-plugin-solid";

const JS_GLOB_INCLUDE = ["**/*.{ts,tsx,mts}"];

const GLOB_EXCLUDE = [
  "**/.nx/**",
  "**/build/**",
  "**/coverage/**",
  "**/dist/**",
  "**/snap/**",
  "**/vite.config.*.timestamp-*.*",
];

const plugins = {
  "@stylistic/js": pluginStylistic,
  "@typescript-eslint": tseslint.plugin,
  import: pluginImport,
  unicorn: pluginUnicorn,
  sonarjs: pluginSonarjs,
  solid: pluginSolid,
};

const rules = {
  ...tseslint.configs.eslintRecommended.rules,
  ...pluginUnicorn.configs.recommended.rules,
  ...pluginSonarjs.configs.recommended.rules,
  ...pluginSolid.configs.typescript.rules,
  semi: ["error", "always"],
  quotes: ["error", "double"],
  "@typescript-eslint/no-unused-vars": "warn",
  "max-len": "off",

  /* Complexity */
  "no-useless-catch": "error",
  "no-useless-constructor": "warn",
  "no-continue": "warn",
  "no-useless-escape": "warn",
  "no-else-return": ["error", { allowElseIf: false }],
  "no-negated-condition": "error",
  "no-useless-return": "warn",
  "no-useless-computed-key": "warn",
  "prefer-arrow-callback": "warn",
  "array-callback-return": "warn",
  "prefer-template": "error",
  "prefer-const": "error",
  "no-var": "warn",
  "prefer-exponentiation-operator": "warn",
  "unicorn/no-useless-fallback-in-spread": "warn",
  "unicorn/no-this-assignment": "warn",

  /* Suspicious */
  eqeqeq: ["warn", "always"],
  "no-debugger": "warn",
  "no-alert": "warn",
  "@typescript-eslint/no-explicit-any": "error",
  "@typescript-eslint/no-inferrable-types": "off",
  "no-console": ["warn", { allow: ["warn", "error"] }],

  /* Style */
  "no-restricted-syntax": [
    "error",
    {
      selector: "ExportDefaultDeclaration",
      message: "Prefer named exports",
    },
  ],
  "@typescript-eslint/array-type": ["warn", { default: "generic" }],
  "@typescript-eslint/no-redeclare": ["error"],
  "@typescript-eslint/consistent-type-imports": "warn",
  "unicorn/consistent-function-scoping": "warn",
  "unicorn/prefer-default-parameters": "error",
  "unicorn/prefer-top-level-await": "off",
  "unicorn/prefer-ternary": "warn",
  "unicorn/prevent-abbreviations": "off",
  "unicorn/no-array-for-each": "off",
  "no-unused-expressions": ["error", { allowTaggedTemplates: true }],

  /* Correctness */
  "no-const-assign": "error",

  /* Nursery */
  "no-await-in-loop": "error",
  "sonarjs/no-nested-template-literals": "warn",
  "max-lines-per-function": ["error", { max: 50, skipBlankLines: true, skipComments: true }],

  /* Performance */
  "unicorn/prefer-regexp-test": "error",
};

/** @type {import('eslint').Linter.Config[]} */
export const eslintConfig = [
  {
    name: "emilgramdk/ignores",
    ignores: GLOB_EXCLUDE,
  },
  {
    name: "emilgramdk/setup",
    files: JS_GLOB_INCLUDE,
    languageOptions: {
      sourceType: "module",
      ecmaVersion: 2022,
      parser: tseslint.parser,
      parserOptions: {
        project: true,
        parser: tseslint.parser,
      },
      globals: {
        ...globals.browser,
      },
    },
    plugins,
    rules,
  },
];
