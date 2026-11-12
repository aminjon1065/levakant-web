import type { Pricing } from '@/lib/types';

/**
 * DEMO price model from the approved mockup — not real prices.
 * Will be replaced by the CMS (PricingSettings); while `isDemo` is true the footer says so.
 */
export const pricing: Pricing = {
  isDemo: true,
  currency: 'TJS',
  pxm: { typ: 5500, f9: 5800, ph: 6200 },
  downMin: 30,
  downStep: 5,
  months: [6, 12, 18, 24],
  discountFull: 5,
};
