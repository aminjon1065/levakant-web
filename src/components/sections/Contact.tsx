// Generated from levakant-source/src/main.html <!--s:contact--> — hand-maintained from here on.
'use client';

import { Fragment, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useShallow } from 'zustand/react/shallow';
import { useSiteData } from '@/components/SiteProvider';
import { focusLater } from '@/lib/actions';
import { leadFieldErrors } from '@/lib/leadRules';
import { track } from '@/lib/analytics';
import type { Lead } from '@/lib/leadSchema';
import { waHref } from '@/lib/links';
import { favList, get, set, tf, up, useSite, type SiteState, type Want } from '@/lib/store';

const FLN = { typ: 'flTyp', f9: 'flF9', ph: 'flPh' } as const;

/** UTM tags of the landing URL, kept for the session and attached to the enquiry. */
function utm(): Record<string, string> {
  try {
    const q = new URLSearchParams(window.location.search);
    const found = Object.fromEntries(
      [...q].filter(([k]) => /^utm_[a-z]+$/.test(k)).map(([k, v]) => [k, v.slice(0, 120)]),
    );
    if (Object.keys(found).length) sessionStorage.setItem('lv-utm', JSON.stringify(found));
    return Object.keys(found).length ? found : JSON.parse(sessionStorage.getItem('lv-utm') || '{}');
  } catch {
    return {};
  }
}

/** Interest options of the form (value → message key). */
const INTEREST = {
  r1: 'n1Bedroom3554',
  r2: 'n2Bedroom6382',
  r4: 'n4Bedroom13356',
  ph: 'apartmentWithPenthouseZone',
  com: 'commercialSpace',
} as const;
const EMPTY_FORM: Partial<SiteState> = { fName: '', fTel: '', fMsg: '', fApt: '', fMethod: '', fWants: [], fHp: '' };

/** Enquiry form (mockup renderVals: "contact"). Success is shown only after the server confirms delivery. */
function useContactVals() {
  const t = useTranslations('contact');
  const methodLabel = (m: 'call' | 'whatsapp' | 'telegram') =>
    m === 'call' ? t('call') : m === 'whatsapp' ? 'WhatsApp' : 'Telegram';
  const tp = useTranslations('price');
  const { d, locale } = useSiteData();
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
      calc: x.calc,
      sendErr: x.sendErr,
      leadsOn: x.leadsOn,
    })),
  );
  useEffect(() => {
    utm();
    let live = true;
    fetch('/api/leads', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { enabled: false }))
      .then((j: { enabled?: boolean }) => live && set({ leadsOn: !!j.enabled }))
      .catch(() => live && set({ leadsOn: false }));
    return () => {
      live = false;
    };
  }, []);
  const L = d.L;
  const favs = favList(s.fav).filter((id) => L[id]);
  const picks = favs.map((id) => ({
    label: L[id].title + ' · ' + t('areaM2', { a: L[id].as }),
    aria: t('removeAria', { what: L[id].title + ' ' + t('areaM2', { a: L[id].as }) }),
    rm: up({ fav: favs.filter((x) => x !== id).join('|') }),
  }));
  if (s.calc && L[s.calc.layout]) {
    const c = s.calc;
    const layout = L[c.layout].title + ' ' + t('areaM2', { a: L[c.layout].as });
    const what =
      c.down >= 100
        ? t('calcPickFull', { layout, fl: tp(FLN[c.floors]) })
        : t('calcPick', { layout, fl: tp(FLN[c.floors]), down: c.down, term: c.term });
    picks.push({ label: what, aria: t('removeAria', { what }), rm: up({ calc: null }) });
  }
  if (s.favCom) picks.push({ label: t('commercialSpace'), aria: t('removeCommercial'), rm: up({ favCom: false }) });
  const errs = s.err ? s.err.split('|') : [];
  const send = async () => {
    const x = get();
    const name = x.fName.trim();
    const tel = x.fTel.trim();
    const e = leadFieldErrors(name, tel);
    if (e.length) {
      set({ err: e.join('|'), sendErr: '' });
      focusLater(e[0] === 'name' ? 'f-name' : 'f-tel');
      return;
    }
    const lead: Lead = {
      name,
      phone: tel,
      method: x.fMethod || null,
      wants: x.fWants,
      interest: x.fApt ? t(INTEREST[x.fApt as keyof typeof INTEREST]) : null,
      message: x.fMsg.trim(),
      layouts: favList(x.fav).filter((id) => L[id]),
      commercial: x.favCom,
      calc: x.calc,
      locale: locale as Lead['locale'],
      page: window.location.origin + window.location.pathname,
      utm: utm(),
      company: x.fHp,
    };
    set({ err: '', sendErr: '', sending: true });
    try {
      const r = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(lead),
      });
      if (r.ok) {
        track('lead_submit', { method: x.fMethod || 'none', layouts: lead.layouts.length, calc: !!x.calc });
        set({
          sending: false,
          sent: true,
          sName: name,
          sTel: tel,
          sMethod: x.fMethod ? methodLabel(x.fMethod) : t('notSelected'),
        });
        return;
      }
      const j = (await r.json().catch(() => ({}))) as { error?: string; fields?: string[] };
      if (r.status === 400 && j.fields?.some((f) => f === 'name' || f === 'phone')) {
        const fe = [j.fields.includes('name') && 'name', j.fields.includes('phone') && 'tel'].filter(Boolean).join('|');
        set({ sending: false, err: fe });
        return;
      }
      track('lead_error', { status: r.status });
      set({
        sending: false,
        sendErr: r.status === 503 ? 'not_configured' : r.status === 429 ? 'rate' : 'failed',
        leadsOn: r.status === 503 ? false : x.leadsOn,
      });
    } catch {
      set({ sending: false, sendErr: 'failed' });
    }
  };
  const bad = (k: string) => errs.includes(k);
  return {
    formOn: !s.sent,
    sent: s.sent,
    send,
    sending: s.sending,
    sendLabel: s.sending ? t('sending') : t('sendLabel'),
    resetForm: up({ sent: false, err: '', sendErr: '', fav: '', favCom: false, calc: null, ...EMPTY_FORM }),
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
    leadsOff: s.leadsOn === false,
    sendErr: s.sendErr,
  };
}

export function Contact() {
  const t = useTranslations('contact');
  const { cfg, locale } = useSiteData();
  const v = useContactVals();
  const f = useSite(
    useShallow((x) => ({
      fName: x.fName,
      fTel: x.fTel,
      fMsg: x.fMsg,
      fApt: x.fApt,
      fMethod: x.fMethod,
      fWants: x.fWants,
      fHp: x.fHp,
    })),
  );
  const toggleWant = (w: Want) =>
    set({ fWants: f.fWants.includes(w) ? f.fWants.filter((x) => x !== w) : [...f.fWants, w] });
  const office = cfg.office[locale as 'ru'];
  const hours = cfg.hours[locale as 'ru'];
  const wa = waHref(cfg, t('waHello'));
  const chats = [cfg.whatsapp && 'WhatsApp', cfg.telegram && 'Telegram'].filter(Boolean).join(' · ');
  const anyContact = !!(cfg.phone || wa || cfg.telegram || office || hours || cfg.email);
  // working channels to offer while the form is not connected
  const alt = [
    wa && { href: wa, label: 'WhatsApp', ext: true },
    cfg.telegram && { href: cfg.telegram.url, label: 'Telegram', ext: true },
    cfg.phone && { href: cfg.phone.href, label: t('callUs'), ext: false },
    cfg.email && { href: 'mailto:' + cfg.email, label: 'E-mail', ext: false },
  ].filter((x): x is { href: string; label: string; ext: boolean } => !!x);
  return (
    <>
      {' '}
      <section className="sec dk ct p3" id="contact" data-lazybg="">
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
              {cfg.phone && (
                <div>
                  <dt>{t('salesTeam')}</dt>
                  <dd>
                    <a href={cfg.phone.href}>{cfg.phone.display}</a>
                  </dd>
                </div>
              )}{' '}
              {chats && (
                <div>
                  <dt>{chats}</dt>
                  <dd>
                    {wa && (
                      <a href={wa} target="_blank" rel="noopener noreferrer">
                        {cfg.whatsapp!.display}
                      </a>
                    )}
                    {wa && cfg.telegram && ' · '}
                    {cfg.telegram && (
                      <a href={cfg.telegram.url} target="_blank" rel="noopener noreferrer">
                        {cfg.telegram.handle}
                      </a>
                    )}
                  </dd>
                </div>
              )}{' '}
              {office && (
                <div>
                  <dt>{t('salesOffice')}</dt>
                  <dd>{office}</dd>
                </div>
              )}{' '}
              {hours && (
                <div>
                  <dt>{t('openingHours')}</dt>
                  <dd>{hours}</dd>
                </div>
              )}{' '}
              {cfg.email && (
                <div>
                  <dt>{'E-mail'}</dt>
                  <dd>
                    <a href={'mailto:' + cfg.email}>{cfg.email}</a>
                  </dd>
                </div>
              )}{' '}
              {!anyContact && (
                <div>
                  <dt>{t('salesTeam')}</dt>
                  <dd>{t('contactsPending')}</dd>
                </div>
              )}
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
                    value={f.fName}
                    onChange={(e) => set({ fName: e.target.value })}
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
                    value={f.fTel}
                    onChange={(e) => set({ fTel: e.target.value })}
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
                    <input
                      type="radio"
                      name="m"
                      id="m1"
                      checked={f.fMethod === 'call'}
                      onChange={() => set({ fMethod: 'call' })}
                    />
                    <label htmlFor="m1">{t('call')}</label>{' '}
                    <input
                      type="radio"
                      name="m"
                      id="m2"
                      checked={f.fMethod === 'whatsapp'}
                      onChange={() => set({ fMethod: 'whatsapp' })}
                    />
                    <label htmlFor="m2">{'WhatsApp'}</label>{' '}
                    <input
                      type="radio"
                      name="m"
                      id="m3"
                      checked={f.fMethod === 'telegram'}
                      onChange={() => set({ fMethod: 'telegram' })}
                    />
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
                    <input
                      type="checkbox"
                      name="w"
                      id="w1"
                      checked={f.fWants.includes('prices')}
                      onChange={() => toggleWant('prices')}
                    />
                    <label htmlFor="w1">{t('pricesInstalments')}</label>{' '}
                    <input
                      type="checkbox"
                      name="w"
                      id="w2"
                      checked={f.fWants.includes('catalog')}
                      onChange={() => toggleWant('catalog')}
                    />
                    <label htmlFor="w2">{t('layoutCatalogue')}</label>{' '}
                    <input
                      type="checkbox"
                      name="w"
                      id="w3"
                      checked={f.fWants.includes('viewing')}
                      onChange={() => toggleWant('viewing')}
                    />
                    <label htmlFor="w3">{t('bookAViewing')}</label>{' '}
                    <input
                      type="checkbox"
                      name="w"
                      id="w4"
                      checked={f.fWants.includes('video')}
                      onChange={() => toggleWant('video')}
                    />
                    <label htmlFor="w4">{t('videoCall')}</label>{' '}
                  </div>{' '}
                </div>{' '}
                {v.noPicks && (
                  <>
                    {' '}
                    <div className="fd w">
                      <label htmlFor="f-apt">{t('whatAreYouLooking')}</label>{' '}
                      <select id="f-apt" name="apt" value={f.fApt} onChange={(e) => set({ fApt: e.target.value })}>
                        {' '}
                        <option value="">{t('notSureYet')}</option> <option value="r1">{t('n1Bedroom3554')}</option>{' '}
                        <option value="r2">{t('n2Bedroom6382')}</option>{' '}
                        <option value="r4">{t('n4Bedroom13356')}</option>{' '}
                        <option value="ph">{t('apartmentWithPenthouseZone')}</option>{' '}
                        <option value="com">{t('commercialSpace')}</option>{' '}
                      </select>{' '}
                    </div>{' '}
                  </>
                )}{' '}
                <div className="fd w">
                  <label htmlFor="f-msg">
                    {t('message')} <span className="opt">{t('optional')}</span>
                  </label>
                  <textarea
                    id="f-msg"
                    name="msg"
                    rows={2}
                    placeholder={t('questionOrWishes')}
                    value={f.fMsg}
                    onChange={(e) => set({ fMsg: e.target.value })}
                  ></textarea>
                </div>{' '}
                <div className="hp" aria-hidden="true">
                  <label htmlFor="f-company">Company</label>
                  <input
                    id="f-company"
                    name="company"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={f.fHp}
                    onChange={(e) => set({ fHp: e.target.value })}
                  />
                </div>
                {(v.leadsOff || v.sendErr) && (
                  <div className="fm-st" role={v.sendErr ? 'alert' : 'note'} id="fm-st">
                    <p>
                      {v.sendErr === 'rate' ? t('errRate') : v.sendErr === 'failed' ? t('errFailed') : t('formOff')}
                    </p>
                    {v.sendErr !== 'rate' && v.sendErr !== 'failed' && alt.length > 0 && (
                      <p>
                        {t('formOffAlt')}{' '}
                        {alt.map((a, i) => (
                          <Fragment key={a.href}>
                            {i > 0 && ' · '}
                            <a href={a.href} {...(a.ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                              {a.label}
                            </a>
                          </Fragment>
                        ))}
                      </p>
                    )}
                  </div>
                )}
                <div className="fm-f">
                  {' '}
                  <p>
                    <i>{'*'}</i>{' '}
                    {cfg.privacyUrl ? (
                      <>
                        {t('requiredFieldsByPressing')}{' '}
                        <a href={cfg.privacyUrl} target="_blank" rel="noopener noreferrer">
                          <u>{t('privacyPolicy')}</u>
                        </a>
                        {'.'}
                      </>
                    ) : (
                      t('requiredOnly')
                    )}
                  </p>{' '}
                  <button
                    className="btn b-gold"
                    type="button"
                    onClick={v.send}
                    disabled={!!v.sending || v.leadsOff}
                    aria-describedby={v.leadsOff ? 'fm-st' : undefined}
                  >
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
