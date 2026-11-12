'use client';

import { Fragment, useEffect, type CSSProperties } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { set } from '@/lib/store';
import { track } from '@/lib/analytics';

const LANGS = [
  ['ru', 'RU'],
  ['tg', 'TJ'],
  ['en', 'EN'],
] as const;
const KEY = 'lv-restore';

/**
 * RU · TJ · EN switch (same markup as the mockup).
 * A full page load, not a client navigation: with Cache Components Next.js keeps previous routes mounted
 * (hidden) — for this one-page site that would duplicate the whole page and its ids. The reading position
 * (section in view + offset) and the selected layout (?apt=) carry over.
 */
export function LangSwitch({ style }: { style?: CSSProperties }) {
  const t = useTranslations('nav');
  const locale = useLocale();
  const go = (l: string) => () => {
    if (l === locale) return;
    set({ menu: false });
    track('lang_switch', { to: l });
    const sec = [...document.querySelectorAll<HTMLElement>('#top, #lr-root section[id]')].find(
      (el) => el.getBoundingClientRect().bottom > 80,
    );
    try {
      if (sec) sessionStorage.setItem(KEY, JSON.stringify({ id: sec.id, dy: -sec.getBoundingClientRect().top }));
    } catch {
      /* storage blocked: the new page opens at the top */
    }
    // deliberate full load (see above): a client navigation would keep the old page mounted with the same ids
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign(`/${l}${window.location.search}${window.location.hash}`);
  };
  return (
    <div className="lang" role="group" aria-label={t('siteLanguage')} style={style}>
      {' '}
      {LANGS.map(([l, label]) => (
        <Fragment key={l}>
          <button className={locale === l ? 'on' : ''} aria-pressed={locale === l} onClick={go(l)} lang={l}>
            {label}
          </button>{' '}
        </Fragment>
      ))}
    </div>
  );
}

/** After a language switch: return to the same section and offset. */
export function RestoreReadingPosition() {
  useEffect(() => {
    let r: { id: string; dy: number } | null = null;
    try {
      r = JSON.parse(sessionStorage.getItem(KEY) || 'null');
      sessionStorage.removeItem(KEY);
    } catch {
      return;
    }
    if (!r) return;
    const to = () => {
      const el = document.getElementById(r!.id);
      if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + r!.dy);
    };
    to();
    // sections above may render (content-visibility) and change height: settle once more
    requestAnimationFrame(() => requestAnimationFrame(to));
  }, []);
  return null;
}
