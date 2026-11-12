import { describe, expect, it } from 'vitest';
import data from '@/content/data.ru.json';
import type { Layout, SiteData } from '@/lib/types';

import { passes } from '@/lib/catalog';

const d = data as unknown as SiteData;
const all = d.order.map((id) => d.L[id]);
const count = (f: Partial<{ fT: string; fA: string; fF: string }>) =>
  all.filter((l: Layout) => passes(l, { fT: 'all', fA: 'all', fF: 'all', ...f })).length;

// Counts shown next to the filter chips on the mockup.
describe('catalogue filters', () => {
  it('type', () => {
    expect(count({})).toBe(18);
    expect(count({ fT: '1' })).toBe(8);
    expect(count({ fT: '2' })).toBe(9);
    expect(count({ fT: '4' })).toBe(1);
    expect(count({ fT: 'ph' })).toBe(2);
  });
  it('area', () => {
    expect(count({ fA: 's' })).toBe(1);
    expect(count({ fA: 'm' })).toBe(13);
    expect(count({ fA: 'l' })).toBe(4);
  });
  it('floor', () => {
    expect(count({ fF: 'typ' })).toBe(11);
    expect(count({ fF: 'f9' })).toBe(8);
    expect(count({ fF: 'ph' })).toBe(5);
  });
  it('combined: 4-room and under 50 m² → nothing', () => {
    expect(count({ fT: '4', fA: 's' })).toBe(0);
  });
  it('floor plans: 14 apartments on typical and 9th floors, 8 on the attic level', () => {
    expect(d.P.typ.length).toBe(14);
    expect(d.P.f9.length).toBe(14);
    expect(d.P.ph.length).toBe(8);
  });
});
