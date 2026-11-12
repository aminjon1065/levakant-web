// Generated from levakant-source/src/main.html <!--s:mcta--> — hand-maintained from here on.
import { useTranslations } from 'next-intl';
import { ActionLink } from '@/components/ActionLink';

/** Phone bottom bar (Цены · Заявка · WhatsApp) and the floating WhatsApp button on desktop. */
export function MobileCta() {
  const t = useTranslations('mcta');
  return (
    <>
      {' '}
      <div className="mcta">
        {' '}
        <a className="btn b-gold" href="#price">
          {t('prices')}
        </a>{' '}
        <a className="btn b-line" href="#contact">
          {t('enquiry')}
        </a>{' '}
        <ActionLink action="goWA" className="btn wa" href="#contact" aria-label={t('messageOnWhatsapp')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4.5 19.5l1.1-3.9A8.2 8.2 0 1 1 8.6 18.5z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"
            ></path>
            <path
              d="M9.2 8.4c.2-.5.5-.5.8-.5h.5c.2 0 .4.1.5.4l.7 1.6c.1.2 0 .5-.1.6l-.5.6c-.1.2-.1.4 0 .5.6 1 1.4 1.8 2.4 2.3.2.1.4.1.5 0l.6-.7c.2-.2.4-.2.6-.1l1.6.8c.2.1.3.3.3.5v.4c0 .4-.2.8-.6 1-.6.3-1.4.4-2.2.1-2.1-.7-3.9-2.4-4.8-4.5-.3-.8-.3-1.6-.1-2.2"
              fill="currentColor"
            ></path>
          </svg>
        </ActionLink>{' '}
      </div>{' '}
      <ActionLink action="goWA" className="waf p3" href="#contact">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4.5 19.5l1.1-3.9A8.2 8.2 0 1 1 8.6 18.5z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          ></path>
          <path
            d="M9.2 8.4c.2-.5.5-.5.8-.5h.5c.2 0 .4.1.5.4l.7 1.6c.1.2 0 .5-.1.6l-.5.6c-.1.2-.1.4 0 .5.6 1 1.4 1.8 2.4 2.3.2.1.4.1.5 0l.6-.7c.2-.2.4-.2.6-.1l1.6.8c.2.1.3.3.3.5v.4c0 .4-.2.8-.6 1-.6.3-1.4.4-2.2.1-2.1-.7-3.9-2.4-4.8-4.5-.3-.8-.3-1.6-.1-2.2"
            fill="currentColor"
          ></path>
        </svg>
        <span>{t('messageOnWhatsapp')}</span>
      </ActionLink>{' '}
    </>
  );
}
