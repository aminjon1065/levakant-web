import { expect, test } from '@playwright/test';

// Tests run with prefers-reduced-motion: reduce, where the site shows static schemes;
// `?3d=1` forces the live WebGL model (software GL in headless Chromium).

test.describe('3D', () => {
  test.describe.configure({ timeout: 90_000 });

  test('model is not downloaded until the 3D section approaches', async ({ page }) => {
    const glb: string[] = [];
    page.on('request', (r) => {
      if (r.url().endsWith('.glb')) glb.push(r.url());
    });
    await page.goto('/ru?3d=1');
    await page.waitForLoadState('networkidle');
    expect(glb).toEqual([]);
    await page.locator('#building').scrollIntoViewIfNeeded();
    await expect(page.locator('#b3')).toHaveClass(/\bgl\b/, { timeout: 45_000 });
    expect(glb.length).toBe(1);
  });

  test('static scheme when 3D is off (reduced motion / weak device)', async ({ page }) => {
    await page.goto('/ru');
    await page.locator('#building').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
    await expect(page.locator('#b3')).not.toHaveClass(/\bgl\b/);
    await expect(page.locator('#b3 .lv.k-5 .xf')).toBeVisible(); // CSS floor blocks of the static scheme
  });

  test('explode, open a floor, pick an apartment, step inside, night', async ({ page }) => {
    await page.goto('/ru?3d=1');
    const b = page.locator('#building');
    await b.scrollIntoViewIfNeeded();
    await expect(page.locator('#b3')).toHaveClass(/\bgl\b/, { timeout: 45_000 });
    await b.getByRole('button', { name: /^7 этаж — показать план/ }).click();
    await expect(b.locator('.b3-i .n')).toHaveText('7 этаж');
    await b.locator('.b3-i .chips button').first().click();
    const enter = b.getByRole('button', { name: 'Войти в квартиру' });
    await expect(enter).toBeVisible();
    await enter.click();
    await expect(b.getByRole('button', { name: 'Выйти из квартиры' })).toHaveAttribute('aria-pressed', 'true');
    await expect(b.locator('.b3-h')).toContainText('Вы внутри квартиры');
    await b.getByRole('button', { name: 'Ночь' }).click();
    await expect(b.getByRole('button', { name: 'Ночь' })).toHaveAttribute('aria-pressed', 'true');
    await b.getByRole('button', { name: 'Собрать здание' }).click();
    await expect(b.getByRole('button', { name: 'Разобрать по этажам' })).toBeVisible();
  });

  test('live sun scene', async ({ page }) => {
    await page.goto('/ru?3d=1');
    const s = page.locator('#lifestyle');
    await s.locator('.sun-f').scrollIntoViewIfNeeded();
    await expect(s.locator('.sun-f')).toHaveClass(/\bgl\b/, { timeout: 45_000 });
    await s.getByRole('button', { name: '21 декабря' }).click();
    await s.locator('.sun-hr button', { hasText: /^10$/ }).click();
    await expect(s.locator('.sun-sl b')).toHaveText('10:00');
    await s.getByRole('button', { name: 'Прокрутить день' }).click();
    await expect(s.getByRole('button', { name: 'Пауза' })).toBeVisible();
    await expect(s.locator('.sun-sl b')).not.toHaveText('10:00', { timeout: 10_000 });
  });
});
