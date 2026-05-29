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
          fileStem: category.slug,
          outputDirectory: join(options.outputDirectory, category.slug),
          scratchDirectory: join(options.scratchDirectory, category.slug),
        }),
      );
    }
  }

  if (options.scope === "all" || options.scope === "section") {
    for (const category of categories) {
      for (const section of category.sections) {
        const fileStem = `${section.slug}_${category.slug}`;
        jobs.push(
          createJob({
            kind: "section",
            title: section.title,
            subtitle: null,
            docs: section.docs,
            fileStem,
            outputDirectory: join(options.outputDirectory, category.slug, section.slug),
            scratchDirectory: join(options.scratchDirectory, category.slug, section.slug),
          }),
        );
      }
    }
  }

  if (options.scope === "all" || options.scope === "topic") {
    for (const topic of groupByTopic(filterDocs(docs, options))) {
      const fileStem = [topic.category, topic.section, slugify(topic.slug)]
        .filter(Boolean)
        .join("_");

      jobs.push(
        createJob({
          kind: "topic",
          title: topic.title,
          subtitle: null,
          docs: topic.docs,
          fileStem,
          outputDirectory: join(options.outputDirectory, topic.category, topic.section ?? "index"),
          scratchDirectory: join(
            options.scratchDirectory,
            topic.category,
            topic.section ?? "index",
          ),
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
  fileStem: string;
  outputDirectory: string;
  scratchDirectory: string;
}): RenderJob {
  const markdown = composeMarkdown(input.title, input.subtitle, input.docs);
  const fileName = `${slugify(input.fileStem)}.pdf`;
  const markdownName = `${slugify(input.fileStem)}.md`;

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
