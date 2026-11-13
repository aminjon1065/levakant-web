// Generated from levakant-source/src/main.html <!--s:trust--> — hand-maintained from here on.
import { useTranslations } from 'next-intl';
import { ActionLink } from '@/components/ActionLink';
import { DemoTag } from '@/components/DemoTag';
import type { PublicConfig } from '@/lib/config';
import { waHref } from '@/lib/links';

/**
 * Document status: a real PDF link when the owner published the file, otherwise a plain status text
 * ("pending", or "on request" for a document that exists but is not published) styled apart from the link.
 */
function DocStatus({ url, label }: { url: string | null; label: string }) {
  return url ? (
    <a className="st" href={url} target="_blank" rel="noopener noreferrer">
      {'PDF'}
    </a>
  ) : (
    <span className="st">{label}</span>
  );
}

export function Trust({ demo, cfg }: { demo: boolean; cfg: PublicConfig }) {
  const t = useTranslations('trust');
  const waVideo = waHref(cfg, t('waVideo'));
  return (
    <>
      {' '}
      <section className="sec dk p2 tr-s" id="trust">
        {' '}
        <div className="wrap">
          {' '}
          <div className="sh rv">
            {' '}
            <div>
              {' '}
              <div className="ey">
                <b>{'05'}</b>
                <i></i>
                {t('developer')}
              </div>{' '}
              <h2 className="h2">
                {t('builtBy')} <em>{t('akaiMuMin')}</em>
              </h2>{' '}
            </div>{' '}
            <p className="lead mt">{t('anApartmentIsA')}</p>{' '}
          </div>{' '}
          <div className="tr">
            {' '}
            <div className="tr-p rv">
              {' '}
              <div className="tr-ph">
                <span className="sf">{t('am')}</span>
              </div>{' '}
              <div className="tr-pt">
                {' '}
                <span className="lb">{t('developer')}</span> <b className="sf">{t('akaiMuMin')}</b>{' '}
                {/* the address is a draft until the developer approves it — not published before that */}
                {cfg.developerQuoteApproved && (
                  <blockquote className="tr-q">
                    <p>{t('weAreBuildingA')}</p>
                  </blockquote>
                )}{' '}
                <dl className="led">
                  {' '}
                  <div>
                    <dt>{t('design')}</dt>
                    <dd>{t('arkhitekturaIDizainLlc')}</dd>
                  </div>{' '}
                </dl>{' '}
              </div>{' '}
            </div>{' '}
            <div className="tr-d rv">
              {' '}
              <span className="lb">{t('documents')}</span>{' '}
              <ul className="dc">
                {' '}
                <li>
                  <div>
                    <b>{t('conceptDesign')}</b>
                    <span>{t('arkhitekturaIDizainLlc')}</span>
                  </div>
                  {/* the sketch design exists, but until its PDF is published it is shown to buyers on request */}
                  <DocStatus url={cfg.docs.sketch} label={t('onRequest')} />
                </li>{' '}
                <li>
                  <div>
                    <b>{t('buildingPermit')}</b>
                    <span>{t('confirmsTheConstructionIs')}</span>
                  </div>
                  <DocStatus url={cfg.docs.permit} label={t('pending')} />
                </li>{' '}
                <li>
                  <div>
                    <b>{t('stateDesignReview')}</b>
                    <span>{t('theDesignIsChecked')}</span>
                  </div>
                  <DocStatus url={cfg.docs.expertise} label={t('pending')} />
                </li>{' '}
                <li>
                  <div>
                    <b>{t('landTitle')}</b>
                    <span>{t('theDeveloperSRight')}</span>
                  </div>
                  <DocStatus url={cfg.docs.land} label={t('pending')} />
                </li>{' '}
                <li>
                  <div>
                    <b>{t('sampleSaleContract')}</b>
                    <span>
                      {t('contractCertifiedByA')}
                      <DemoTag on={demo} />
                    </span>
                  </div>
                  <DocStatus url={cfg.docs.contract} label={t('pending')} />
                </li>{' '}
              </ul>{' '}
              <p className="tr-x">{t('adviceForAnyBuyer')}</p>{' '}
            </div>{' '}
          </div>{' '}
          <div className="tl rv">
            {' '}
            <div className="tl-h">
              <span className="lb">{t('constructionProgress')}</span>
              <DemoTag on={demo} />
              {cfg.constructionChannelUrl && (
                <a className="tl-s" href={cfg.constructionChannelUrl} target="_blank" rel="noopener noreferrer">
                  {t('photoReports')}
                </a>
              )}
            </div>{' '}
            <ol className="tl-l">
              {' '}
              <li className="dn">
                <i></i>
                <b>{t('conceptDesign')}</b>
                <span>{'2026'}</span>
              </li>{' '}
              <li className="cu">
                <i></i>
                <b>{t('permitExpertReview')}</b>
                <span>{t('q42026')}</span>
              </li>{' '}
              <li>
                <i></i>
                <b>{t('excavationFoundations')}</b>
                <span>{'2027'}</span>
              </li>{' '}
              <li>
                <i></i>
                <b>{t('frameRoof')}</b>
                <span>{'2027–2028'}</span>
              </li>{' '}
              <li>
                <i></i>
                <b>{t('faAdeServices')}</b>
                <span>{'2028'}</span>
              </li>{' '}
              <li>
                <i></i>
                <b>{t('completion')}</b>
                <span>{t('q42028')}</span>
              </li>{' '}
            </ol>{' '}
          </div>{' '}
          <div className="abr rv" id="abroad">
            {' '}
            <div className="abr-h">
              {' '}
              <h3 className="h3">{t('buyingFromAbroad')}</h3>{' '}
              <p className="mt">
                {t('youCanChooseAnd')}
                <DemoTag on={demo} />
              </p>{' '}
              {waVideo ? (
                <a className="btn b-gold" href={waVideo} target="_blank" rel="noopener noreferrer">
                  {t('bookAVideoCall')}{' '}
                  <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
                    <path d="M0 5h16M12 1l4 4-4 4" stroke="currentColor" strokeWidth="1.3"></path>
                  </svg>
                </a>
              ) : (
                <ActionLink action="askVideo" className="btn b-gold" href="#contact">
                  {t('bookAVideoCall')}{' '}
                  <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
                    <path d="M0 5h16M12 1l4 4-4 4" stroke="currentColor" strokeWidth="1.3"></path>
                  </svg>
                </ActionLink>
              )}{' '}
            </div>{' '}
            <ol className="abr-s">
              {' '}
              <li>
                <b>{'1'}</b>
                <div>
                  <h4>{t('videoCall')}</h4>
                  <p>{t('aManagerShowsYou')}</p>
                </div>
              </li>{' '}
              <li>
                <b>{'2'}</b>
                <div>
                  <h4>{t('reservation')}</h4>
                  <p>{t('reservationText')}</p>
                </div>
              </li>{' '}
              <li>
                <b>{'3'}</b>
                <div>
                  <h4>{t('contract')}</h4>
                  <p>{t('byPowerOfAttorney')}</p>
                </div>
              </li>{' '}
              <li>
                <b>{'4'}</b>
                <div>
                  <h4>{t('payment')}</h4>
                  <p>{t('byTransferToThe')}</p>
                </div>
              </li>{' '}
            </ol>{' '}
          </div>{' '}
        </div>{' '}
      </section>{' '}
    </>
  );
}
