import { expect, test, type Browser, type Page } from '@playwright/test';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import fs from 'node:fs';

/**
 * Visual parity with the approved mockup (brief: "пиксель в пиксель на 1440, 834 и 390").
 * Needs the mockup served locally:  cd levakant-export/levakant-site && python3 -m http.server 4173
 *   MOCKUP_URL=http://127.0.0.1:4173/ pnpm test:visual
 * Live 3D canvases are masked (GPU output differs); everything else must match.
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
const WIDTHS: [number, number][] = [
  [1440, 900],
  [834, 1112],
  [390, 844],
];
/**
 * Sections changed on purpose after the launch audit — honest content instead of the mockup's placeholders.
 * Their height may differ; pixels are compared loosely (a guard against broken layout, not a pixel match).
 */
const CHANGED: Record<string, string> = {
  top: 'ДЕМО marks in the hero ledger',
  about: 'ДЕМО marks on price / instalments / completion',
  price: 'ДЕМО marks, demo footnote, quote button label',
  floorplan: 'plan scroll hint on narrow screens',
  trust: 'documents "pending", draft developer address hidden, ДЕМО marks',
  commerce: 'ДЕМО mark on rates, plan scroll hint on narrow screens',
  contact: 'placeholder contacts removed, consent text, form status',
};
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
      return { y: Math.round(top), h: e.offsetHeight, rects };
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
  return { png, h: box.h };
}

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
        const diff = new PNG({ width: ww, height: hh });
        const n = pixelmatch(crop(a.png), crop(b.png), diff.data, ww, hh, { threshold: 0.1 });
        if (n / (ww * hh) > 0.005)
          fs.writeFileSync(test.info().outputPath(`diff-${w}-${id}.png`), PNG.sync.write(diff));
        const ratio = n / (ww * hh);
        report.push(
          `${id}: height ${a.h}/${b.h}, diff ${(ratio * 100).toFixed(2)}%${CHANGED[id] ? ' (changed: ' + CHANGED[id] + ')' : ''}`,
        );
        if (!CHANGED[id]) expect.soft(b.h, `${id} height at ${w}px`).toBe(a.h);
        expect.soft(ratio, `${id} pixel diff at ${w}px`).toBeLessThan(CHANGED[id] ? MAX_DIFF_CHANGED : MAX_DIFF);
      }
      console.log(`[${w}px]\n  ` + report.join('\n  '));
    });
  }
});
