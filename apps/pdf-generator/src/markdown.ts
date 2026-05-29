import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { DocNode } from "./types.js";

export function composeMarkdown(title: string, subtitle: string | null, docs: DocNode[]): string {
  const chunks = [`# ${title}`];

  if (subtitle) {
    chunks.push(`_${subtitle}_`);
  }

  for (const doc of docs) {
    chunks.push(formatDocument(doc));
  }

  return `${chunks.join("\n\n---\n\n")}\n`;
}

export async function writeMarkdown(path: string, markdown: string): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, markdown, "utf8");
}

function formatDocument(doc: DocNode): string {
  const lines = [`## ${doc.title}`];

  if (doc.description) {
    lines.push("", `_${doc.description}_`);
  }

  lines.push("", doc.content.trim());
  return lines.join("\n");
}
