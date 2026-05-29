#!/usr/bin/env node
import { mkdir } from "node:fs/promises";
import { availableParallelism } from "node:os";
import { resolve } from "node:path";
import { defaultPaths } from "./config.js";
import { loadDocuments } from "./documents.js";
import { createJobs } from "./jobs.js";
import { writeMarkdown } from "./markdown.js";
import { renderPdf } from "./pdf.js";
import type { BuildScope, CliOptions } from "./types.js";

const scopes = new Set<BuildScope>(["all", "category", "section", "topic"]);
const defaultConcurrency = Math.max(1, Math.min(4, availableParallelism() - 1));

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const docs = await loadDocuments(options.docsDirectory);
  const jobs = createJobs(docs, options);

  if (jobs.length === 0) {
    throw new Error("No documents matched the selected filters.");
  }

  await mkdir(options.outputDirectory, { recursive: true });
  await mkdir(options.scratchDirectory, { recursive: true });

  console.log(`Found ${jobs.length} PDF job${jobs.length === 1 ? "" : "s"}.`);
  console.log(`Concurrency: ${options.dryRun ? 1 : options.concurrency}.`);

  await runQueue(jobs, options.dryRun ? 1 : options.concurrency, async (job) => {
    await writeMarkdown(job.markdownPath, job.markdown);

    if (!options.dryRun) {
      await renderPdf({
        title: job.title,
        subtitle: job.subtitle,
        markdown: job.markdown,
        outputPath: job.pdfPath,
      });
    }

    const status = options.dryRun ? "prepared" : "generated";
    const fileLabel = job.sourceCount === 1 ? "file" : "files";
    console.log(`${status}: ${job.pdfPath} (${job.sourceCount} ${fileLabel})`);
  });

  console.log(`Done: ${jobs.length} PDF ${options.dryRun ? "prepared" : "generated"}.`);
}

function parseArgs(args: string[]): CliOptions {
  const options: CliOptions = {
    scope: "all",
    category: null,
    section: null,
    topic: null,
    docsDirectory: defaultPaths.docsDirectory,
    outputDirectory: defaultPaths.outputDirectory,
    scratchDirectory: defaultPaths.scratchDirectory,
    dryRun: false,
    concurrency: defaultConcurrency,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const next = args[index + 1];

    switch (arg) {
      case "--":
        break;

      case "--scope":
        if (!next || !scopes.has(next as BuildScope)) {
          throw new Error(`Invalid scope. Use one of: ${[...scopes].join(", ")}.`);
        }
        options.scope = next as BuildScope;
        index += 1;
        break;

      case "--category":
        options.category = readValue(arg, next);
        index += 1;
        break;

      case "--section":
        options.section = readValue(arg, next);
        index += 1;
        break;

      case "--topic":
        options.topic = readValue(arg, next);
        index += 1;
        break;

      case "--docs":
        options.docsDirectory = resolve(readValue(arg, next));
        index += 1;
        break;

      case "--out":
        options.outputDirectory = resolve(readValue(arg, next));
        index += 1;
        break;

      case "--markdown-out":
        options.scratchDirectory = resolve(readValue(arg, next));
        index += 1;
        break;

      case "--concurrency":
      case "-j":
        options.concurrency = readPositiveInteger(arg, next);
        index += 1;
        break;

      case "--dry-run":
        options.dryRun = true;
        break;

      case "--help":
      case "-h":
        printHelp();
        process.exit(0);

      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

async function runQueue<T>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<void>,
): Promise<void> {
  let nextIndex = 0;

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (nextIndex < items.length) {
      const item = items[nextIndex];
      nextIndex += 1;

      if (item) {
        await worker(item);
      }
    }
  });

  await Promise.all(workers);
}

function readValue(name: string, value: string | undefined): string {
  if (!value || value.startsWith("--")) {
    throw new Error(`Missing value for ${name}.`);
  }

  return value;
}

function readPositiveInteger(name: string, value: string | undefined): number {
  const parsed = Number.parseInt(readValue(name, value), 10);

  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${name} must be a positive integer.`);
  }

  return parsed;
}

function printHelp(): void {
  console.log(`Manuale PDF Generator

Usage:
  pnpm --filter @manuale/pdf-generator generate -- [options]

Options:
  --scope all|category|section|topic  Level to generate (default: all)
  --category <slug>                   Filter by category, e.g. python
  --section <slug>                    Filter by section, e.g. basics
  --topic <slug>                      Filter by topic, e.g. comments
  --docs <path>                       Source MD/MDX documents directory
  --out <path>                        PDF output directory
  --markdown-out <path>               Intermediate Markdown output directory
  --concurrency, -j <number>          PDFs to generate in parallel (default: ${defaultConcurrency})
  --dry-run                           Write intermediate Markdown only
  --help                              Show this help
`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Error: ${message}`);
  process.exit(1);
});
