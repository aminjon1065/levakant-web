// Generated from levakant-source/src/main.html <!--s:footer--> — hand-maintained from here on.
import { useTranslations } from 'next-intl';
import { LangSwitch } from '@/components/LangSwitch';
import type { PublicConfig } from '@/lib/config';

/**
 * `demo`: show the "examples" disclaimer while prices / terms on the page are the mockup's examples.
 * Contacts and social profiles appear only when configured (no placeholders).
 */
export function Footer({ demo, cfg }: { demo: boolean; cfg: PublicConfig }) {
  const socials = [
    cfg.instagram && { k: 'Instagram', v: cfg.instagram.handle, href: cfg.instagram.url },
    cfg.telegram && { k: 'Telegram', v: cfg.telegram.handle, href: cfg.telegram.url },
    cfg.facebook && { k: 'Facebook', v: cfg.facebook.label, href: cfg.facebook.url },
  ].filter((x): x is { k: string; v: string; href: string } => !!x);
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
              {(cfg.phone || cfg.email) && (
                <p
                  style={{
                    marginTop: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    alignItems: 'flex-start',
                  }}
                >
                  {cfg.phone && <a href={cfg.phone.href}>{cfg.phone.display}</a>}
                  {cfg.email && <a href={'mailto:' + cfg.email}>{cfg.email}</a>}
                </p>
              )}{' '}
            </div>{' '}
            <div>
              {' '}
              <h3>{socials.length ? t('socialMedia') : t('language')}</h3>{' '}
              {socials.length > 0 && (
                <p className="soc">
                  {socials.map((x) => (
                    <a key={x.k} href={x.href} target="_blank" rel="noopener noreferrer">
                      <b>{x.k}</b>
                      {x.v}
                    </a>
                  ))}
                </p>
              )}{' '}
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
