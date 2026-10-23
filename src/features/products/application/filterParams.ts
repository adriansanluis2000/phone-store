import type { PriceSort, ProductFilters } from '../domain/productFilters';

// The filters of a smart search, and what it could not filter, kept in the URL
// next to the query so that they survive a visit to a product and can be
// shared (ADR 0011)
const BRAND = 'brand';
const KEYWORD = 'kw';
const MIN = 'min';
const MAX = 'max';
const SORT = 'sort';
const UNSUPPORTED = 'unsupported';

const SORTS: readonly string[] = [
  'price-asc',
  'price-desc',
] satisfies PriceSort[];

/** The filters the URL holds; anything malformed is left out. */
export function filtersFromParams(params: URLSearchParams): ProductFilters {
  const brands = params.getAll(BRAND).filter(Boolean);
  const keywords = params.getAll(KEYWORD).filter(Boolean);
  const minPrice = price(params.get(MIN));
  const maxPrice = price(params.get(MAX));
  const sort = params.get(SORT);

  return {
    ...(brands.length > 0 ? { brands } : {}),
    ...(keywords.length > 0 ? { keywords } : {}),
    ...(minPrice !== undefined ? { minPrice } : {}),
    ...(maxPrice !== undefined ? { maxPrice } : {}),
    ...(sort !== null && SORTS.includes(sort)
      ? { sort: sort as PriceSort }
      : {}),
  };
}

/** Replaces the filters in the URL, leaving every other parameter as it is. */
export function writeFilters(
  params: URLSearchParams,
  { brands = [], keywords = [], minPrice, maxPrice, sort }: ProductFilters,
): URLSearchParams {
  for (const name of [BRAND, KEYWORD, MIN, MAX, SORT]) {
    params.delete(name);
  }
  for (const brand of brands) {
    params.append(BRAND, brand);
  }
  for (const keyword of keywords) {
    params.append(KEYWORD, keyword);
  }
  if (minPrice !== undefined) {
    params.set(MIN, minPrice.toString());
  }
  if (maxPrice !== undefined) {
    params.set(MAX, maxPrice.toString());
  }
  if (sort) {
    params.set(SORT, sort);
  }
  return params;
}

function price(value: string | null): number | undefined {
  const number = value === null || value === '' ? Number.NaN : Number(value);
  return Number.isFinite(number) && number >= 0 ? number : undefined;
}

/** What the last smart search could not filter. */
export function unsupportedFromParams(params: URLSearchParams): string[] {
  return params.getAll(UNSUPPORTED).filter(Boolean);
}

export function writeUnsupported(
  params: URLSearchParams,
  unsupported: string[],
): URLSearchParams {
  params.delete(UNSUPPORTED);
  for (const item of unsupported) {
    params.append(UNSUPPORTED, item);
  }
  return params;
}
