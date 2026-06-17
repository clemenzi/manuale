import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const languageByExtension: Record<string, string> = {
  css: "css",
  html: "html",
  js: "javascript",
  php: "php",
  py: "python",
  sql: "sql",
  ts: "typescript",
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getLanguageFromPath(path: string): string {
  const extension = path.split(".").pop()?.toLowerCase();

  return (extension && languageByExtension[extension]) || "plaintext";
}
