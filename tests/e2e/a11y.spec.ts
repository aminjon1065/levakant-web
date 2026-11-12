import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

async function audit(page: Page, label: string) {
  // render every section (content-visibility skips offscreen ones)
  await page.evaluate(() =>
    document.querySelectorAll('section').forEach((s) => (s.style.contentVisibility = 'visible')),
  );
  const r = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  const v = r.violations.map(
    (x) => `${label}: ${x.id} (${x.impact}) ×${x.nodes.length} — ${x.nodes[0]?.target.join(' ')}`,
  );
  return v;
}

for (const locale of ['ru', 'tg', 'en']) {
  test(`axe: no WCAG A/AA violations on /${locale} and its states @all`, async ({ page }, info) => {
    test.setTimeout(120_000);
    await page.goto(`/${locale}`);
    await page.waitForLoadState('networkidle');
    const found: string[] = [];
    found.push(...(await audit(page, 'initial')));
    if (info.project.name === 'phone') {
      await page.locator('.burger').click();
      found.push(...(await audit(page, 'menu')));
      await page.locator('.burger').click();
    }
    await page.locator('#building .b3-ct .b3-ex').click();
    await page.locator('#building .fr button').nth(3).click();
    found.push(...(await audit(page, 'building exploded')));
    await page.locator('#apartments .cv-md button').nth(1).click();
    found.push(...(await audit(page, '3D apartment')));
    await page.locator('#apartments .cv-md button').nth(0).click();
    await page.locator('#apartments .cv-tl .tb').last().click();
    found.push(...(await audit(page, 'plan full screen')));
    await page.keyboard.press('Escape');
    await page.locator('#gallery .gi').first().click();
    found.push(...(await audit(page, 'lightbox')));
    await page.keyboard.press('Escape');
    await page.route('**/api/leads', (route) => route.fulfill({ json: { enabled: true } }));
    await page.evaluate(() => fetch('/api/leads'));
    expect(found).toEqual([]);
  });
}

test('dialogs: focus moves in, background is inert, focus returns on close', async ({ page }) => {
  await page.goto('/ru');
  await page.waitForLoadState('networkidle');
  const opener = page.locator('#gallery .gi').first();
  await opener.click();
  await expect(page.locator('#lb-x')).toBeFocused();
  await expect(page.locator('#lr-root > .rest')).toHaveAttribute('inert', '');
  for (let i = 0; i < 6; i++) await page.keyboard.press('Tab');
  expect(await page.evaluate(() => !!document.activeElement?.closest('[role=dialog]'))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(opener).toBeFocused();
  await expect(page.locator('#lr-root > .rest')).not.toHaveAttribute('inert', '');
});
