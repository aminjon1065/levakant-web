'use client';

/**
 * Funnel events. A no-op until an analytics ID is configured (NEXT_PUBLIC_YM_ID, NEXT_PUBLIC_GA4_ID,
 * NEXT_PUBLIC_META_PIXEL_ID) — then the event goes to every configured system. No personal data in params.
 */
export type AnalyticsEvent =
  | 'layout_select'
  | 'layout_share'
  | 'calc_quote'
  | 'calc_open_from_card'
  | 'building_explode'
  | 'apartment_3d'
  | 'contact_click'
  | 'lead_submit'
  | 'lead_error'
  | 'lang_switch';

type Params = Record<string, string | number | boolean>;
type W = Window & {
  gtag?: (...a: unknown[]) => void;
  ym?: (...a: unknown[]) => void;
  fbq?: (...a: unknown[]) => void;
};

const YM = process.env.NEXT_PUBLIC_YM_ID;

export function track(event: AnalyticsEvent, params: Params = {}) {
  if (typeof window === 'undefined') return;
  const w = window as W;
  try {
    w.gtag?.('event', event, params);
    if (YM) w.ym?.(Number(YM), 'reachGoal', event, params);
    w.fbq?.('trackCustom', event, params);
  } catch {
    /* analytics must never break the page */
  }
}
