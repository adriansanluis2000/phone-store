import { http, HttpResponse, type JsonBodyType } from 'msw';
import { describe, expect, it } from 'vitest';
import { API_BASE_URL } from '../../../shared/http/apiClient';
import detail from '../../../test/fixtures/product-detail.json';
import products from '../../../test/fixtures/products.json';
import { server } from '../../../test/server';
import { getProductDetail, getProducts } from './productApi';

// Serves a fixture and counts how many requests reach the network
function serve(path: string, body: JsonBodyType) {
  const requests = { count: 0 };
  server.use(
    http.get(`${API_BASE_URL}${path}`, () => {
      requests.count++;
      return HttpResponse.json(body);
    }),
  );
  return requests;
}

describe('productApi', () => {
  it('lists every product the API returns', async () => {
    serve('/api/product', products);

    const list = await getProducts();

    expect(list).toHaveLength(100);
    expect(list[0]).toEqual({
      id: 'ZmGrkLRPXOTpxsU4jjAcv',
      brand: 'Acer',
      model: 'Iconia Talk S',
      price: 170,
      imageUrl:
        'https://itx-frontend-test.onrender.com/images/ZmGrkLRPXOTpxsU4jjAcv.jpg',
    });
  });

  it('serves the list from the cache after the first request', async () => {
    const requests = serve('/api/product', products);

    await getProducts();
    await getProducts();

    expect(requests.count).toBe(1);
  });

  it('gets the detail of a product, cached per product', async () => {
    const requests = serve(`/api/product/${detail.id}`, detail);

    const product = await getProductDetail(detail.id);
    await getProductDetail(detail.id);

    expect(product).toMatchObject({ id: detail.id, model: 'Iconia Tab A700' });
    expect(requests.count).toBe(1);
  });
});
