import type { Product } from './product';
import type { ProductFilters } from './productFilters';

/** What a sent search asked for. */
export interface SearchInterpretation {
  filters: ProductFilters;
  /** What the catalogue cannot filter, in the user's words: told, not applied. */
  unsupported: string[];
}

/**
 * Turns what the user typed into filters over the catalogue. The text search
 * of the statement answers at once, on every change; a strategy that relies
 * on a service answers later, once the search is sent.
 */
export type SearchStrategy =
  | { live: true; interpret: (query: string) => ProductFilters }
  | {
      live: false;
      interpret: (
        query: string,
        catalogue: Product[],
        signal: AbortSignal,
      ) => Promise<SearchInterpretation>;
    };

/** The search of the statement: every word typed, in the brand and model. */
export const textSearch = {
  live: true,
  interpret: (query: string) => ({
    keywords: query.split(/\s+/).filter(Boolean),
  }),
} satisfies SearchStrategy;
