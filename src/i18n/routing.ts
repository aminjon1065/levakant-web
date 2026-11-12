import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['ru', 'tg', 'en'],
  defaultLocale: 'ru',
  localePrefix: 'always',
  // Russian is the primary language: `/` always goes to `/ru`, visitors switch manually.
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
