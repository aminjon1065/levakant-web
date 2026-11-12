// Generated from levakant-source/src/main.html <!--s:price--> — hand-maintained from here on.
'use client';

import { Fragment, type ChangeEvent } from 'react';
import { useTranslations } from 'next-intl';
import { useShallow } from 'zustand/react/shallow';
import { DemoTag } from '@/components/DemoTag';
import { useSiteData } from '@/components/SiteProvider';
import { waHref } from '@/lib/links';
import { track } from '@/lib/analytics';
import { imgDims } from '@/lib/imgDims';
import { preFill, withFav } from '@/lib/actions';
import { area, nf } from '@/lib/format';
import { allMin, calc, moOf, pxMin } from '@/lib/pricing';
import { set, tf, up, useSite } from '@/lib/store';
import type { FloorKey } from '@/lib/types';

const TYPES = [
  [1, 'type1'],
  [2, 'type2'],
  [4, 'type4'],
] as const;
const FLN = { typ: 'flTyp', f9: 'flF9', ph: 'flPh' } as const;

/** Prices, instalment calculator (mockup renderVals: "prices — demo model"). */
function usePriceVals() {
  const t = useTranslations('price');
  const { d, pricing: p, locale, cfg } = useSiteData();
  const s = useSite(useShallow((x) => ({ pcApt: x.pcApt, pcFl: x.pcFl, pcDown: x.pcDown, pcTerm: x.pcTerm })));
  const L = d.L;
  const n = (v: number) => nf(locale, v);
  const pcId = L[s.pcApt] ? s.pcApt : 'b6329';
  const pcL = L[pcId];
  const pxTypes = TYPES.map(([r, key]) => {
    const ids = d.order.filter((id) => L[id].r === r);
    const ar = ids.map((id) => L[id].total);
    const mn = Math.min(...ids.map((id) => pxMin(d, p, id)));
    const lo = Math.min(...ar);
    const hi = Math.max(...ar);
    return {
      k: t(key),
      area:
        lo === hi
          ? t('areaOne', { a: area(locale, lo) })
          : t('areaRange', { lo: area(locale, lo), hi: area(locale, hi) }),
      from: n(mn),
      mo: n(moOf(p, mn)),
      cls: 'pt' + (pcL.r === r ? ' on' : ''),
      on: tf(pcL.r === r),
      pick: up({ pcApt: ids[0], pcFl: L[ids[0]].fk[0] }),
    };
  });
  const pcFl: FloorKey = pcL.fk.includes(s.pcFl) ? s.pcFl : pcL.fk[0];
  const c = calc(p, pcL.total, pcFl, s.pcDown, s.pcTerm);
  const pcI = d.order.indexOf(pcId);
  const stepPc = (dir: number) => {
    const id = d.order[(pcI + dir + d.order.length) % d.order.length];
    return up({ pcApt: id, pcFl: L[id].fk.includes(pcFl) ? pcFl : L[id].fk[0] });
  };
  return {
    pxFrom: n(allMin(d, p)),
    pxTypes,
    pcImg: pcL.img,
    pcTitle: pcL.title,
    pcArea: pcL.as,
    pcSide: pcL.side,
    pcPrev: stepPc(-1),
    pcNext: stepPc(1),
    pcFls: pcL.fk.map((k) => ({
      label: t(FLN[k]),
      m2: t('perM2', { v: n(p.pxm[k]) }),
      cls: 'chip' + (pcFl === k ? ' on' : ''),
      on: tf(pcFl === k),
      pick: up({ pcFl: k }),
    })),
    pcDown: s.pcDown,
    pcDownTxt: s.pcDown + '%',
    pcDownSet: (e: ChangeEvent<HTMLInputElement>) => set({ pcDown: +e.target.value }),
    downMin: p.downMin,
    downStep: p.downStep,
    pcTerms: p.months.map((m) => ({
      label: t('months', { m }),
      cls: 'chip' + (!c.full && s.pcTerm === m ? ' on' : ''),
      on: tf(!c.full && s.pcTerm === m),
      off: c.full,
      pick: up({ pcTerm: m }),
    })),
    pcResK: c.full ? t('resFull', { d: p.discountFull }) : t('resMonthly'),
    pcRes: n(c.monthly),
    pcResU: c.full ? t('somoni') : t('somoniMonth'),
    pcPrice: n(c.price),
    pcDownSum: n(c.downSum),
    pcRestK: c.full ? t('discount') : t('rest'),
    pcRest: c.full ? t('restFull', { v: n(c.discount) }) : t('restTerm', { v: n(c.rest), m: s.pcTerm }),
    pcM2: n(p.pxm[pcFl]),
    // "Получить расчёт": the calculation goes into the enquiry form…
    askCalc: () => {
      set({
        fav: withFav(pcId),
        sent: false,
        calc: { layout: pcId, floors: pcFl, down: s.pcDown, term: c.full ? 0 : s.pcTerm },
      });
      preFill({ whatsapp: true, wants: ['prices'] });
      track('calc_quote', { layout: pcId, via: 'form' });
    },
    fullHint: t('fullHint', { d: p.discountFull }),
    // …or straight into WhatsApp when a verified number is configured
    waCalc: waHref(
      cfg,
      c.full
        ? t('waCalcFull', { layout: pcL.title + ' ' + t('areaOne', { a: pcL.as }), fl: t(FLN[pcFl]) })
        : t('waCalc', {
            layout: pcL.title + ' ' + t('areaOne', { a: pcL.as }),
            fl: t(FLN[pcFl]),
            down: s.pcDown,
            term: s.pcTerm,
          }),
    ),
  };
}

export function Price() {
  const t = useTranslations('price');
  const v = usePriceVals();
  const { demo } = useSiteData();
  return (
    <>
      {' '}
      <section className="sec dk p1 pr-s" id="price">
        {' '}
        <div className="wrap">
          {' '}
          <div className="sh rv">
            {' '}
            <div>
              {' '}
              <div className="ey">
                <b>{'02'}</b>
                <i></i>
                {t('pricesPayment')}
              </div>{' '}
              <h2 className="h2">
                {t('prices')} <em>{t('andInstalments')}</em>
              </h2>{' '}
            </div>{' '}
            <p className="lead mt">{t('apartmentsFromPxfromSomoni', { pxFrom: v.pxFrom })}</p>{' '}
          </div>{' '}
          <div className="pr-t rv" role="group" aria-label={t('apartmentType')}>
            {' '}
            {v.pxTypes.map((tx, i) => (
              <Fragment key={i}>
                {' '}
                <button className={tx.cls} onClick={tx.pick} aria-pressed={tx.on}>
                  <span className="lb">{tx.k}</span>
                  <span className="pt-a">{tx.area}</span>
                  <b>
                    {t('fromFrom', { from: tx.from })} <small>{t('somoni')}</small>
                  </b>
                  <span className="pt-m">{t('inInstalmentsFromMo', { mo: tx.mo })}</span>
                </button>{' '}
              </Fragment>
            ))}{' '}
          </div>{' '}
          <div className="pr-g">
            {' '}
            <div className="pc rv" aria-live="polite">
              {' '}
              <div className="pc-h">
                <span className="lb">{t('instalmentCalculator')}</span>
                <DemoTag on={demo} />
              </div>{' '}
              <div className="pc-a">
                {' '}
                <button className="ib" aria-label={t('previousLayout')} onClick={v.pcPrev}>
                  <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
                    <path d="M18 5H2M6 1L2 5l4 4" stroke="currentColor" strokeWidth="1.3"></path>
                  </svg>
                </button>{' '}
                <div className="pc-ap">
                  <img src={v.pcImg} {...imgDims(v.pcImg)} alt="" loading="lazy" decoding="async" />
                  <span>
                    <b>{v.pcTitle}</b>
                    <span>{t('pcareaPcside', { pcArea: v.pcArea, pcSide: v.pcSide })}</span>
                  </span>
                </div>{' '}
                <button className="ib" aria-label={t('nextLayout')} onClick={v.pcNext}>
                  <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
                    <path d="M0 5h16M12 1l4 4-4 4" stroke="currentColor" strokeWidth="1.3"></path>
                  </svg>
                </button>{' '}
              </div>{' '}
              <span className="lb">{t('floor')}</span>{' '}
              <div className="chips">
                {v.pcFls.map((o, i) => (
                  <Fragment key={i}>
                    <button className={o.cls} onClick={o.pick} aria-pressed={o.on}>
                      {o.label} <small>{o.m2}</small>
                    </button>
                  </Fragment>
                ))}
              </div>{' '}
              <label className="sun-sl pc-sl">
                <span>{t('downPayment')}</span>
                <input
                  type="range"
                  min={v.downMin}
                  max={100}
                  step={v.downStep}
                  value={v.pcDown}
                  onChange={v.pcDownSet}
                  aria-label={t('downPaymentPercent')}
                  aria-valuetext={v.pcDownTxt}
                />
                <b>
                  {v.pcDown}
                  {'%'}
                </b>
              </label>
              <p className="pc-hint">
                {v.fullHint}
                <DemoTag on={demo} />
              </p>{' '}
              <span className="lb">{t('instalmentTerm')}</span>{' '}
              <div className="chips">
                {v.pcTerms.map((o, i) => (
                  <Fragment key={i}>
                    <button className={o.cls} onClick={o.pick} aria-pressed={o.on} disabled={!!o.off}>
                      {o.label}
                    </button>
                  </Fragment>
                ))}
              </div>{' '}
              <div className="pc-r">
                {' '}
                <span className="lb">{v.pcResK}</span>{' '}
                <b className="pc-m">
                  {v.pcRes} <small>{v.pcResU}</small>
                </b>{' '}
                <dl className="led">
                  {' '}
                  <div>
                    <dt>{t('price')}</dt>
                    <dd>{t('pcpriceSomoni', { pcPrice: v.pcPrice })}</dd>
                  </div>{' '}
                  <div>
                    <dt>{t('downPayment2')}</dt>
                    <dd>{t('pcdownsumSomoni', { pcDownSum: v.pcDownSum })}</dd>
                  </div>{' '}
                  <div>
                    <dt>{v.pcRestK}</dt>
                    <dd>{v.pcRest}</dd>
                  </div>{' '}
                  <div>
                    <dt>{t('pricePerM')}</dt>
                    <dd>{t('pcm2Somoni', { pcM2: v.pcM2 })}</dd>
                  </div>{' '}
                </dl>{' '}
              </div>{' '}
              <a
                className="btn b-gold"
                {...(v.waCalc
                  ? {
                      href: v.waCalc,
                      target: '_blank',
                      rel: 'noopener noreferrer',
                      onClick: () => track('calc_quote', { via: 'whatsapp' }),
                    }
                  : { href: '#contact', onClick: v.askCalc })}
              >
                {v.waCalc ? t('getQuoteWa') : t('getQuote')}{' '}
                <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
                  <path d="M0 5h16M12 1l4 4-4 4" stroke="currentColor" strokeWidth="1.3"></path>
                </svg>
              </a>{' '}
            </div>{' '}
            <div className="po rv">
              {' '}
              <article>
                <span className="po-n">{'01'}</span>
                <div>
                  <h3>{t('payInFull')}</h3>
                  <p>{t('n5OffTheApartment')}</p>
                </div>
                <DemoTag on={demo} />
              </article>{' '}
              <article className="on">
                <span className="po-n">{'02'}</span>
                <div>
                  <h3>{t('developerInstalmentPlan')}</h3>
                  <p>{t('noMarkUpAnd')}</p>
                </div>
                <DemoTag on={demo} />
              </article>{' '}
              <article>
                <span className="po-n">{'03'}</span>
                <div>
                  <h3>{t('mortgage')}</h3>
                  <p>{t('throughAPartnerBank')}</p>
                </div>
                <DemoTag on={demo} />
              </article>{' '}
              <article>
                <span className="po-n">{'04'}</span>
                <div>
                  <h3>{t('buyingFromAbroad')}</h3>
                  <p>{t('videoTourContractBy')}</p>
                  <a className="lk" href="#abroad">
                    {t('howItWorks')}{' '}
                    <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
                      <path d="M0 5h16M12 1l4 4-4 4" stroke="currentColor" strokeWidth="1.3"></path>
                    </svg>
                  </a>
                </div>
                <DemoTag on={demo} />
              </article>{' '}
              <p className="po-x">{demo ? t('demoNote') : t('thePriceAndPayment')}</p>{' '}
            </div>{' '}
          </div>{' '}
        </div>{' '}
      </section>{' '}
    </>
  );
}
