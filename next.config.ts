import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export', // 정적 export 설정!!
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true, // 정적 export용
    remotePatterns: [
      {
        hostname: '**',
      },
    ],
  },
  // 정적 배포 최적화
  trailingSlash: false,
  skipMiddlewareUrlNormalize: false,
  skipTrailingSlashRedirect: false,
};

export default nextConfig;
