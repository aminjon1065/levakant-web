/** Number formatting per locale (ru/tg: "193 160" with a no-break space, en: "193,160"). */
const cache = new Map<string, Intl.NumberFormat>();
const fmt = (locale: string, digits: number) => {
  const k = locale + digits;
  let f = cache.get(k);
  if (!f) {
    f = new Intl.NumberFormat(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits });
    cache.set(k, f);
  }
  return f;
};

/** Whole number, rounded like the mockup's `nf`. */
export const nf = (locale: string, v: number) => fmt(locale, 0).format(Math.round(v));
/** Area with two decimals: "35,12" / "35.12". */
export const area = (locale: string, v: number) => fmt(locale, 2).format(v);
