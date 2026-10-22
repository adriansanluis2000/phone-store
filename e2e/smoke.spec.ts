import { expect, test } from '@playwright/test';

// Against the real API, which can take a minute or more to wake up. Run on
// demand with npm run test:smoke; CI uses the mocked API (ADR 0009)
test.setTimeout(180_000);

test('loads the catalogue and a product from the real API', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByText('100 móviles')).toBeVisible({ timeout: 120_000 });

  await page.getByRole('link', { name: /Iconia Talk S/ }).click();

  await expect(
    page.getByRole('heading', { level: 1, name: 'Acer Iconia Talk S' }),
  ).toBeVisible({
    timeout: 30_000,
  });
  await expect(
    page.getByRole('group', { name: 'Almacenamiento' }),
  ).toBeVisible();
});
