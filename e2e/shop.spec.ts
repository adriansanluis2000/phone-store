import { AxeBuilder } from '@axe-core/playwright';
import { expect, test } from './fixtures';

const A700 = '/product/g18mWn2tnbOq2HJx98pTb';

test('finds a phone, adds it to the cart and keeps the count after a reload', async ({
  page,
  api,
}) => {
  await page.goto('/');
  await expect(page.getByText('100 móviles')).toBeVisible();

  await page
    .getByRole('searchbox', { name: 'Buscar por marca o modelo' })
    .fill('iconia tab a700');
  await expect(page.getByText('1 de 100 móviles')).toBeVisible();
  await page.getByRole('link', { name: /Iconia Tab A700/ }).click();

  await expect(
    page.getByRole('heading', { level: 1, name: 'Acer Iconia Tab A700' }),
  ).toBeVisible();
  await page.getByRole('radio', { name: '64 GB' }).check();
  await page.getByRole('radio', { name: 'Metallic Red' }).check();
  await page.getByRole('button', { name: 'Añadir al carrito' }).click();

  await expect(
    page.getByText('Añadido al carrito: Iconia Tab A700, 64 GB, Metallic Red.'),
  ).toBeVisible();
  await expect(
    page.getByRole('status', { name: 'Carrito: 1 producto' }),
  ).toBeVisible();
  expect(api.cart).toEqual([
    { id: 'g18mWn2tnbOq2HJx98pTb', colorCode: 1001, storageCode: 2002 },
  ]);

  await page.reload();
  await expect(
    page.getByRole('status', { name: 'Carrito: 1 producto' }),
  ).toBeVisible();

  await page.getByRole('link', { name: 'Volver al listado' }).click();
  await expect(page).toHaveURL(/\?q=iconia\+tab\+a700$/);
  await expect(page.getByText('1 de 100 móviles')).toBeVisible();
});

for (const [width, columns] of [
  [360, 2],
  [768, 3],
  [1024, 4],
  [1440, 4],
] as const) {
  test(`shows ${columns.toString()} products per row at ${width.toString()} px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const cards = page.getByRole('link', { name: /€|Precio no disponible/ });
    await expect(cards).toHaveCount(100);

    const lefts = new Set<number>();
    for (const card of (await cards.all()).slice(0, 8)) {
      const box = await card.boundingBox();
      if (box) {
        lefts.add(Math.round(box.x));
      }
    }

    expect(lefts.size).toBe(columns);
  });
}

for (const colorScheme of ['light', 'dark'] as const) {
  test(`has no accessibility violations in ${colorScheme} mode`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme });
    const audit = () =>
      new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();

    await page.goto('/');
    await expect(page.getByText('100 móviles')).toBeVisible();
    expect((await audit()).violations).toEqual([]);

    await page.goto(A700);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Acer Iconia Tab A700' }),
    ).toBeVisible();
    expect((await audit()).violations).toEqual([]);
  });
}
