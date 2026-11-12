// Generated from levakant-source/src/main.html <!--s:planx--> — hand-maintained from here on.
'use client';

import { Fragment } from 'react';
import { useTranslations } from 'next-intl';
import { useCatalogVals } from '@/lib/catalog';
import { useModal } from '@/lib/useModal';

/** Full-screen apartment plan (opened from the catalogue card). */
export function PlanZoom() {
  const t = useTranslations('planx');
  const v = useCatalogVals();
  useModal(v.pz, '.pzx');
  return (
    <>
      {' '}
      {v.pz && (
        <>
          {' '}
          <div
            className="lbx pzx"
            role="dialog"
            aria-modal="true"
            aria-label={t('apartmentPlanFullScreen')}
            style={{ top: v.pzTop, height: v.pzH }}
            onKeyDown={v.pzKey}
          >
            {' '}
            <div className="lbx-t">
              {' '}
              <span>
                <b>{v.sTitle}</b> {t('sareaSfloors', { sArea: v.sArea, sFloors: v.sFloors })}
              </span>{' '}
              <div className="g-nav">
                {' '}
                <button className="tb" onClick={v.toggleLab} aria-pressed={v.labOn}>
                  {t('labels')}
                </button>{' '}
                <button className="tb" onClick={v.zOut} aria-label={t('reducePlan')} disabled={!!v.zOutOff}>
                  {'−'}
                </button>{' '}
                <span className="tz">{v.zPct}</span>{' '}
                <button className="tb" onClick={v.zIn} aria-label={t('enlargePlan')} disabled={!!v.zInOff}>
                  {'+'}
                </button>{' '}
                <button className="ib" id="pz-x" aria-label={t('closePlan')} onClick={v.pzClose}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.3"></path>
                  </svg>
                </button>{' '}
              </div>{' '}
            </div>{' '}
            <div className="lbx-m" tabIndex={0} role="region" aria-label={t('planRegion')}>
              {' '}
              <div
                className="pv"
                style={{ aspectRatio: v.sAr, width: `calc(min(100%, (${v.pzH} - 190px) * ${v.sAr}) * ${v.zF})` }}
              >
                {' '}
                <img src={v.sImg} alt={v.sAlt} />{' '}
                {v.lab && (
                  <>
                    {' '}
                    {v.sLabels.map((l, i) => (
                      <Fragment key={i}>
                        {' '}
                        <span className={l.cls} style={{ left: l.x, top: l.y }}>
                          <b>{l.n}</b>
                          <span>{l.a}</span>
                        </span>{' '}
                      </Fragment>
                    ))}{' '}
                  </>
                )}{' '}
                <div className="scale" style={{ width: v.sScale }}>
                  <span>{'0'}</span>
                  <span>{'1'}</span>
                  <span>{t('n2M')}</span>
                </div>{' '}
              </div>{' '}
            </div>{' '}
            <div className="lbx-b">
              {' '}
              <p>{v.sLine}</p>{' '}
              <a className="btn b-ink btn-s" href="#contact" onClick={v.askAptX}>
                {t('getPriceInstalments')}
              </a>{' '}
            </div>{' '}
          </div>{' '}
        </>
      )}{' '}
    </>
  );
}
