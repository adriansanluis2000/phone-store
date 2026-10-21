import { http, HttpResponse } from 'msw';
import { API_BASE_URL } from '../shared/http/apiClient';
import incompleteDetail from './fixtures/product-detail-incomplete.json';
import detail from './fixtures/product-detail.json';
import products from './fixtures/products.json';

const details = new Map(
  [detail, incompleteDetail].map((product) => [product.id, product]),
);

/** The real API's responses, from the fixtures. */
export const handlers = [
  http.get(`${API_BASE_URL}/api/product`, () => HttpResponse.json(products)),
  http.get(`${API_BASE_URL}/api/product/:id`, ({ params }) => {
    const product = details.get(String(params.id));
    // Like the real API, unknown products answer 500
    return product
      ? HttpResponse.json(product)
      : HttpResponse.json(
          { message: 'An Unexpected Error Occurred', code: 0 },
          { status: 500 },
        );
  }),
];
