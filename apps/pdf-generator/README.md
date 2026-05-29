# Manuale PDF Generator

CLI for creating PDFs from Manuale Markdown/MDX documents.

The generator follows three levels:

- category: merges every document in a category into `[category].pdf`
- section: merges every document in a section into `[section]_[category].pdf`
- topic: exports each document to `[category]_[section]_[topic].pdf`

## Usage

Generate every PDF into the site's public directory:

```bash
pnpm pdf:generate
```

Generate only the topics in one section:

```bash
pnpm --filter @manuale/pdf-generator generate -- --scope topic --category python --section basics
```

Generate PDFs with explicit parallelism:

```bash
pnpm --filter @manuale/pdf-generator generate -- --scope topic --category python --section basics --concurrency 4
```

Prepare only the intermediate Markdown files:

```bash
pnpm --filter @manuale/pdf-generator generate -- --scope section --category sql --dry-run
```

## Options

- `--scope all|category|section|topic`: level to generate
- `--category <slug>`: filter by category, for example `python`
- `--section <slug>`: filter by section, for example `basics`
- `--topic <slug>`: filter by topic, for example `comments`
- `--docs <path>`: change the source documents directory
- `--out <path>`: change the PDF output directory
- `--markdown-out <path>`: change the intermediate Markdown output directory
- `--concurrency <number>` or `-j <number>`: number of PDFs to generate in parallel
- `--dry-run`: write intermediate Markdown files without generating PDFs
