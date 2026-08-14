import createMDX from '@next/mdx'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  experimental: {
    // Only bundle the brand icons we actually import, not all of react-icons.
    optimizePackageImports: ['react-icons'],
  },
  images: {
    domains: [
      'api.microlink.io', // Microlink Image Preview
    ],
  },
}

const withMDX = createMDX({
  extension: /\.mdx?$/,
})

export default withMDX(nextConfig)
