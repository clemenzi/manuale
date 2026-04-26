import { openrouter } from "@openrouter/ai-sdk-provider";
import { generateText, Output } from "ai";
import chalk from "chalk";
import dotenv from "dotenv";
import ora from "ora";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { z } from "zod/v4";

const ROOT_DIR = path.join(__dirname, "../../..");
const OUTPUT_DIR = path.join(process.cwd(), "dist");
// const WRITER_SKILL_PATH = path.join(ROOT_DIR, ".agents/skills/writer/SKILL.md");
const MODEL = process.env.MODEL || "openai/gpt-oss-120b:nitro";

const reviewSchema = z.object({
  reviews: z
    .array(
      z.object({
        lines: z
          .string()
          .regex(
            /^\d+(?:-\d+)?(?:,\s*\d+(?:-\d+)?)*$/,
            "line range must be in format X, X-Y or X-Y,X-Y",
          )
          .describe("range of lines, ex. 4, 4-5, 7"),
        review: z.string().describe("review of the lines"),
      }),
    )
    .describe("reviews of the document"),
});

type Review = z.infer<typeof reviewSchema>["reviews"][number];

dotenv.config({
  path: path.join(ROOT_DIR, ".env"),
  quiet: true,
});

async function buildSystemPrompt(): Promise<string> {
  // const writingGuidelines = await fs.readFile(WRITER_SKILL_PATH, "utf-8");

  return `
Il tuo lavoro è revisionare il documento e, se trovi qualcosa che necessita di essere migliorato, fare una revisione con il range di righe e il suggerimento di modifica. Se non c'è nulla da modificare, restituisci un array vuoto.
Il documento deve rispettare le seguenti linee guida:
- Ogni termine tecnico è spiegato in parole semplici al primo utilizzo (devi considerare l'ipotesi che il termine sia gia stato spiegato in altri documenti)
- Ogni nuovo concetto ha un'analogia della vita reale
- Nessun paragrafo supera le 4 frasi
- Ogni blocco di codice ha uno scopo chiaro e un solo concetto principale
- Gli esempi di codice sono minimali e commentati in italiano semplice
- I nomi usati nel codice sono semplici e facili da riconoscere
- Se serve, l'output atteso o il risultato del codice è mostrato subito dopo
- Il tono è caldo e incoraggiante dall'inizio alla fine
- Un principiante potrebbe seguire ogni passaggio senza conoscenze pregresse
`;
}

async function reviewDocument(file: string, systemPrompt: string): Promise<Review[]> {
  const content = await fs.readFile(file, "utf-8");
  const { output } = await generateText({
    model: openrouter(MODEL),
    system: systemPrompt,
    prompt: content,
    output: Output.object({
      schema: reviewSchema,
    }),
  });

  return output.reviews;
}

function printReviews(reviews: Review[]): void {
  for (const review of reviews) {
    console.log("At line(s) " + chalk.cyan(review.lines) + ":", chalk.yellow(review.review));
  }
}

type FileReviewResult = {
  file: string;
  reviews: Review[];
};

async function writeRunReviewFile(fileResults: FileReviewResult[]): Promise<void> {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const reportBody = fileResults
    .map(({ file, reviews }) => {
      if (reviews.length === 0) {
        return `## ${file}\nNo reviews needed.`;
      }

      const reviewBody = reviews
        .map((review) => `### Lines: ${review.lines}\n${review.review}`)
        .join("\n\n");

      return `## ${file}\n\n${reviewBody}`;
    })
    .join("\n\n");

  const content = `# Review report for run\n\n${reportBody}\n`;

  await fs.writeFile(path.join(OUTPUT_DIR, `review-run-${crypto.randomUUID()}.md`), content);
}

yargs(hideBin(process.argv))
  .command(
    "$0 <files...>",
    "review the documents",
    (yargs) => {
      return yargs.positional("files", {
        describe: "list of files to review",
        type: "string",
        array: true,
      });
    },
    async (argv) => {
      if (!argv.files) return;

      let hasErrors = false;
      const fileResults: FileReviewResult[] = [];
      const systemPrompt = await buildSystemPrompt();

      for (const file of argv.files) {
        const spinner = ora({
          text: `Reviewing ${file}`,
        }).start();

        try {
          const reviews = await reviewDocument(file, systemPrompt);

          fileResults.push({ file, reviews });

          if (reviews.length === 0) {
            spinner.succeed(`No reviews needed for ${file}`);
            continue;
          }

          hasErrors = true;
          spinner.succeed(`Reviews found for ${file}`);
          printReviews(reviews);
        } catch (error) {
          hasErrors = true;
          spinner.fail(`Failed to review ${file}`);
          console.error(error instanceof Error ? error.message : error);
        }
      }

      const hasReviews = fileResults.some(({ reviews }) => reviews.length > 0);

      if (hasReviews) {
        await writeRunReviewFile(fileResults);
      }

      if (hasErrors) {
        process.exit(1);
      }
    },
  )
  .parse();
