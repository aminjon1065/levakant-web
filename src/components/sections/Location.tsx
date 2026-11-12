// Generated from levakant-source/src/main.html <!--s:location--> — hand-maintained from here on.
import { useTranslations } from 'next-intl';

export function Location() {
  const t = useTranslations('location');
  return (
    <>
      {' '}
      <section className="sec dk p2" id="location">
        {' '}
        <div className="wrap lo">
          {' '}
          <div className="lo-l rv">
            {' '}
            <div>
              {' '}
              <div className="ey">
                <b>{'07'}</b>
                <i></i>
                {t('location')}
              </div>{' '}
              <h2 className="h2">
                {t('inTheHeart')} <em>{t('ofLevakant')}</em>
              </h2>{' '}
            </div>{' '}
            <p className="lead mt">{t('theBuildingStandsOn')}</p>{' '}
            <dl className="adr">
              {' '}
              <dt>{t('address')}</dt>
              <dd>{t('ismoiliSomoniStLevakant')}</dd> <dt>{t('nearby')}</dt>
              <dd>{t('leninStVictoryPark')}</dd> <dt>{t('drive')}</dt>
              <dd>{t('about15MinutesBy')}</dd> <dt>{t('pin')}</dt>
              <dd>{t('n37869N68')}</dd>{' '}
            </dl>{' '}
            <p className="mt" style={{ fontSize: '12.5px', lineHeight: '1.5' }}>
              {t('nearbyPlacesAndCoordinates')}
            </p>{' '}
          </div>{' '}
          <div className="map rv">
            {' '}
            <svg
              viewBox="0 0 720 460"
              preserveAspectRatio="xMidYMid slice"
              role="img"
              aria-label={t('siteDiagramPerThe')}
              fontFamily="Manrope, sans-serif"
            >
              {' '}
              <rect width="720" height="460" fill="#171A1D"></rect>{' '}
              <g transform="rotate(-20 360 230)">
                {' '}
                <g fill="#1B1F23" stroke="#F3EFE7" strokeOpacity=".07">
                  {' '}
                  <rect x="-160" y="-150" width="236" height="444"></rect>{' '}
                  <rect x="556" y="-150" width="330" height="444"></rect>{' '}
                  <rect x="-160" y="392" width="236" height="300"></rect>{' '}
                  <rect x="162" y="392" width="724" height="300"></rect>{' '}
                  <rect x="162" y="-150" width="374" height="182"></rect>{' '}
                </g>{' '}
                <rect x="-300" y="318" width="1400" height="50" fill="#262B31"></rect>{' '}
                <rect x="96" y="-400" width="46" height="1300" fill="#262B31"></rect>{' '}
                <path
                  d="M-300 343H1100M119 -400V900"
                  stroke="#F3EFE7"
                  strokeOpacity=".28"
                  strokeDasharray="10 12"
                ></path>{' '}
                <rect
                  x="158"
                  y="52"
                  width="372"
                  height="258"
                  fill="#1F2429"
                  stroke="#C9A46A"
                  strokeOpacity=".55"
                  strokeDasharray="4 5"
                ></rect>{' '}
                <g fill="#3D5A45">
                  {' '}
                  <circle cx="172" cy="68" r="7"></circle>
                  <circle cx="172" cy="296" r="7"></circle>
                  <circle cx="516" cy="296" r="7"></circle>
                  <circle cx="516" cy="68" r="7"></circle> <circle cx="204" cy="296" r="5"></circle>
                  <circle cx="486" cy="296" r="5"></circle>
                  <circle cx="172" cy="120" r="5"></circle>
                  <circle cx="516" cy="120" r="5"></circle>
                  <circle cx="516" cy="180" r="5"></circle>
                  <circle cx="516" cy="240" r="5"></circle>{' '}
                </g>{' '}
                <path
                  d="M226 288v18M248 288v18M270 288v18M292 288v18M314 288v18M336 288v18M358 288v18M380 288v18M402 288v18M424 288v18M446 288v18M468 288v18M164 150h18M164 172h18M164 194h18M164 216h18M164 238h18M164 260h18"
                  stroke="#F3EFE7"
                  strokeOpacity=".34"
                ></path>{' '}
                <rect
                  x="318"
                  y="62"
                  width="92"
                  height="52"
                  fill="#C9A46A"
                  fillOpacity=".07"
                  stroke="#C9A46A"
                  strokeOpacity=".7"
                ></rect>{' '}
                <rect
                  x="196"
                  y="130"
                  width="290"
                  height="152"
                  fill="#C9A46A"
                  fillOpacity=".2"
                  stroke="#C9A46A"
                  strokeWidth="1.6"
                ></rect>{' '}
                <path
                  d="M237.4 130v152M278.9 130v152M320.3 130v152M361.7 130v152M403.1 130v152M444.6 130v152M196 181.8h290M196 230.2h290"
                  stroke="#C9A46A"
                  strokeOpacity=".28"
                ></path>{' '}
                <text
                  x="341"
                  y="202"
                  textAnchor="middle"
                  fill="#F3EFE7"
                  fontSize="13"
                  fontWeight="600"
                  letterSpacing="3"
                >
                  {'LEVAKANT RESIDENCE'}
                </text>{' '}
                <text x="341" y="221" textAnchor="middle" fill="#ABA69C" fontSize="10.5" letterSpacing="1">
                  {t('n9FloorsAndAn')}
                </text>{' '}
                <text x="364" y="92" textAnchor="middle" fill="#D9C39A" fontSize="10" letterSpacing=".6">
                  {t('playground')}
                </text>{' '}
                <text x="347" y="305" textAnchor="middle" fill="#ABA69C" fontSize="9.5" letterSpacing="1.4" dy="18">
                  {t('parking')}
                </text>{' '}
                <text x="436" y="347" textAnchor="middle" fill="#F3EFE7" fontSize="11.5" letterSpacing="2.4">
                  {t('ismoiliSomoniSt')}
                </text>{' '}
              </g>{' '}
              <g transform="translate(668 54)" fill="none" stroke="#F3EFE7" strokeOpacity=".8">
                {' '}
                <circle r="19"></circle>{' '}
                <path d="M0 12V-12M-5 -6l5-7 5 7" stroke="#C9A46A" strokeOpacity="1" strokeWidth="1.4"></path>{' '}
                <text y="-25" textAnchor="middle" fill="#F3EFE7" stroke="none" fontSize="10.5" fontWeight="600">
                  {t('n')}
                </text>{' '}
              </g>{' '}
            </svg>{' '}
            <div className="mk">
              <span>{t('siteDiagramPerMaster')}</span>
              <span className="mk-l">
                <a href="#location">{t('openIn2gis')}</a>
                <a href="#location">{'Google Maps'}</a>
              </span>
            </div>{' '}
          </div>{' '}
        </div>{' '}
      </section>{' '}
    </>
  );
}
