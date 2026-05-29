import { join } from "node:path";
import { groupByCategory, groupByTopic } from "./documents.js";
import { composeMarkdown } from "./markdown.js";
import { slugify } from "./slug.js";
import type { CliOptions, DocNode, RenderJob } from "./types.js";

export function createJobs(docs: DocNode[], options: CliOptions): RenderJob[] {
  const categories = groupByCategory(filterDocs(docs, options));
  const jobs: RenderJob[] = [];

  if (options.scope === "all" || options.scope === "category") {
    for (const category of categories) {
      jobs.push(
        createJob({
          kind: "category",
          title: category.title,
          subtitle: null,
          docs: category.docs,
          route: [category.slug],
          outputDirectory: options.outputDirectory,
          scratchDirectory: options.scratchDirectory,
        }),
      );
    }
  }

  if (options.scope === "all" || options.scope === "section") {
    for (const category of categories) {
      for (const section of category.sections) {
        jobs.push(
          createJob({
            kind: "section",
            title: section.title,
            subtitle: null,
            docs: section.docs,
            route: [category.slug, section.slug],
            outputDirectory: options.outputDirectory,
            scratchDirectory: options.scratchDirectory,
          }),
        );
      }
    }
  }

  if (options.scope === "all" || options.scope === "topic") {
    for (const topic of groupByTopic(filterDocs(docs, options))) {
      jobs.push(
        createJob({
          kind: "topic",
          title: topic.title,
          subtitle: null,
          docs: topic.docs,
          route: [topic.category, topic.section, topic.slug].filter((part) => part !== null),
          outputDirectory: options.outputDirectory,
          scratchDirectory: options.scratchDirectory,
        }),
      );
    }
  }

  return jobs;
}

function filterDocs(docs: DocNode[], options: CliOptions): DocNode[] {
  return docs.filter((doc) => {
    if (options.category && doc.category !== options.category) {
      return false;
    }

    if (options.section && doc.section !== options.section) {
      return false;
    }

    if (options.topic && doc.topic !== options.topic) {
      return false;
    }

    return true;
  });
}

function createJob(input: {
  kind: RenderJob["kind"];
  title: string;
  subtitle: string | null;
  docs: DocNode[];
  route: string[];
  outputDirectory: string;
  scratchDirectory: string;
}): RenderJob {
  const markdown = composeMarkdown(input.title, input.subtitle, input.docs);
  const fileStem = input.route.map((part) => slugify(part)).join("-");
  const fileName = `${fileStem}.pdf`;
  const markdownName = `${fileStem}.md`;

  return {
    kind: input.kind,
    title: input.title,
    subtitle: input.subtitle,
    markdown,
    markdownPath: join(input.scratchDirectory, markdownName),
    pdfPath: join(input.outputDirectory, fileName),
    sourceCount: input.docs.length,
  };
}
