import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getLanguageFromPath(path: string): string {
  const fileContent = path.split(".").pop()?.toLowerCase();

  if (fileContent === "py") {
    return "python";
  } else if (fileContent === "js") {
    return "javascript";
  } else if (fileContent === "ts") {
    return "typescript";
  } else if (fileContent === "html") {
    return "html";
  } else if (fileContent === "css") {
    return "css";
  } else if (fileContent === "php") {
    return "php";
  } else if (fileContent === "sql") {
    return "sql";
  }

  return "plaintext";
}
