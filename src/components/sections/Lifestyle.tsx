// Generated from levakant-source/src/main.html <!--s:lifestyle--> — hand-maintained from here on.
'use client';

import { Fragment, useEffect, useRef, type ChangeEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Pic } from '@/components/Pic';
import { Stage3DStatus } from '@/components/Stage3DStatus';
import { useShallow } from 'zustand/react/shallow';
import { useSiteData } from '@/components/SiteProvider';
import { get, set, tf, up, useSite } from '@/lib/store';
import { imgDims } from '@/lib/imgDims';
import { DATES, sunPos } from '@/lib/sun';
import type { SunDateKey } from '@/lib/types';
import { useStage } from '@/engine/useStage';

const SUN_DATES: SunDateKey[] = ['summer', 'equinox', 'winter'];

/** "Солнце в ваших окнах" (mockup renderVals: "orbit and sun"). */
function useSunVals() {
  const t = useTranslations('lifestyle');
  const { d } = useSiteData();
  const s = useSite(
    useShallow((x) => ({ sunD: x.sunD, sunM: x.sunM, sunH: x.sunH, sunPlay: x.sunPlay, glSun: x.glSun })),
  );
  const sunMin = s.sunM >= 0 ? s.sunM : s.sunH * 60;
  // Without the 3D scene the day plays hour by hour (mockup `_st` interval); the 3D scene drives time itself.
  useEffect(() => {
    if (!s.sunPlay || s.glSun) return;
    const id = setInterval(() => {
      const x = get();
      const hs = d.sun[x.sunD].hours;
      const cur = x.sunM >= 0 ? x.sunM : x.sunH * 60;
      const i = Math.max(0, hs.indexOf(Math.round(cur / 60)));
      set({ sunM: hs[(i + 1) % hs.length] * 60 });
    }, 900);
    return () => clearInterval(id);
  }, [s.sunPlay, s.glSun, d]);
  const SD = d.sun[s.sunD];
  const smin = Math.min(SD.setM, Math.max(SD.riseM, sunMin));
  const hq = smin / 60;
  const sh = SD.hours.reduce((a, b) => (Math.abs(b - hq) < Math.abs(a - hq) ? b : a), SD.hours[0]);
  const dd = DATES[s.sunD];
  const r = sunPos(dd[0], dd[1], dd[2], Math.floor(smin / 60), Math.round(smin % 60));
  const sp = [Math.round(r.az), Math.round(r.el)];
  const clock = String(Math.floor(smin / 60)).padStart(2, '0') + ':' + String(Math.round(smin % 60)).padStart(2, '0');
  const facOn = (dir: string) => {
    const b = parseFloat(String(dir).split('·')[1]);
    return sp[1] > 2 && Math.cos(((sp[0] - b) * Math.PI) / 180) > 0.05;
  };
  return {
    sunImg: SD.img[String(sh)],
    sunAlt: t('shadowsAlt', { date: SD.label, time: clock }),
    sunClock: clock,
    sunDateLabel: SD.label,
    sunBestH: t('hoursShort', { h: SD.fac[0].h }),
    sunFCls: 'sun-f' + (s.glSun ? ' gl' : ''),
    sunMin: SD.riseM,
    sunMax: SD.setM,
    sunMv: smin,
    sunSlide: (e: ChangeEvent<HTMLInputElement>) => set({ sunM: +e.target.value, sunPlay: false }),
    sunDates: SUN_DATES.map((k) => ({
      label: d.sun[k].label,
      cls: 'chip' + (s.sunD === k ? ' on' : ''),
      on: tf(s.sunD === k),
      pick: up({ sunD: k }),
    })),
    sunHours: SD.hours.map((h) => ({
      label: String(h).padStart(2, '0'),
      cls: h === sh ? 'on' : '',
      on: tf(h === sh),
      pick: up({ sunM: h * 60, sunPlay: false }),
    })),
    sunRows: SD.fac.map((f) => ({
      n: f.n,
      dir: f.dir,
      v: f.v,
      h: f.h,
      on: facOn(f.dir),
      cls: 'sun-r' + (facOn(f.dir) ? ' on' : ''),
    })),
    sunRise: SD.rise,
    sunPrev: up({ sunM: Math.max(SD.riseM, smin - 60), sunPlay: false }),
    sunNext: up({ sunM: Math.min(SD.setM, smin + 60), sunPlay: false }),
    sunToggle: up({ sunPlay: !s.sunPlay, sunM: smin >= SD.setM - 5 ? SD.riseM : smin }),
    sunPlayOn: tf(s.sunPlay),
    sunPlayLabel: s.sunPlay ? t('pause') : t('playDay'),
    sunPos: t('sunPos', { az: sp[0], el: sp[1] }),
  };
}

export function Lifestyle() {
  const t = useTranslations('lifestyle');
  const v = useSunVals();
  // Canvas for the live 3D sun scene (stage 4).
  const sunView = useRef<HTMLCanvasElement>(null);
  useStage(sunView, 'sun');
  return (
    <>
      {' '}
      <section className="sec iv p2" id="lifestyle">
        {' '}
        <div className="wrap">
          {' '}
          <div className="sh rv">
            {' '}
            <div>
              {' '}
              <div className="ey">
                <b>{'06'}</b>
                <i></i>
                {t('surroundings')}
              </div>{' '}
              <h2 className="h2">
                {t('courtyardGreenery')} <em>{t('andLight')}</em>
              </h2>{' '}
            </div>{' '}
            <p className="lead mt">{t('lifeHereStartsAt')}</p>{' '}
          </div>{' '}
          <div className="ls">
            {' '}
            <figure className="ls-i rvi">
              {' '}
              <div>
                {' '}
                <Pic src="/assets/aerial.webp" alt={t('aerialViewLandscapingParking')} sizes="92vw" />{' '}
                <span className="pin" style={{ left: '18%', top: '18%' }}>
                  {'1'}
                </span>{' '}
                <span className="pin" style={{ left: '72%', top: '67%' }}>
                  {'2'}
                </span>{' '}
                <span className="pin" style={{ left: '39.5%', top: '83%' }}>
                  {'4'}
                </span>{' '}
                <span className="pin" style={{ left: '57%', top: '64.5%' }}>
                  {'5'}
                </span>{' '}
                <span className="pin" style={{ left: '40%', top: '14%' }}>
                  {'6'}
                </span>{' '}
              </div>{' '}
            </figure>{' '}
            <ol className="li rv">
              {' '}
              <li>
                <b>{'1'}</b>
                <div>
                  <h3>{t('landscaping')}</h3>
                  <p>{t('lawnsTreesAndShrubs')}</p>
                </div>
                <span className="tag">{t('sitePlan')}</span>
              </li>{' '}
              <li>
                <b>{'2'}</b>
                <div>
                  <h3>{t('parking')}</h3>
                  <p>{t('parkingSpacesAlongThe')}</p>
                </div>
                <span className="tag">{t('sitePlan')}</span>
              </li>{' '}
              <li>
                <b>{'3'}</b>
                <div>
                  <h3>{t('playground')}</h3>
                  <p>{t('aPlaygroundInThe')}</p>
                </div>
                <span className="tag">{t('sitePlan')}</span>
              </li>{' '}
              <li>
                <b>{'4'}</b>
                <div>
                  <h3>{t('pedestrianAreas')}</h3>
                  <p>{t('pavedWalkwaysAndStreet')}</p>
                </div>
                <span className="tag">{t('rendering')}</span>
              </li>{' '}
              <li>
                <b>{'5'}</b>
                <div>
                  <h3>{t('retailServices')}</h3>
                  <p>{t('twoLowerLevelsShops')}</p>
                </div>
                <span className="tag">{t('design')}</span>
              </li>{' '}
              <li>
                <b>{'6'}</b>
                <div>
                  <h3>{t('solarPanels')}</h3>
                  <p>{t('panelsOnTheRoof')}</p>
                </div>
                <span className="tag">{t('rendering')}</span>
              </li>{' '}
            </ol>{' '}
          </div>{' '}
          <div className="sun rv" id="sun">
            {' '}
            <div className="sun-h">
              {' '}
              <div>
                <div className="ey">
                  <i></i>
                  {t('sunOverTheBuilding')}
                </div>
                <h3 className="h2 sun-t">
                  {t('sunlight')} <em>{t('inYourWindows')}</em>
                </h3>
              </div>{' '}
              <div className="sun-k">
                <b>{v.sunBestH}</b>
                <div>
                  <p className="sun-k1">
                    {t('ofDirectSunA')} <span>{v.sunDateLabel}</span>
                  </p>
                  <p className="lead mt">{t('chooseADayAnd')}</p>
                </div>
              </div>{' '}
            </div>{' '}
            <div className="sun-g">
              {' '}
              <figure className={v.sunFCls}>
                {' '}
                <img
                  className="sun-i"
                  src={v.sunImg}
                  {...imgDims(v.sunImg)}
                  alt={v.sunAlt}
                  loading="lazy"
                  decoding="async"
                />{' '}
                <canvas
                  className="sun-gl"
                  ref={sunView}
                  role="img"
                  aria-label={v.sunAlt + '. ' + t('kbdHint')}
                ></canvas>{' '}
                <Stage3DStatus which="sunSt" />
                <div className="sun-n" aria-hidden="true" style={{ transform: 'rotate(-24deg)' }}>
                  <i></i>
                  <b>{t('n')}</b>
                </div>{' '}
                <figcaption>
                  <b>{v.sunClock}</b>
                  <span>{v.sunDateLabel}</span>
                </figcaption>{' '}
              </figure>{' '}
              <div className="sun-c">
                {' '}
                <span className="lb">{t('day')}</span>{' '}
                <div className="chips">
                  {v.sunDates.map((o, i) => (
                    <Fragment key={i}>
                      <button className={o.cls} onClick={o.pick} aria-pressed={o.on}>
                        {o.label}
                      </button>
                    </Fragment>
                  ))}
                </div>{' '}
                <span className="lb">{t('hourSunrise', { sunRise: v.sunRise })}</span>{' '}
                <div className="sun-hr" role="group" aria-label={t('hour')}>
                  {v.sunHours.map((o, i) => (
                    <Fragment key={i}>
                      <button className={o.cls} onClick={o.pick} aria-pressed={o.on}>
                        {o.label}
                      </button>
                    </Fragment>
                  ))}
                </div>{' '}
                <label className="sun-sl">
                  <span>{t('time')}</span>
                  <input
                    type="range"
                    min={v.sunMin}
                    max={v.sunMax}
                    step="5"
                    value={v.sunMv}
                    onChange={v.sunSlide}
                    aria-label={t('timeOfDay')}
                    aria-valuetext={v.sunClock}
                  />
                  <b>{v.sunClock}</b>
                </label>{' '}
                <div className="sun-nav">
                  {' '}
                  <button className="ib" aria-label={t('anHourEarlier')} onClick={v.sunPrev}>
                    <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
                      <path d="M18 5H2M6 1L2 5l4 4" stroke="currentColor" strokeWidth="1.3"></path>
                    </svg>
                  </button>{' '}
                  <button className="ib" aria-label={t('anHourLater')} onClick={v.sunNext}>
                    <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
                      <path d="M0 5h16M12 1l4 4-4 4" stroke="currentColor" strokeWidth="1.3"></path>
                    </svg>
                  </button>{' '}
                  <button className="chip" onClick={v.sunToggle} aria-pressed={v.sunPlayOn}>
                    {v.sunPlayLabel}
                  </button>{' '}
                  <span>{v.sunPos}</span>{' '}
                </div>{' '}
                <div className="sun-t2">
                  {' '}
                  <div className="sun-r head">
                    <span>{t('faAde')}</span>
                    <span>{t('directSun')}</span>
                    <span>{t('hours')}</span>
                  </div>{' '}
                  {v.sunRows.map((r, i) => (
                    <Fragment key={i}>
                      <div className={r.cls}>
                        <span>
                          <b>{r.n}</b>
                          <small>
                            {r.dir}
                            {r.on && <span className="sun-now">{' · ' + t('sunNow')}</span>}
                          </small>
                        </span>
                        <span>{r.v}</span>
                        <span>{r.h}</span>
                      </div>
                    </Fragment>
                  ))}{' '}
                </div>{' '}
                <p className="sun-x">{t('shadowsAreCalculatedOn')}</p>{' '}
              </div>{' '}
            </div>{' '}
          </div>{' '}
        </div>{' '}
      </section>{' '}
    </>
  );
}
