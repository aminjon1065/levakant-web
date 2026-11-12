import 'server-only';

/**
 * Owner-provided public settings, read from environment variables at build time
 * (the pages are prerendered — rebuild after changing them). See `.env.example`.
 *
 * Rule: nothing here is invented. A channel, document or link that is not configured
 * is simply not shown (or shown with an honest "pending" status) — never a placeholder.
 * Lead-delivery secrets are NOT here: they are read at request time by /api/leads.
 */

export type DocKey = 'sketch' | 'permit' | 'expertise' | 'land' | 'contract';
export type Localized = Partial<Record<'ru' | 'tg' | 'en', string>>;

export interface PublicConfig {
  phone: { display: string; href: string } | null;
  whatsapp: { display: string; number: string } | null;
  telegram: { handle: string; url: string } | null;
  email: string | null;
  instagram: { handle: string; url: string } | null;
  facebook: { label: string; url: string } | null;
  office: Localized;
  hours: Localized;
  maps: { gis: string | null; google: string | null };
  docs: Record<DocKey, string | null>;
  privacyUrl: string | null;
  /** construction photo reports channel (shown only when set) */
  constructionChannelUrl: string | null;
  /** the developer's address is a draft until the developer approves it */
  developerQuoteApproved: boolean;
}

const env = (k: string) => {
  const v = process.env[k]?.trim();
  return v ? v : null;
};
const url = (k: string) => {
  const v = env(k);
  if (!v) return null;
  try {
    const u = new URL(v);
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.toString() : null;
  } catch {
    console.warn(`[config] ${k} is not a valid URL — ignored`);
    return null;
  }
};
const phone = (k: string) => {
  const v = env(k);
  if (!v) return null;
  const digits = v.replace(/\D/g, '');
  if (!/^\+?[\d\s()-]+$/.test(v) || digits.length < 9 || digits.length > 15) {
    console.warn(`[config] ${k} does not look like a phone number — ignored`);
    return null;
  }
  return { display: v, digits };
};
const localized = (k: string): Localized => ({
  ...(env(`${k}_RU`) ? { ru: env(`${k}_RU`)! } : {}),
  ...(env(`${k}_TG`) ? { tg: env(`${k}_TG`)! } : {}),
  ...(env(`${k}_EN`) ? { en: env(`${k}_EN`)! } : {}),
});

export function getPublicConfig(): PublicConfig {
  const p = phone('CONTACT_PHONE');
  const wa = phone('CONTACT_WHATSAPP');
  const tg = env('CONTACT_TELEGRAM')?.replace(/^@|^https?:\/\/t\.me\//, '') ?? null;
  const ig =
    env('CONTACT_INSTAGRAM')
      ?.replace(/^@|^https?:\/\/(www\.)?instagram\.com\//, '')
      .replace(/\/$/, '') ?? null;
  const email = env('CONTACT_EMAIL');
  const fb = url('CONTACT_FACEBOOK_URL');
  return {
    phone: p ? { display: p.display, href: 'tel:+' + p.digits } : null,
    whatsapp: wa ? { display: wa.display, number: wa.digits } : null,
    telegram: tg && /^[A-Za-z0-9_]{4,32}$/.test(tg) ? { handle: '@' + tg, url: 'https://t.me/' + tg } : null,
    email: email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null,
    instagram:
      ig && /^[A-Za-z0-9._]{1,30}$/.test(ig)
        ? { handle: '@' + ig, url: 'https://www.instagram.com/' + ig + '/' }
        : null,
    facebook: fb ? { label: env('CONTACT_FACEBOOK_LABEL') ?? 'Facebook', url: fb } : null,
    office: localized('CONTACT_OFFICE'),
    hours: localized('CONTACT_HOURS'),
    maps: { gis: url('MAP_2GIS_URL'), google: url('MAP_GOOGLE_URL') },
    docs: {
      sketch: url('DOC_SKETCH_URL'),
      permit: url('DOC_PERMIT_URL'),
      expertise: url('DOC_EXPERTISE_URL'),
      land: url('DOC_LAND_URL'),
      contract: url('DOC_CONTRACT_URL'),
    },
    privacyUrl: url('PRIVACY_POLICY_URL'),
    constructionChannelUrl: url('CONSTRUCTION_CHANNEL_URL'),
    developerQuoteApproved: env('DEVELOPER_QUOTE_APPROVED') === '1',
  };
}
