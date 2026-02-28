import type { DocsLayoutProps } from 'fumadocs-ui/layouts/docs'
import type { HomeLayoutProps } from 'fumadocs-ui/layouts/home'
import { source } from '@/app/source'

// shared configuration
export const baseOptions: HomeLayoutProps = {
  nav: {
    title: 'Vision UI',
  },
  links: [
    {
      text: 'Documentation',
      url: '/docs',
      active: 'nested-url',
    },
  ],
  githubUrl: 'https://github.com/fluid-design-io/vision-ui',
}

// docs layout configuration
export const docsOptions: DocsLayoutProps = {
  ...baseOptions,
  tree: source.pageTree,
}
