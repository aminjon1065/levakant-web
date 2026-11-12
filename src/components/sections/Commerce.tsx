// Generated from levakant-source/src/main.html <!--s:commerce--> — hand-maintained from here on.
'use client';

import { Fragment } from 'react';
import { useTranslations } from 'next-intl';
import { Pic } from '@/components/Pic';
import { useShallow } from 'zustand/react/shallow';
import { DemoTag } from '@/components/DemoTag';
import { PanHint } from '@/components/PanHint';
import { useSiteData } from '@/components/SiteProvider';
import { askCom } from '@/lib/actions';
import { imgDims } from '@/lib/imgDims';
import { tf, up, useSite } from '@/lib/store';

/** Ground floor / lower level switch (mockup renderVals: "commerce"). */
function useCommerceVals() {
  const t = useTranslations('commerce');
  const { d } = useSiteData();
  const s = useSite(useShallow((x) => ({ com: x.com, cFlip: x.cFlip })));
  const f1 = s.com === 'f1';
  return {
    askCom,
    c1cls: f1 ? 'on' : '',
    c0cls: s.com === 'b' ? 'on' : '',
    c1on: tf(f1),
    c0on: tf(s.com === 'b'),
    pickC1: up({ com: 'f1', cFlip: !s.cFlip }),
    pickC0: up({ com: 'b', cFlip: !s.cFlip }),
    cA: s.cFlip,
    cB: !s.cFlip,
    comImg: d.img[`floor_${s.com}`],
    comAlt: f1 ? t('planF1Alt') : t('planBAlt'),
    comArea2: f1 ? t('n82348M') : t('n82353M'),
    comRows: f1
      ? [
          { k: t('rowArea'), v: t('n82348M') },
          { k: t('rowAccess'), v: t('rowAccessF1') },
          { k: t('rowFacade'), v: t('rowFacadeF1') },
          { k: t('rowCore'), v: t('rowCoreV') },
        ]
      : [
          { k: t('rowArea'), v: t('n82353M') },
          { k: t('rowAccess'), v: t('rowAccessB') },
          { k: t('rowName'), v: t('rowNameB') },
          { k: t('rowCore'), v: t('rowCoreV') },
        ],
  };
}

export function Commerce() {
  const t = useTranslations('commerce');
  const v = useCommerceVals();
  const { demo } = useSiteData();
  return (
    <>
      {' '}
      <section className="sec dk p3" id="commerce">
        {' '}
        <div className="wrap">
          {' '}
          <div className="sh rv">
            {' '}
            <div>
              {' '}
              <div className="ey">
                <b>{'10'}</b>
                <i></i>
                {t('commercial')}
              </div>{' '}
              <h2 className="h2">
                {t('twoLevelsForBusiness')} <em>{t('andServices')}</em>
              </h2>{' '}
            </div>{' '}
            <p className="lead mt">{t('theGroundFloorAnd')}</p>{' '}
          </div>{' '}
        </div>{' '}
        <div className="cm-img rvi px">
          <Pic src="/assets/commerce.webp" alt={t('groundFloorShopfrontGlazing')} sizes="100vw" />
        </div>{' '}
        <div className="wrap">
          {' '}
          <div className="cm">
            {' '}
            <div className="cm-l rv">
              {' '}
              <p className="mt">{t('onThePlansThese')}</p>{' '}
              <dl className="led">
                {' '}
                <div>
                  <dt>{t('totalArea')}</dt>
                  <dd>
                    <b>{t('n164701M')}</b>{' '}
                    <span className="mt" style={{ fontSize: '12.5px' }}>
                      {t('twoLevelsCombined')}
                    </span>
                  </dd>
                </div>{' '}
                <div>
                  <dt>{t('layout')}</dt>
                  <dd>{t('openSpaceNoPartitions')}</dd>
                </div>{' '}
                <div>
                  <dt>{t('columnGrid')}</dt>
                  <dd>{t('n60MAlong')}</dd>
                </div>{' '}
                <div>
                  <dt>{t('gridDimensions')}</dt>
                  <dd>{t('n4222M')}</dd>
                </div>{' '}
                <div>
                  <dt>{t('leaseSale')}</dt>
                  <dd>
                    {t('saleFrom7500')}
                    <DemoTag on={demo} />
                  </dd>
                </div>{' '}
              </dl>{' '}
              <div>
                <a
                  className="btn b-gold"
                  href="#contact"
                  onClick={v.askCom}
                  style={{ whiteSpace: 'normal', textAlign: 'center', paddingBlock: '14px', lineHeight: '1.5' }}
                >
                  {t('askAboutLeaseSale')}
                </a>
              </div>{' '}
            </div>{' '}
            <div className="cm-p rv">
              {' '}
              <div className="tabs" role="group" aria-label={t('level')}>
                {' '}
                <button className={v.c1cls} onClick={v.pickC1} aria-pressed={v.c1on}>
                  {t('groundFloor')} <span>{t('n82348M')}</span>
                </button>{' '}
                <button className={v.c0cls} onClick={v.pickC0} aria-pressed={v.c0on}>
                  {t('lowerLevel')} <span>{t('n82353M')}</span>
                </button>{' '}
              </div>{' '}
              <div className="cm-pl" tabIndex={0} role="region" aria-label={v.comAlt}>
                {' '}
                <div className="cm-w">
                  {' '}
                  {v.cA && (
                    <>
                      <img
                        className="sw"
                        src={v.comImg}
                        {...imgDims(v.comImg)}
                        alt={v.comAlt}
                        loading="lazy"
                        decoding="async"
                      />
                    </>
                  )}{' '}
                  {v.cB && (
                    <>
                      <img
                        className="sw"
                        src={v.comImg}
                        {...imgDims(v.comImg)}
                        alt={v.comAlt}
                        loading="lazy"
                        decoding="async"
                      />
                    </>
                  )}{' '}
                  <div className="fp-c">
                    <span>{t('retailServices')}</span>
                    <b>{v.comArea2}</b>
                  </div>{' '}
                  <div className="scale" style={{ width: '20.54%' }}>
                    <span>{'0'}</span>
                    <span>{'5'}</span>
                    <span>{t('n10M')}</span>
                  </div>{' '}
                </div>{' '}
              </div>
              <PanHint />{' '}
              <dl className="led cm-f" aria-live="polite">
                {' '}
                {v.comRows.map((r, i) => (
                  <Fragment key={i}>
                    <div>
                      <dt>{r.k}</dt>
                      <dd>{r.v}</dd>
                    </div>
                  </Fragment>
                ))}{' '}
              </dl>{' '}
            </div>{' '}
          </div>{' '}
        </div>{' '}
      </section>{' '}
    </>
  );
}
