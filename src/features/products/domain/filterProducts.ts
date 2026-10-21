import { normalizeText } from '../../../shared/lib/normalizeText';
import type { Product } from './product';

/**
 * The products whose brand and model contain every word of the query, in any
 * order and ignoring case and accents. A blank query keeps them all.
 */
export function filterProducts(products: Product[], query: string): Product[] {
  const words = normalizeText(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return products;
  }
  return products.filter((product) => {
    const text = normalizeText(`${product.brand} ${product.model}`);
    return words.every((word) => text.includes(word));
  });
}
