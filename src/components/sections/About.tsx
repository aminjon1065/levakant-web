// Generated from levakant-source/src/main.html <!--s:about--> — hand-maintained from here on.
import { useTranslations } from 'next-intl';
import { Pic } from '@/components/Pic';
import { DemoTag } from '@/components/DemoTag';

export function About({ pxFrom, demo }: { pxFrom: string; demo: boolean }) {
  const t = useTranslations('about');
  const v = { pxFrom };
  return (
    <>
      {' '}
      <section className="sec iv p1 ab-s" id="about">
        {' '}
        <div className="wrap">
          {' '}
          <div className="sh rv">
            {' '}
            <div>
              {' '}
              <div className="ey">
                <b>{'01'}</b>
                <i></i>
                {t('about')}
              </div>{' '}
              <h2 className="h2">
                {t('whyItS')} <em>{t('easyToLiveHere')}</em>
              </h2>{' '}
            </div>{' '}
            <p className="lead mt">{t('levakantResidenceIsA')}</p>{' '}
          </div>{' '}
          <div className="bn">
            {' '}
            <article className="bn-i rv">
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
                <circle cx="15" cy="15" r="5.5" stroke="currentColor" strokeWidth="1.3"></circle>
                <path
                  d="M15 2.5v4M15 23.5v4M2.5 15h4M23.5 15h4M6.2 6.2l2.8 2.8M21 21l2.8 2.8M6.2 23.8L9 21M21 9l2.8-2.8"
                  stroke="currentColor"
                  strokeWidth="1.3"
                ></path>
              </svg>
              <h3>{t('sunlitWindows')}</h3>
              <p>{t('streetFacingWindowsGet')}</p>
            </article>{' '}
            <article className="bn-i rv">
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
                <rect x="4" y="3" width="9.5" height="24" stroke="currentColor" strokeWidth="1.3"></rect>
                <rect x="16.5" y="3" width="9.5" height="24" stroke="currentColor" strokeWidth="1.3"></rect>
                <path d="M6.5 13l2.25-3 2.25 3M19 17l2.25 3 2.25-3" stroke="currentColor" strokeWidth="1.3"></path>
              </svg>
              <h3>{t('twoLifts')}</h3>
              <p>{t('twoLiftsAndTwo')}</p>
            </article>{' '}
            <article className="bn-i rv">
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
                <path
                  d="M3 11.5L5.5 4h19L27 11.5M3 11.5h24M3 11.5c0 2 1.6 3.4 3.75 3.4s3.75-1.4 3.75-3.4c0 2 1.6 3.4 3.75 3.4S18 13.5 18 11.5c0 2 1.6 3.4 3.75 3.4S27 13.5 27 11.5M5 15v12h20V15M12 27v-7h6v7"
                  stroke="currentColor"
                  strokeWidth="1.3"
                ></path>
              </svg>
              <h3>{t('shopsInTheBuilding')}</h3>
              <p>{t('theGroundFloorAnd')}</p>
            </article>{' '}
            <article className="bn-i rv">
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
                <circle cx="11" cy="10" r="6.5" stroke="currentColor" strokeWidth="1.3"></circle>
                <path
                  d="M11 16.5V27M3 27h24M21 27v-9.5M18 20.5h6M18 17.5h6"
                  stroke="currentColor"
                  strokeWidth="1.3"
                ></path>
              </svg>
              <h3>{t('courtyardParking')}</h3>
              <p>{t('aPlaygroundLawnsAnd')}</p>
            </article>{' '}
            <article className="bn-i rv">
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
                <path
                  d="M15 27s-8.5-8.2-8.5-14.5a8.5 8.5 0 0 1 17 0C23.5 18.8 15 27 15 27z"
                  stroke="currentColor"
                  strokeWidth="1.3"
                ></path>
                <circle cx="15" cy="12.5" r="3" stroke="currentColor" strokeWidth="1.3"></circle>
              </svg>
              <h3>{t('centralLevakant')}</h3>
              <p>{t('closeToLeninStreet')}</p>
            </article>{' '}
            <article className="bn-i rv">
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
                <path
                  d="M3 27V12L15 4l12 8v15M3 27h24M9 27V16h12v11M15 16v11"
                  stroke="currentColor"
                  strokeWidth="1.3"
                ></path>
              </svg>
              <h3>{t('atticLevel')}</h3>
              <p>{t('apartmentsOfUpTo')}</p>
            </article>{' '}
          </div>{' '}
          <div className="ab2">
            {' '}
            <figure className="ab-f rvi">
              {' '}
              <div className="af px">
                <Pic
                  src="/assets/corner.webp"
                  alt={t('levakantResidenceCornerPerspecti')}
                  sizes="(max-width: 1100px) 92vw, 52vw"
                />
              </div>{' '}
              <figcaption className="cap">
                <b>{t('view')}</b>
                {t('cornerPerspective')}
              </figcaption>{' '}
            </figure>{' '}
            <dl className="led rv">
              {' '}
              <div>
                <dt>{t('storeys')}</dt>
                <dd>{t('n9FloorsAndAn')}</dd>
              </div>{' '}
              <div>
                <dt>{t('apartments')}</dt>
                <dd>{t('n12And4')}</dd>
              </div>{' '}
              <div>
                <dt>{t('price')}</dt>
                <dd>
                  {t('fromPxfromSomoni', { pxFrom: v.pxFrom })}
                  <DemoTag on={demo} />
                </dd>
              </div>{' '}
              <div>
                <dt>{t('instalments')}</dt>
                <dd>
                  {t('noMarkUp30')}
                  <DemoTag on={demo} />
                </dd>
              </div>{' '}
              <div>
                <dt>{t('completion')}</dt>
                <dd>
                  {t('q42028')}
                  <DemoTag on={demo} />
                </dd>
              </div>{' '}
              <div>
                <dt>{t('developer')}</dt>
                <dd>{t('akaiMuMin')}</dd>
              </div>{' '}
              <div>
                <dt>{t('design')}</dt>
                <dd>{t('arkhitekturaIDizainLlc')}</dd>
              </div>{' '}
            </dl>{' '}
          </div>{' '}
        </div>{' '}
      </section>{' '}
    </>
  );
}
