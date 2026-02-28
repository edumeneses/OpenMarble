import { createMDX } from 'fumadocs-mdx/next'

const withMDX = createMDX({})

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  experimental: {
    reactCompiler: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default withMDX(config)
