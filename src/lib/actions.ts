'use client';

import { favList, get, set } from './store';

/** Pre-tick contact-form options (mockup `_pre`): WhatsApp as the method, "what to send" boxes. */
export function preFill(o: { wa?: boolean; w?: string[] }) {
  setTimeout(() => {
    const ck = (id: string) => {
      const el = document.getElementById(id) as HTMLInputElement | null;
      if (el) el.checked = true;
    };
    if (o.wa) ck('m2');
    (o.w || []).forEach(ck);
  }, 30);
}

export function focusLater(id: string) {
  setTimeout(() => document.getElementById(id)?.focus(), 60);
}

/** Overlay position inside the page root (mockup `place`). */
export function place(secId: string) {
  const root = document.getElementById('lr-root');
  const sec = document.getElementById(secId);
  const vh = window.innerHeight;
  let top = 0;
  let h = vh;
  if (!root) return { top, h };
  const rt = root.getBoundingClientRect().top;
  if (vh > 1500 && sec) {
    top = Math.max(0, sec.getBoundingClientRect().top - rt);
    h = Math.max(560, Math.min(sec.offsetHeight, 900));
  } else top = Math.max(0, -rt);
  return { top, h };
}

/** Add a layout to the saved list (it goes into the enquiry). */
export function withFav(id: string) {
  const favs = favList(get().fav);
  return (favs.includes(id) ? favs : favs.concat([id])).join('|');
}

/** "Получить расчёт в WhatsApp" / "Написать в WhatsApp" */
export const goWA = () => {
  set({ sent: false, menu: false });
  preFill({ wa: true, w: ['w1'] });
};

/** "Записаться на видеозвонок" */
export const askVideo = () => {
  set({ sent: false });
  preFill({ wa: true, w: ['w4'] });
};

/** "Узнать условия аренды и продажи" */
export const askCom = () => set({ favCom: true, sent: false });
