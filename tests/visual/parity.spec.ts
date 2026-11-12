import { expect, test, type Browser, type Page } from '@playwright/test';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import fs from 'node:fs';

/**
 * Visual parity with the approved mockup (brief: "пиксель в пиксель на 1440, 834 и 390").
 * Needs the mockup served locally:  cd levakant-export/levakant-site && python3 -m http.server 4173
 *   MOCKUP_URL=http://127.0.0.1:4173/ pnpm test:visual
 * Live 3D canvases are masked (GPU output differs); everything else must match.
 * Photos (<img>) are compared with a softer per-pixel threshold: the site serves resized AVIF/WebP, the mockup lets
 * the browser shrink the 2000 px originals, and their edges never match exactly. Measured on the gallery photo:
 * the same photo differs in 1–3 % of its pixels at 0.3, a different photo in the same place in 33–35 %.
 */
const MOCKUP = process.env.MOCKUP_URL!;
const SECTIONS = [
  'top',
  'about',
  'price',
  'building',
  'floorplan',
  'apartments',
  'trust',
  'lifestyle',
  'location',
  'gallery',
  'architecture',
  'commerce',
  'contact',
];
const MASK = ['.b3c', '.sun-f'];
const PHOTO_THRESHOLD = 0.3;
const MAX_PHOTO_DIFF = 0.1; // per photo: share of its pixels that may differ
const WIDTHS: [number, number][] = [
  [1440, 900],
  [834, 1112],
  [390, 844],
];
/**
 * Sections changed on purpose after the launch audit — honest content instead of the mockup's placeholders.
 * Pixels are compared loosely (a guard against broken layout, not a pixel match); the height may differ only by
 * what the change explains: `dh` = allowed |site − mockup| in px at any width (measured + a small margin).
 */
const CHANGED: Record<string, { why: string; dh: number }> = {
  top: { why: 'ДЕМО marks in the hero ledger', dh: 12 },
  about: { why: 'ДЕМО marks on price / instalments / completion', dh: 40 },
  price: { why: 'ДЕМО marks, demo footnote, quote button label, "100 % — discount" hint', dh: 190 },
  floorplan: { why: 'plan scroll hint on narrow screens', dh: 70 },
  apartments: { why: 'card: "Рассчитать рассрочку" row, "Поделиться" chip, ДЕМО mark on the price', dh: 60 },
  trust: { why: 'documents "pending", draft developer address hidden, ДЕМО marks', dh: 260 },
  commerce: { why: 'ДЕМО mark on rates, plan scroll hint on narrow screens', dh: 70 },
  contact: { why: 'placeholder contacts removed, consent text, form status', dh: 170 },
};
type Rect = { x: number; y: number; w: number; h: number };
// Unchanged sections: renders go through next/image (resampled AVIF/WebP) and the floating WhatsApp
// button is absent without a verified number — a few percent of pixels; layout must match exactly.
const MAX_DIFF = 0.06;
const MAX_DIFF_CHANGED = 0.2;

async function open(browser: Browser, url: string, w: number, h: number) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: h },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  // render every section now (the site skips offscreen ones with content-visibility)
  await page.evaluate(() =>
    document.querySelectorAll('section').forEach((s) => (s.style.contentVisibility = 'visible')),
  );
  // let the live building model draw its first frame (it changes the hint text below it)
  await page.locator('#building').scrollIntoViewIfNeeded();
  await page
    .waitForFunction(() => document.getElementById('b3')?.classList.contains('gl'), null, { timeout: 45_000 })
    .catch(() => {});
  return page;
}

async function shot(page: Page, id: string) {
  const box = await page.evaluate(
    ({ id, mask }) => {
      const e = document.getElementById(id)!;
      const top = e.getBoundingClientRect().top + scrollY;
      const rects = mask.flatMap((s) =>
        [...e.querySelectorAll(s)].map((m) => {
          const r = m.getBoundingClientRect();
          return { x: r.left, y: r.top + scrollY - top, w: r.width, h: r.height };
        }),
      );
      // photos: visible <img> boxes (icons excluded), clipped to the viewport width
      const photos = [...e.querySelectorAll('img')]
        .map((m) => m.getBoundingClientRect())
        .filter((r) => r.width >= 40 && r.height >= 40 && r.left < innerWidth && r.right > 0)
        .map((r) => {
          const x = Math.max(0, r.left);
          return { x, y: r.top + scrollY - top, w: Math.min(innerWidth, r.right) - x, h: r.height };
        });
      return { y: Math.round(top), h: e.offsetHeight, rects, photos };
    },
    { id, mask: MASK },
  );
  await page.evaluate((y) => scrollTo(0, y), box.y);
  // lazy images of the section must be decoded before the screenshot
  await page
    .waitForFunction(
      (id) =>
        [...document.getElementById(id)!.querySelectorAll('img')].every(
          (i) => i.complete && (i.naturalWidth > 0 || !i.currentSrc),
        ),
      id,
      { timeout: 15_000 },
    )
    .catch(() => {});
  await page.waitForTimeout(300);
  const w = page.viewportSize()!.width;
  const png = PNG.sync.read(
    await page.screenshot({ fullPage: true, clip: { x: 0, y: box.y, width: w, height: box.h } }),
  );
  for (const r of box.rects)
    for (let y = Math.max(0, Math.floor(r.y)); y < Math.min(png.height, r.y + r.h); y++)
      for (let x = Math.max(0, Math.floor(r.x)); x < Math.min(png.width, r.x + r.w); x++)
        png.data.writeUInt32BE(0x000000ff, (y * png.width + x) * 4);
  return { png, h: box.h, photos: box.photos as Rect[] };
}

/** Pixels of a pixelmatch output that are real differences (red), not anti-aliasing (yellow) or background. */
const isDiff = (d: Buffer, i: number) => d[i * 4] === 255 && d[i * 4 + 1] === 0 && d[i * 4 + 2] === 0;

test.describe('parity with the mockup', () => {
  test.skip(!MOCKUP, 'MOCKUP_URL not set');
  test.describe.configure({ timeout: 240_000 });

  for (const [w, h] of WIDTHS) {
    test(`${w}px`, async ({ browser, baseURL }) => {
      fs.mkdirSync(test.info().outputPath(), { recursive: true });
      const ref = await open(browser, MOCKUP, w, h);
      const our = await open(browser, `${baseURL}/${process.env.PARITY_LOCALE || 'ru'}?3d=1`, w, h);
      const report: string[] = [];
      for (const id of SECTIONS) {
        const a = await shot(ref, id);
        const b = await shot(our, id);
        const ww = Math.min(a.png.width, b.png.width);
        const hh = Math.min(a.png.height, b.png.height);
        const crop = (p: PNG) => {
          const o = new PNG({ width: ww, height: hh });
          PNG.bitblt(p, o, 0, 0, ww, hh, 0, 0);
          return o.data;
        };
        const [A, B] = [crop(a.png), crop(b.png)];
        const diff = new PNG({ width: ww, height: hh }); // strict: text, lines, layout
        pixelmatch(A, B, diff.data, ww, hh, { threshold: 0.1 });
        const soft = new PNG({ width: ww, height: hh }); // photos
        pixelmatch(A, B, soft.data, ww, hh, { threshold: PHOTO_THRESHOLD, diffMask: true });
        const photo = new Uint8Array(ww * hh);
        for (const r of [...a.photos, ...b.photos])
          for (let y = Math.max(0, Math.floor(r.y)); y < Math.min(hh, r.y + r.h); y++)
            photo.fill(1, y * ww + Math.max(0, Math.floor(r.x)), y * ww + Math.min(ww, Math.ceil(r.x + r.w)));
        let n = 0;
        for (let i = 0; i < ww * hh; i++) if (isDiff(photo[i] ? soft.data : diff.data, i)) n++;
        const ratio = n / (ww * hh);
        if (ratio > 0.005) fs.writeFileSync(test.info().outputPath(`diff-${w}-${id}.png`), PNG.sync.write(diff));
        // every photo on its own: a swapped picture must not hide in the section average
        let worst = 0;
        for (const r of b.photos) {
          let d = 0;
          let t = 0;
          for (let y = Math.max(0, Math.floor(r.y)); y < Math.min(hh, r.y + r.h); y++)
            for (let x = Math.max(0, Math.floor(r.x)); x < Math.min(ww, r.x + r.w); x++, t++)
              if (isDiff(soft.data, y * ww + x)) d++;
          if (t > 1600) worst = Math.max(worst, d / t);
        }
        const ch = CHANGED[id];
        report.push(
          `${id}: height ${a.h}/${b.h}, diff ${(ratio * 100).toFixed(2)}%, worst photo ${(worst * 100).toFixed(1)}%` +
            (ch ? ` (changed: ${ch.why})` : ''),
        );
        if (ch) expect.soft(Math.abs(b.h - a.h), `${id} height change at ${w}px`).toBeLessThanOrEqual(ch.dh);
        else expect.soft(b.h, `${id} height at ${w}px`).toBe(a.h);
        expect.soft(ratio, `${id} pixel diff at ${w}px`).toBeLessThan(ch ? MAX_DIFF_CHANGED : MAX_DIFF);
        // unchanged sections only: in a changed one the content above may shift, so photos no longer line up
        if (!ch) expect.soft(worst, `${id}: a photo differs at ${w}px`).toBeLessThan(MAX_PHOTO_DIFF);
      }
      console.log(`[${w}px]\n  ` + report.join('\n  '));
    });
  }
});
