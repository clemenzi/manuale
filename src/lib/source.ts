import { type InferPageType, loader, type LoaderPlugin } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';
import { createElement } from 'react';
import type { ComponentType, SVGProps } from 'react';
import { docs } from 'collections/server';
import { docsContentRoute, docsRoute } from './shared';
import { PythonIcon, CppIcon } from '@/components/icons';

const customIconsMap: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  PythonIcon,
  CppIcon,
};

function resolveCustomIcon(icon: unknown): ReturnType<typeof createElement> | undefined {
  if (typeof icon === 'string' && icon in customIconsMap) {
    const Component = customIconsMap[icon];
    return createElement(Component, { width: 20, height: 20 });
  }
  return undefined;
}

function customIconsPlugin(): LoaderPlugin {
  return {
    name: 'custom-icons',
    enforce: 'pre',
    transformPageTree: {
      file(node) {
        if (typeof node.icon === 'string') {
          const icon = resolveCustomIcon(node.icon);
          if (icon) return { ...node, icon };
        }
        return node;
      },
      folder(node) {
        if (typeof node.icon === 'string') {
          const icon = resolveCustomIcon(node.icon);
          if (icon) return { ...node, icon };
        }
        return node;
      },
      separator(node) {
        if (typeof node.icon === 'string') {
          const icon = resolveCustomIcon(node.icon);
          if (icon) return { ...node, icon };
        }
        return node;
      },
    },
  };
}

export const source = loader({
  source: docs.toFumadocsSource(),
  baseUrl: docsRoute,
  plugins: [customIconsPlugin(), lucideIconsPlugin()],
});

export function getPageMarkdownUrl(page: InferPageType<typeof source>) {
  const segments = [...page.slugs, 'content.md'];

  return {
    segments,
    url: `${docsContentRoute}/${segments.join('/')}`,
  };
}

export async function getLLMText(page: InferPageType<typeof source>) {
  const processed = await page.data.getText('processed');

  return `# ${page.data.title} (${page.url})

${processed}`;
}
