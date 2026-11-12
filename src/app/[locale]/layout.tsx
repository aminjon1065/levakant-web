import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { indexable, OG_LOCALE, siteUrl } from '@/lib/site';
import '@/styles/00-fonts.css';
import '@/styles/10-main.css';
import '@/styles/20-v4-building.css';
import '@/styles/30-v5.css';
import '@/styles/40-v6.css';
import '@/styles/50-v7.css';
import '@/styles/60-v8-sales.css';
import '@/styles/70-launch.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  const title = t('title');
  const description = t('description');
  return {
    metadataBase: new URL(siteUrl()),
    title,
    description,
    alternates: {
      canonical: `/${locale}`,
      languages: { ...Object.fromEntries(routing.locales.map((l) => [l, `/${l}`])), 'x-default': '/ru' },
    },
    openGraph: {
      type: 'website',
      siteName: 'LEVAKANT RESIDENCE',
      title,
      description,
      url: `/${locale}`,
      locale: OG_LOCALE[locale],
      alternateLocale: routing.locales.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
      images: [{ url: '/og.jpg', width: 1200, height: 630, alt: t('ogAlt') }],
    },
    twitter: { card: 'summary_large_image', title, description, images: ['/og.jpg'] },
    robots: indexable() ? { index: true, follow: true } : { index: false, follow: false },
  };
}

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#111315' };

/** Fonts needed for the first screen (Cyrillic subsets). */
const PRELOAD = [
  'manrope-cyrillic-400-normal',
  'manrope-cyrillic-600-normal',
  'cormorant-garamond-cyrillic-300-normal',
  'cormorant-garamond-cyrillic-300-italic',
];

export default async function LocaleLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {PRELOAD.map((f) => (
          <link key={f} rel="preload" href={`/fonts/${f}.woff2`} as="font" type="font/woff2" crossOrigin="" />
        ))}
        {/* the hero render is the LCP element: preload the AVIF variant the CSS will pick (browsers without AVIF skip it) */}
        <link
          rel="preload"
          as="image"
          imageSrcSet="/assets/r/hero_photo-1080.avif 2x, /assets/r/hero_photo-1600.avif 3x"
          type="image/avif"
          media="(max-width: 760px)"
          fetchPriority="high"
        />
        <link
          rel="preload"
          as="image"
          imageSrcSet="/assets/r/hero_photo-1600.avif 1x, /assets/r/hero_photo-2400.avif 2x"
          type="image/avif"
          media="(min-width: 761px)"
          fetchPriority="high"
        />
        {/* lets CSS defer decorative backgrounds of far sections; without JS nothing is deferred */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
