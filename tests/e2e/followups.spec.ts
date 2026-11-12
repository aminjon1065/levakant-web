import { expect, test } from '@playwright/test';

test.describe('form state @all', () => {
  test('prefill from other sections and a full reset after "Новая заявка"', async ({ page }) => {
    await page.route('**/api/leads', (route) =>
      route.fulfill({ json: route.request().method() === 'GET' ? { enabled: true } : { ok: true } }),
    );
    await page.goto('/ru');
    await page.waitForLoadState('networkidle');
    await page.locator('#abroad a.btn').click(); // "Записаться на видеозвонок"
    await expect(page.locator('#m2')).toBeChecked();
    await expect(page.locator('#w4')).toBeChecked();
    const f = page.locator('#contact');
    await f.locator('#f-name').fill('Анвар');
    await f.locator('#f-tel').fill('+992 90 123 45 67');
    await f.locator('#f-msg').fill('Вопрос');
    await f.getByRole('button', { name: /Оставить заявку/ }).click();
    await expect(f.getByRole('status')).toContainText('Анвар');
    await f.getByRole('button', { name: /Новая заявка/ }).click();
    await expect(f.locator('#f-name')).toHaveValue('');
    await expect(f.locator('#f-tel')).toHaveValue('');
    await expect(f.locator('#f-msg')).toHaveValue('');
    await expect(page.locator('#m2')).not.toBeChecked();
    await expect(page.locator('#w4')).not.toBeChecked();
  });
});

test.describe('security @all', () => {
  test('security headers and same-origin enquiries only', async ({ page, request }) => {
    const r = await page.goto('/ru');
    const h = r!.headers();
    expect(h['x-content-type-options']).toBe('nosniff');
    expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(h['x-frame-options']).toBe('SAMEORIGIN');
    expect(h['content-security-policy']).toContain("frame-ancestors 'self'");
    const bad = await request.post('/api/leads', { headers: { origin: 'https://evil.example' }, data: {} });
    expect(bad.status()).toBe(403);
  });
});

test.describe('shareable layouts and calculator link', () => {
  test('?apt= opens the layout; choices update the address; language switch keeps it', async ({ page }) => {
    await page.goto('/ru?apt=d13356');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#apartments .cv-h .n')).toContainText('133,56');
    await page.locator('#apartments .cl .lc').first().click();
    await expect(page).toHaveURL(/\?apt=a35/);
    const yBefore = await page.evaluate(() => Math.round(document.getElementById('apartments')!.getBoundingClientRect().top));
    await page.locator('.nav-r .lang button[lang=en]').click();
    await expect(page).toHaveURL(/\/en\?apt=a35/);
    await expect(page.locator('#apartments .cv-h .n')).toContainText('35.12');
    // one page in the DOM (no hidden copy of the previous language) and the same reading position
    await expect(page.locator('#lr-root')).toHaveCount(1);
    await page.waitForTimeout(500);
    const yAfter = await page.evaluate(() => Math.round(document.getElementById('apartments')!.getBoundingClientRect().top));
    expect(Math.abs(yAfter - yBefore)).toBeLessThan(40);
  });

  test('"Поделиться" copies a link to the selected layout', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.addInitScript(() => Object.defineProperty(navigator, 'share', { value: undefined }));
    await page.goto('/ru');
    await page.waitForLoadState('networkidle');
    await page.locator('#apartments .cl .lc').nth(2).click();
    await page.locator('#apartments .cv-f').getByRole('button', { name: 'Поделиться' }).click();
    await expect(page.locator('#apartments .cv-f p')).toHaveText('Ссылка на планировку скопирована.');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(/\/ru\?apt=a5058#apartments$/);
  });

  test('"Рассчитать рассрочку" puts the card layout into the calculator', async ({ page }) => {
    await page.goto('/ru');
    await page.waitForLoadState('networkidle');
    await page.locator('#apartments .cl .lc').last().click(); // 4-room 133,56
    await page.locator('#apartments .cv-calc').click();
    await expect(page.locator('#price .pc-ap')).toContainText('133,56');
    await expect(page.locator('#price .pc-hint')).toContainText('100% — оплата сразу со скидкой 5%');
  });
});

test.describe('keyboard rotation', () => {
  test('CSS models: arrows rotate the building and the 3D apartment', async ({ page }) => {
    await page.goto('/ru?3d=0');
    await page.waitForLoadState('networkidle');
    const m = page.locator('#b3-m');
    const before = await m.getAttribute('style');
    await page.locator('#b3').focus();
    await page.keyboard.press('ArrowRight');
    await expect(m).not.toHaveAttribute('style', before!);
    await page.locator('#apartments .cv-md button').nth(1).click();
    const q = page.locator('#q3-m');
    const qb = await q.getAttribute('style');
    await page.locator('#q3').focus();
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowUp');
    await expect(q).not.toHaveAttribute('style', qb!);
  });

  test('WebGL building: arrows turn the live model', async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto('/ru?3d=1');
    await page.locator('#building').scrollIntoViewIfNeeded();
    await expect(page.locator('#b3')).toHaveClass(/\bgl\b/, { timeout: 45_000 });
    await page.waitForTimeout(1500);
    const snap = () => page.locator('#b3 canvas').evaluate((c: HTMLCanvasElement) => c.toDataURL('image/png').length + ':' + c.toDataURL('image/png').slice(-200));
    const a = await snap();
    await page.locator('#b3').focus();
    for (let i = 0; i < 4; i++) await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(2500);
    expect(await snap()).not.toBe(a);
  });
});
