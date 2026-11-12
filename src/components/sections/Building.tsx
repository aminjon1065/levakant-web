// Generated from levakant-source/src/main.html <!--s:building--> — hand-maintained from here on.
'use client';

import { Fragment, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useExplorerVals } from '@/lib/explorer';
import { useDragRotate } from '@/lib/drag';

export function Building() {
  const t = useTranslations('building');
  const v = useExplorerVals();
  const b3View = useRef<HTMLCanvasElement>(null);
  useDragRotate('b3');
  return (
    <>
      {' '}
      <section className="sec dk p1 b3s" id="building">
        {' '}
        <div className="wrap">
          {' '}
          <div className="sh rv">
            {' '}
            <div>
              {' '}
              <div className="ey">
                <b>{'03'}</b>
                <i></i>
                {t('buildingIn3d')}
              </div>{' '}
              <h2 className="h2">
                {t('exploreTheBuilding')} <em>{t('in3d')}</em>
              </h2>{' '}
            </div>{' '}
            <p className="lead mt">{t('theArchicadModelOf')}</p>{' '}
          </div>{' '}
          <ol className="stp rv" aria-label={t('pathBuildingFloorApartment')}>
            {' '}
            {v.steps.map((st, i) => (
              <Fragment key={i}>
                {' '}
                <li className={st.cls}>
                  <a href={st.href} onClick={st.pick}>
                    <b>{st.no}</b>
                    <span>
                      {st.t}
                      <small>{st.v}</small>
                    </span>
                  </a>
                </li>{' '}
              </Fragment>
            ))}{' '}
          </ol>{' '}
          <div className="b3w rv" onKeyDown={v.exKey}>
            {' '}
            <div className="fr" role="group" aria-label={t('chooseAFloor')}>
              {' '}
              <span className="fr-l">{t('chooseAFloor')}</span>{' '}
              {v.floors.map((f, i) => (
                <Fragment key={i}>
                  {' '}
                  <button className={f.rcls} onClick={f.pick} aria-label={f.aria} aria-pressed={f.on}>
                    <b>{f.n}</b>
                    <small>{f.kind}</small>
                  </button>{' '}
                </Fragment>
              ))}{' '}
              <button
                className={v.baseCls}
                onClick={v.pickBase}
                aria-label={t('lowerLevelShow')}
                aria-pressed={v.baseOn}
              >
                <b>{'−1'}</b>
                <small>{t('retail')}</small>
              </button>{' '}
            </div>{' '}
            <div className="b3c">
              {' '}
              <div className={v.b3Cls} id="b3">
                {' '}
                <canvas className="b3-gl" ref={b3View} role="img" aria-label={t('n3dBuildingModelFrom')}></canvas>{' '}
                <div className="b3-sc">
                  {' '}
                  <div className={v.b3cls} id="b3-m" style={{ transform: v.b3tf }}>
                    {' '}
                    <div className="b3-g">
                      {' '}
                      <i className="g-site"></i> <span className="g-st">{t('ismoiliSomoniSt')}</span>{' '}
                      <span className="g-yd">{t('courtyard')}</span>{' '}
                      <span className="g-d1">
                        <i>{t('n464MArchicad')}</i>
                      </span>{' '}
                      <span className="g-d2">
                        <i>{t('n268M')}</i>
                      </span>{' '}
                    </div>{' '}
                    {v.LV.map((l, i) => (
                      <Level key={i} l={l} withZones={i >= 2} v={v} />
                    ))}
                  </div>{' '}
                </div>{' '}
                <span className="b3-tag">{t('archicadModelSitePer')}</span>{' '}
                <p className="b3-n">
                  <svg width="26" height="12" viewBox="0 0 26 12" fill="none" aria-hidden="true">
                    <path d="M1 6h24M5 2L1 6l4 4M21 2l4 4-4 4" stroke="currentColor" strokeWidth="1.2"></path>
                  </svg>
                  {t('dragToRotate')}
                </p>{' '}
              </div>{' '}
              <div className="b3-ct">
                {' '}
                <div className="b3-cg">
                  {' '}
                  <span className="b3-cl">{t('building')}</span>{' '}
                  <button className={v.exCls} onClick={v.toggleEx} aria-pressed={v.exOn}>
                    <svg width="20" height="18" viewBox="0 0 20 18" fill="none" aria-hidden="true">
                      <path
                        d="M10 1l9 4-9 4-9-4 9-4zM1 9l9 4 9-4M1 13l9 4 9-4"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinejoin="round"
                      ></path>
                    </svg>
                    {v.exLabel}
                  </button>{' '}
                </div>{' '}
                <div className="b3-cg b3-ct3">
                  {' '}
                  <span className="b3-cl">{t('timeOfDay')}</span>{' '}
                  <div className="b3-v b3-tod" role="group" aria-label={t('timeOfDay')}>
                    {' '}
                    {v.tods.map((vx, i) => (
                      <Fragment key={i}>
                        <button className={vx.cls} onClick={vx.pick} aria-pressed={vx.on}>
                          {vx.label}
                        </button>
                      </Fragment>
                    ))}{' '}
                  </div>{' '}
                </div>{' '}
                <div className="b3-cg b3-cv">
                  {' '}
                  <span className="b3-cl">{t('view')}</span>{' '}
                  <div className="b3-v" role="group" aria-label={t('view')}>
                    {' '}
                    {v.views.map((vx, i) => (
                      <Fragment key={i}>
                        {' '}
                        <button className={vx.cls} onClick={vx.pick} aria-pressed={vx.on}>
                          {vx.label}
                        </button>{' '}
                      </Fragment>
                    ))}{' '}
                  </div>{' '}
                </div>{' '}
              </div>{' '}
            </div>{' '}
            <div className="b3-i" aria-live="polite">
              {' '}
              <div className="ey">{v.fKicker}</div> <div className="n">{v.fTitle}</div> <p className="mt">{v.fSub}</p>{' '}
              <p className="b3-h">{v.b3Hint}</p>{' '}
              {v.isRes && (
                <>
                  {' '}
                  <span className="lb">{t('layoutsOnThisFloor')}</span>{' '}
                  <div className="chips">
                    {' '}
                    {v.b3Types.map((tx, i) => (
                      <Fragment key={i}>
                        {' '}
                        <button className={tx.cls} onClick={tx.pick} aria-pressed={tx.on}>
                          {tx.label} <small>{tx.cnt}</small>
                        </button>{' '}
                      </Fragment>
                    ))}{' '}
                  </div>{' '}
                </>
              )}{' '}
              {v.isCom && (
                <>
                  {' '}
                  <div className="led b3-l">
                    {' '}
                    <div>
                      <span>{t('area')}</span>
                      <span>{v.comArea}</span>
                    </div>{' '}
                    <div>
                      <span>{t('layout')}</span>
                      <span>{t('openSpaceColumnGrid')}</span>
                    </div>{' '}
                  </div>{' '}
                </>
              )}{' '}
              {v.exHas && (
                <>
                  {' '}
                  <p className="b3-x">
                    <b>{v.exTitle}</b>
                    {v.exMeta}
                  </p>{' '}
                </>
              )}{' '}
              <div className="b3-a">
                {' '}
                {v.exHas && (
                  <>
                    {' '}
                    <a className="btn b-gold" href="#apartments" onClick={v.exOpen}>
                      {t('apartmentLayout')}{' '}
                      <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
                        <path d="M0 5h16M12 1l4 4-4 4" stroke="currentColor" strokeWidth="1.3"></path>
                      </svg>
                    </a>{' '}
                  </>
                )}{' '}
                {v.exHas3 && (
                  <>
                    {' '}
                    <a className="lk" href="#apartments" onClick={v.exOpen3}>
                      {t('open3dApartment')}{' '}
                      <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
                        <path d="M0 5h16M12 1l4 4-4 4" stroke="currentColor" strokeWidth="1.3"></path>
                      </svg>
                    </a>{' '}
                  </>
                )}{' '}
                {v.canEnter && (
                  <>
                    {' '}
                    <button className={v.enterCls} onClick={v.toggleEnter} aria-pressed={v.enterOn}>
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                        <path
                          d="M2 16V6l7-4 7 4v10M7 16v-5h4v5"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinejoin="round"
                        ></path>
                      </svg>
                      {v.enterLabel}
                    </button>{' '}
                  </>
                )}{' '}
                <a className="lk" href="#floorplan">
                  {t('floorPlan')}{' '}
                  <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
                    <path d="M0 5h16M12 1l4 4-4 4" stroke="currentColor" strokeWidth="1.3"></path>
                  </svg>
                </a>{' '}
              </div>{' '}
              <p className="b3-d">{v.b3Note}</p>{' '}
            </div>{' '}
          </div>{' '}
        </div>{' '}
      </section>{' '}
    </>
  );
}

type ExplorerVals = ReturnType<typeof useExplorerVals>;

/** One floor block of the CSS building model; residential levels carry apartment zones. */
function Level({ l, withZones, v }: { l: ExplorerVals['LV'][number]; withZones: boolean; v: ExplorerVals }) {
  return (
    <>
      <div className={l.cls} style={{ transform: l.tf }} onClick={l.pick}>
        {' '}
        <i className="xf">
          <em>{l.t}</em>
        </i>
        <i className="xr"></i>
        <i className="xl"></i>
        <i className="xk"></i>{' '}
        <div className="xt">
          {l.sel && (
            <>
              <img className="sw" src={v.planImg} alt={v.planAlt} />
              {withZones && (
                <>
                  {' '}
                  {v.zones.map((z, i) => (
                    <Fragment key={i}>
                      {' '}
                      <button
                        className={z.cls}
                        style={{
                          left: z.x,
                          top: z.y,
                          width: z.w,
                          height: z.h,
                          clipPath: `polygon(${z.poly})`,
                        }}
                        onClick={z.pick}
                        aria-label={z.aria}
                        aria-pressed={z.on}
                      ></button>{' '}
                    </Fragment>
                  ))}
                </>
              )}
            </>
          )}
        </div>{' '}
        <button className="lb3" style={{ transform: l.ltf }} aria-label={l.aria} tabIndex={-1}>
          <b>{l.n}</b>
          <span>
            <em>{l.ps}</em>
            <i>{l.pl}</i>
          </span>
        </button>{' '}
      </div>{' '}
    </>
  );
}
