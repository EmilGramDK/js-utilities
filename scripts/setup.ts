#!/usr/bin/env bun
import { writeFile, cp, access } from "fs/promises";
import { constants } from "fs";
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = process.cwd();

const devDependencies = [
  "@stylistic/eslint-plugin@>=5.2.2",
  "eslint-plugin-import-x@>=4.16.1",
  "eslint-plugin-perfectionist@>=4.0.0",
  "eslint-plugin-solid@>=0.14.5",
  "eslint-plugin-sonarjs@>=3.0.0",
  "eslint-plugin-unicorn@>=60.0.0",
  "eslint@>=9.32.0",
  "globals@>=16.3.0",
  "prettier@>=3.6.0",
  "typescript@>=5.8.2",
  "typescript-eslint@^8.38.0",
];

const configFiles = [
  { name: "eslint.config.ts", target: "eslint.config.ts" },
  { name: ".prettierrc", target: ".prettierrc" },
];

async function fileExists(filePath: string) {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function installDeps() {
  const deps = devDependencies.join(" ");
  console.log("📦 Installing dev dependencies...");
  execSync(`bun add -d ${deps}`, { stdio: "inherit" });
}

async function copyConfigs() {
  for (const file of configFiles) {
    const destPath = path.join(root, file.target);
    const alreadyExists = await fileExists(destPath);
    if (alreadyExists) {
      console.log(`⚠️  ${file.target} already exists. Skipped.`);
    } else {
      const srcPath = path.join(__dirname, "..", file.name);
      await cp(srcPath, destPath);
      console.log(`✅ Copied ${file.name}`);
    }
  }
}

(async () => {
  try {
    await installDeps();
    await copyConfigs();
    console.log("🎉 ESLint and Prettier setup complete!");
  } catch (error) {
    console.error("❌ Setup failed:", error);
    process.exit(1);
  }
})();
