#!/usr/bin/env bun
import { writeFile, cp, access, readFile } from "fs/promises";
import { constants } from "fs";
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = process.cwd();

const devDependencies = [
  "@stylistic/eslint-plugin",
  "eslint-plugin-import-x",
  "eslint-plugin-perfectionist",
  "eslint-plugin-solid",
  "eslint-plugin-sonarjs",
  "eslint-plugin-unicorn",
  "eslint",
  "globals",
  "prettier",
  "typescript",
  "typescript-eslint",
];

const configFiles = [
  { name: "eslint.config.ts", target: "eslint.config.ts" },
  { name: ".prettierrc.json", target: ".prettierrc.json" },
];

const scripts = {
  lint: "eslint 'src/**/*.{ts,mts,tsx}' --fix",
  format: "prettier --write 'src/**/*.{ts,mts,tsx,js,json,md}'",
};

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

async function updatePackageJsonScripts() {
  const packageJsonPath = path.join(root, "package.json");
  const raw = await readFile(packageJsonPath, "utf8");
  const json = JSON.parse(raw);

  let modified = false;
  if (!json.scripts) json.scripts = {};

  for (const [key, command] of Object.entries(scripts)) {
    if (!json.scripts[key]) {
      json.scripts[key] = command;
      console.log(`✅ Added "${key}" script to package.json`);
      modified = true;
    } else {
      console.log(`ℹ️  "${key}" script already exists, skipped.`);
    }
  }

  if (modified) {
    await writeFile(packageJsonPath, JSON.stringify(json, null, 2) + "\n", "utf8");
    console.log("📦 package.json updated.");
  }
}

(async () => {
  try {
    await installDeps();
    await copyConfigs();
    await updatePackageJsonScripts();
    console.log("🎉 ESLint and Prettier setup complete!");
  } catch (error) {
    console.error("❌ Setup failed:", error);
    process.exit(1);
  }
})();
