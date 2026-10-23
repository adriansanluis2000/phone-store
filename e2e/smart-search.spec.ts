import { AxeBuilder } from '@axe-core/playwright';
import { expect, test } from './fixtures';

test('finds phones from a description and keeps its filters on the way back', async ({
  page,
}) => {
  // The AI search function, mocked: the model is never called
  const searches: unknown[] = [];
  await page.route('**/api/ai-search', async (route) => {
    searches.push(route.request().postDataJSON());
    await route.fulfill({
      json: { keywords: ['tab'], maxPrice: 250, sort: 'price-asc' },
    });
  });
  await page.goto('/');
  await expect(page.getByText('100 móviles')).toBeVisible();

  await page.getByRole('switch', { name: 'Búsqueda inteligente' }).click();
  await page
    .getByRole('searchbox', { name: /Describe lo que buscas/ })
    .fill('una tablet de menos de 250 €');
  await page.keyboard.press('Enter');

  await expect(page.getByText('19 de 100 móviles')).toBeVisible();
  expect(searches).toEqual([
    expect.objectContaining({ query: 'una tablet de menos de 250 €' }),
  ]);
  const chips = page.getByRole('list', { name: 'Hemos entendido:' });
  await expect(chips.getByRole('listitem')).toHaveCount(3);
  const audit = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(audit.violations).toEqual([]);

  await page.getByRole('link', { name: /Iconia Tab A700/ }).click();
  await page.getByRole('link', { name: 'Volver al listado' }).click();
  await expect(page.getByText('19 de 100 móviles')).toBeVisible();
  await expect(chips.getByRole('listitem')).toHaveCount(3);
  expect(searches).toHaveLength(1);
});
