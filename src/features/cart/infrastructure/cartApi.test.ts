import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { API_BASE_URL } from '../../../shared/http/apiClient';
import { HttpError } from '../../../shared/http/errors';
import { server } from '../../../test/server';
import { addToCart } from './cartApi';

const item = {
  productId: 'ZmGrkLRPXOTpxsU4jjAcv',
  colorCode: 1000,
  storageCode: 2000,
};

describe('cartApi', () => {
  it('posts the product id and the chosen codes and returns the count', async () => {
    const bodies: unknown[] = [];
    server.use(
      http.post(`${API_BASE_URL}/api/cart`, async ({ request }) => {
        bodies.push(await request.json());
        return HttpResponse.json({ count: 1 });
      }),
    );

    await expect(addToCart(item)).resolves.toBe(1);
    expect(bodies).toEqual([
      { id: 'ZmGrkLRPXOTpxsU4jjAcv', colorCode: 1000, storageCode: 2000 },
    ]);
  });

  it('sends every add to the API, without caching', async () => {
    let requests = 0;
    server.use(
      http.post(`${API_BASE_URL}/api/cart`, () => {
        requests++;
        return HttpResponse.json({ count: 1 });
      }),
    );

    await addToCart(item);
    await addToCart(item);

    expect(requests).toBe(2);
  });

  it('fails without retrying when the API fails', async () => {
    let requests = 0;
    server.use(
      http.post(`${API_BASE_URL}/api/cart`, () => {
        requests++;
        return new HttpResponse(null, { status: 503 });
      }),
    );

    await expect(addToCart(item)).rejects.toBeInstanceOf(HttpError);
    expect(requests).toBe(1);
  });
});
