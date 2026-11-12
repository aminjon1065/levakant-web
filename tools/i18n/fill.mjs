// Adds keys that exist in messages/ru.json but are missing in tg/en, translated with the
// mockup dictionary. Prints what it could not translate — add those by hand.
//   node tools/i18n/fill.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeTranslator, translateIcu } from './translate.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (l) => JSON.parse(fs.readFileSync(path.join(root, `messages/${l}.json`), 'utf8'));
const ru = read('ru');
// Hand translations for strings the dictionary lacks (dotted keys). TJ is a draft for native review.
const manual = JSON.parse(fs.readFileSync(path.join(root, 'tools/i18n/manual.json'), 'utf8'));
let missing = 0;
for (const l of ['tg', 'en']) {
  const tr = makeTranslator(l);
  const m = read(l);
  const walk = (src, dst, p) => {
    for (const [k, v] of Object.entries(src)) {
      if (typeof v === 'object') walk(v, (dst[k] ||= {}), p + k + '.');
      else if (dst[k] === undefined) {
        const out = manual[l]?.[p + k] ?? translateIcu(tr, v);
        if (out === undefined) {
          missing++;
          console.log(`[${l}] ${p}${k}: ${v}`);
        } else dst[k] = out;
      }
    }
  };
  walk(ru, m, '');
  // keep key order as in ru
  const order = (src, dst) =>
    Object.fromEntries(
      Object.keys(src)
        .filter((k) => dst[k] !== undefined)
        .map((k) => [k, typeof src[k] === 'object' ? order(src[k], dst[k]) : dst[k]]),
    );
  fs.writeFileSync(path.join(root, `messages/${l}.json`), JSON.stringify(order(ru, m), null, 2) + '\n');
}
console.log(missing ? `${missing} strings need manual translation` : 'all keys translated');
