import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
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
  
  // Experimental features for performance
  experimental: {
    optimizePackageImports: ['lucide-react', '@heroicons/react'],
  },
  
  // TypeScript configuration
  typescript: {
    // Allow build to complete even with type errors (temporary)
    ignoreBuildErrors: true,
  },
  
  // ESLint configuration
  eslint: {
    // Do not allow builds to proceed if ESLint errors are present
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;