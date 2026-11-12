/** Site and solar geometry (shared by the sun section and the 3D engine). */
export const SITE = { lat: 37.869, lon: 68.918, tz: 5, yardBearing: 336 };
export const DATES = {
  summer: [2026, 6, 21],
  equinox: [2026, 9, 22],
  winter: [2026, 12, 21],
  nov: [2026, 11, 21],
} as const;

const D2R = Math.PI / 180;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** NOAA solar position for the site, local time UTC+5. Returns azimuth and elevation in degrees. */
export function sunPos(year: number, month: number, day: number, hour: number, minute = 0) {
  const utcMs = Date.UTC(year, month - 1, day, hour, minute) - SITE.tz * 3600e3;
  const jd = utcMs / 86400e3 + 2440587.5;
  const T = (jd - 2451545) / 36525;
  const L0 = (280.46646 + T * (36000.76983 + 0.0003032 * T)) % 360;
  const M = 357.52911 + T * (35999.05029 - 0.0001537 * T);
  const e = 0.016708634 - T * (0.000042037 + 0.0000001267 * T);
  const Mr = M * D2R;
  const C =
    Math.sin(Mr) * (1.914602 - T * (0.004817 + 0.000014 * T)) +
    Math.sin(2 * Mr) * (0.019993 - 0.000101 * T) +
    Math.sin(3 * Mr) * 0.000289;
  const om = 125.04 - 1934.136 * T;
  const lam = L0 + C - 0.00569 - 0.00478 * Math.sin(om * D2R);
  const eps0 = 23 + (26 + (21.448 - T * (46.815 + T * (0.00059 - T * 0.001813))) / 60) / 60;
  const eps = eps0 + 0.00256 * Math.cos(om * D2R);
  const decl = Math.asin(Math.sin(eps * D2R) * Math.sin(lam * D2R));
  const y = Math.tan((eps * D2R) / 2) ** 2;
  const L0r = L0 * D2R;
  const eqt =
    (4 / D2R) *
    (y * Math.sin(2 * L0r) -
      2 * e * Math.sin(Mr) +
      4 * e * y * Math.sin(Mr) * Math.cos(2 * L0r) -
      0.5 * y * y * Math.sin(4 * L0r) -
      1.25 * e * e * Math.sin(2 * Mr));
  const mins = hour * 60 + minute;
  const tst = (((mins + eqt + 4 * SITE.lon - 60 * SITE.tz) % 1440) + 1440) % 1440;
  const ha = (tst / 4 - 180) * D2R;
  const lat = SITE.lat * D2R;
  const cz = Math.sin(lat) * Math.sin(decl) + Math.cos(lat) * Math.cos(decl) * Math.cos(ha);
  const el = 90 - Math.acos(clamp(cz, -1, 1)) / D2R;
  const az =
    (Math.atan2(Math.sin(ha), Math.cos(ha) * Math.sin(lat) - Math.tan(decl) * Math.cos(lat)) / D2R + 180 + 360) % 360;
  return { az, el };
}
