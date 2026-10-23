import { z } from 'zod';

// What the browser and the AI search function exchange (ADR 0011). Both sides
// validate with these schemas, so neither has to trust the other. The function
// imports this file too: it must depend on nothing but zod.

export const QUERY_MAX_LENGTH = 200;

export const AiSearchRequestSchema = z.object({
  query: z.string().trim().min(1).max(QUERY_MAX_LENGTH),
  // The catalogue, so that the answer uses its own brands and model names
  brands: z.array(z.string().max(40)).min(1).max(50),
  models: z.array(z.string().max(80)).max(200),
});

export type AiSearchRequest = z.infer<typeof AiSearchRequestSchema>;

export const AiSearchResponseSchema = z.object({
  brands: z.array(z.string().max(40)).max(50).optional(),
  keywords: z.array(z.string().max(40)).max(10).optional(),
  minPrice: z.number().nonnegative().optional(),
  maxPrice: z.number().nonnegative().optional(),
  sort: z.enum(['price-asc', 'price-desc']).optional(),
  // What the search asked for that the list cannot filter, to tell the user
  unsupported: z.array(z.string().max(40)).max(5).optional(),
});

export type AiSearchResponse = z.infer<typeof AiSearchResponseSchema>;
