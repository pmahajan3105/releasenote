import type { NextConfig } from "next";
import path from "node:path";

const supabaseHostname = (() => {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!rawUrl) return null

  try {
    return new URL(rawUrl).hostname
  } catch {
    return null
  }
})()

const remotePatterns: NonNullable<NextConfig['images']>['remotePatterns'] = [
  {
    protocol: 'https',
    hostname: '**.supabase.co',
  },
  {
    protocol: 'https',
    hostname: 'avatars.githubusercontent.com',
  },
  {
    protocol: 'https',
    hostname: 'images.unsplash.com',
  },
]

if (supabaseHostname) {
  remotePatterns.push({
    protocol: 'https',
    hostname: supabaseHostname,
  })
}

const nextConfig: NextConfig = {
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  outputFileTracingRoot: path.resolve(process.cwd()),
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns,
  },
  
  // Headers for caching and security
  async headers() {
    return [
      {
        source: '/notes/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ];
  },
  
// Commenting experimental features to test may resolve the deployment issue.
  // Remove these if not necessary or causing conflicts.
  
  // Output configuration - let Vercel handle this automatically
  // output: 'standalone',

  // Simplified webpack configuration
  // webpack: (config, { dev, isServer }) => {
  //   return config;
  // },
  
};

export default nextConfig;
