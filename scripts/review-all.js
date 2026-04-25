import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const docreviewToolPath = path.join(__dirname, "../apps/www/src/content/docs/");

function getMdxFiles(directory, files = []) {
  for (const file of fs.readdirSync(directory)) {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getMdxFiles(filePath, files);
    } else if (file.endsWith(".mdx")) {
      files.push(filePath);
    }
  }

  return files;
}

const files = getMdxFiles(docreviewToolPath);

spawn("pnpm", ["run", "tools:review", ...files], { stdio: "inherit" });
