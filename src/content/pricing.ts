import type { Pricing } from '@/lib/types';

/**
 * Price model: the approved mockup's figures, confirmed by the owner as the real offer (2026-11-13).
 * Will be replaced by the CMS (PricingSettings). `isDemo: true` brings back the «ДЕМО» marks on prices, terms
 * and dates, the demo footnote under the payment options and the footer disclaimer.
 */
export const pricing: Pricing = {
  isDemo: false,
  currency: 'TJS',
  pxm: { typ: 5500, f9: 5800, ph: 6200 },
  downMin: 30,
  downStep: 5,
  months: [6, 12, 18, 24],
  discountFull: 5,
};
