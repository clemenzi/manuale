import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import matter from "gray-matter";
import { labelCategory, labelSection, titleize } from "./labels.js";
import type { CategoryGroup, DocNode, SectionGroup, TopicGroup } from "./types.js";

const contentFilePattern = /\.mdx?$/;

export async function loadDocuments(docsDirectory: string): Promise<DocNode[]> {
  const paths = await collectFiles(docsDirectory);
  const docs = await Promise.all(paths.map((path) => readDocument(docsDirectory, path)));

  return docs
    .filter((doc) => doc !== null)
    .sort((left, right) => left.relativePath.localeCompare(right.relativePath, "it"));
}

export function groupByCategory(docs: DocNode[]): CategoryGroup[] {
  const groups = new Map<string, DocNode[]>();

  for (const doc of docs) {
    const categoryDocs = groups.get(doc.category) ?? [];
    categoryDocs.push(doc);
    groups.set(doc.category, categoryDocs);
  }

  return [...groups.entries()]
    .sort(([left], [right]) => left.localeCompare(right, "it"))
    .map(([slug, categoryDocs]) => ({
      slug,
      title: labelCategory(slug),
      docs: sortDocs(categoryDocs),
      sections: groupBySection(categoryDocs),
    }));
}

export function groupBySection(docs: DocNode[]): SectionGroup[] {
  const groups = new Map<string, DocNode[]>();

  for (const doc of docs) {
    if (!doc.section) {
      continue;
    }

    const sectionDocs = groups.get(doc.section) ?? [];
    sectionDocs.push(doc);
    groups.set(doc.section, sectionDocs);
  }

  return [...groups.entries()]
    .sort(([left], [right]) => left.localeCompare(right, "it"))
    .map(([slug, sectionDocs]) => ({
      category: sectionDocs[0]?.category ?? "",
      slug,
      title: labelSection(slug),
      docs: sortDocs(sectionDocs),
    }));
}

export function groupByTopic(docs: DocNode[]): TopicGroup[] {
  return sortDocs(docs).map((doc) => ({
    category: doc.category,
    section: doc.section,
    slug: doc.topic,
    title: doc.title,
    docs: [doc],
  }));
}

function sortDocs(docs: DocNode[]): DocNode[] {
  return [...docs].sort((left, right) => {
    const sectionOrder = (left.section ?? "").localeCompare(right.section ?? "", "it");
    if (sectionOrder !== 0) {
      return sectionOrder;
    }

    if (left.topic === "index") {
      return -1;
    }

    if (right.topic === "index") {
      return 1;
    }

    return left.topic.localeCompare(right.topic, "it");
  });
}

async function collectFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);

      if (entry.isDirectory()) {
        return collectFiles(path);
      }

      if (entry.isFile() && contentFilePattern.test(entry.name)) {
        return [path];
      }

      return [];
    }),
  );

  return files.flat();
}

async function readDocument(docsDirectory: string, sourcePath: string): Promise<DocNode | null> {
  const relativePath = relative(docsDirectory, sourcePath);
  const parts = relativePath.split(/[\\/]/);

  if (parts.length < 2) {
    return null;
  }

  const raw = await readFile(sourcePath, "utf8");
  const parsed = matter(raw);
  const fileName = parts.at(-1)?.replace(contentFilePattern, "") ?? "index";
  const category = parts[0] ?? "";
  const section = parts.length > 2 ? (parts.at(-2) ?? null) : null;

  return {
    category,
    section,
    topic: fileName,
    title: typeof parsed.data.title === "string" ? parsed.data.title : titleize(fileName),
    description: typeof parsed.data.description === "string" ? parsed.data.description : null,
    sourcePath,
    relativePath,
    content: stripMdxOnlySyntax(parsed.content),
  };
}

function stripMdxOnlySyntax(markdown: string): string {
  return markdown
    .replace(/^import\s.+?;?\s*$/gm, "")
    .replace(/^export\s.+?;?\s*$/gm, "")
    .replace(/<([A-Z][A-Za-z0-9.]*)\b[^>]*>/g, "")
    .replace(/<\/([A-Z][A-Za-z0-9.]*)>/g, "");
}
