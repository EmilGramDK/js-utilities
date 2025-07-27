import fs from "fs";
import path from "path";

// Get the folder from command-line args
const inputDir = process.argv[2];

if (!inputDir) {
  console.error("❌ Usage: bun generate-barrel.js <relative/path/to/folder>");
  process.exit(1);
}

const folderPath = path.resolve(__dirname, "../", inputDir);
const indexFilePath = path.join(folderPath, "index.ts");

// Validate folder exists
if (!fs.existsSync(folderPath) || !fs.statSync(folderPath).isDirectory()) {
  console.error(`❌ Folder does not exist: ${folderPath}`);
  process.exit(1);
}

// Read all .ts and .tsx files except index.ts
const files = fs
  .readdirSync(folderPath)
  .filter((file) => file !== "index.ts" && (file.endsWith(".ts") || file.endsWith(".tsx")));

// Generate export lines
const exports = files.map((file) => {
  const name = path.basename(file, path.extname(file));
  return `export * from "./${name}";`;
});

// Write to index.ts
fs.writeFileSync(indexFilePath, exports.join("\n") + "\n");

console.log(
  `✅ Generated ${path.relative(process.cwd(), indexFilePath)} with ${files.length} exports.`,
);
