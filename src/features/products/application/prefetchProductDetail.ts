import { getProductDetail } from '../infrastructure/productApi';

/**
 * Fills the cache with a product's detail ahead of a likely visit. A failure
 * is left for the detail page to show, if the user does open it.
 */
export function prefetchProductDetail(id: string): void {
  getProductDetail(id).catch(() => undefined);
}
