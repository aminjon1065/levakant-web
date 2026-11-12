'use client';

import { create } from 'zustand';

/**
 * Page state shared by all interactive sections.
 * Field names and defaults are the mockup's `Component.state` (levakant-source/src/main.js),
 * so the ported logic reads 1:1. Language lives in the URL (/ru, /tg, /en), not here.
 */
export interface SiteState {
  // 3D building explorer
  glB3: boolean;
  /** live 3D status per stage: '' (not started yet) | loading | ready | error | off-webgl | off-pref | off-device */
  b3St: string;
  sunSt: string;
  /** visitor opted in to 3D (reduced motion / modest device) */
  force3d: boolean;
  enter: boolean;
  tod: 'day' | 'dusk' | 'night';
  floor: string;
  exApt: string;
  view: '' | 'front' | 'corner' | 'yard' | 'top';
  ex: boolean;
  op: boolean;
  ry: number;
  rx: number;
  fz: boolean;
  fpFlip: boolean;
  // sun
  glSun: boolean;
  sunM: number;
  sunD: 'summer' | 'equinox' | 'winter';
  sunH: number;
  sunPlay: boolean;
  // apartment card
  am: 'plan' | 'd3';
  rm: number;
  az: number;
  ax: number;
  av: '' | 'persp' | 'top';
  apt: string;
  fT: string;
  fA: string;
  fF: string;
  sortDesc: boolean;
  vz: number;
  lab: boolean;
  vFlip: boolean;
  fav: string;
  favCom: boolean;
  pz: boolean;
  pzTop: number;
  pzH: number;
  // commerce
  com: 'f1' | 'b';
  cFlip: boolean;
  // gallery
  lb: number;
  lbTop: number;
  lbH: number;
  lbFlip: boolean;
  // nav
  menu: boolean;
  spy: string;
  // form
  err: string;
  sending: boolean;
  sent: boolean;
  sName: string;
  sTel: string;
  sMethod: string;
  /** '' | 'not_configured' | 'rate' | 'failed' — why the last submit did not go through */
  sendErr: string;
  /** is the enquiry channel connected? null until /api/leads answers */
  leadsOn: boolean | null;
  /** calculator parameters attached to the enquiry ("Получить расчёт") */
  calc: { layout: string; floors: 'typ' | 'f9' | 'ph'; down: number; term: number } | null;
  // price calculator
  pcApt: string;
  pcFl: 'typ' | 'f9' | 'ph';
  pcDown: number;
  pcTerm: number;
}

export const initialState: SiteState = {
  glB3: false,
  b3St: '',
  sunSt: '',
  force3d: false,
  enter: false,
  tod: 'dusk',
  floor: '5',
  exApt: '',
  view: 'corner',
  ex: false,
  op: false,
  ry: -36,
  rx: -16,
  fz: false,
  fpFlip: false,
  glSun: false,
  sunM: -1,
  sunD: 'equinox',
  sunH: 12,
  sunPlay: false,
  am: 'plan',
  rm: -1,
  az: -30,
  ax: 54,
  av: 'persp',
  apt: 'b8029',
  fT: 'all',
  fA: 'all',
  fF: 'all',
  sortDesc: false,
  vz: 0,
  lab: true,
  vFlip: false,
  fav: '',
  favCom: false,
  pz: false,
  pzTop: 0,
  pzH: 900,
  com: 'f1',
  cFlip: false,
  lb: -1,
  lbTop: 0,
  lbH: 800,
  lbFlip: false,
  menu: false,
  spy: '',
  err: '',
  sending: false,
  sent: false,
  sName: '',
  sTel: '',
  sMethod: '',
  sendErr: '',
  leadsOn: null,
  calc: null,
  pcApt: 'b6329',
  pcFl: 'typ',
  pcDown: 30,
  pcTerm: 24,
};

export const useSite = create<SiteState>()(() => ({ ...initialState }));

/** setState, as in the mockup component. */
export const set = (o: Partial<SiteState>) => useSite.setState(o);
/** `up(o)` from the mockup: a handler that applies a state patch. */
export const up = (o: Partial<SiteState>) => () => set(o);
export const get = () => useSite.getState();

/** 'true' / 'false' for aria attributes. */
export const tf = (v: boolean) => (v ? 'true' : 'false') as 'true' | 'false';

export const favList = (fav: string) => (fav ? fav.split('|') : []);
