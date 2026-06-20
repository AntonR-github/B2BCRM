import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'app.payper.co.il',
      },
      {
        protocol: 'https',
        hostname: 'api.payper.co.il',
      },
    ],
  },
}

export default nextConfig
