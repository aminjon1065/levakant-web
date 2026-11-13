import 'server-only';
import { routing } from '@/i18n/routing';

/** Public site URL (canonical, hreflang, sitemap, previews). */
export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
/** Search engines may index the site only when explicitly allowed (`SITE_INDEXABLE=1`). */
export const indexable = () => process.env.SITE_INDEXABLE === '1';
export const OG_LOCALE: Record<string, string> = { ru: 'ru_RU', tg: 'tg_TJ', en: 'en_US' };
export const locales = routing.locales;
