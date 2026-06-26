export { cn, type ClassValue } from "cnfast";

const languageByExtension: Record<string, string> = {
  css: "css",
  html: "html",
  js: "javascript",
  php: "php",
  py: "python",
  sql: "sql",
  ts: "typescript",
};

export function getLanguageFromPath(path: string): string {
  const extension = path.split(".").pop()?.toLowerCase();

  return (extension && languageByExtension[extension]) || "plaintext";
}
