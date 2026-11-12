// Generated from levakant-source/src/main.html <!--s:apartments--> — hand-maintained from here on.
'use client';

import { Fragment } from 'react';
import { useTranslations } from 'next-intl';
import { DemoTag } from '@/components/DemoTag';
import { Pic } from '@/components/Pic';
import { useSiteData } from '@/components/SiteProvider';
import { useCatalogVals } from '@/lib/catalog';
import { useDragRotate } from '@/lib/drag';

export function Apartments() {
  const t = useTranslations('apartments');
  const v = useCatalogVals();
  const { demo } = useSiteData();
  useDragRotate('q3');
  return (
    <>
      {' '}
      <section className="sec pa p2" id="apartments">
        {' '}
        <div className="wrap">
          {' '}
          <div className="sh rv">
            {' '}
            <div>
              {' '}
              <div className="ey">
                <b>{'04'}</b>
                <i></i>
                {t('apartments')}
              </div>{' '}
              <h2 className="h2">
                {t('layouts')} <em>{t('andAreas')}</em>
              </h2>{' '}
            </div>{' '}
            <p className="lead mt">{t('n18LayoutsFrom35')}</p>{' '}
          </div>{' '}
          <div className="fl rv">
            {' '}
            <div>
              {' '}
              <span className="lb">{t('type')}</span>{' '}
              <div className="chips">
                {v.optT.map((o, i) => (
                  <Fragment key={i}>
                    <button className={o.cls} onClick={o.pick} aria-pressed={o.on} disabled={!!o.off}>
                      {o.label} <small>{o.cnt}</small>
                    </button>
                  </Fragment>
                ))}
              </div>{' '}
            </div>{' '}
            <div>
              {' '}
              <span className="lb">{t('areaM')}</span>{' '}
              <div className="chips">
                {v.optA.map((o, i) => (
                  <Fragment key={i}>
                    <button className={o.cls} onClick={o.pick} aria-pressed={o.on} disabled={!!o.off}>
                      {o.label} <small>{o.cnt}</small>
                    </button>
                  </Fragment>
                ))}
              </div>{' '}
            </div>{' '}
            <div>
              {' '}
              <span className="lb">{t('floor')}</span>{' '}
              <div className="chips">
                {v.optF.map((o, i) => (
                  <Fragment key={i}>
                    <button className={o.cls} onClick={o.pick} aria-pressed={o.on} disabled={!!o.off}>
                      {o.label} <small>{o.cnt}</small>
                    </button>
                  </Fragment>
                ))}
              </div>{' '}
            </div>{' '}
            <div className="fl-r">
              {' '}
              <p className="cnt" aria-live="polite">
                {v.countLabel}
              </p>{' '}
              <button className="chip" onClick={v.toggleSort} aria-label={v.sortAria}>
                {t('sortarrow', { sortArrow: v.sortArrow })}
              </button>{' '}
              {v.fActive && (
                <>
                  <button className="chip rst" onClick={v.resetF}>
                    {t('reset')}
                  </button>
                </>
              )}{' '}
            </div>{' '}
          </div>{' '}
          <p className="av">
            <b>{t('layoutsNotAvailability')}</b>
            <span>{t('theCatalogueShowsThe')}</span>
          </p>{' '}
          <div className="cat">
            {' '}
            <div className="cl">
              {' '}
              {v.cards.map((c, i) => (
                <Fragment key={i}>
                  {' '}
                  <button className={c.cls} onClick={c.pick} aria-pressed={c.on}>
                    {' '}
                    <span className="th">
                      <Pic src={c.img} alt="" sizes="64px" />
                    </span>{' '}
                    <span>
                      <span className="t">{c.title}</span>
                      <span className="a">{t('area', { area: c.area })}</span>
                      <span className="pk2">{t('fromPxSomoni', { px: c.px })}</span>
                    </span>{' '}
                    <span className="f">
                      {c.floors}
                      <i className={c.fav}></i>
                    </span>{' '}
                  </button>{' '}
                </Fragment>
              ))}{' '}
              {v.noCards && (
                <>
                  {' '}
                  <div className="cl-e">
                    <p>{t('noLayoutsMatchThese')}</p>
                    <button className="btn b-inkl btn-s" onClick={v.resetF}>
                      {t('resetFilters')}
                    </button>
                  </div>{' '}
                </>
              )}{' '}
            </div>{' '}
            <aside className="cv" aria-label={t('selectedLayout')}>
              {' '}
              <div className="cv-h">
                {' '}
                <div>
                  {' '}
                  <div className="ey" style={{ marginBottom: '8px' }}>
                    {v.sKicker}
                  </div>{' '}
                  <div className="n">
                    {v.sArea}
                    <small>{t('m')}</small>
                  </div>{' '}
                </div>{' '}
                <div className="cv-hr">
                  {' '}
                  <div className="mi" style={{ textAlign: 'right' }}>
                    {' '}
                    <span>
                      <b>{v.sFloors}</b>
                    </span>{' '}
                    <span>{v.sSide}</span>{' '}
                  </div>{' '}
                  <div className="g-nav">
                    {' '}
                    <span>{v.sPos}</span>{' '}
                    <button className="ib" aria-label={t('previousLayout')} onClick={v.sPrev}>
                      <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
                        <path d="M18 5H2M6 1L2 5l4 4" stroke="currentColor" strokeWidth="1.3"></path>
                      </svg>
                    </button>{' '}
                    <button className="ib" aria-label={t('nextLayout')} onClick={v.sNext}>
                      <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
                        <path d="M0 5h16M12 1l4 4-4 4" stroke="currentColor" strokeWidth="1.3"></path>
                      </svg>
                    </button>{' '}
                  </div>{' '}
                </div>{' '}
              </div>{' '}
              <div className="cv-b">
                {' '}
                <div className="cv-pw">
                  {' '}
                  <div className="cv-md" role="tablist" aria-label={t('apartmentViewMode')}>
                    {' '}
                    <button className={v.mdPlanCls} role="tab" aria-selected={v.mdPlanOn} onClick={v.setPlan}>
                      {t('plan')}
                      <small>{t('technicalDrawing')}</small>
                    </button>{' '}
                    <button className={v.md3Cls} role="tab" aria-selected={v.md3On} onClick={v.set3d}>
                      {t('n3dApartment')}
                      <small>{v.md3Note}</small>
                    </button>{' '}
                  </div>{' '}
                  {v.isPlan && (
                    <>
                      {' '}
                      <div className="cv-tl" role="toolbar" aria-label={t('planTools')}>
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
                        <button className="tb" onClick={v.pzOpen}>
                          {t('fullScreen')}
                        </button>{' '}
                      </div>{' '}
                      <div className="cv-p">
                        {' '}
                        <div
                          className="pv"
                          style={{ aspectRatio: v.sAr, width: `calc(min(100%, 440px * ${v.sAr}) * ${v.zF})` }}
                        >
                          {' '}
                          {v.vA && (
                            <>
                              <img className="sw" src={v.sImg} alt={v.sAlt} loading="lazy" decoding="async" />
                            </>
                          )}{' '}
                          {v.vB && (
                            <>
                              <img className="sw" src={v.sImg} alt={v.sAlt} loading="lazy" decoding="async" />
                            </>
                          )}{' '}
                          {v.sRp.map((r, i) => (
                            <Fragment key={i}>
                              {' '}
                              <button
                                className={r.cls}
                                style={{ clipPath: `polygon(${r.poly})` }}
                                onClick={r.pick}
                                aria-label={r.aria}
                                aria-pressed={r.on}
                              ></button>{' '}
                            </Fragment>
                          ))}{' '}
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
                    </>
                  )}{' '}
                  {v.has3 && (
                    <>
                      {' '}
                      <div className="cv-tl" role="toolbar" aria-label={t('n3dModelTools')}>
                        {' '}
                        <button className={v.avTopCls} onClick={v.avTop} aria-pressed={v.avTopOn}>
                          {t('top')}
                        </button>{' '}
                        <button className={v.avPerCls} onClick={v.avPer} aria-pressed={v.avPerOn}>
                          {t('perspective')}
                        </button>{' '}
                        <button className="tb" onClick={v.zOut} aria-label={t('zoomOut')} disabled={!!v.zOutOff}>
                          {'−'}
                        </button>{' '}
                        <span className="tz">{v.zPct}</span>{' '}
                        <button className="tb" onClick={v.zIn} aria-label={t('zoomIn')} disabled={!!v.zInOff}>
                          {'+'}
                        </button>{' '}
                        <span className="q3-hn">{t('dragToRotateTap')}</span>{' '}
                      </div>{' '}
                    </>
                  )}{' '}
                  {v.has3 && (
                    <>
                      {' '}
                      <div className="q3" id="q3">
                        {' '}
                        <div className={v.a3zCls}>
                          {' '}
                          <div className={v.a3Cls} id="q3-m" style={{ transform: v.a3tf, aspectRatio: v.sAr }}>
                            {' '}
                            <div className="q3-fl">
                              {' '}
                              {v.sRp.map((r, i) => (
                                <Fragment key={i}>
                                  {' '}
                                  <button
                                    className={r.cls3}
                                    style={{ clipPath: `polygon(${r.poly})` }}
                                    onClick={r.pick}
                                    aria-label={r.aria}
                                    aria-pressed={r.on}
                                  ></button>{' '}
                                </Fragment>
                              ))}{' '}
                              <img src={v.sImg} alt="" />{' '}
                            </div>{' '}
                            <i className="q3-f f1"></i>
                            <i className="q3-f f2"></i>
                            <i className="q3-f f3"></i>
                            <i className="q3-f f4"></i>
                            <i className="q3-f f5"></i>{' '}
                            <div className="q3-fc">
                              <img src={v.sImg} alt="" />
                            </div>{' '}
                            <i className="q3-w w1"></i>
                            <i className="q3-w w2"></i>
                            <i className="q3-w w3"></i>
                            <i className="q3-w w4"></i>
                            <i className="q3-w w5"></i>
                            <i className="q3-w w6"></i>
                            <i className="q3-w w7"></i>
                            <i className="q3-w w8"></i>
                            <i className="q3-w w9"></i>
                            <i className="q3-w w10"></i>
                            <i className="q3-w w11"></i>
                            <i className="q3-w w12"></i>
                            <i className="q3-w w13"></i>
                            <i className="q3-w w14"></i>{' '}
                            {v.RL.map((r, i) => (
                              <Fragment key={i}>
                                <span className={r.cls} style={{ left: r.x, top: r.y, transform: r.tf }}>
                                  <b>{r.n}</b>
                                  {r.a}
                                </span>{' '}
                              </Fragment>
                            ))}
                          </div>{' '}
                        </div>{' '}
                        <div className="q3-k" aria-hidden="true">
                          {' '}
                          <div>
                            <img src={v.sImg} alt="" style={{ aspectRatio: v.sAr }} />{' '}
                            {v.sRp.map((r, i) => (
                              <Fragment key={i}>
                                <i className={r.clsK} style={{ clipPath: `polygon(${r.poly})` }}></i>
                              </Fragment>
                            ))}{' '}
                          </div>{' '}
                          <span>{t('technicalPlan')}</span>{' '}
                        </div>{' '}
                      </div>{' '}
                      <p className="q3-c">
                        <b>{t('illustrativeModel')}</b> {t('wallsAndFurnitureCome')}
                      </p>{' '}
                    </>
                  )}{' '}
                  {v.no3 && (
                    <>
                      {' '}
                      <div className="q3-e">
                        {' '}
                        <div className="h3">{t('the3dModelOf')}</div> <p>{t('modelsAreBuiltFrom')}</p>{' '}
                        <div className="chips">
                          {' '}
                          {v.a3Ready.map((o, i) => (
                            <Fragment key={i}>
                              <button className={o.cls} onClick={o.pick}>
                                {o.label}
                              </button>
                            </Fragment>
                          ))}{' '}
                        </div>{' '}
                        <button className="lk" onClick={v.setPlan} style={{ alignSelf: 'flex-start' }}>
                          {t('backToPlan')}{' '}
                          <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
                            <path d="M0 5h16M12 1l4 4-4 4" stroke="currentColor" strokeWidth="1.3"></path>
                          </svg>
                        </button>{' '}
                      </div>{' '}
                    </>
                  )}{' '}
                </div>{' '}
                <div className="cv-i">
                  {' '}
                  <div className="rm-i" aria-live="polite">
                    <span className="lb">{v.rmK}</span>
                    <b>{v.rmT}</b>
                    <span>{v.rmS}</span>
                  </div>{' '}
                  <div className="rt">
                    {' '}
                    {v.sRm.map((r, i) => (
                      <Fragment key={i}>
                        {' '}
                        <button className={r.cls} onClick={r.pick} aria-pressed={r.on} disabled={!!r.off}>
                          <span>{r.n}</span>
                          <span>{r.a}</span>
                        </button>{' '}
                      </Fragment>
                    ))}{' '}
                    <div className="rt-t">
                      <span>{t('totalArea')}</span>
                      <span>{t('sarea', { sArea: v.sArea })}</span>
                    </div>{' '}
                  </div>{' '}
                  <div className="mi">
                    {' '}
                    <span>
                      {t('perFloorInThe')} <b>{v.sPer}</b>
                    </span>{' '}
                    <span>
                      {t('balconies')} <b>{v.sBalc}</b>
                    </span>{' '}
                  </div>{' '}
                  <div className="kp">
                    {' '}
                    <span className="lb">{v.kpLabel}</span>{' '}
                    <div className="kp-in">
                      <div className="kp-b">
                        {' '}
                        <img
                          src={v.kpImg}
                          alt=""
                          style={{ aspectRatio: '2706 / 1536' }}
                          loading="lazy"
                          decoding="async"
                        />{' '}
                        {v.kpZones.map((z, i) => (
                          <Fragment key={i}>
                            <span
                              className="kz"
                              style={{ left: z.x, top: z.y, width: z.w, height: z.h, clipPath: `polygon(${z.poly})` }}
                            ></span>
                          </Fragment>
                        ))}{' '}
                      </div>
                    </div>{' '}
                  </div>{' '}
                  <div className="inb">
                    {' '}
                    <span className="lb">{t('showInTheBuilding')}</span>{' '}
                    <div className="inb-r">
                      {v.sFl.map((f, i) => (
                        <Fragment key={i}>
                          <a className="fc" href="#building" onClick={f.pick} aria-label={f.aria}>
                            {f.n}
                          </a>
                        </Fragment>
                      ))}
                    </div>{' '}
                  </div>{' '}
                  {v.sHasNote && (
                    <>
                      {' '}
                      <p className="cv-n">{v.sNote}</p>{' '}
                    </>
                  )}{' '}
                </div>{' '}
              </div>{' '}
              <div className="cv-px">
                <span className="lb">
                  {t('price')}
                  <DemoTag on={demo} />
                </span>
                <b>
                  {t('fromSpx', { sPx: v.sPx })} <small>{t('somoni')}</small>
                </b>
                <span>{t('smoSm2', { sMo: v.sMo, sM2: v.sM2 })}</span>
              </div>{' '}
              <div className="cv-f">
                {' '}
                <button className={v.favCls} onClick={v.toggleFav} aria-pressed={v.favOn}>
                  {v.favLabel}
                </button>{' '}
                <p aria-live="polite">{v.favNote}</p>{' '}
                <a className="btn b-ink" href="#contact" onClick={v.askApt}>
                  {t('getPriceInstalments')}{' '}
                  <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
                    <path d="M0 5h16M12 1l4 4-4 4" stroke="currentColor" strokeWidth="1.3"></path>
                  </svg>
                </a>{' '}
              </div>{' '}
            </aside>{' '}
          </div>{' '}
        </div>{' '}
      </section>{' '}
    </>
  );
}
