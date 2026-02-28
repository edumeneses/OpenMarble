import { rehypeCode } from 'fumadocs-core/mdx-plugins'

import { fileGenerator, remarkDocGen } from 'fumadocs-docgen'
import { defineConfig, defineDocs, frontmatterSchema } from 'fumadocs-mdx/config'
import { z } from 'zod'

export const { docs, meta } = defineDocs({
  docs: {
    schema: frontmatterSchema.extend({
      preview: z.string().optional(),
      index: z.boolean().default(false),
    }),
  },
})

export default defineConfig({
  mdxOptions: {
    rehypePlugins: [[rehypeCode]],
    remarkPlugins: [[remarkDocGen, { generators: [fileGenerator()] }]],
  },
})
