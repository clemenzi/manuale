// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

import cloudflare from "@astrojs/cloudflare";

import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://www.manuale.dev",
  integrations: [
    starlight({
      title: "Manuale",
      description:
        "Una guida pratica alla programmazione in Python, SQL e C++ per chi parte da zero.",
      favicon: "/favicon.ico",
      logo: {
        dark: "./src/assets/logo-dark.svg",
        light: "./src/assets/logo-light.svg",
        alt: "Manuale Logo",
      },
      routeMiddleware: "./src/route-middleware.ts",
      components: {},
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
          label: "SQL",
          items: [
            "sql",
            {
              label: "Le basi",
              collapsed: false,
              items: [
                "sql/basics/cos-e-sql",
                "sql/basics/database-relazionali",
                "sql/basics/tipi-di-dati",
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
                "sql/queries/select",
                "sql/queries/alias",
                "sql/queries/where",
                "sql/queries/operatori-di-confronto",
                "sql/queries/operatori-logici",
                "sql/queries/null",
                "sql/queries/order-by",
                "sql/queries/limit-e-offset",
                "sql/queries/insert",
                "sql/queries/update",
                "sql/queries/delete",
                "sql/queries/funzioni-aggregate",
                "sql/queries/group-by",
                "sql/queries/having",
                "sql/queries/funzioni-stringhe",
                "sql/queries/funzioni-date-tempo",
                "sql/queries/cast-e-convert",
                "sql/queries/join",
                "sql/queries/join-avanzati",
                "sql/queries/subquery",
                "sql/queries/cte",
                "sql/queries/set-operations",
                "sql/queries/window-functions",
                "sql/queries/query-ricorsive",
              ],
            },
            {
              label: "Progettazione dati",
              collapsed: true,
              items: [
                "sql/design/schema-design",
                "sql/design/vincoli",
                "sql/design/relazioni-tra-tabelle",
                "sql/design/sequence-e-auto-increment",
                "sql/design/normalizzazione-1nf",
                "sql/design/normalizzazione-2nf",
                "sql/design/normalizzazione-3nf",
                "sql/design/denormalizzazione",
                "sql/design/create-index",
                "sql/design/indici-avanzati",
                "sql/design/drop-index",
                "sql/design/create-view",
                "sql/design/materialized-view",
              ],
            },
            {
              label: "Transazioni e concorrenza",
              collapsed: true,
              items: [
                "sql/transactions/transazioni",
                "sql/transactions/acid",
                "sql/transactions/livelli-di-isolamento",
                "sql/transactions/locking-e-concorrenza",
                "sql/transactions/deadlock",
              ],
            },
            {
              label: "Programmazione lato database",
              collapsed: true,
              items: [
                "sql/programming/stored-procedure",
                "sql/programming/stored-procedure-avanzate",
                "sql/programming/funzioni-definite-dall-utente",
                "sql/programming/trigger",
                "sql/programming/cursori",
              ],
            },
            {
              label: "Operazioni e performance",
              collapsed: true,
              items: [
                "sql/operations/gestione-utenti-e-permessi",
                "sql/operations/sicurezza-del-database",
                "sql/operations/backup-e-restore",
                "sql/operations/import-export-dati",
                "sql/operations/etl",
                "sql/operations/json-e-dati-semi-strutturati",
                "sql/operations/testing-query-sql",
                "sql/operations/versioning-e-migrazioni-database",
                "sql/operations/explain-e-query-plan",
                "sql/operations/analisi-delle-performance",
                "sql/operations/logging-e-monitoring",
                "sql/operations/gestione-di-grandi-dataset",
                "sql/operations/partizionamento-delle-tabelle",
                "sql/operations/sharding",
                "sql/operations/best-practice-sql",
                "sql/operations/anti-pattern-comuni",
                "sql/operations/differenze-tra-dialetti-sql",
                "sql/operations/introduzione-a-orm",
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
  ],

  adapter: cloudflare(),

  vite: {
    plugins: [tailwindcss()],
  },
});
