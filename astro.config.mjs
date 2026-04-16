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
      disable404Route: true,
      sidebar: [
        { slug: 'docs' },
        { label: 'Python', autogenerate: { directory: 'src/content/docs/python' } },
        { label: 'C++', autogenerate: { directory: 'src/content/docs/cpp' } },
      ],
    }),
  ],

  adapter: cloudflare(),
});