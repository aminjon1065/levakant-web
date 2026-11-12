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
 * The engine (three.js + model) is a separate lazily loaded chunk; until its first frame
 * the section shows the static scheme from the mockup.
 */
export function useStage(canvas: RefObject<HTMLCanvasElement | null>, mode: 'explore' | 'sun') {
  const { d } = useSiteData();
  useEffect(() => {
    const cv = canvas.current;
    if (!cv || !can3D()) return;
    let stage: Stage | null = null;
    let unsub = () => {};
    let dead = false;
    const start = async () => {
      const { createStage } = await import('./engine');
      if (dead) return;
      const base: Pick<StageOptions, 'model' | 'onError'> = {
        model: d.gl.model,
        onError: (e) => console.warn('[3d]', e),
      };
      if (mode === 'explore') {
        stage = createStage(cv, {
          ...base,
          mode,
          plans: { typ: d.P.typ, f9: d.P.f9, ph: d.P.ph },
          planImgs: d.gl.planImgs,
          rooms: d.gl.rooms,
          onFirstFrame: () => set({ glB3: true }),
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
          onFirstFrame: () => set({ glSun: true }),
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
          start().catch((e) => console.warn('[3d] engine failed to load', e));
        }
      },
      { rootMargin: '150% 0px' },
    );
    io.observe(cv);
    return () => {
      dead = true;
      io.disconnect();
      unsub();
      stage?.dispose();
      set(mode === 'explore' ? { glB3: false } : { glSun: false });
    };
  }, [canvas, mode, d]);
}
