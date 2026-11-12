import { describe, expect, it } from 'vitest';
import data from '@/content/data.ru.json';
import { pricing } from '@/content/pricing';
import { nf } from '@/lib/format';
import { allMin, calc, m2Min, moOf, pxMin } from '@/lib/pricing';
import type { SiteData } from '@/lib/types';

const d = data as unknown as SiteData;
const n = (v: number) => nf('ru', v);

// Figures as shown on the approved mockup (LEVAKANT_content.md).
describe('demo price model', () => {
  it('lowest price in the project', () => {
    expect(n(allMin(d, pricing))).toBe('193 160');
  });

  it.each([
    ['a35', '193 160'],
    ['a5332', '309 256'],
    ['a5345p', '331 390'],
    ['b6329', '348 095'],
    ['b8029', '441 595'],
    ['b8248', '511 376'],
    ['d13356', '828 072'],
  ])('price "from" for %s', (id, want) => {
    expect(n(pxMin(d, pricing, id))).toBe(want);
  });

  it('monthly payment "from" (30 % down, 24 months)', () => {
    expect(n(moOf(pricing, pxMin(d, pricing, 'a35')))).toBe('5 634');
    expect(n(moOf(pricing, pxMin(d, pricing, 'b6329')))).toBe('10 153');
    expect(n(moOf(pricing, pxMin(d, pricing, 'd13356')))).toBe('24 152');
    expect(n(moOf(pricing, pxMin(d, pricing, 'b8029')))).toBe('12 880');
    expect(n(m2Min(d, pricing, 'b8029'))).toBe('5 500');
  });

  it('calculator default: 2-room 63,29 m², floors 2–8, 30 %, 24 months', () => {
    const c = calc(pricing, d.L.b6329.total, 'typ', 30, 24);
    expect(n(c.price)).toBe('348 095');
    expect(n(c.downSum)).toBe('104 429');
    expect(n(c.rest)).toBe('243 667');
    expect(n(c.monthly)).toBe('10 153');
    expect(c.full).toBe(false);
  });

  it('100 % down = pay in full with a 5 % discount', () => {
    const c = calc(pricing, d.L.d13356.total, 'ph', 100, 24);
    expect(c.full).toBe(true);
    expect(n(c.price)).toBe('828 072');
    expect(n(c.monthly)).toBe(n(828072 * 0.95));
    expect(n(c.discount)).toBe(n(828072 * 0.05));
  });

  it('50 % down over 12 months', () => {
    const c = calc(pricing, d.L.b8029.total, 'typ', 50, 12);
    expect(c.monthly).toBeCloseTo(441595 / 2 / 12, 6);
  });
});
