'use client';

import { useEffect } from 'react';
import { LEVEL_GEOM, lbTf } from './explorer';
import { get, set } from './store';

/** Apartment CSS model transforms (mockup a3Tf / a3Lt). */
export const a3Tf = (az: number, ax: number) => 'rotateX(' + ax + 'deg) rotateZ(' + az + 'deg)';
export const a3Lt = (az: number, ax: number) =>
  'translateZ(60px) rotateZ(' + -az + 'deg) rotateX(' + -ax + 'deg) translate(-50%, -100%)';

interface Drag {
  x: number;
  y: number;
  a: number;
  b: number;
  na?: number;
  nb?: number;
  moved: boolean;
  st: HTMLElement;
  m: HTMLElement | null;
}

/**
 * Drag to rotate the CSS models (#b3 building, #q3 apartment), as in the mockup:
 * transforms are written to the DOM while dragging and committed to state on release;
 * the click right after a drag is swallowed. When the WebGL building is live, it handles #b3 itself.
 */
export function useDragRotate(id: 'b3' | 'q3') {
  useEffect(() => {
    const apt = id === 'q3';
    let g: Drag | null = null;
    let sup = 0;
    const inStage = (e: Event) => {
      const t = (e.composedPath?.()[0] || e.target) as HTMLElement | null;
      return t?.closest ? (t.closest('#' + id) as HTMLElement | null) : null;
    };
    const pd = (e: PointerEvent) => {
      const st = inStage(e);
      if (!st) return;
      if (!apt && get().glB3) return;
      const s = get();
      g = {
        x: e.clientX,
        y: e.clientY,
        st,
        a: apt ? s.az : s.ry,
        b: apt ? s.ax : s.rx,
        moved: false,
        m: st.querySelector(apt ? '#q3-m' : '#b3-m'),
      };
    };
    const pm = (e: PointerEvent) => {
      if (!g) return;
      const dx = e.clientX - g.x;
      const dy = e.clientY - g.y;
      if (!g.moved && Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      g.moved = true;
      const m = g.m;
      m?.classList.add('drag');
      if (apt) {
        g.na = g.a + dx * 0.4;
        g.nb = Math.max(0, Math.min(68, g.b - dy * 0.3));
        if (m) m.style.transform = a3Tf(g.na, g.nb);
        const lt = a3Lt(g.na, g.nb);
        g.st.querySelectorAll<HTMLElement>('.q3-l').forEach((el) => (el.style.transform = lt));
      } else {
        g.na = g.a + dx * 0.36;
        g.nb = Math.max(-86, Math.min(-2, g.b - dy * 0.26));
        if (m) m.style.transform = 'rotateX(' + g.nb.toFixed(1) + 'deg) rotateY(' + g.na.toFixed(1) + 'deg)';
        const na = g.na;
        const nb = g.nb;
        g.st.querySelectorAll<HTMLElement>('.lb3').forEach((el, i) => {
          const lg = LEVEL_GEOM[i];
          if (lg) el.style.transform = lbTf(lg[0], lg[1], na, nb);
        });
      }
    };
    const pu = () => {
      const d = g;
      g = null;
      if (!d || !d.moved) return;
      sup = Date.now();
      d.m?.classList.remove('drag');
      const r1 = (v: number) => Math.round(v * 10) / 10;
      if (apt) set({ av: '', az: r1(d.na!), ax: r1(d.nb!) });
      else set({ view: '', ry: r1(d.na!), rx: r1(d.nb!) });
    };
    const ck = (e: MouseEvent) => {
      if (sup && Date.now() - sup < 350 && inStage(e)) {
        e.stopPropagation();
        e.preventDefault();
      }
    };
    document.addEventListener('pointerdown', pd);
    document.addEventListener('pointermove', pm);
    document.addEventListener('pointerup', pu);
    document.addEventListener('pointercancel', pu);
    document.addEventListener('click', ck, true);
    return () => {
      document.removeEventListener('pointerdown', pd);
      document.removeEventListener('pointermove', pm);
      document.removeEventListener('pointerup', pu);
      document.removeEventListener('pointercancel', pu);
      document.removeEventListener('click', ck, true);
    };
  }, [id]);
}
