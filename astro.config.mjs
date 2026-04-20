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
      description: "Una guida pratica alla programmazione in Python e C++ per chi parte da zero.",
      favicon: "/favicon.ico",
      logo: {
        src: "./src/assets/logo.svg",
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
