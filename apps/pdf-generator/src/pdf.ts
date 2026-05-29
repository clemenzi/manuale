import { mkdir, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { mdToPdf } from "md-to-pdf";
import { defaultPaths } from "./config.js";

const stylesheetPath = resolve(defaultPaths.workspaceRoot, "apps/pdf-generator/src/styles/pdf.css");

export async function renderPdf(input: {
  title: string;
  subtitle: string | null;
  markdown: string;
  outputPath: string;
}): Promise<void> {
  await mkdir(dirname(input.outputPath), { recursive: true });

  const css = await readFile(stylesheetPath, "utf8");

  await mdToPdf(
    { content: input.markdown },
    {
      dest: input.outputPath,
      css,
      document_title: input.title,
      body_class: ["manuale-pdf"],
      highlight_style: "github",
      marked_options: {
        gfm: true,
        breaks: false,
      },
      pdf_options: {
        format: "A4",
        printBackground: true,
        displayHeaderFooter: true,
        margin: {
          top: "22mm",
          right: "18mm",
          bottom: "20mm",
          left: "18mm",
        },
        footerTemplate: footerTemplate(input.title),
        headerTemplate: "<span></span>",
      },
      launch_options: {
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      },
    },
  );
}

function footerTemplate(title: string): string {
  return `
    <style>
      .manuale-footer {
        width: 100%;
        margin: 0 18mm;
        color: #687789;
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        font-size: 8px;
        display: flex;
        justify-content: space-between;
      }
    </style>
    <div class="manuale-footer">
      <span>${escapeHtml(title)}</span>
      <span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
    </div>
  `;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
