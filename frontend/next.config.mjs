import { createMDX } from 'fumadocs-mdx/next'

const withMDX = createMDX()

/** @type {import('next').NextConfig} */
const config = {
  reactCompiler: true,
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/files/**',
      },
    ],
  },
  async redirects() {
    return [
      // The SuperSplat viewer is a static build symlinked into public/.
      // Next.js does not serve extensionless directory paths, so /supersplat
      // 404s — send it to the built index.html.
      {
        source: '/supersplat',
        destination: '/supersplat/index.html',
        permanent: false,
      },
      // Legacy route: the app was renamed OpenMarble -> Diorama.
      {
        source: '/openmarble/:path*',
        destination: '/diorama/:path*',
        permanent: true,
      },
    ]
  },
}

export default withMDX(config)
