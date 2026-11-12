/**
 * Contacts and project facts shown on the page.
 * DEMO values from the approved mockup — will come from the CMS (SiteSettings).
 * While `isDemo` is true the footer shows the "examples" disclaimer.
 */
export interface SiteInfo {
  isDemo: boolean;
  phone: string;
  whatsapp: string;
  email: string;
  instagram: string;
  telegram: string;
  facebook: string;
  /** "IV кв. 2028" etc. are in messages; completion is a demo fact too */
  completion: { quarter: number; year: number };
  coords: { lat: number; lon: number };
}

export const site: SiteInfo = {
  isDemo: true,
  phone: '+992 00 000-00-00',
  whatsapp: '+992 00 000-00-00',
  email: 'sales@levakant-residence.tj',
  instagram: '@levakant.residence',
  telegram: 't.me/levakant_residence',
  facebook: 'LEVAKANT RESIDENCE',
  completion: { quarter: 4, year: 2028 },
  coords: { lat: 37.869, lon: 68.918 },
};
