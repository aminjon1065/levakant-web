// Generated from levakant-source/src/main.html <!--s:arch--> — hand-maintained from here on.
import { useTranslations } from 'next-intl';

export function Architecture() {
  const t = useTranslations('arch');
  return (
    <>
      {' '}
      <section className="sec dk p3" id="architecture">
        {' '}
        <div className="wrap">
          {' '}
          <div className="ar-h rv">
            {' '}
            <div className="ey">
              <b>{'09'}</b>
              <i></i>
              {t('architecture')}
            </div>{' '}
            <h2 className="h2">
              {t('theFaAde')} <em>{t('quietClassic')}</em>
            </h2>{' '}
            <p className="lead mt">{t('lightColumnsWarmBeige')}</p>{' '}
          </div>{' '}
          <div className="ar-p rv">
            {' '}
            <ol className="ar-z">
              {' '}
              <li className="z1">
                <div>
                  <h3>{t('top')}</h3>
                  <p>{t('lightUpperFloorsWith')}</p>
                </div>
                <b>{'I'}</b>
              </li>{' '}
              <li className="z2">
                <div>
                  <h3>{t('residentialFloors')}</h3>
                  <p>{t('sevenFloorsInOne')}</p>
                  <div className="pal">
                    <i style={{ background: '#F1E6CD' }}></i>
                    <i style={{ background: '#9E9586' }}></i>
                    <i style={{ background: '#AC7D50' }}></i>
                    <i style={{ background: '#484644' }}></i>
                  </div>
                  <p className="pal-l">{t('faAdeColoursPer')}</p>
                </div>
                <b>{'II'}</b>
              </li>{' '}
              <li className="z3">
                <div>
                  <h3>{t('groundFloor')}</h3>
                  <p>{t('largeShopfrontsAndStreet')}</p>
                </div>
                <b>{'III'}</b>
              </li>{' '}
            </ol>{' '}
            <div className="af ar-e">
              <img src="/assets/facade.webp" alt={t('mainFaAdeOf')} loading="lazy" />
            </div>{' '}
            <p className="cap ar-cap">
              <b>{t('faAde')}</b>
              {t('viewFromIsmoiliSomoni')}
            </p>{' '}
          </div>{' '}
          <div className="ar-t">
            {' '}
            <figure className="rv">
              <div className="af px">
                <img src="/assets/d-crown.webp" alt={t('buildingCornerCorniceUpper')} loading="lazy" />
              </div>
              <figcaption className="cap">
                <b>{'I'}</b>
                {t('corniceAndRoofPergolas')}
              </figcaption>
            </figure>{' '}
            <figure className="rv">
              <div className="af px">
                <img src="/assets/d-rhythm.webp" alt={t('faAdeDetailVertical')} loading="lazy" />
              </div>
              <figcaption className="cap">
                <b>{'II'}</b>
                {t('windowRhythm')}
              </figcaption>
            </figure>{' '}
            <figure className="rv">
              <div className="af px">
                <img src="/assets/d-base.webp" alt={t('groundFloorShopfrontsAnd')} loading="lazy" />
              </div>
              <figcaption className="cap">
                <b>{'III'}</b>
                {t('groundFloorShopfronts')}
              </figcaption>
            </figure>{' '}
          </div>{' '}
          <div className="ar-c">
            {' '}
            <figure className="rvi">
              <div className="af px">
                <img src="/assets/rear.webp" alt={t('courtyardFaAdeWith')} loading="lazy" />
              </div>
            </figure>{' '}
            <div className="rv">
              {' '}
              <b className="rn">{'IV'}</b> <h3 className="h3">{t('onTheCourtyardSide')}</h3>{' '}
              <p className="mt">{t('courtyardSideApartmentsOn')}</p>{' '}
              <figure>
                <div className="af">
                  <img src="/assets/d-balcony.webp" alt={t('courtyardSideBalconies')} loading="lazy" />
                </div>
                <figcaption className="cap">
                  <b>{'IV'}</b>
                  {t('courtyardSideBalconies')}
                </figcaption>
              </figure>{' '}
            </div>{' '}
          </div>{' '}
        </div>{' '}
      </section>{' '}
    </>
  );
}
