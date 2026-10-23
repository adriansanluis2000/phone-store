import { apiCache } from '../../../shared/cache/apiCache';
import { createHttpClient } from '../../../shared/http/httpClient';
import { normalizeText } from '../../../shared/lib/normalizeText';
import type { Product } from '../domain/product';
import type { SearchStrategy } from '../domain/searchStrategy';
import {
  AiSearchResponseSchema,
  type AiSearchRequest,
  type AiSearchResponse,
} from './aiSearchContract';

const PATH = '/api/ai-search';

// The app's own function, on its own domain. Never retried: a failed smart
// search falls back to the text search at once (ADR 0011)
const functions = createHttpClient({
  baseUrl: '',
  timeoutMs: 15_000,
  retries: 0,
  retryDelayMs: 0,
});

/** The smart search: Claude reads the query, through the AI search function. */
export const aiSearch = {
  live: false,
  async interpret(query: string, catalogue: Product[], signal: AbortSignal) {
    const request: AiSearchRequest = {
      query: query.trim(),
      brands: unique(catalogue.map(({ brand }) => brand)),
      models: unique(catalogue.map(({ model }) => model)),
    };
    // A search already made is answered from the cache, for an hour
    const { unsupported = [], ...filters } = await apiCache.getOrFetch(
      `POST ${PATH} ${normalizeText(request.query)}`,
      async (): Promise<AiSearchResponse> =>
        AiSearchResponseSchema.parse(await functions.post(PATH, request)),
      signal,
    );
    return { filters, unsupported };
  },
} satisfies SearchStrategy;

function unique(values: string[]): string[] {
  return [...new Set(values)];
}
