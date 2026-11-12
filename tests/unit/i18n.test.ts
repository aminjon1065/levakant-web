import { describe, expect, it } from 'vitest';
import ru from '../../messages/ru.json';
import tg from '../../messages/tg.json';
import en from '../../messages/en.json';
import dataTg from '@/content/data.tg.json';
import dataEn from '@/content/data.en.json';

type Msgs = Record<string, Record<string, string>>;
const flat = (m: Msgs) =>
  Object.entries(m).flatMap(([ns, o]) => Object.entries(o).map(([k, v]) => [`${ns}.${k}`, v] as const));
const args = (s: string) => [...s.matchAll(/\{([A-Za-z0-9_]+)[,}]/g)].map((x) => x[1]).sort();
const CYR = /[А-Яа-яЁёҲҳҶҷҚқҒғӢӣӮӯ]/;
// Letters of Russian that are not used in Tajik — a sign of an untranslated string.
const RU_ONLY = /[цщыьЦЩЫЬ]/;
const strings = (o: unknown): string[] =>
  typeof o === 'string'
    ? [o]
    : Array.isArray(o)
      ? o.flatMap(strings)
      : o && typeof o === 'object'
        ? Object.values(o).flatMap(strings)
        : [];

describe('translations', () => {
  const R = new Map(flat(ru as Msgs));
  for (const [name, m] of [
    ['tg', tg],
    ['en', en],
  ] as const) {
    const M = new Map(flat(m as Msgs));
    it(`${name}: same keys as ru`, () => {
      expect([...M.keys()].sort()).toEqual([...R.keys()].sort());
    });
    it(`${name}: same ICU arguments as ru`, () => {
      const bad = [...R].filter(([k, v]) => M.has(k) && args(v).join() !== args(M.get(k)!).join());
      expect(bad).toEqual([]);
    });
  }
  it('en: no Cyrillic left in messages', () => {
    expect(flat(en as Msgs).filter(([, v]) => CYR.test(v))).toEqual([]);
  });
  it('tg: no Russian-only letters in messages', () => {
    expect(flat(tg as Msgs).filter(([, v]) => RU_ONLY.test(v))).toEqual([]);
  });
  it('en: no Cyrillic left in project data', () => {
    expect(strings(dataEn).filter((v) => CYR.test(v))).toEqual([]);
  });
  it('tg: no Russian-only letters in project data', () => {
    expect(strings(dataTg).filter((v) => RU_ONLY.test(v))).toEqual([]);
  });
});
