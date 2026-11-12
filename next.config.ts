import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';
// Never let search engines index a build that points canonical / sitemap / previews to a placeholder.
if (process.env.SITE_INDEXABLE === '1' && (!/^https:\/\//.test(siteUrl) || /example\.com|localhost/.test(siteUrl))) {
  throw new Error('SITE_INDEXABLE=1 requires NEXT_PUBLIC_SITE_URL with the real https:// domain');
}
// A closed demo may run without a domain, but link previews (og:image) and canonical links would point nowhere.
if (process.env.NODE_ENV === 'production' && (!siteUrl || /example\.com|localhost/.test(siteUrl))) {
  console.warn(
    `⚠ NEXT_PUBLIC_SITE_URL is "${siteUrl || 'not set'}": link previews and canonical URLs will not point to the site.`,
  );
}

const ga = process.env.NEXT_PUBLIC_GA4_ID;
const ym = process.env.NEXT_PUBLIC_YM_ID;
const fb = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const src = (...hosts: (string | false | undefined)[]) => hosts.filter(Boolean).join(' ');

/**
 * Content-Security-Policy (production): own origin only, plus analytics hosts when an ID is configured.
 * 'unsafe-inline' scripts are needed by the prerendered pages (Next's inline RSC payload, JSON-LD);
 * no third-party code runs unless analytics is switched on.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${src(ga && 'https://www.googletagmanager.com', ym && 'https://mc.yandex.ru https://yastatic.net', fb && 'https://connect.facebook.net')}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${src(ga && 'https://*.google-analytics.com https://www.googletagmanager.com', ym && 'https://mc.yandex.ru', fb && 'https://www.facebook.com')}`,
  "font-src 'self'",
  `connect-src 'self' ${src(ga && 'https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com', ym && 'https://mc.yandex.ru https://mc.yandex.com', fb && 'https://www.facebook.com')}`,
  `frame-src ${ym ? 'https://mc.yandex.ru' : "'none'"}`,
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join('; ');

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
  ...(siteUrl.startsWith('https://')
    ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }]
    : []),
  // dev needs eval for fast refresh — the policy applies to production builds only
  ...(process.env.NODE_ENV === 'production' ? [{ key: 'Content-Security-Policy', value: csp }] : []),
];

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
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default createNextIntlPlugin('./src/i18n/request.ts')(nextConfig);
