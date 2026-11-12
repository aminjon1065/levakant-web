'use client';

import { useEffect, type RefObject } from 'react';
import { useSiteData } from '@/components/SiteProvider';
import { get, set, useSite, type SiteState } from '@/lib/store';
import { can3D } from './capability';
import type { Stage, StageOptions, StageState } from './engine';

/** Store → engine state (mockup `_glPush`). */
const exploreState = (s: SiteState): Partial<StageState> => ({
  exploded: s.ex,
  open: s.ex && s.op,
  floor: s.floor,
  apt: s.exApt,
  enter: !!(s.enter && s.ex && s.op && s.exApt),
  view: s.view,
  tod: s.tod,
});
const sunState = (s: SiteState): Partial<StageState> => ({
  date: s.sunD,
  minutes: s.sunM >= 0 ? s.sunM : s.sunH * 60,
  play: s.sunPlay,
});

/**
 * Mounts a live 3D stage on `canvas` when it comes within ~1.5 screens of the viewport.
 * The engine (three.js + model) is a separate lazily loaded chunk. Until its first frame —
 * and whenever 3D is off or fails — the section shows the static scheme from the mockup;
 * the status (`b3St` / `sunSt`) drives an honest note in the UI.
 */
export function useStage(canvas: RefObject<HTMLCanvasElement | null>, mode: 'explore' | 'sun') {
  const { d } = useSiteData();
  const force = useSite((s) => s.force3d);
  useEffect(() => {
    const cv = canvas.current;
    const stKey = mode === 'explore' ? 'b3St' : 'sunSt';
    const glKey = mode === 'explore' ? 'glB3' : 'glSun';
    const status = (v: string) => set({ [stKey]: v } as Partial<SiteState>);
    if (!cv) return;
    const cap = can3D();
    if (!cap.ok) {
      status('off-' + cap.reason);
      return;
    }
    let stage: Stage | null = null;
    let unsub = () => {};
    let dead = false;
    const fail = () => {
      if (dead) return;
      unsub();
      stage?.dispose();
      stage = null;
      set({ [glKey]: false, [stKey]: 'error' } as Partial<SiteState>);
    };
    const start = async () => {
      status('loading');
      const { createStage } = await import('./engine');
      if (dead) return;
      const base: Pick<StageOptions, 'model' | 'onError' | 'quality'> = {
        model: d.gl.model,
        quality: cap.quality,
        onError: fail,
      };
      if (mode === 'explore') {
        stage = createStage(cv, {
          ...base,
          mode,
          plans: { typ: d.P.typ, f9: d.P.f9, ph: d.P.ph },
          planImgs: d.gl.planImgs,
          rooms: d.gl.rooms,
          onFirstFrame: () => set({ glB3: true, b3St: 'ready' }),
          // click on a floor of the model (mockup `pick3`)
          onFloor: (k) => {
            const s = get();
            const fl = d.floors.find((f) => f.k === k);
            const plan = k === 'b' ? 'b' : fl ? fl.plan : '';
            const zones = plan === 'typ' || plan === 'f9' || plan === 'ph' ? d.P[plan] : [];
            const has = zones.some((z) => z.id === s.exApt);
            set({ floor: k, ex: true, op: true, enter: false, exApt: has ? s.exApt : '', fpFlip: !s.fpFlip });
          },
          onApt: (id) => set({ exApt: id, enter: false }),
          onFree: () => {
            if (get().view) set({ view: '' });
          },
        });
        stage.set(exploreState(get()));
        unsub = useSite.subscribe((s) => stage?.set(exploreState(s)));
      } else {
        stage = createStage(cv, {
          ...base,
          mode,
          dayRange: (k) => [d.sun[k].riseM, d.sun[k].setM],
          onFirstFrame: () => set({ glSun: true, sunSt: 'ready' }),
          onTime: (m) => set({ sunM: m }),
        });
        stage.set(sunState(get()));
        unsub = useSite.subscribe((s) => stage?.set(sunState(s)));
      }
    };
    const io = new IntersectionObserver(
      (es) => {
        if (es.some((e) => e.isIntersecting)) {
          io.disconnect();
          start().catch(fail);
        }
      },
      { rootMargin: '150% 0px' },
    );
    // observe the section box: inside a not-yet-rendered (content-visibility) section the canvas has no size
    io.observe(cv.closest('section') ?? cv);
    return () => {
      dead = true;
      io.disconnect();
      unsub();
      stage?.dispose();
      set({ [glKey]: false, [stKey]: '' } as Partial<SiteState>);
    };
  }, [canvas, mode, d, force]);
}
