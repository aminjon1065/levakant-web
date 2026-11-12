'use client';

import { useEffect } from 'react';

/** Floor-section textures of the CSS building model, shown on "Разобрать по этажам". */
const EXPLODE_TEXTURES = ['b', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'ph'].map((k) => `/assets/cut_${k}.webp`);

/** Decode images in idle time so the first click that shows them does not pay for decoding. */
function predecode(urls: string[]) {
  const idle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 200));
  idle(() =>
    urls.forEach((u) => {
      const im = new Image();
      im.src = u;
      im.decode().catch(() => {});
    }),
  );
}

/**
 * Adds `near` to [data-lazybg] sections ~1.5 screens before they scroll in (unblocks their CSS backgrounds);
 * for the building, also pre-decodes the textures of the exploded view.
 */
export function NearMarker() {
  useEffect(() => {
    const els = [...document.querySelectorAll<HTMLElement>('[data-lazybg]')];
    if (typeof IntersectionObserver === 'undefined') {
      els.forEach((e) => e.classList.add('near'));
      return;
    }
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('near');
            if (e.target.id === 'building') predecode(EXPLODE_TEXTURES);
            io.unobserve(e.target);
          }
        }),
      { rootMargin: '150% 0px' },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);
  return null;
}
