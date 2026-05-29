import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const appDirectory = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(appDirectory, "../../..");

export const defaultPaths = {
  workspaceRoot,
  docsDirectory: resolve(workspaceRoot, "apps/www/src/content/docs"),
  outputDirectory: resolve(workspaceRoot, "apps/www/public/pdf"),
  scratchDirectory: resolve(workspaceRoot, "apps/pdf-generator/.generated/markdown"),
};
