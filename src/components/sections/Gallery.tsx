// Generated from levakant-source/src/main.html <!--s:gallery--> — hand-maintained from here on.
'use client';

import { Fragment } from 'react';
import { useTranslations } from 'next-intl';
import { useSiteData } from '@/components/SiteProvider';
import { galScroll, lbKey, openLb } from '@/lib/gallery';

export function Gallery() {
  const t = useTranslations('gallery');
  const { d } = useSiteData();
  const v = {
    gal: d.gal.map((g, i) => ({
      img: g.img,
      ar: g.ar,
      no: g.no,
      t: g.t,
      aria: t('openAria', { t: g.t }),
      open: () => openLb(i),
    })),
    galCount: t('count', { n: d.gal.length }),
    galPrev: () => galScroll(-1),
    galNext: () => galScroll(1),
    lbKey: lbKey(d.gal.length),
  };
  return (
    <>
      {' '}
      <section className="sec iv p3" id="gallery" onKeyDown={v.lbKey}>
        {' '}
        <div className="wrap gh rv">
          {' '}
          <div>
            {' '}
            <div className="ey">
              <b>{'08'}</b>
              <i></i>
              {t('gallery')}
            </div>{' '}
            <h2 className="h2">
              {t('theBuilding')} <em>{t('inDetail')}</em>
            </h2>{' '}
          </div>{' '}
          <div className="g-nav">
            {' '}
            <span>{v.galCount}</span>{' '}
            <button className="ib" aria-label={t('scrollBack')} onClick={v.galPrev}>
              <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
                <path d="M18 5H2M6 1L2 5l4 4" stroke="currentColor" strokeWidth="1.3"></path>
              </svg>
            </button>{' '}
            <button className="ib" aria-label={t('scrollForward')} onClick={v.galNext}>
              <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
                <path d="M0 5h16M12 1l4 4-4 4" stroke="currentColor" strokeWidth="1.3"></path>
              </svg>
            </button>{' '}
          </div>{' '}
        </div>{' '}
        <div className="gs" id="gal-strip">
          {' '}
          {v.gal.map((g, i) => (
            <Fragment key={i}>
              {' '}
              <button className="gi" onClick={g.open} aria-label={g.aria}>
                {' '}
                <span className="af" style={{ display: 'block', aspectRatio: g.ar }}>
                  <img src={g.img} alt="" loading="lazy" />
                </span>{' '}
                <span className="cap">
                  <b>{g.no}</b>
                  {g.t}
                </span>{' '}
              </button>{' '}
            </Fragment>
          ))}{' '}
        </div>{' '}
      </section>{' '}
    </>
  );
}
