'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { PublicConfig } from '@/lib/config';
import type { Pricing, SiteData } from '@/lib/types';

interface Ctx {
  d: SiteData;
  pricing: Pricing;
  /** owner-provided contacts, links and documents (only what is configured) */
  cfg: PublicConfig;
  /** prices, payment terms and dates are the mockup's examples */
  demo: boolean;
  locale: string;
}

const SiteCtx = createContext<Ctx | null>(null);

export function SiteProvider({ children, ...value }: Ctx & { children: ReactNode }) {
  return <SiteCtx.Provider value={value}>{children}</SiteCtx.Provider>;
}

export function useSiteData() {
  const c = useContext(SiteCtx);
  if (!c) throw new Error('useSiteData outside SiteProvider');
  return c;
}
