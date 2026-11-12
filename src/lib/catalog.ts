'use client';

import type { KeyboardEvent } from 'react';
import { useTranslations } from 'next-intl';
import { useShallow } from 'zustand/react/shallow';
import { useSiteData } from '@/components/SiteProvider';
import { focusLater, place, preFill, withFav } from './actions';
import { a3Lt, a3Tf } from './drag';
import { nf } from './format';
import { m2Min, moOf, pxMin } from './pricing';
import { favList, get, set, tf, up, useSite, type SiteState } from './store';
import type { Layout } from './types';

const pc = (v: number | string) => v + '%';
const ZOOM = [1, 1.5, 2.2];
const ZPCT = ['100%', '150%', '220%'];

const PICK = (s: SiteState) => ({
  apt: s.apt,
  fT: s.fT,
  fA: s.fA,
  fF: s.fF,
  sortDesc: s.sortDesc,
  fav: s.fav,
  am: s.am,
  rm: s.rm,
  az: s.az,
  ax: s.ax,
  av: s.av,
  vz: s.vz,
  lab: s.lab,
  vFlip: s.vFlip,
  fpFlip: s.fpFlip,
  pz: s.pz,
  pzTop: s.pzTop,
  pzH: s.pzH,
});

type Filters = Pick<SiteState, 'fT' | 'fA' | 'fF'>;

/** Does a layout pass the type / area / floor filters? */
export function passes(l: Layout, f: Filters) {
  return (
    (f.fT === 'all' || (f.fT === 'ph' ? l.ph : String(l.r) === f.fT)) &&
    (f.fA === 'all' || (f.fA === 's' ? l.total < 50 : f.fA === 'm' ? l.total >= 50 && l.total < 70 : l.total >= 70)) &&
    (f.fF === 'all' || l.fk.includes(f.fF as Layout['fk'][number]))
  );
}

export function openPz() {
  const p = place('apartments');
  set({ pz: true, pzTop: p.top, pzH: p.h });
  focusLater('pz-x');
}

/** Apartment catalogue and the selected layout card (mockup renderVals: "catalog", "apartment: plan / 3d"). */
export function useCatalogVals() {
  const t = useTranslations('apartments');
  const { d, pricing: p, locale } = useSiteData();
  const s = useSite(useShallow(PICK));
  const L = d.L;
  const n = (v: number) => nf(locale, v);
  const all = d.order.map((id) => L[id]);
  const list = all.filter((l) => passes(l, s)).sort((a, b) => (s.sortDesc ? b.total - a.total : a.total - b.total));
  const sel = list.find((l) => l.id === s.apt) || list[0] || L[s.apt];
  const si = Math.max(0, list.indexOf(sel));
  const stepSel = (dir: number) => () => {
    if (list.length) set({ apt: list[(si + dir + list.length) % list.length].id, vFlip: !s.vFlip, vz: 0, rm: -1 });
  };
  const opts = (key: keyof Filters, arr: [string, string][]) =>
    arr.map(([val, label]) => {
      const cnt = all.filter((l) => passes(l, { ...s, [key]: val })).length;
      const on = s[key] === val;
      return {
        label,
        cnt: String(cnt),
        cls: 'chip' + (on ? ' on' : ''),
        on: tf(on),
        off: cnt === 0 && !on,
        pick: up({ [key]: val }),
      };
    });
  const favs = favList(s.fav);
  const cards = list.map((l) => ({
    cls: 'lc' + (l.id === sel.id ? ' on' : ''),
    on: tf(l.id === sel.id),
    img: l.img,
    title: l.title,
    area: l.as,
    floors: l.flShort,
    px: n(pxMin(d, p, l.id)),
    fav: favs.includes(l.id) ? 'on' : '',
    pick: up({ apt: l.id, vFlip: !s.vFlip, vz: 0, rm: -1 }),
  }));
  const fActive = s.fT !== 'all' || s.fA !== 'all' || s.fF !== 'all';
  const kpKey = sel.fk[0];
  const favOn = favs.includes(sel.id);
  const sFl: { n: string; aria: string; pick: () => void }[] = [];
  sel.fk.forEach((k) =>
    (k === 'typ' ? ['2', '3', '4', '5', '6', '7', '8'] : k === 'f9' ? ['9'] : ['ph']).forEach((fk) =>
      sFl.push({
        n: fk === 'ph' ? t('phShort') : fk,
        aria: t('inBuildingAria', { floor: fk === 'ph' ? t('floorPh') : t('floorN', { n: fk }) }),
        pick: up({ floor: fk, exApt: sel.id, ex: true, op: true, fpFlip: !s.fpFlip }),
      }),
    ),
  );

  /* apartment: plan / 3d */
  const rm3 = sel.rooms3 || null;
  const rmi = rm3 && s.rm >= 0 && s.rm < rm3.length && !rm3[s.rm].off ? s.rm : -1;
  const is3 = s.am === 'd3';
  const has3 = !!sel.m3;
  const pickRm = (i: number) => up({ rm: i === rmi ? -1 : i });
  const noop = () => {};
  const sRm = rm3
    ? rm3.map((r, i) => ({
        cls: 'rr' + (i === rmi ? ' on' : ''),
        n: r.n,
        a: t('areaM2', { a: r.as }),
        on: tf(i === rmi),
        off: !!r.off,
        pick: r.off ? noop : pickRm(i),
      }))
    : sel.list.map((r) => ({ cls: 'rr', n: r.n, a: r.a, on: tf(false), off: true, pick: noop }));
  const sRp = (rm3 || [])
    .map((r, i) => ({
      cls: 'rz' + (i === rmi ? ' on' : ''),
      cls3: 'q3-r' + (i === rmi ? ' on' : ''),
      clsK: i === rmi ? 'on' : '',
      poly: r.poly,
      on: tf(i === rmi),
      aria: t('roomAria', { n: r.n, a: r.as }),
      pick: pickRm(i),
      off: r.off,
    }))
    .filter((x) => !x.off);
  const alt = a3Lt(s.az, s.ax);
  const RL = Array.from({ length: 10 }, (_, i) => {
    const r = rm3 && rm3[i] && !rm3[i].off ? rm3[i] : null;
    return r
      ? {
          cls: 'q3-l' + (i === rmi ? ' on' : '') + (r.nm ? '' : ' un'),
          x: pc(r.cx),
          y: pc(r.cy),
          tf: alt,
          n: r.nm ? r.n : '',
          a: r.as,
        }
      : { cls: 'q3-l off', x: '0%', y: '0%', tf: alt, n: '', a: '' };
  });
  const nearZ = (a: number) => a + 360 * Math.round((s.az - a) / 360);
  const a3Ready = d.m3.map((id) => ({
    label: t('a3Label', { short: L[id].short, area: L[id].as }),
    cls: 'chip' + (id === sel.id ? ' on' : ''),
    pick: up({ apt: id, fT: 'all', fA: 'all', fF: 'all', am: 'd3', rm: -1, vz: 0, vFlip: !s.vFlip }),
  }));
  const rmR = rmi >= 0 ? rm3![rmi] : null;
  const addSel = withFav(sel.id);
  const pzKey = (e: KeyboardEvent) => {
    const vz = get().vz;
    if (e.key === 'Escape') set({ pz: false });
    else if (e.key === '+' || e.key === '=') set({ vz: Math.min(2, vz + 1) });
    else if (e.key === '-') set({ vz: Math.max(0, vz - 1) });
  };

  return {
    optT: opts('fT', [
      ['all', t('optAll')],
      ['1', t('optR1')],
      ['2', t('optR2')],
      ['4', t('optR4')],
      ['ph', t('optPh')],
    ]),
    optA: opts('fA', [
      ['all', t('optAny')],
      ['s', t('optS')],
      ['m', t('optM')],
      ['l', t('optL')],
    ]),
    optF: opts('fF', [
      ['all', t('optAnyF')],
      ['typ', '2–8'],
      ['f9', '9'],
      ['ph', t('optPhF')],
    ]),
    countLabel: list.length ? t('countLabel', { n: list.length }) : t('nothingFound'),
    toggleSort: up({ sortDesc: !s.sortDesc }),
    sortArrow: s.sortDesc ? '↓' : '↑',
    sortAria: t('sortHint', { dir: s.sortDesc ? t('sortDesc') : t('sortAsc') }),
    fActive,
    resetF: up({ fT: 'all', fA: 'all', fF: 'all' }),
    cards,
    noCards: list.length === 0,
    sPx: n(pxMin(d, p, sel.id)),
    sMo: n(moOf(p, pxMin(d, p, sel.id))),
    sM2: n(m2Min(d, p, sel.id)),
    sKicker: sel.ph ? t('kickerPh', { title: sel.title }) : sel.title,
    sTitle: sel.title,
    sArea: sel.as,
    sFloors: sel.fl,
    sSide: sel.side,
    sPos: list.length ? si + 1 + ' / ' + list.length : '',
    sPrev: stepSel(-1),
    sNext: stepSel(1),
    sAr: sel.ar,
    sImg: sel.img,
    sAlt: t('planAlt', { title: sel.title, area: sel.as }),
    sLabels: sel.labels.map((l) => ({ cls: 'rl' + (l.n ? '' : ' s'), n: l.n || '', a: l.a, x: pc(l.x), y: pc(l.y) })),
    sScale: (200 / sel.wm).toFixed(2) + '%',
    sPer: sel.per,
    sBalc: sel.balc,
    sHasNote: !!sel.note,
    sNote: sel.note || '',
    sLine: sel.list.map((r) => r.n + ' ' + r.a).join(' · '),
    lab: s.lab,
    labOn: tf(s.lab),
    toggleLab: up({ lab: !s.lab }),
    zF: ZOOM[s.vz],
    zPct: ZPCT[s.vz],
    zIn: up({ vz: Math.min(2, s.vz + 1) }),
    zOut: up({ vz: Math.max(0, s.vz - 1) }),
    zInOff: s.vz === 2,
    zOutOff: s.vz === 0,
    vA: s.vFlip,
    vB: !s.vFlip,
    pz: s.pz,
    pzTop: s.pzTop + 'px',
    pzH: s.pzH + 'px',
    pzOpen: openPz,
    pzClose: up({ pz: false }),
    pzKey,
    kpLabel: t('kpLabel', { f: kpKey === 'typ' ? '2–8' : kpKey === 'f9' ? '9' : t('kpPh') }),
    kpImg: d.img[`floor_${kpKey}`],
    kpZones: d.P[kpKey]
      .filter((z) => z.id === sel.id)
      .map((z) => ({ x: pc(z.x), y: pc(z.y), w: pc(z.w), h: pc(z.h), poly: z.poly })),
    favCls: 'chip' + (favOn ? ' on' : ''),
    favOn: tf(favOn),
    favLabel: favOn ? t('favOn') : t('favAdd'),
    toggleFav: up({ fav: (favOn ? favs.filter((x) => x !== sel.id) : favs.concat([sel.id])).join('|') }),
    favNote: favs.length ? t('favNote', { n: favs.length }) : t('favNone'),
    askApt: () => {
      set({ fav: addSel, sent: false });
      preFill({ w: ['w1'] });
    },
    askAptX: () => {
      set({ fav: addSel, sent: false, pz: false });
      preFill({ w: ['w1'] });
    },
    sFl,
    isPlan: !is3,
    is3,
    has3: is3 && has3,
    no3: is3 && !has3,
    mdPlanCls: is3 ? '' : 'on',
    mdPlanOn: tf(!is3),
    md3Cls: is3 ? 'on' : '',
    md3On: tf(is3),
    md3Note: has3 ? t('md3Ready') : t('md3Soon'),
    setPlan: up({ am: 'plan', vz: 0 }),
    set3d: up({ am: 'd3', vz: 0 }),
    sRm,
    sRp,
    a3Ready,
    RL,
    a3Cls: 'q3-m q3-' + sel.id,
    a3zCls: 'q3-sc z' + s.vz,
    a3tf: a3Tf(s.az, s.ax),
    avTopCls: 'tb' + (s.av === 'top' ? ' on' : ''),
    avTopOn: tf(s.av === 'top'),
    avPerCls: 'tb' + (s.av === 'persp' ? ' on' : ''),
    avPerOn: tf(s.av === 'persp'),
    avTop: up({ av: 'top', az: nearZ(0), ax: 0 }),
    avPer: up({ av: 'persp', az: nearZ(-30), ax: 54 }),
    rmK: rmR ? t('rmPicked') : rm3 ? t('rmRoom') : t('rmRooms'),
    rmT: rmR ? rmR.n : rm3 ? t('rmNone') : sel.title,
    rmS: rmR ? t('rmOf', { a: rmR.as, total: sel.as }) : rm3 ? t('rmHint') : t('rmByLabels'),
  };
}
