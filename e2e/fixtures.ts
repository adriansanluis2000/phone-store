import { test as base, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const API = 'https://itx-frontend-test.onrender.com';

function fixture(name: string): unknown {
  return JSON.parse(
    readFileSync(
      new URL(`../src/test/fixtures/${name}.json`, import.meta.url),
      'utf8',
    ),
  );
}

const products = fixture('products');
const details = new Map(
  ['product-detail', 'product-detail-incomplete'].map((name) => {
    const detail = fixture(name) as { id: string };
    return [detail.id, detail];
  }),
);

// A neutral picture, so the tests never wait on the real image host
const PICTURE =
  '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="212"><rect width="160" height="212" fill="#ddd"/></svg>';

/** Answers like the real API, from its saved responses, and records the cart. */
async function mockApi(page: Page) {
  const cart: unknown[] = [];
  await page.route(`${API}/images/**`, (route) =>
    route.fulfill({ contentType: 'image/svg+xml', body: PICTURE }),
  );
  await page.route(`${API}/api/product`, (route) =>
    route.fulfill({ json: products }),
  );
  await page.route(`${API}/api/product/*`, (route) => {
    const id = new URL(route.request().url()).pathname.split('/').pop() ?? '';
    const detail = details.get(id);
    return detail
      ? route.fulfill({ json: detail })
      : route.fulfill({
          status: 500,
          json: { message: 'An Unexpected Error Occurred', code: 0 },
        });
  });
  await page.route(`${API}/api/cart`, (route) => {
    cart.push(route.request().postDataJSON());
    return route.fulfill({ json: { count: 1 } });
  });
  return { cart };
}

/**
 * Every test gets the mocked API and fails on any error in the browser
 * console, such as a request blocked by the Content Security Policy.
 */
export const test = base.extend<{ api: { cart: unknown[] } }>({
  api: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on('console', (message) => {
        if (message.type() === 'error') {
          errors.push(message.text());
        }
      });
      page.on('pageerror', (error) => {
        errors.push(error.message);
      });
      await use(await mockApi(page));
      expect(errors).toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
