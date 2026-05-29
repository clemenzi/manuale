export type BuildScope = "all" | "category" | "section" | "topic";

export type DocNode = {
  category: string;
  section: string | null;
  topic: string;
  title: string;
  description: string | null;
  sourcePath: string;
  relativePath: string;
  content: string;
};

export type CategoryGroup = {
  slug: string;
  title: string;
  docs: DocNode[];
  sections: SectionGroup[];
};

export type SectionGroup = {
  category: string;
  slug: string;
  title: string;
  docs: DocNode[];
};

export type TopicGroup = {
  category: string;
  section: string | null;
  slug: string;
  title: string;
  docs: DocNode[];
};

export type RenderJob = {
  kind: "category" | "section" | "topic";
  title: string;
  subtitle: string | null;
  markdown: string;
  markdownPath: string;
  pdfPath: string;
  sourceCount: number;
};

export type CliOptions = {
  scope: BuildScope;
  category: string | null;
  section: string | null;
  topic: string | null;
  docsDirectory: string;
  outputDirectory: string;
  scratchDirectory: string;
  dryRun: boolean;
  concurrency: number;
};
