// Generated from levakant-source/src/main.html <!--s:footer--> — hand-maintained from here on.
import { useTranslations } from 'next-intl';
import { LangSwitch } from '@/components/LangSwitch';
import type { SiteInfo } from '@/content/site';

/** `demo`: show the "examples" disclaimer while any price/contact on the page is a placeholder. */
export function Footer({ demo, site }: { demo: boolean; site: SiteInfo }) {
  const t = useTranslations('footer');
  return (
    <>
      {' '}
      <footer className="ft p3">
        {' '}
        <div className="wrap">
          {' '}
          <div className="ft-g">
            {' '}
            <div>
              {' '}
              <a className="brand" href="#top" aria-label={t('levakantResidenceBackTo')}>
                {' '}
                <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
                  <path
                    d="M3.5 23V8M9.8 23V3M16.2 23V3M22.5 23V8M1 23.4h24M7.5 3h11"
                    stroke="currentColor"
                    strokeWidth="1.3"
                  ></path>
                </svg>{' '}
                <span>
                  <b>{'LEVAKANT'}</b>
                  <em>{'RESIDENCE'}</em>
                </span>{' '}
              </a>{' '}
              <p className="sf" style={{ fontSize: '26px', lineHeight: '1.15', marginTop: '20px', maxWidth: '12em' }}>
                {t('architectureOfBetterLiving')}
              </p>{' '}
            </div>{' '}
            <div>
              {' '}
              <h3>{t('navigation')}</h3>{' '}
              <ul className="ft-n">
                {' '}
                <li>
                  <a href="#about">{t('about')}</a>
                </li>{' '}
                <li>
                  <a href="#trust">{t('developer')}</a>
                </li>{' '}
                <li>
                  <a href="#price">{t('pricesInstalments')}</a>
                </li>{' '}
                <li>
                  <a href="#location">{t('location')}</a>
                </li>{' '}
                <li>
                  <a href="#building">{t('buildingIn3d')}</a>
                </li>{' '}
                <li>
                  <a href="#commerce">{t('commercial')}</a>
                </li>{' '}
                <li>
                  <a href="#apartments">{t('apartments')}</a>
                </li>{' '}
                <li>
                  <a href="#contact">{t('contact')}</a>
                </li>{' '}
              </ul>{' '}
            </div>{' '}
            <div>
              {' '}
              <h3>{t('addressContacts')}</h3>{' '}
              <p>
                {t('ismoiliSomoniStLevakant')}
                <br />
                {t('republicOfTajikistan')}
              </p>{' '}
              <p
                style={{
                  marginTop: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  alignItems: 'flex-start',
                }}
              >
                <span>{site.phone}</span>
                <span>{site.email}</span>
              </p>{' '}
            </div>{' '}
            <div>
              {' '}
              <h3>{t('socialMedia')}</h3>{' '}
              <p className="soc">
                <span>
                  <b>{'Instagram'}</b>
                  {site.instagram}
                </span>
                <span>
                  <b>{'Telegram'}</b>
                  {site.telegram}
                </span>
                <span>
                  <b>{'Facebook'}</b>
                  {site.facebook}
                </span>
              </p>{' '}
              <LangSwitch style={{ display: 'inline-flex', marginTop: '18px' }} />{' '}
            </div>{' '}
          </div>{' '}
          <div className="ft-b">
            {' '}
            <p>
              {t('legal')}
              {demo && ' ' + t('demoNotice')}
            </p>{' '}
            <p>{t('conceptDesignArkhitekturaI')}</p>{' '}
          </div>{' '}
        </div>{' '}
      </footer>{' '}
    </>
  );
}
