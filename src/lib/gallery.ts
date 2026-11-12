'use client';

import type { KeyboardEvent } from 'react';
import { focusLater, place } from './actions';
import { get, set } from './store';

/** Gallery + lightbox actions (mockup openLb / stepLb / lbKey / galScroll). */
export function openLb(i: number) {
  const p = place('gallery');
  set({ lb: i, lbTop: p.top, lbH: p.h, lbFlip: !get().lbFlip });
  focusLater('lb-x');
}

export function stepLb(n: number, dir: number) {
  const s = get();
  set({ lb: (s.lb + dir + n) % n, lbFlip: !s.lbFlip });
}

export function lbKey(n: number) {
  return (e: KeyboardEvent) => {
    if (get().lb < 0) return;
    if (e.key === 'Escape') set({ lb: -1 });
    else if (e.key === 'ArrowRight') stepLb(n, 1);
    else if (e.key === 'ArrowLeft') stepLb(n, -1);
  };
}

export function galScroll(dir: number) {
  const el = document.getElementById('gal-strip');
  if (el) el.scrollBy({ left: dir * Math.max(300, el.clientWidth * 0.72), behavior: 'smooth' });
}
