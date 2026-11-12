import { useTranslations } from 'next-intl';

/**
 * The mockup designers' "ДЕМО" mark (<i class="dm">, styles in the v8 layer): flags a price,
 * payment term or date that is an example, not a confirmed offer. Renders nothing once real
 * data replaces the demo values.
 */
export function DemoTag({ on }: { on: boolean }) {
  const t = useTranslations('common');
  if (!on) return null;
  return (
    <i className="dm" title={t('demoTitle')}>
      {t('demo')}
    </i>
  );
}
