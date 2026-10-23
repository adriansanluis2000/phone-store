import { normalizeText } from '../../../shared/lib/normalizeText';
import { filterProducts } from './filterProducts';
import type { Product } from './product';

export type PriceSort = 'price-asc' | 'price-desc';

/** What a search keeps of the catalogue, and in which order. */
export interface ProductFilters {
  /** Any of these brands, ignoring case and accents. */
  brands?: string[];
  /** Every one of these words, in the brand and model. */
  keywords?: string[];
  /** In euros, both included. */
  minPrice?: number;
  maxPrice?: number;
  sort?: PriceSort;
}

/**
 * The products that pass every filter. Products without a price never pass a
 * price limit, and go last when sorting by price.
 */
export function applyFilters(
  products: Product[],
  { brands = [], keywords = [], minPrice, maxPrice, sort }: ProductFilters,
): Product[] {
  const wanted = new Set(brands.map(normalizeText));
  const priced = minPrice !== undefined || maxPrice !== undefined;

  const results = filterProducts(products, keywords.join(' ')).filter(
    ({ brand, price }) =>
      (wanted.size === 0 || wanted.has(normalizeText(brand))) &&
      (!priced ||
        (price !== null &&
          price >= (minPrice ?? 0) &&
          price <= (maxPrice ?? Infinity))),
  );

  if (!sort) {
    return results;
  }
  const direction = sort === 'price-asc' ? 1 : -1;
  return results.sort(
    (a, b) =>
      Number(a.price === null) - Number(b.price === null) ||
      ((a.price ?? 0) - (b.price ?? 0)) * direction,
  );
}
