'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

/**
 * For a horizontally scrollable plan (the element right before this one): a hint and ‹ › buttons,
 * shown only while the plan is wider than its frame (phones, or a zoomed plan).
 */
export function PanHint() {
  const t = useTranslations('common');
  const ref = useRef<HTMLDivElement>(null);
  const [st, setSt] = useState<{ over: boolean; start: boolean; end: boolean }>({
    over: false,
    start: true,
    end: false,
  });
  useEffect(() => {
    const box = ref.current?.previousElementSibling as HTMLElement | null;
    if (!box) return;
    const upd = () => {
      const over = box.scrollWidth > box.clientWidth + 4;
      setSt({ over, start: box.scrollLeft < 4, end: box.scrollLeft + box.clientWidth >= box.scrollWidth - 4 });
    };
    upd();
    box.addEventListener('scroll', upd, { passive: true });
    const ro = new ResizeObserver(upd);
    ro.observe(box);
    if (box.firstElementChild) ro.observe(box.firstElementChild);
    return () => {
      box.removeEventListener('scroll', upd);
      ro.disconnect();
    };
  }, []);
  const go = (dir: number) => {
    const box = ref.current?.previousElementSibling as HTMLElement | null;
    box?.scrollBy({ left: dir * box.clientWidth * 0.7, behavior: 'smooth' });
  };
  return (
    <div ref={ref} className="pan" role="group" aria-label={t('panLabel')} hidden={!st.over}>
      <button type="button" className="ib" onClick={() => go(-1)} disabled={st.start} aria-label={t('panLeft')}>
        <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
          <path d="M18 5H2M6 1L2 5l4 4" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      </button>
      <span>{t('panHint')}</span>
      <button type="button" className="ib" onClick={() => go(1)} disabled={st.end} aria-label={t('panRight')}>
        <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
          <path d="M0 5h16M12 1l4 4-4 4" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      </button>
    </div>
  );
}
