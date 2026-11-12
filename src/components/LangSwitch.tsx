'use client';

import { Fragment, type CSSProperties } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { set } from '@/lib/store';

const LANGS = [
  ['ru', 'RU'],
  ['tg', 'TJ'],
  ['en', 'EN'],
] as const;

/** RU · TJ · EN switch (same markup as the mockup); keeps the scroll position and the hash. */
export function LangSwitch({ style }: { style?: CSSProperties }) {
  const t = useTranslations('nav');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const go = (l: string) => () => {
    if (l === locale) return;
    set({ menu: false });
    router.replace(pathname + window.location.hash, { locale: l, scroll: false });
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
