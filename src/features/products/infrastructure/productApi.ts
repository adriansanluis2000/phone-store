import { apiCache } from '../../../shared/cache/apiCache';
import { apiClient } from '../../../shared/http/apiClient';
import type { Product, ProductDetail } from '../domain/product';
import type { ProductDetailDto, ProductListItemDto } from './productDto';
import { toProduct, toProductDetail } from './productMapper';

// Responses are cached as received and mapped on every read (ADR 0004)

const PRODUCTS_PATH = '/api/product';

export async function getProducts(signal?: AbortSignal): Promise<Product[]> {
  const products = await apiCache.getOrFetch(
    `GET ${PRODUCTS_PATH}`,
    () => apiClient.get(PRODUCTS_PATH) as Promise<ProductListItemDto[]>,
    signal,
  );
  return products.map(toProduct);
}

/** The products, only when the cache holds them fresh: never fetches. */
export function peekProducts(): Product[] | undefined {
  const products = apiCache.peek(`GET ${PRODUCTS_PATH}`) as
    ProductListItemDto[] | undefined;
  return products?.map(toProduct);
}

export async function getProductDetail(
  id: string,
  signal?: AbortSignal,
): Promise<ProductDetail> {
  const path = `/api/product/${encodeURIComponent(id)}`;
  const product = await apiCache.getOrFetch(
    `GET ${path}`,
    () => apiClient.get(path) as Promise<ProductDetailDto>,
    signal,
  );
  return toProductDetail(product);
}
