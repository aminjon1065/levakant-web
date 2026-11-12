'use client';

import { useTranslations } from 'next-intl';
import { optIn3D } from '@/engine/capability';
import { set, useSite } from '@/lib/store';

/**
 * Honest status of a live 3D scene: loading, failed, or not started (and why).
 * While it shows, the section displays the static scheme from the mockup.
 */
export function Stage3DStatus({ which }: { which: 'b3St' | 'sunSt' }) {
  const t = useTranslations('common');
  const st = useSite((s) => s[which]);
  const force = useSite((s) => s.force3d);
  if (!st || st === 'ready') return null;
  const text =
    st === 'loading'
      ? t('g3Loading')
      : st === 'error'
        ? t('g3Error')
        : st === 'off-webgl'
          ? t('g3OffWebgl')
          : st === 'off-pref'
            ? t('g3OffPref')
            : t('g3OffDevice');
  const canOptIn = st === 'off-pref' || st === 'off-device';
  return (
    <p className={'g3-st' + (st === 'loading' ? ' ld' : '')} role="status" aria-live="polite">
      <span>{text}</span>
      {canOptIn && (
        <button
          type="button"
          onClick={() => {
            optIn3D();
            set({ force3d: !force });
          }}
        >
          {t('g3Show')}
        </button>
      )}
    </p>
  );
}
