import { describe, expect, it } from 'vitest';
import data from '@/content/data.ru.json';
import { DATES, sunPos } from '@/lib/sun';
import type { SiteData, SunDateKey } from '@/lib/types';

const d = data as unknown as SiteData;

describe('NOAA sun position', () => {
  it('matches the precomputed table in the project data (±1°)', () => {
    for (const k of Object.keys(d.sun) as SunDateKey[]) {
      const [y, m, day] = DATES[k];
      for (const h of d.sun[k].hours) {
        const { az, el } = sunPos(y, m, day, h);
        const [paz, pel] = d.sun[k].pos[String(h)];
        expect(Math.abs(az - paz)).toBeLessThanOrEqual(1);
        expect(Math.abs(el - pel)).toBeLessThanOrEqual(1);
      }
    }
  });
  it('22 September 12:00 — azimuth 173°, altitude 52° (as on the mockup)', () => {
    const { az, el } = sunPos(2026, 9, 22, 12, 0);
    expect(Math.round(az)).toBe(173);
    expect(Math.round(el)).toBe(52);
  });
});
