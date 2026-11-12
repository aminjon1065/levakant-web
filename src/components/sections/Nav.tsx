// Generated from levakant-source/src/main.html <!--s:nav--> — hand-maintained from here on.
'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useShallow } from 'zustand/react/shallow';
import { LangSwitch, RestoreReadingPosition } from '@/components/LangSwitch';
import { set, tf, up, useSite } from '@/lib/store';

/** Section in view → highlighted nav item (mockup `spyMap`). */
const SPY: Record<string, string> = {
  about: 'about',
  price: 'price',
  building: 'apartments',
  floorplan: 'apartments',
  apartments: 'apartments',
  trust: 'trust',
  lifestyle: 'location',
  location: 'location',
  gallery: 'location',
  architecture: 'commerce',
  commerce: 'commerce',
  contact: 'contact',
};
const NAV_KEYS = ['about', 'price', 'apartments', 'trust', 'location', 'commerce', 'contact'] as const;

function useNavVals() {
  const s = useSite(useShallow((x) => ({ spy: x.spy, menu: x.menu })));
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting && window.innerHeight < 3000) set({ spy: e.target.id });
        }),
      { rootMargin: '-45% 0px -50% 0px' },
    );
    Object.keys(SPY).forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);
  const nv = Object.fromEntries(NAV_KEYS.map((k) => [k, SPY[s.spy] === k ? 'on' : ''])) as Record<
    (typeof NAV_KEYS)[number],
    string
  >;
  return {
    nv,
    menu: s.menu,
    menuOff: !s.menu,
    menuExp: tf(s.menu),
    toggleMenu: up({ menu: !s.menu }),
    closeMenu: up({ menu: false }),
  };
}

export function Nav() {
  const t = useTranslations('nav');
  const v = useNavVals();
  return (
    <>
      {' '}
      <a className="skip" href="#about">
        {t('skipToContent')}
      </a>{' '}
      <RestoreReadingPosition />
      <nav className="nav nt p1" aria-label={t('mainNavigation')}>
        {' '}
        <a className="brand" href="#top">
          {' '}
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
            <path
              d="M3.5 23V8M9.8 23V3M16.2 23V3M22.5 23V8M1 23.4h24M7.5 3h11"
              stroke="currentColor"
              strokeWidth="1.3"
            ></path>
          </svg>{' '}
          <span>
            <b>{'LEVAKANT'}</b> <em>{'RESIDENCE'}</em>
            <span className="vh">{' — ' + t('toTop')}</span>
          </span>{' '}
        </a>{' '}
        <div className="nav-l">
          {' '}
          <a className={v.nv.about} href="#about">
            {t('about')}
          </a>{' '}
          <a className={v.nv.price} href="#price">
            {t('prices')}
          </a>{' '}
          <a className={v.nv.apartments} href="#apartments">
            {t('apartments')}
          </a>{' '}
          <a className={v.nv.trust} href="#trust">
            {t('developer')}
          </a>{' '}
          <a className={v.nv.location} href="#location">
            {t('location')}
          </a>{' '}
          <a className={v.nv.commerce} href="#commerce">
            {t('commercial')}
          </a>{' '}
          <a className={v.nv.contact} href="#contact">
            {t('contact')}
          </a>{' '}
        </div>{' '}
        <div className="nav-r">
          {' '}
          <LangSwitch />{' '}
          <a className="btn b-gold btn-s" href="#price">
            {t('pricesInstalments')}
          </a>{' '}
          <button className="burger" aria-label={t('menu')} aria-expanded={v.menuExp} onClick={v.toggleMenu}>
            {' '}
            {v.menuOff && (
              <>
                <svg width="20" height="14" viewBox="0 0 20 14" fill="none" aria-hidden="true">
                  <path d="M0 1h20M0 7h20M6 13h14" stroke="currentColor" strokeWidth="1.3"></path>
                </svg>
              </>
            )}{' '}
            {v.menu && (
              <>
                <svg width="16" height="16" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.3"></path>
                </svg>
              </>
            )}{' '}
          </button>{' '}
        </div>{' '}
        {v.menu && (
          <>
            {' '}
            <div className="menu">
              {' '}
              <a className="m" href="#about" onClick={v.closeMenu}>
                {t('about')} <small>{'01'}</small>
              </a>{' '}
              <a className="m" href="#price" onClick={v.closeMenu}>
                {t('pricesInstalments')} <small>{'02'}</small>
              </a>{' '}
              <a className="m" href="#building" onClick={v.closeMenu}>
                {t('buildingIn3d')} <small>{'03'}</small>
              </a>{' '}
              <a className="m" href="#apartments" onClick={v.closeMenu}>
                {t('apartments')} <small>{'04'}</small>
              </a>{' '}
              <a className="m" href="#trust" onClick={v.closeMenu}>
                {t('developer')} <small>{'05'}</small>
              </a>{' '}
              <a className="m" href="#location" onClick={v.closeMenu}>
                {t('location')} <small>{'07'}</small>
              </a>{' '}
              <a className="m" href="#commerce" onClick={v.closeMenu}>
                {t('commercial')} <small>{'10'}</small>
              </a>{' '}
              <a className="m" href="#contact" onClick={v.closeMenu}>
                {t('contact')} <small>{'11'}</small>
              </a>{' '}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '14px',
                  marginTop: '20px',
                }}
              >
                {' '}
                <LangSwitch style={{ display: 'flex' }} />{' '}
                <span className="mt" style={{ fontSize: '12px' }}>
                  {t('ismoiliSomoniStLevakant')}
                </span>{' '}
              </div>{' '}
              <a className="btn b-gold" href="#price" onClick={v.closeMenu}>
                {t('pricesInstalments')}
              </a>{' '}
            </div>{' '}
          </>
        )}{' '}
      </nav>{' '}
    </>
  );
}
