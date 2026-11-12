// Builds per-locale project data from src/content/levakant-data.json:
//   - asset paths made absolute (/assets/...)
//   - RU strings translated to TJ/EN with the mockup dictionary
//   - EN decimal commas -> points
// Output: src/content/data.{ru,tg,en}.json. Fails on any string it cannot translate.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeTranslator, hasCyrillic } from './translate.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const src = JSON.parse(fs.readFileSync(path.join(root, 'src/content/levakant-data.json'), 'utf8'));
delete src._readme;
delete src.prices_demo;

const SKIP = new Set(['poly', 'id', 'img', 'k', 'plan', 'fk', 'model', 'order', 'm3']);
const overrides = JSON.parse(fs.readFileSync(path.join(root, 'tools/i18n/data-overrides.json'), 'utf8'));

for (const locale of ['ru', 'tg', 'en']) {
  const tr = locale === 'ru' ? null : makeTranslator(locale);
  const fails = new Set();
  const walk = (v, key) => {
    if (Array.isArray(v)) return v.map((x) => walk(x, key));
    if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x, k)]));
    if (typeof v !== 'string') return v;
    if (v.startsWith('assets/')) return '/' + v;
    if (v.endsWith('.glb')) return '/3d/' + v;
    if (!tr || SKIP.has(key)) return v;
    if (locale === 'en' && /^\d+,\d+$/.test(v)) return v.replace(',', '.');
    if (!hasCyrillic(v)) return v;
    // areas like "15,67 м²" are already correct Tajik
    if (locale === 'tg' && /^[\d\s\u00a0,.+]+ м²$/.test(v)) return v;
    const o = overrides[locale]?.[v];
    if (o !== undefined) return o;
    const out = tr(v);
    // a composite template may "translate" a string to itself: only real Tajik words may stay identical
    const same = locale === 'tg' && out === v && /[А-Яа-яЁё]{3,}/.test(v) && !overrides.tgSameAsRu.includes(v);
    if (out === undefined || same || (locale === 'en' && hasCyrillic(out))) {
      fails.add(v);
      return v;
    }
    return out;
  };
  let out = walk(src, '');
  // The dictionary says "2-bedroom" for «2-комнатная», but a 2-room flat has one bedroom: use "N-room".
  if (locale === 'en') out = JSON.parse(JSON.stringify(out).replace(/(\d)-bed(room)?\b/g, '$1-room'));
  fs.writeFileSync(path.join(root, `src/content/data.${locale}.json`), JSON.stringify(out) + '\n');
  if (fails.size) {
    console.error(`[${locale}] ${fails.size} untranslated:\n  ` + [...fails].join('\n  '));
    process.exitCode = 1;
  } else console.log(`[${locale}] ok`);
}
