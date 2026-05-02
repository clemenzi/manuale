// @ts-check
import { mkdir, readdir, writeFile } from "node:fs/promises";
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

import cloudflare from "@astrojs/cloudflare";

import tailwindcss from "@tailwindcss/vite";

const site = "https://www.manuale.dev";

/** @returns {import("astro").AstroIntegration} */
function docsLanguageSitemaps() {
  return {
    name: "docs-language-sitemaps",
    hooks: {
      "astro:build:done": async ({ pages, dir, logger }) => {
        const docsDirectory = new URL("./src/content/docs/", import.meta.url);
        const docsEntries = await readdir(docsDirectory, { withFileTypes: true });
        const docsLanguages = new Set(
          docsEntries.filter((entry) => entry.isDirectory()).map((entry) => entry.name),
        );

        const pagesByLanguage = new Map();

        for (const { pathname } of pages) {
          const language = pathname.split("/").filter(Boolean).at(0);

          if (!language || !docsLanguages.has(language)) {
            continue;
          }

          if (!pagesByLanguage.has(language)) {
            pagesByLanguage.set(language, []);
          }

          pagesByLanguage.get(language).push(pathname);
        }

        const sitemapEntries = [];

        for (const [language, pathnames] of [...pagesByLanguage.entries()].sort()) {
          const filename = `sitemap-${language}.xml`;
          const urls = [...new Set(pathnames)]
            .sort()
            .map((pathname) => new URL(pathname, site).href);
          const xml = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
            ...urls.map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`),
            "</urlset>",
            "",
          ].join("\n");

          await mkdir(dir, { recursive: true });
          await writeFile(new URL(filename, dir), xml);
          sitemapEntries.push(new URL(filename, site).href);
        }

        if (sitemapEntries.length > 0) {
          const sitemapIndex = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
            ...sitemapEntries.map((url) => `  <sitemap><loc>${escapeXml(url)}</loc></sitemap>`),
            "</sitemapindex>",
            "",
          ].join("\n");

          await writeFile(new URL("sitemap-index.xml", dir), sitemapIndex);
        }

        logger.info(`Generated ${sitemapEntries.length} docs language sitemaps.`);
      },
    },
  };
}

/** @param {string} value */
function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export default defineConfig({
  site,
  integrations: [
    starlight({
      title: "Manuale",
      description:
        "Una guida pratica alla programmazione in Python, PHP, SQL e C++ per chi parte da zero.",
      favicon: "/favicon.ico",
      locales: {
        root: {
          label: "Italiano",
          lang: "it",
        },
      },
      logo: {
        dark: "./src/assets/logo-dark.svg",
        light: "./src/assets/logo-light.svg",
        alt: "Manuale Logo",
      },
      routeMiddleware: "./src/route-middleware.ts",
      components: {},
      disable404Route: true,
      social: [{ icon: "github", label: "GitHub", href: "https://github.com/clemenzi/manuale" }],
      customCss: ["./src/styles/global.css"],
      sidebar: [
        {
          label: "Python",
          items: [
            "python",
            {
              label: "Le basi",
              collapsed: false,
              autogenerate: { directory: "python/basics" },
            },
            {
              label: "Strutture dati",
              collapsed: false,
              autogenerate: { directory: "python/data-structures" },
            },
            {
              label: "Controllo del flusso",
              collapsed: false,
              autogenerate: { directory: "python/flow-control" },
            },
            {
              label: "Funzioni",
              collapsed: false,
              autogenerate: { directory: "python/functions" },
            },
            {
              label: "Programmazione a oggetti",
              collapsed: true,
              autogenerate: { directory: "python/oop" },
            },
            {
              label: "Moduli e libreria standard",
              collapsed: true,
              autogenerate: { directory: "python/modules-and-stdlib" },
            },
            {
              label: "Input e output",
              collapsed: true,
              autogenerate: { directory: "python/input-output" },
            },
            {
              label: "Gestione degli errori",
              collapsed: true,
              autogenerate: { directory: "python/errors" },
            },
            {
              label: "Tecniche avanzate",
              collapsed: true,
              autogenerate: { directory: "python/advanced" },
            },
            {
              label: "Ecosistema Python",
              collapsed: true,
              autogenerate: { directory: "python/ecosystem" },
            },
            {
              label: "Grafica e interfacce",
              collapsed: true,
              autogenerate: { directory: "python/graphics" },
            },
          ],
        },
        {
          label: "PHP",
          items: [
            "php",
            {
              label: "Le basi",
              collapsed: false,
              items: [
                "php/basics/installation",
                "php/basics/first-program",
                "php/basics/base-syntax",
                "php/basics/comments",
                "php/basics/variables-constants",
                "php/basics/data-types",
                "php/basics/operators",
              ],
            },
            {
              label: "Controllo del flusso",
              collapsed: false,
              items: [
                "php/flow-control/conditions",
                "php/flow-control/loops",
                "php/flow-control/break-continue",
              ],
            },
            {
              label: "Funzioni",
              collapsed: false,
              items: [
                "php/functions/functions",
                "php/functions/parameters-return-values",
                "php/functions/scope",
              ],
            },
            {
              label: "Strutture dati",
              collapsed: false,
              items: [
                "php/data-structures/strings",
                "php/data-structures/array",
                "php/data-structures/associative-arrays",
                "php/data-structures/dates-times",
              ],
            },
            {
              label: "PHP per applicazioni web",
              collapsed: true,
              items: [
                {
                  label: "Pagine, form e stato",
                  collapsed: false,
                  items: [
                    "php/web/php-html",
                    "php/web/form-get-post",
                    "php/web/sessions-cookies",
                    "php/web/file-upload",
                  ],
                },
                {
                  label: "Database con PDO",
                  collapsed: true,
                  items: [
                    "php/database/pdo",
                    "php/database/prepared-statements",
                    "php/database/crud",
                  ],
                },
              ],
            },
            {
              label: "Organizzare progetti PHP",
              collapsed: true,
              items: [
                {
                  label: "Programmazione a oggetti",
                  collapsed: true,
                  items: [
                    "php/oop/classes-objects",
                    "php/oop/constructors-visibility",
                    "php/oop/inheritance-interfaces-traits",
                  ],
                },
                {
                  label: "Strumenti",
                  collapsed: true,
                  items: [
                    "php/tools/composer",
                    "php/tools/autoload-namespaces",
                    "php/tools/testing-best-practices",
                  ],
                },
              ],
            },
            {
              label: "Gestione degli errori",
              collapsed: true,
              items: ["php/errors/common-errors", "php/errors/debugging", "php/errors/exceptions"],
            },
          ],
        },
        {
          label: "SQL",
          items: [
            "sql",
            {
              label: "Le basi",
              collapsed: false,
              items: [
                "sql/basics/what-is-sql",
                "sql/basics/relational-databases",
                "sql/basics/data-types",
                "sql/basics/create-database",
                "sql/basics/create-table",
                "sql/basics/alter-table",
                "sql/basics/drop-table",
              ],
            },
            {
              label: "Query",
              collapsed: false,
              items: [
                {
                  label: "Lettura dei dati",
                  collapsed: true,
                  items: [
                    "sql/queries/reading-data/select",
                    "sql/queries/reading-data/alias",
                    "sql/queries/reading-data/where",
                    "sql/queries/reading-data/comparison-operators",
                    "sql/queries/reading-data/logical-operators",
                    "sql/queries/reading-data/null",
                    "sql/queries/reading-data/order-by",
                    "sql/queries/reading-data/limit-offset",
                  ],
                },
                {
                  label: "Manipolazione dei dati",
                  collapsed: true,
                  items: [
                    "sql/queries/data-manipulation/insert",
                    "sql/queries/data-manipulation/update",
                    "sql/queries/data-manipulation/delete",
                  ],
                },
                {
                  label: "Aggregazione e funzioni",
                  collapsed: true,
                  items: [
                    "sql/queries/aggregation/aggregate-functions",
                    "sql/queries/aggregation/group-by",
                    "sql/queries/aggregation/having",
                    "sql/queries/aggregation/string-functions",
                    "sql/queries/aggregation/date-time-functions",
                    "sql/queries/aggregation/cast-e-convert",
                  ],
                },
                {
                  label: "Join e sottoquery",
                  collapsed: true,
                  items: [
                    "sql/queries/joins-subqueries/join",
                    "sql/queries/joins-subqueries/advanced-joins",
                    "sql/queries/joins-subqueries/subquery",
                    "sql/queries/joins-subqueries/cte",
                  ],
                },
                {
                  label: "Query avanzate",
                  collapsed: true,
                  items: [
                    "sql/queries/advanced/set-operations",
                    "sql/queries/advanced/window-functions",
                    "sql/queries/advanced/recursive-queries",
                  ],
                },
              ],
            },
            {
              label: "Progettazione dati",
              collapsed: false,
              items: [
                {
                  label: "Progettazione dello schema",
                  collapsed: true,
                  items: [
                    "sql/design/schema/schema-design",
                    "sql/design/schema/constraints",
                    "sql/design/schema/table-relationships",
                    "sql/design/schema/sequence-e-auto-increment",
                  ],
                },
                {
                  label: "Normalizzazione",
                  collapsed: true,
                  items: [
                    "sql/design/normalization/1nf-normalization",
                    "sql/design/normalization/2nf-normalization",
                    "sql/design/normalization/3nf-normalization",
                    "sql/design/normalization/denormalization",
                  ],
                },
                {
                  label: "Indici",
                  collapsed: true,
                  items: [
                    "sql/design/indexes/create-index",
                    "sql/design/indexes/advanced-indexes",
                    "sql/design/indexes/drop-index",
                  ],
                },
                {
                  label: "Viste",
                  collapsed: true,
                  items: ["sql/design/views/create-view", "sql/design/views/materialized-view"],
                },
              ],
            },
            {
              label: "Transazioni e concorrenza",
              collapsed: true,
              items: [
                "sql/transactions/transactions",
                "sql/transactions/acid",
                "sql/transactions/isolation-levels",
                "sql/transactions/locking-concurrency",
                "sql/transactions/deadlock",
              ],
            },
            {
              label: "Programmazione lato database",
              collapsed: true,
              items: [
                "sql/programming/stored-procedure",
                "sql/programming/advanced-stored-procedures",
                "sql/programming/user-defined-functions",
                "sql/programming/trigger",
                "sql/programming/cursors",
              ],
            },
            {
              label: "Operazioni e performance",
              collapsed: true,
              items: [
                "sql/operations/user-permission-management",
                "sql/operations/database-security",
                "sql/operations/backup-e-restore",
                "sql/operations/data-import-export",
                "sql/operations/etl",
                "sql/operations/json-semi-structured-data",
                "sql/operations/testing-query-sql",
                "sql/operations/database-versioning-migrations",
                "sql/operations/explain-e-query-plan",
                "sql/operations/performance-analysis",
                "sql/operations/logging-e-monitoring",
                "sql/operations/large-dataset-management",
                "sql/operations/table-partitioning",
                "sql/operations/sharding",
                "sql/operations/best-practice-sql",
                "sql/operations/common-anti-patterns",
                "sql/operations/sql-dialect-differences",
                "sql/operations/orm-introduction",
                "sql/operations/sql-vs-nosql",
              ],
            },
          ],
        },
        {
          label: "CPP",
          items: [
            "cpp",
            {
              label: "Le basi",
              collapsed: false,
              autogenerate: { directory: "cpp/basics" },
            },
            {
              label: "Input e output",
              collapsed: false,
              autogenerate: { directory: "cpp/input-output" },
            },
            {
              label: "Controllo del flusso",
              collapsed: false,
              autogenerate: { directory: "cpp/flow-control" },
            },
            {
              label: "Strutture dati",
              collapsed: true,
              autogenerate: { directory: "cpp/data-structures" },
            },
            {
              label: "Funzioni",
              collapsed: true,
              autogenerate: { directory: "cpp/functions" },
            },
            {
              label: "Memoria e puntatori",
              collapsed: true,
              autogenerate: { directory: "cpp/memory" },
            },
            {
              label: "Programmazione a oggetti",
              collapsed: true,
              autogenerate: { directory: "cpp/oop" },
            },
            {
              label: "Tecniche avanzate",
              collapsed: true,
              autogenerate: { directory: "cpp/advanced" },
            },
            {
              label: "Strumenti e tecniche",
              collapsed: true,
              autogenerate: { directory: "cpp/tools" },
            },
          ],
        },
      ],
    }),
    docsLanguageSitemaps(),
  ],

  adapter: cloudflare(),

  vite: {
    plugins: [tailwindcss()],
  },
});
