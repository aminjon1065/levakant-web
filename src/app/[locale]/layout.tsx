import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import '@/styles/00-fonts.css';
import '@/styles/10-main.css';
import '@/styles/20-v4-building.css';
import '@/styles/30-v5.css';
import '@/styles/40-v6.css';
import '@/styles/50-v7.css';
import '@/styles/60-v8-sales.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `/${locale}`,
      languages: { ...Object.fromEntries(routing.locales.map((l) => [l, `/${l}`])), 'x-default': '/ru' },
    },
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
    <html lang={locale}>
      <head>
        {PRELOAD.map((f) => (
          <link key={f} rel="preload" href={`/fonts/${f}.woff2`} as="font" type="font/woff2" crossOrigin="" />
        ))}
        <link rel="preload" href="/assets/hero_photo.webp" as="image" fetchPriority="high" />
      </head>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
