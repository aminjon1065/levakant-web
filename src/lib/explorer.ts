'use client';

import type { KeyboardEvent, MouseEvent } from 'react';
import { useTranslations } from 'next-intl';
import { useShallow } from 'zustand/react/shallow';
import { useSiteData } from '@/components/SiteProvider';
import { track } from './analytics';
import { set, tf, up, useSite, type SiteState } from './store';
import type { PlanKey } from './types';

const pc = (v: number | string) => v + '%';

/** Label transform for a floor block in the CSS model (mockup `lbTf`). */
export function lbTf(hx: number, h: number, ry: number, rx: number) {
  const a = (ry * Math.PI) / 180;
  const x = Math.cos(a) > 0 ? -hx : hx;
  const z = Math.sin(a) > 0 ? -133.8 : 133.8;
  return (
    'translate3d(' +
    x +
    'px, ' +
    (-h / 2).toFixed(1) +
    'px, ' +
    z +
    'px) rotateY(' +
    -ry +
    'deg) rotateX(' +
    -rx +
    'deg) scale(calc(1 / (var(--sc) * var(--em)))) translate(calc(-100% - 6px), -50%)'
  );
}

/** Vertical position and height (px) of each level block in the CSS model. */
const LZ: Record<string, [number, number]> = {
  b: [-30, 30],
  1: [0, 55],
  2: [55, 30.5],
  3: [85.5, 31.5],
  4: [117, 31.5],
  5: [148.5, 31.5],
  6: [180, 31.5],
  7: [211.5, 31.5],
  8: [243, 31.5],
  9: [274.5, 31.5],
  ph: [306, 65],
};
export const LEVEL_HX = 232.1;
/** [half-width, height] of each level, bottom to top — used while dragging. */
export const LEVEL_GEOM = ['b', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'ph'].map(
  (k) => [LEVEL_HX, LZ[k][1]] as const,
);

const PICK = (s: SiteState) => ({
  floor: s.floor,
  exApt: s.exApt,
  ex: s.ex,
  op: s.op,
  view: s.view,
  ry: s.ry,
  rx: s.rx,
  tod: s.tod,
  enter: s.enter,
  glB3: s.glB3,
  fz: s.fz,
  fpFlip: s.fpFlip,
  vFlip: s.vFlip,
});

/** 3D building + floor plan (mockup renderVals: "building explorer" and "building in 3d"). */
export function useExplorerVals() {
  const t = useTranslations('building');
  const { d } = useSiteData();
  const s = useSite(useShallow(PICK));
  const L = d.L;
  const cur = s.floor;
  const keys = d.floors.map((f) => f.k).concat(['b']);
  const planOf = (k: string): PlanKey => (k === 'b' ? 'b' : d.floors.find((f) => f.k === k)!.plan);
  const onPlan = (plan: PlanKey, id: string) =>
    plan in d.P && d.P[plan as keyof typeof d.P].some((z) => z.id === id) ? id : '';
  const go = (k: string) =>
    set({ floor: k, exApt: onPlan(planOf(k), s.exApt), fpFlip: !s.fpFlip, op: s.ex ? true : s.op });
  const floors = d.floors.map((f) => ({
    n: f.n,
    t: f.t,
    kind: f.k === 'ph' ? t('kindPh') : f.k === '1' ? t('kindCom') : '',
    top: pc(f.top),
    h: pc(f.h),
    rcls: f.k === cur ? 'on' : '',
    on: tf(f.k === cur),
    aria: t('showPlanAria', { t: f.t }),
    pick: () => go(f.k),
  }));
  const isBase = cur === 'b';
  const cf = isBase ? null : d.floors.find((f) => f.k === cur)!;
  const plan = planOf(cur);
  const isRes = plan === 'typ' || plan === 'f9' || plan === 'ph';
  const ki = keys.indexOf(cur);
  const texts: Record<PlanKey, [string, string]> = {
    typ: [t('planTypK'), t('planTypS')],
    f9: [t('planF9K'), t('planF9S')],
    ph: [t('planPhK'), t('planPhS')],
    f1: [t('planComK'), t('planF1S')],
    b: [t('planComK'), t('planBS')],
  };
  const zonesOf = isRes ? d.P[plan] : [];
  const zones = zonesOf.map((z) => {
    const on = z.id === s.exApt;
    return {
      cls: 'hz' + (on ? ' on' : ''),
      lcls: 'hl' + (on ? ' on' : ''),
      on: tf(on),
      x: pc(z.x),
      y: pc(z.y),
      w: pc(z.w),
      h: pc(z.h),
      poly: z.poly,
      cx: pc(z.cx),
      cy: pc(z.cy),
      area: L[z.id].as,
      aria: t('zoneAria', { title: L[z.id].title, area: L[z.id].as }),
      pick: up({ exApt: z.id }),
    };
  });
  const seen: Record<string, number> = {};
  zonesOf.forEach((z) => (seen[z.id] = (seen[z.id] || 0) + 1));
  const typeIds = Object.keys(seen).sort((a, b) => L[a].total - L[b].total);
  const ex = s.exApt ? L[s.exApt] : undefined;
  const hiOn = !isBase;
  const exKey = (e: KeyboardEvent) => {
    const tg = e.target as HTMLElement;
    if (!tg.closest || !tg.closest('.fr')) return;
    if (e.key === 'ArrowUp' && ki > 0) {
      e.preventDefault();
      go(keys[ki - 1]);
    } else if (e.key === 'ArrowDown' && ki < keys.length - 1) {
      e.preventDefault();
      go(keys[ki + 1]);
    }
  };

  /* building in 3d: floor blocks */
  const near = (a: number) => a + 360 * Math.round((s.ry - a) / 360);
  const lev = [{ k: 'b', plan: 'b' as PlanKey, n: '−1', t: t('levelB'), ps: t('psCom'), pl: t('plB') }].concat(
    d.floors
      .slice()
      .reverse()
      .map((f) => ({
        k: f.k,
        plan: f.plan,
        n: f.n,
        t: f.t,
        ps: f.k === 'ph' ? t('psPh') : f.k === '1' ? t('psCom') : t('psRes'),
        pl: f.k === 'ph' ? t('plPh') : f.k === '1' ? t('plF1') : t('plRes'),
      })),
  );
  const ci = lev.findIndex((l) => l.k === cur);
  const topV = s.ex && s.op && s.view === 'top';
  const LV = lev.map((l, i) => {
    const [y, h] = LZ[l.k];
    const off = !s.ex ? 0 : (i === 0 ? -16 : (i - 1) * 24) + (s.op && i > ci ? 78 : 0);
    return {
      cls:
        'lv k-' +
        l.k +
        (l.plan === 'f1' || l.plan === 'b' ? ' com' : '') +
        (i === ci ? ' on' : '') +
        (topV && i > ci ? ' off' : ''),
      tf: 'translateY(' + (-(y + off)).toFixed(1) + 'px)',
      t: l.t,
      n: l.n,
      ps: l.ps,
      pl: l.pl,
      sel: s.ex && s.op && i === ci,
      ltf: lbTf(LEVEL_HX, h, s.ry, s.rx),
      aria: t('levelAria', { t: l.t, ps: l.ps, pl: l.pl }),
      pick: (e: MouseEvent) => {
        const tg = e.target as HTMLElement;
        if (tg && tg.closest && tg.closest('.hz')) return;
        go(l.k);
      },
    };
  });
  const views = (
    [
      ['front', 'viewFront', 0, -6],
      ['corner', 'viewCorner', -36, -17],
      ['yard', 'viewYard', 144, -17],
      ['top', 'viewTop', 0, -82],
    ] as const
  ).map(([k, label, ry, rx]) => ({
    label: t(label),
    cls: s.view === k ? 'on' : '',
    on: tf(s.view === k),
    pick: up({ view: k, ry: near(ry), rx }),
  }));
  const fTypes = typeIds.map((id) => ({
    _id: id,
    label: t('typeChip', { r: L[id].r, area: L[id].as }),
    cnt: seen[id] > 1 ? '×' + seen[id] : '',
    cls: 'chip' + (id === s.exApt ? ' on' : ''),
    on: tf(id === s.exApt),
    pick: up({ exApt: id === s.exApt ? '' : id }),
  }));
  const b3Types = fTypes.map((x) => ({
    ...x,
    pick: () => set({ exApt: x._id === s.exApt ? '' : x._id, ex: true, op: true }),
  }));
  const toggleEx = s.ex
    ? up({ ex: false, op: false })
    : () => {
        set({ ex: true, op: false, ...(s.view === 'top' ? { view: 'corner' as const, ry: near(-36), rx: -17 } : {}) });
        track('building_explode');
      };
  const stage = !s.ex ? 1 : !s.op ? 2 : !ex ? 3 : 4;
  const stc = (n: number) => (n === stage ? 'on' : n < stage ? 'done' : '');
  const floorName = isBase ? t('levelBLower') : cf!.t;
  const openApt = { apt: s.exApt, fT: 'all', fA: 'all', fF: 'all', vFlip: !s.vFlip, vz: 0, rm: -1 };
  const noop = () => {};
  const steps = [
    {
      no: '01',
      t: t('stepBuilding'),
      v: s.ex ? t('stepExploded') : t('stepWhole'),
      cls: !s.ex ? 'on' : 'done',
      href: '#building',
      pick: up({ ex: false, op: false }),
    },
    {
      no: '02',
      t: t('stepFloor'),
      v: s.ex && s.op ? floorName : t('stepPickOnModel'),
      cls: stc(2) || (stage > 2 ? 'done' : ''),
      href: '#building',
      pick: up({ ex: true, op: s.op }),
    },
    {
      no: '03',
      t: t('stepApt'),
      v: ex ? t('stepAptV', { short: ex.short, area: ex.as }) : t('stepPickOnPlan'),
      cls: stage === 3 ? 'on' : ex ? 'done' : '',
      href: '#floorplan',
      pick: noop,
    },
    {
      no: '04',
      t: t('stepPlan3d'),
      v: t('stepPlan3dV'),
      cls: stage === 4 ? 'on' : '',
      href: '#apartments',
      pick: ex ? up(openApt) : noop,
    },
    { no: '05', t: t('stepLead'), v: t('stepLeadV'), cls: '', href: '#contact', pick: noop },
  ];
  const b3HintStatic = [
    '',
    ex ? t('hintAssembled', { floor: floorName, short: ex.short, area: ex.as }) : t('hintPick'),
    t('hintExploded'),
    isRes ? t('hintFloorOpen') : t('hintLevelOpen'),
    t('hintAptPicked'),
  ][stage];
  const b3HintG = !s.glB3
    ? null
    : !s.ex
      ? t('glHintWhole')
      : !s.op
        ? t('glHintExploded')
        : !isRes
          ? t('glHintCom')
          : !ex
            ? t('glHintFloor')
            : s.enter
              ? t('glHintInside')
              : t('glHintApt');
  return {
    floors,
    hiOn,
    hiTop: hiOn ? pc(cf!.top) : '0%',
    hiH: hiOn ? pc(cf!.h) : '0%',
    baseCls: isBase ? 'on' : '',
    baseOn: tf(isBase),
    pickBase: () => go('b'),
    flUp: () => ki > 0 && go(keys[ki - 1]),
    flDown: () => ki < keys.length - 1 && go(keys[ki + 1]),
    flUpOff: ki === 0,
    flDownOff: ki === keys.length - 1,
    toggleFz: up({ fz: !s.fz }),
    fzOn: tf(s.fz),
    fzLabel: s.fz ? t('zoomOut') : t('zoomIn'),
    fpCls: s.fz ? 'zm' : '',
    exKey,
    fKicker: texts[plan][0],
    fTitle: isBase ? t('levelB') : cf!.t,
    fSub: texts[plan][1],
    isRes,
    isCom: !isRes,
    fpA: s.fpFlip,
    fpB: !s.fpFlip,
    planImg: d.img[`floor_${plan}`],
    planAlt: t('planAlt', { what: floorName }),
    comArea: plan === 'b' ? t('areaB') : t('areaF1'),
    zones,
    fTypes,
    exHas: !!ex,
    exNone: !ex,
    b3Cls: 'b3' + (s.glB3 ? ' gl' : ''),
    canEnter: !!(s.glB3 && s.ex && s.op && ex && isRes),
    enterOn: tf(s.enter),
    enterCls: 'b3-in' + (s.enter ? ' on' : ''),
    enterLabel: s.enter ? t('enterExit') : t('enterIn'),
    toggleEnter: up({ enter: !s.enter }),
    b3Note: s.glB3 ? t('noteGl') : t('noteStatic'),
    tods: (
      [
        ['day', 'todDay'],
        ['dusk', 'todDusk'],
        ['night', 'todNight'],
      ] as const
    ).map(([k, label]) => ({
      label: t(label),
      cls: s.tod === k ? 'on' : '',
      on: tf(s.tod === k),
      pick: up({ tod: k }),
    })),
    LV,
    views,
    b3Types,
    steps,
    b3Hint: b3HintG || b3HintStatic,
    b3cls:
      'b3-m t-' +
      s.tod +
      ' md-' +
      (s.ex ? 'ex' : 'solid') +
      (s.ex && s.op ? ' op' : '') +
      ' v-' +
      (s.view || 'free') +
      (Math.cos((s.ry * Math.PI) / 180) < 0 ? ' bk' : ''),
    b3tf: 'rotateX(' + s.rx + 'deg) rotateY(' + s.ry + 'deg)',
    toggleEx,
    exCls: 'b3-ex' + (s.ex ? ' on' : ''),
    exOn: tf(s.ex),
    exLabel: s.ex ? t('exAssemble') : t('exExplode'),
    isEx: s.ex,
    exHas3: !!(ex && ex.m3),
    exOpen3: up({ ...openApt, am: 'd3' }),
    exTitle: ex ? t('exTitle', { title: ex.title, area: ex.as }) : '',
    exMeta: ex ? ex.fl + ' · ' + ex.side : '',
    exOpen: up(openApt),
  };
}
