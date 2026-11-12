import type { MetadataRoute } from 'next';
import { locales, siteUrl } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const u = siteUrl();
  const languages = Object.fromEntries(locales.map((l) => [l, `${u}/${l}`]));
  return locales.map((l) => ({
    url: `${u}/${l}`,
    changeFrequency: 'weekly',
    priority: l === 'ru' ? 1 : 0.8,
    alternates: { languages },
  }));
}
