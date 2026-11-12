import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  output: 'standalone',
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [75],
    localPatterns: [{ pathname: '/assets/**' }],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default createNextIntlPlugin('./src/i18n/request.ts')(nextConfig);
