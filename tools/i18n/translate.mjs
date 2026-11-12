// Translator from the mockup (RU text -> TJ/EN by exact phrase + regex templates).
// Used only by tooling to prefill messages/data; the site itself uses next-intl messages.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const dict = JSON.parse(fs.readFileSync(path.join(here, 'reference-dict.json'), 'utf8'));
const LANG = { tg: 'tj', en: 'en' };

export function makeTranslator(locale) {
  const D = dict[LANG[locale]];
  const R = dict.rx[LANG[locale]].map((r) => [new RegExp(r[0]), r[1]]);
  const tk = (k, dp) => {
    const v = D[k];
    if (v !== undefined) return v;
    if (dp > 14) return undefined;
    for (const [re, rep] of R) {
      const m = k.match(re);
      if (m)
        return rep
          .replace(/§(\d)/g, (x, j) => {
            const r = tk(m[+j], dp + 1);
            return r === undefined ? m[+j] : r;
          })
          .replace(/\$(\d)/g, (x, j) => m[+j] || '');
    }
    return undefined;
  };
  return (s) => {
    const k = String(s).replace(/\s+/g, ' ').trim();
    return k ? tk(k, 0) : s;
  };
}

const SAMPLES = ['193 160', '5 500', '35,12', '12', '7', '2', '3'];
/** Translate an ICU-ish message with {args}: substitute sample values, translate, put args back. */
export function translateIcu(tr, msg) {
  const args = [...new Set([...msg.matchAll(/\{([A-Za-z0-9_]+)\}/g)].map((m) => m[1]))];
  if (!args.length) return tr(msg);
  for (let s = 0; s < SAMPLES.length; s++) {
    const vals = args.map((a, i) => SAMPLES[(s + i) % SAMPLES.length]);
    let txt = msg;
    args.forEach((a, i) => (txt = txt.split('{' + a + '}').join(vals[i])));
    const out = tr(txt);
    if (out === undefined) continue;
    let back = out,
      ok = true;
    args.forEach((a, i) => {
      if (back.split(vals[i]).length !== 2) ok = false;
      else back = back.replace(vals[i], '{' + a + '}');
    });
    if (ok) return back;
  }
  return undefined;
}

export const hasCyrillic = (s) => /[А-Яа-яЁё]/.test(s);
