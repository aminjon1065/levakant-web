import { expect, test, type Page } from '@playwright/test';

const NBSP = ' ';
const go = async (page: Page, path = '/ru') => {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
};

test.describe('page structure @all', () => {
  test('sections and anchors in mockup order', async ({ page }) => {
    await go(page);
    const ids = await page
      .locator('#lr-root [id]')
      .evaluateAll((els) =>
        els
          .map((e) => e.id)
          .filter((id) =>
            [
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
            ].includes(id),
          ),
      );
    expect(ids).toEqual([
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
    ]);
  });

  test('/ redirects to /ru; language switch keeps working', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/ru$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
    await go(page, '/tg');
    await expect(page.locator('html')).toHaveAttribute('lang', 'tg');
    await expect(page.locator('#about h2')).toContainText('Чаро');
    await go(page, '/en');
    await expect(page.locator('#about h2')).toContainText('Why');
  });
});

test.describe('prices and calculator', () => {
  test('type cards and default calculation', async ({ page }) => {
    await go(page);
    const cards = page.locator('#price .pr-t button');
    await expect(cards).toHaveCount(3);
    await expect(cards.nth(0)).toContainText(`от 193${NBSP}160`);
    await expect(page.locator('#price .pc-m')).toContainText(`10${NBSP}153`);
  });

  test('100 % down → pay in full with discount, terms disabled', async ({ page }) => {
    await go(page);
    await page.locator('#price .pr-t button').nth(2).click(); // 4-room
    await page.locator('#price input[type=range]').fill('100');
    await expect(page.locator('#price .pc-r .lb')).toHaveText('Оплата сразу со скидкой 5%');
    await expect(page.locator('#price .pc-m')).toContainText(`786${NBSP}668`);
    for (const b of await page.locator('#price .chips').nth(1).locator('button').all()) await expect(b).toBeDisabled();
  });

  test('"Получить расчёт в WhatsApp" adds the layout to the form and ticks WhatsApp', async ({ page }) => {
    await go(page);
    await page.locator('#price .pc a.btn').click();
    await expect(page.locator('#contact .pk-i')).toHaveCount(1);
    await expect(page.locator('#m2')).toBeChecked();
    await expect(page.locator('#w1')).toBeChecked();
  });
});

test.describe('catalogue', () => {
  test('filters, counts, sort, empty state', async ({ page }) => {
    await go(page);
    const sec = page.locator('#apartments');
    await sec.getByRole('button', { name: /^2-комн\./ }).click();
    await expect(sec.locator('.cnt')).toHaveText('Показано: 9 планировок');
    await expect(sec.locator('.cl .lc')).toHaveCount(9);
    await sec.getByRole('button', { name: /^Сбросить$/ }).click();
    await expect(sec.locator('.cl .lc')).toHaveCount(18);
    await sec.getByRole('button', { name: /^4-комн\./ }).click();
    await expect(sec.getByRole('button', { name: /^до 50/ })).toBeDisabled();
    await sec.getByRole('button', { name: /Сортировка по площади/ }).click();
    await expect(sec.getByRole('button', { name: /Сортировка по площади: по убыванию/ })).toBeVisible();
  });

  test('card: favourite goes into the enquiry; ask price', async ({ page }) => {
    await go(page);
    const sec = page.locator('#apartments');
    await sec.locator('.cl .lc').first().click();
    await expect(sec.locator('.cv .n')).toContainText('35,12');
    await sec.getByRole('button', { name: 'В избранное' }).click();
    await expect(sec.locator('.cv-f p')).toHaveText('В избранном: 1 планировка. Они попадут в заявку.');
    await expect(sec.locator('.lc.on i.on')).toHaveCount(1);
    await sec.locator('.cv-f a.btn').click();
    await expect(page.locator('#contact .pk-i')).toContainText('1-комнатная · 35,12 м²');
    await expect(page.locator('#w1')).toBeChecked();
  });

  test('plan: room selection, zoom, full screen', async ({ page }) => {
    await go(page);
    const sec = page.locator('#apartments');
    await sec.locator('.rt button:not([disabled])').first().click();
    await expect(sec.locator('.rm-i .lb')).toHaveText('Выбрано');
    await sec.getByRole('button', { name: 'Увеличить план' }).click();
    await expect(sec.locator('.cv-tl .tz')).toHaveText('150%');
    await sec.getByRole('button', { name: 'На весь экран' }).click();
    const dlg = page.getByRole('dialog', { name: 'План квартиры на весь экран' });
    await expect(dlg).toBeVisible();
    await expect(page.locator('#pz-x')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(dlg).toBeHidden();
  });

  test('3D apartment (CSS model) and "show in building"', async ({ page }) => {
    await go(page);
    const sec = page.locator('#apartments');
    await sec.getByRole('tab', { name: /3D-квартира/ }).click();
    await expect(sec.locator('#q3')).toBeVisible();
    await sec.locator('.q3-fl button').first().dispatchEvent('click'); // rooms are clip-path polygons
    await expect(sec.locator('.rm-i .lb')).toHaveText('Выбрано');
    await sec.getByRole('button', { name: 'Сверху' }).click();
    await expect(sec.getByRole('button', { name: 'Сверху' })).toHaveAttribute('aria-pressed', 'true');
    await sec.locator('.inb-r a').first().click();
    await expect(page.locator('#building .b3-x')).toContainText('80,29');
  });
});

test.describe('building and floor plan', () => {
  test('pick floor, explode, pick apartment, open its layout', async ({ page }) => {
    await go(page);
    const b = page.locator('#building');
    await b.getByRole('button', { name: /^9 этаж — показать план/ }).click();
    await expect(page.locator('#floorplan .n, #building .b3-i .n').first()).toHaveText('9 этаж');
    await b.getByRole('button', { name: 'Разобрать по этажам' }).click();
    await expect(b.getByRole('button', { name: 'Собрать здание' })).toBeVisible();
    await b.locator('.b3-i .chips button').first().click();
    await expect(b.locator('.b3-x')).toBeVisible();
    await b.locator('.b3-a a.btn').click();
    await expect(page.locator('#apartments .cv .n')).toBeVisible();
  });

  test('floor plan zones select an apartment', async ({ page }) => {
    await go(page);
    const fp = page.locator('#floorplan');
    await fp.locator('button.hz').first().click();
    await expect(fp.locator('button.hz.on')).toHaveCount(1);
  });
});

test.describe('sun', () => {
  test('date and hour change the shadow frame and the clock', async ({ page }) => {
    await go(page);
    const s = page.locator('#lifestyle');
    await s.getByRole('button', { name: '21 июня' }).click();
    await s.locator('.sun-hr button', { hasText: /^18$/ }).click();
    await expect(s.locator('.sun-i')).toHaveAttribute('src', /sun_summer_18/);
    await expect(s.locator('.sun-sl b')).toHaveText('18:00');
  });
});

test.describe('gallery', () => {
  test('lightbox opens, steps, closes on Escape', async ({ page }) => {
    await go(page);
    await page.locator('#gallery .gi').first().click();
    const dlg = page.getByRole('dialog', { name: 'Просмотр изображения' });
    await expect(dlg).toBeVisible();
    await expect(dlg.locator('.lbx-t span')).toHaveText('01 / 12');
    await dlg.getByRole('button', { name: 'Следующее изображение' }).click();
    await expect(dlg.locator('.lbx-t span')).toHaveText('02 / 12');
    await dlg.getByRole('button', { name: 'Закрыть просмотр' }).focus();
    await page.keyboard.press('Escape');
    await expect(dlg).toBeHidden();
  });
});

test.describe('contact form @all', () => {
  test('errors, then success', async ({ page }) => {
    await go(page);
    const f = page.locator('#contact');
    await f.getByRole('button', { name: /Оставить заявку/ }).click();
    await expect(f.locator('#e-name')).toHaveText('Укажите имя — как к вам обращаться');
    await expect(f.locator('#e-tel')).toHaveText('Укажите номер телефона полностью');
    await f.locator('#f-name').fill('Анвар');
    await f.locator('#f-tel').fill('+992 90 123 45 67');
    await f.locator('label[for=m2]').click();
    await f.getByRole('button', { name: /Оставить заявку/ }).click();
    await expect(f.getByRole('status')).toContainText('Анвар', { timeout: 5000 });
    await expect(f.getByRole('status')).toContainText('WhatsApp');
  });
});

test.describe('phone @phone', () => {
  test('bottom bar and menu', async ({ page }) => {
    await go(page);
    await expect(page.locator('.mcta')).toBeVisible();
    await page.getByRole('button', { name: 'Меню' }).click();
    await expect(page.locator('.menu')).toBeVisible();
    await page.locator('.menu a.m').first().click();
    await expect(page.locator('.menu')).toHaveCount(0);
  });
});
