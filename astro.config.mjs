// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  integrations: [
    starlight({
      title: 'Programming Handbook',
      description:
        'Una guida pratica alla programmazione in Python e C++ per chi parte da zero.',
      editLink: {
        baseUrl: 'https://github.com/clemenzi/programming-handbook-it/edit/main/src/content/docs/',
      },
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/clemenzi/programming-handbook-it',
        },
      ],
      components: {
        Sidebar: './src/components/starlight/Sidebar.astro',
      },
      disable404Route: true,
      sidebar: [
        {
          label: 'Python',
          items: [
            'python',
            {
              label: 'Le basi',
              collapsed: false,
              autogenerate: { directory: 'docs/python/basics' },
            },
            {
              label: 'Strutture dati',
              collapsed: false,
              autogenerate: { directory: 'docs/python/data-structures' },
            },
            {
              label: 'Controllo del flusso',
              collapsed: false,
              autogenerate: { directory: 'docs/python/flow-control' },
            },
            {
              label: 'Funzioni',
              collapsed: false,
              autogenerate: { directory: 'docs/python/functions' },
            },
            {
              label: 'Programmazione a oggetti',
              collapsed: true,
              autogenerate: { directory: 'docs/python/oop' },
            },
            {
              label: 'Moduli e libreria standard',
              collapsed: true,
              autogenerate: { directory: 'docs/python/modules-and-stdlib' },
            },
            {
              label: 'Input e output',
              collapsed: true,
              autogenerate: { directory: 'docs/python/input-output' },
            },
            {
              label: 'Gestione degli errori',
              collapsed: true,
              autogenerate: { directory: 'docs/python/errors' },
            },
            {
              label: 'Tecniche avanzate',
              collapsed: true,
              autogenerate: { directory: 'docs/python/advanced' },
            },
            {
              label: 'Ecosistema Python',
              collapsed: true,
              autogenerate: { directory: 'docs/python/ecosystem' },
            },
            {
              label: 'Grafica e interfacce',
              collapsed: true,
              autogenerate: { directory: 'docs/python/graphics' },
            },
          ],
        },
        {
          label: 'CPP',
          items: [
            'cpp',
            {
              label: 'Le basi',
              collapsed: false,
              autogenerate: { directory: 'docs/cpp/basics' },
            },
            {
              label: 'Input e output',
              collapsed: false,
              autogenerate: { directory: 'docs/cpp/input-output' },
            },
            {
              label: 'Controllo del flusso',
              collapsed: false,
              autogenerate: { directory: 'docs/cpp/flow-control' },
            },
            {
              label: 'Strutture dati',
              collapsed: true,
              autogenerate: { directory: 'docs/cpp/data-structures' },
            },
            {
              label: 'Funzioni',
              collapsed: true,
              autogenerate: { directory: 'docs/cpp/functions' },
            },
            {
              label: 'Memoria e puntatori',
              collapsed: true,
              autogenerate: { directory: 'docs/cpp/memory' },
            },
            {
              label: 'Programmazione a oggetti',
              collapsed: true,
              autogenerate: { directory: 'docs/cpp/oop' },
            },
            {
              label: 'Tecniche avanzate',
              collapsed: true,
              autogenerate: { directory: 'docs/cpp/advanced' },
            },
            {
              label: 'Strumenti e tecniche',
              collapsed: true,
              autogenerate: { directory: 'docs/cpp/tools' },
            },
          ],
        },
      ],
    }),
  ],

  adapter: cloudflare(),
});
