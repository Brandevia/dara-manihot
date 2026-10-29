import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Stable in Next 16. Turns links to routes that don't exist (like the old
  // /privacy and /terms footer links) into compile-time type errors.
  typedRoutes: true,

  // Next 16 only allows `images.qualities: [75]` by default; the hero uses 85.
  images: {
    qualities: [75, 85],
  },

  // Next 16 replaces the old wildcard CORS header with an allow-list for the
  // dev server. These cover the Replit preview domains used by this project.
  allowedDevOrigins: ['*.replit.dev', '*.repl.co', '*.replit.app'],

  experimental: {
    agentUpgrade: 'security',
  },
}

export default nextConfig
