// Generated from levakant-source/src/main.html <!--s:lightbox--> — hand-maintained from here on.
'use client';

import { useTranslations } from 'next-intl';
import { useShallow } from 'zustand/react/shallow';
import { useSiteData } from '@/components/SiteProvider';
import { lbKey, stepLb } from '@/lib/gallery';
import { up, useSite } from '@/lib/store';

/** Full-screen image viewer, positioned over the page like in the mockup. */
export function Lightbox() {
  const t = useTranslations('lightbox');
  const { d } = useSiteData();
  const s = useSite(useShallow((x) => ({ lb: x.lb, lbTop: x.lbTop, lbH: x.lbH, lbFlip: x.lbFlip })));
  const n = d.gal.length;
  const lg = s.lb >= 0 ? d.gal[s.lb] : d.gal[0];
  const v = {
    lbOpen: s.lb >= 0,
    lbA: s.lbFlip,
    lbB: !s.lbFlip,
    lbTop: s.lbTop + 'px',
    lbH: s.lbH + 'px',
    lbImg: lg.img,
    lbAlt: lg.t,
    lbT: lg.t,
    lbS: lg.s,
    lbNo: lg.no + ' / ' + String(n).padStart(2, '0'),
    lbClose: up({ lb: -1 }),
    lbPrev: () => stepLb(n, -1),
    lbNext: () => stepLb(n, 1),
    lbKey: lbKey(n),
  };
  return (
    <>
      {' '}
      {v.lbOpen && (
        <>
          {' '}
          <div
            className="lbx"
            role="dialog"
            aria-modal="true"
            aria-label={t('dialog')}
            style={{ top: v.lbTop, height: v.lbH }}
            onKeyDown={v.lbKey}
          >
            {' '}
            <div className="lbx-t">
              {' '}
              <span>{v.lbNo}</span>{' '}
              <button className="ib" id="lb-x" aria-label={t('close')} onClick={v.lbClose}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.3"></path>
                </svg>
              </button>{' '}
            </div>{' '}
            <div className="lbx-m">
              {' '}
              {v.lbA && (
                <>
                  <img src={v.lbImg} alt={v.lbAlt} />
                </>
              )}{' '}
              {v.lbB && (
                <>
                  <img src={v.lbImg} alt={v.lbAlt} />
                </>
              )}{' '}
            </div>{' '}
            <div className="lbx-b">
              {' '}
              <p>
                <b>{v.lbT}</b>
                {v.lbS}
              </p>{' '}
              <div className="g-nav">
                {' '}
                <button className="ib" aria-label={t('prev')} onClick={v.lbPrev}>
                  <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
                    <path d="M18 5H2M6 1L2 5l4 4" stroke="currentColor" strokeWidth="1.3"></path>
                  </svg>
                </button>{' '}
                <button className="ib" aria-label={t('next')} onClick={v.lbNext}>
                  <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
                    <path d="M0 5h16M12 1l4 4-4 4" stroke="currentColor" strokeWidth="1.3"></path>
                  </svg>
                </button>{' '}
              </div>{' '}
            </div>{' '}
          </div>{' '}
        </>
      )}{' '}
    </>
  );
}
