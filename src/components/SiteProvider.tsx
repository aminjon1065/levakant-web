'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { Pricing, SiteData } from '@/lib/types';
import type { SiteInfo } from '@/content/site';

interface Ctx {
  d: SiteData;
  pricing: Pricing;
  site: SiteInfo;
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
