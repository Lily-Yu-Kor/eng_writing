import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        hostname: '**',
      },
    ],
  },
  // Vercel 배포 최적화
  trailingSlash: false,
  skipMiddlewareUrlNormalize: false,
  skipTrailingSlashRedirect: false,
};

export default nextConfig;
