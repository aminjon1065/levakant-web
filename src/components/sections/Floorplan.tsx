// Generated from levakant-source/src/main.html <!--s:floorplan--> — hand-maintained from here on.
'use client';

import { Fragment } from 'react';
import { useTranslations } from 'next-intl';
import { PanHint } from '@/components/PanHint';
import { useExplorerVals } from '@/lib/explorer';
import { imgDims } from '@/lib/imgDims';

/** Floor plan with apartment zones; shares the floor/apartment choice with the 3D building. */
export function Floorplan() {
  const t = useTranslations('floorplan');
  const v = useExplorerVals();
  return (
    <>
      {' '}
      <section className="sec iv p1 fps" id="floorplan">
        {' '}
        <div className="wrap">
          {' '}
          <div className="ex-ph rv" aria-live="polite">
            {' '}
            <div>
              {' '}
              <div className="ey" style={{ marginBottom: '10px' }}>
                {v.fKicker}
              </div>{' '}
              <div className="n">{v.fTitle}</div>{' '}
            </div>{' '}
            <div className="ex-pt">
              {' '}
              <p>{v.fSub}</p>{' '}
              <div className="g-nav">
                {' '}
                <button className="ib" aria-label={t('floorDown')} onClick={v.flDown} disabled={!!v.flDownOff}>
                  <svg width="10" height="18" viewBox="0 0 10 18" fill="none" aria-hidden="true">
                    <path d="M5 0v16M1 12l4 4 4-4" stroke="currentColor" strokeWidth="1.3"></path>
                  </svg>
                </button>{' '}
                <button className="ib" aria-label={t('floorUp')} onClick={v.flUp} disabled={!!v.flUpOff}>
                  <svg width="10" height="18" viewBox="0 0 10 18" fill="none" aria-hidden="true">
                    <path d="M5 18V2M1 6l4-4 4 4" stroke="currentColor" strokeWidth="1.3"></path>
                  </svg>
                </button>{' '}
                <button className="chip" onClick={v.toggleFz} aria-pressed={v.fzOn}>
                  {v.fzLabel}
                </button>{' '}
                <a className="chip" href="#building">
                  {t('backTo3d')}
                </a>{' '}
              </div>{' '}
            </div>{' '}
          </div>{' '}
          {v.isRes && (
            <>
              {' '}
              <div className="fps-g">
                {' '}
                <div>
                  {' '}
                  <div className={`fp ${v.fpCls}`}>
                    {' '}
                    <div className="fp-w">
                      {' '}
                      <div className="fp-in">
                        {' '}
                        {v.fpA && (
                          <>
                            <img
                              loading="lazy"
                              decoding="async"
                              className="sw"
                              src={v.planImg}
                              {...imgDims(v.planImg)}
                              alt={v.planAlt}
                              style={{ aspectRatio: '2706 / 1536' }}
                            />
                          </>
                        )}{' '}
                        {v.fpB && (
                          <>
                            <img
                              loading="lazy"
                              decoding="async"
                              className="sw"
                              src={v.planImg}
                              {...imgDims(v.planImg)}
                              alt={v.planAlt}
                              style={{ aspectRatio: '2706 / 1536' }}
                            />
                          </>
                        )}{' '}
                        {v.zones.map((z, i) => (
                          <Fragment key={i}>
                            {' '}
                            <button
                              className={z.cls}
                              style={{ left: z.x, top: z.y, width: z.w, height: z.h, clipPath: `polygon(${z.poly})` }}
                              onClick={z.pick}
                              aria-label={z.aria}
                              aria-pressed={z.on}
                            ></button>{' '}
                            <span className={z.lcls} style={{ left: z.cx, top: z.cy }}>
                              {z.area}
                            </span>{' '}
                          </Fragment>
                        ))}{' '}
                      </div>{' '}
                      <div className="scale" style={{ width: '20.95%' }}>
                        <span>{'0'}</span>
                        <span>{'5'}</span>
                        <span>{t('n10M')}</span>
                      </div>{' '}
                    </div>{' '}
                  </div>
                  <PanHint /> <p className="swipe">{t('swipeOrZoomThe')}</p>{' '}
                  <div className="fps-o">
                    <span>{t('courtyard')}</span>
                    <span>{t('ismoiliSomoniSt')}</span>
                  </div>{' '}
                </div>{' '}
                <div className="ex-f">
                  {' '}
                  <span className="lb">{t('layoutsOnThisFloor')}</span>{' '}
                  <div className="chips">
                    {' '}
                    {v.fTypes.map((tx, i) => (
                      <Fragment key={i}>
                        {' '}
                        <button className={tx.cls} onClick={tx.pick} aria-pressed={tx.on}>
                          {tx.label} <small>{tx.cnt}</small>
                        </button>{' '}
                      </Fragment>
                    ))}{' '}
                  </div>{' '}
                  <div className="ex-sel" aria-live="polite">
                    {' '}
                    {v.exHas && (
                      <>
                        {' '}
                        <div>
                          <b>{v.exTitle}</b>
                          {v.exMeta}
                        </div>{' '}
                        <a className="btn b-ink btn-s" href="#apartments" onClick={v.exOpen}>
                          {t('viewLayout')}{' '}
                          <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
                            <path d="M0 5h16M12 1l4 4-4 4" stroke="currentColor" strokeWidth="1.3"></path>
                          </svg>
                        </a>{' '}
                      </>
                    )}{' '}
                    {v.exNone && (
                      <>
                        {' '}
                        <div>{t('areasInMFollow')}</div>{' '}
                      </>
                    )}{' '}
                  </div>{' '}
                </div>{' '}
              </div>{' '}
            </>
          )}{' '}
          {v.isCom && (
            <>
              {' '}
              <div className="fps-g">
                {' '}
                <div>
                  {' '}
                  <div className={`fp ${v.fpCls}`}>
                    {' '}
                    <div className="fp-w">
                      {' '}
                      <div className="fp-in">
                        {' '}
                        {v.fpA && (
                          <>
                            <img
                              loading="lazy"
                              decoding="async"
                              className="sw"
                              src={v.planImg}
                              {...imgDims(v.planImg)}
                              alt={v.planAlt}
                              style={{ aspectRatio: '2760 / 1620' }}
                            />
                          </>
                        )}{' '}
                        {v.fpB && (
                          <>
                            <img
                              loading="lazy"
                              decoding="async"
                              className="sw"
                              src={v.planImg}
                              {...imgDims(v.planImg)}
                              alt={v.planAlt}
                              style={{ aspectRatio: '2760 / 1620' }}
                            />
                          </>
                        )}{' '}
                        <div className="fp-c">
                          <span>{t('retailServices')}</span>
                          <b>{v.comArea}</b>
                        </div>{' '}
                      </div>{' '}
                      <div className="scale" style={{ width: '20.54%' }}>
                        <span>{'0'}</span>
                        <span>{'5'}</span>
                        <span>{t('n10M')}</span>
                      </div>{' '}
                    </div>{' '}
                  </div>
                  <PanHint /> <p className="swipe">{t('swipeOrZoomThe')}</p>{' '}
                </div>{' '}
                <div className="ex-f">
                  {' '}
                  <span className="lb">{t('commercialLevel')}</span>{' '}
                  <div className="mi">
                    {' '}
                    <span>{t('openSpaceColumnGrid')}</span> <span>{t('twoLiftsAndTwo')}</span>{' '}
                  </div>{' '}
                  <div className="ex-sel">
                    <div>{t('detailsInTheCommercial')}</div>
                    <a className="btn b-ink btn-s" href="#commerce">
                      {t('aboutTheCommercialSpaces')}{' '}
                      <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
                        <path d="M0 5h16M12 1l4 4-4 4" stroke="currentColor" strokeWidth="1.3"></path>
                      </svg>
                    </a>
                  </div>{' '}
                </div>{' '}
              </div>{' '}
            </>
          )}{' '}
        </div>{' '}
      </section>{' '}
    </>
  );
}
