'use client';

import { useEffect } from 'react';

/** Adds `near` to [data-lazybg] sections ~1.5 screens before they scroll in (unblocks their CSS backgrounds). */
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
