import { describe, expect, it } from 'vitest';
import {
  AiSearchRequestSchema,
  AiSearchResponseSchema,
  QUERY_MAX_LENGTH,
} from './aiSearchContract';

const REQUEST = {
  query: ' un acer barato ',
  brands: ['Acer'],
  models: ['Liquid Zest'],
};

describe('AI search contract', () => {
  it('takes a search with its catalogue, trimmed', () => {
    expect(AiSearchRequestSchema.parse(REQUEST)).toEqual({
      ...REQUEST,
      query: 'un acer barato',
    });
  });

  it('rejects empty, too long or unanchored searches', () => {
    for (const request of [
      { ...REQUEST, query: '  ' },
      { ...REQUEST, query: 'a'.repeat(QUERY_MAX_LENGTH + 1) },
      { ...REQUEST, brands: [] },
      { ...REQUEST, models: Array.from({ length: 201 }, () => 'X') },
      { query: 'acer' },
    ]) {
      expect(AiSearchRequestSchema.safeParse(request).success).toBe(false);
    }
  });

  it('accepts any subset of filters and drops unknown fields', () => {
    expect(AiSearchResponseSchema.parse({})).toEqual({});
    expect(
      AiSearchResponseSchema.parse({
        maxPrice: 300,
        sort: 'price-asc',
        unsupported: ['azul'],
        x: 1,
      }),
    ).toEqual({ maxPrice: 300, sort: 'price-asc', unsupported: ['azul'] });
  });

  it('rejects filters the list cannot apply', () => {
    for (const response of [
      { minPrice: -1 },
      { maxPrice: '300' },
      { sort: 'rating' },
      { keywords: Array.from({ length: 11 }, () => 'x') },
      { unsupported: Array.from({ length: 6 }, () => 'x') },
    ]) {
      expect(AiSearchResponseSchema.safeParse(response).success).toBe(false);
    }
  });
});
