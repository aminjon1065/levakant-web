// Generated from levakant-source/src/main.html <!--s:hero--> — hand-maintained from here on.
import { useTranslations } from 'next-intl';
import { DemoTag } from '@/components/DemoTag';
import { HeroParallax } from '@/components/HeroParallax';

/** First screen. Scroll animation is pure CSS (animation-timeline); pointer parallax is a client island. */
export function Hero({ pxFrom, demo }: { pxFrom: string; demo: boolean }) {
  const t = useTranslations('hero');
  const v = { pxFrom };
  return (
    <>
      {' '}
      <div className="h-track p1">
        {' '}
        <header className="hero" id="top">
          <HeroParallax />{' '}
          <div className="h-scene" aria-hidden="true">
            {' '}
            <div className="h-ph"></div>{' '}
            <div className="h-wmk">
              <div className="h-wm2">
                <span>{'L'}</span>
                <span>{'E'}</span>
                <span>{'V'}</span>
                <span>{'A'}</span>
                <span>{'K'}</span>
                <span>{'A'}</span>
                <span>{'N'}</span>
                <span>{'T'}</span>
              </div>
            </div>{' '}
          </div>{' '}
          <div className="h-shade"></div>{' '}
          <div className="wrap h-in">
            {' '}
            <div className="h-txt">
              {' '}
              <div className="ey">
                <i></i>
                {t('residentialComplexLevakant')}
              </div>{' '}
              <h1 className="h1">
                <span>
                  <i>{t('newLevelOfLiving')}</i>
                </span>
                <span>
                  <i>{t('centralLevakant')}</i>
                </span>
                <span>
                  <i>{t('homeForYourFamily')}</i>
                </span>
              </h1>{' '}
              <p className="h-sub">
                {t('apartmentsOf35To')}
                <DemoTag on={demo} />
              </p>{' '}
              <div className="h-cta">
                {' '}
                <a className="btn b-gold" href="#apartments">
                  {t('chooseAnApartment')}{' '}
                  <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
                    <path d="M0 5h16M12 1l4 4-4 4" stroke="currentColor" strokeWidth="1.3"></path>
                  </svg>
                </a>{' '}
                <a className="lk" href="#price">
                  {t('pricesInstalments')}{' '}
                  <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
                    <path d="M0 5h16M12 1l4 4-4 4" stroke="currentColor" strokeWidth="1.3"></path>
                  </svg>
                </a>{' '}
              </div>{' '}
            </div>{' '}
            <p className="h-note">{t('architecturalRenderingConceptDes')}</p>{' '}
          </div>{' '}
          <div className="h-led">
            {' '}
            <div className="wrap">
              {' '}
              <span>{t('apartments35134M')}</span>{' '}
              <span>
                {t('fromPxfromSomoni', { pxFrom: v.pxFrom })}
                <DemoTag on={demo} />
              </span>{' '}
              <span>
                {t('n0InstalmentsUpTo')}
                <DemoTag on={demo} />
              </span>{' '}
              <span>
                {t('completionQ42028')}
                <DemoTag on={demo} />
              </span>{' '}
              <a className="h-scroll" href="#about">
                <i></i>
                {t('scroll')}
              </a>{' '}
            </div>{' '}
          </div>{' '}
          <div className="h-cur" aria-hidden="true"></div>{' '}
        </header>{' '}
      </div>{' '}
    </>
  );
}
