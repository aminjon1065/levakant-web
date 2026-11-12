// Generated from levakant-source/src/main.html <!--s:contact--> — hand-maintained from here on.
'use client';

import { Fragment } from 'react';
import { useTranslations } from 'next-intl';
import { useShallow } from 'zustand/react/shallow';
import { useSiteData } from '@/components/SiteProvider';
import { focusLater } from '@/lib/actions';
import { favList, set, tf, up, useSite } from '@/lib/store';

/** Enquiry form (mockup renderVals: "contact" + send). Not connected to a backend yet. */
function useContactVals() {
  const t = useTranslations('contact');
  const { d } = useSiteData();
  const s = useSite(
    useShallow((x) => ({
      err: x.err,
      sending: x.sending,
      sent: x.sent,
      sName: x.sName,
      sTel: x.sTel,
      sMethod: x.sMethod,
      fav: x.fav,
      favCom: x.favCom,
    })),
  );
  const L = d.L;
  const favs = favList(s.fav);
  const errs = s.err ? s.err.split('|') : [];
  const picks = favs
    .filter((id) => L[id])
    .map((id) => ({
      label: L[id].title + ' · ' + t('areaM2', { a: L[id].as }),
      aria: t('removeAria', { what: L[id].title + ' ' + t('areaM2', { a: L[id].as }) }),
      rm: up({ fav: favs.filter((x) => x !== id).join('|') }),
    }));
  if (s.favCom) picks.push({ label: t('commercialSpace'), aria: t('removeCommercial'), rm: up({ favCom: false }) });
  const send = () => {
    const g = (id: string) => (document.getElementById(id) as HTMLInputElement | null)?.value.trim() ?? '';
    const name = g('f-name');
    const tel = g('f-tel');
    const e: string[] = [];
    if (name.length < 2) e.push('name');
    if (tel.replace(/\D/g, '').length < 7) e.push('tel');
    if (e.length) {
      set({ err: e.join('|') });
      focusLater(e[0] === 'name' ? 'f-name' : 'f-tel');
      return;
    }
    const m = document.querySelector<HTMLInputElement>('input[name="m"]:checked');
    const ml = m ? document.querySelector(`label[for="${m.id}"]`) : null;
    set({ err: '', sending: true, sName: name, sTel: tel, sMethod: ml?.textContent ?? t('notSelected') });
    // TODO(stage 7): POST /api/leads — today the form only shows the success state, like the mockup.
    setTimeout(() => set({ sending: false, sent: true }), 900);
  };
  const bad = (k: string) => errs.includes(k);
  return {
    formOn: !s.sent,
    sent: s.sent,
    send,
    sending: s.sending,
    sendLabel: s.sending ? t('sending') : t('sendLabel'),
    resetForm: up({ sent: false, err: '', fav: '', favCom: false }),
    picks,
    hasPicks: picks.length > 0,
    noPicks: picks.length === 0,
    nameCls: bad('name') ? 'bad' : '',
    telCls: bad('tel') ? 'bad' : '',
    nameInv: tf(bad('name')),
    telInv: tf(bad('tel')),
    nameErr: bad('name') ? t('nameErr') : '',
    telErr: bad('tel') ? t('telErr') : '',
    sName: s.sName,
    sTel: s.sTel,
    sMethod: s.sMethod,
    sPicks: picks.length ? picks.map((p) => p.label).join('; ') : t('notSpecified'),
  };
}

export function Contact() {
  const t = useTranslations('contact');
  const { site } = useSiteData();
  const v = useContactVals();
  return (
    <>
      {' '}
      <section className="sec dk ct p3" id="contact">
        {' '}
        <div className="wrap cg">
          {' '}
          <div className="cg-l rv">
            {' '}
            <div>
              {' '}
              <div className="ey">
                <b>{'11'}</b>
                <i></i>
                {t('contact')}
              </div>{' '}
              <h2 className="h2">
                {t('yourNewSpace')} <em>{t('startsHere')}</em>
              </h2>{' '}
            </div>{' '}
            <p className="lead mt">{t('leaveYourNumberWe')}</p>{' '}
            <dl className="cinfo">
              {' '}
              <div>
                <dt>{t('salesTeam')}</dt>
                <dd>{site.phone}</dd>
              </div>{' '}
              <div>
                <dt>{'WhatsApp · Telegram'}</dt>
                <dd>{site.whatsapp}</dd>
              </div>{' '}
              <div>
                <dt>{t('salesOffice')}</dt>
                <dd>{t('ismoiliSomoniStBy')}</dd>
              </div>{' '}
              <div>
                <dt>{t('openingHours')}</dt>
                <dd>{t('monSat900')}</dd>
              </div>{' '}
              <div>
                <dt>{'E-mail'}</dt>
                <dd>{site.email}</dd>
              </div>{' '}
            </dl>{' '}
          </div>{' '}
          <div className="fm rv" role="group" aria-label={t('enquiryForm')}>
            {' '}
            {v.formOn && (
              <>
                {' '}
                {v.hasPicks && (
                  <>
                    {' '}
                    <div className="fd w">
                      {' '}
                      <span className="lg">{t('yourSelection')}</span>{' '}
                      <div className="pk">
                        {' '}
                        {v.picks.map((p, i) => (
                          <Fragment key={i}>
                            {' '}
                            <span className="pk-i">
                              {p.label}
                              <button aria-label={p.aria} onClick={p.rm}>
                                <svg width="10" height="10" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                                  <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.6"></path>
                                </svg>
                              </button>
                            </span>{' '}
                          </Fragment>
                        ))}{' '}
                      </div>{' '}
                    </div>{' '}
                  </>
                )}{' '}
                <div className={`fd ${v.nameCls}`}>
                  <label htmlFor="f-name">
                    {t('name')} <i>{'*'}</i>
                  </label>
                  <input
                    id="f-name"
                    type="text"
                    name="name"
                    autoComplete="name"
                    placeholder={t('howShouldWeAddress')}
                    aria-invalid={v.nameInv}
                    aria-describedby="e-name"
                  />
                  <p className="er" id="e-name">
                    {v.nameErr}
                  </p>
                </div>{' '}
                <div className={`fd ${v.telCls}`}>
                  <label htmlFor="f-tel">
                    {t('phone')} <i>{'*'}</i>
                  </label>
                  <input
                    id="f-tel"
                    type="tel"
                    name="tel"
                    autoComplete="tel"
                    placeholder="+992"
                    aria-invalid={v.telInv}
                    aria-describedby="e-tel"
                  />
                  <p className="er" id="e-tel">
                    {v.telErr}
                  </p>
                </div>{' '}
                <div className="fd w">
                  {' '}
                  <span className="lg" id="lg-m">
                    {t('howToReachYou')}
                  </span>{' '}
                  <div className="rd" role="radiogroup" aria-labelledby="lg-m">
                    {' '}
                    <input type="radio" name="m" id="m1" />
                    <label htmlFor="m1">{t('call')}</label> <input type="radio" name="m" id="m2" />
                    <label htmlFor="m2">{'WhatsApp'}</label> <input type="radio" name="m" id="m3" />
                    <label htmlFor="m3">{'Telegram'}</label>{' '}
                  </div>{' '}
                </div>{' '}
                <div className="fd w">
                  {' '}
                  <span className="lg" id="lg-w">
                    {t('whatToSend')}
                  </span>{' '}
                  <div className="rd ck" role="group" aria-labelledby="lg-w">
                    {' '}
                    <input type="checkbox" name="w" id="w1" />
                    <label htmlFor="w1">{t('pricesInstalments')}</label> <input type="checkbox" name="w" id="w2" />
                    <label htmlFor="w2">{t('layoutCatalogue')}</label> <input type="checkbox" name="w" id="w3" />
                    <label htmlFor="w3">{t('bookAViewing')}</label> <input type="checkbox" name="w" id="w4" />
                    <label htmlFor="w4">{t('videoCall')}</label>{' '}
                  </div>{' '}
                </div>{' '}
                {v.noPicks && (
                  <>
                    {' '}
                    <div className="fd w">
                      <label htmlFor="f-apt">{t('whatAreYouLooking')}</label>{' '}
                      <select id="f-apt" name="apt">
                        {' '}
                        <option>{t('notSureYet')}</option> <option>{t('n1Bedroom3554')}</option>{' '}
                        <option>{t('n2Bedroom6382')}</option> <option>{t('n4Bedroom13356')}</option>{' '}
                        <option>{t('apartmentWithPenthouseZone')}</option> <option>{t('commercialSpace')}</option>{' '}
                      </select>{' '}
                    </div>{' '}
                  </>
                )}{' '}
                <div className="fd w">
                  <label htmlFor="f-msg">
                    {t('message')} <span className="opt">{t('optional')}</span>
                  </label>
                  <textarea id="f-msg" name="msg" rows={2} placeholder={t('questionOrWishes')}></textarea>
                </div>{' '}
                <div className="fm-f">
                  {' '}
                  <p>
                    <i>{'*'}</i> {t('requiredFieldsByPressing')} <u>{t('privacyPolicy')}</u>
                    {'.'}
                  </p>{' '}
                  <button className="btn b-gold" type="button" onClick={v.send} disabled={!!v.sending}>
                    {v.sendLabel}{' '}
                    <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
                      <path d="M0 5h16M12 1l4 4-4 4" stroke="currentColor" strokeWidth="1.3"></path>
                    </svg>
                  </button>{' '}
                </div>{' '}
              </>
            )}{' '}
            {v.sent && (
              <>
                {' '}
                <div className="ok" role="status">
                  {' '}
                  <div className="ey">
                    <i></i>
                    {t('enquiryReceived')}
                  </div>{' '}
                  <p className="h3">{t('thankYouSnameWe', { sName: v.sName })}</p>{' '}
                  <dl className="led">
                    {' '}
                    <div>
                      <dt>{t('phone')}</dt>
                      <dd>{v.sTel}</dd>
                    </div>{' '}
                    <div>
                      <dt>{t('contactMethod')}</dt>
                      <dd>{v.sMethod}</dd>
                    </div>{' '}
                    <div>
                      <dt>{t('interest')}</dt>
                      <dd>{v.sPicks}</dd>
                    </div>{' '}
                  </dl>{' '}
                  <p className="mt" style={{ fontSize: '13px' }}>
                    {t('aManagerWillReply')}
                  </p>{' '}
                  <button className="lk" type="button" onClick={v.resetForm}>
                    {t('newEnquiry')}
                  </button>{' '}
                </div>{' '}
              </>
            )}{' '}
          </div>{' '}
        </div>{' '}
      </section>{' '}
    </>
  );
}
