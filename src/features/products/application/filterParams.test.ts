import { describe, expect, it } from 'vitest';
import {
  filtersFromParams,
  unsupportedFromParams,
  writeFilters,
  writeUnsupported,
} from './filterParams';

describe('filter parameters', () => {
  it('round-trips every filter through the URL', () => {
    const filters = {
      brands: ['Acer', 'alcatel'],
      keywords: ['liquid'],
      minPrice: 50.5,
      maxPrice: 150,
      sort: 'price-desc' as const,
    };

    const params = writeFilters(new URLSearchParams('q=barato'), filters);

    expect(params.toString()).toBe(
      'q=barato&brand=Acer&brand=alcatel&kw=liquid&min=50.5&max=150&sort=price-desc',
    );
    expect(filtersFromParams(params)).toEqual(filters);
  });

  it('replaces the filters and leaves the other parameters alone', () => {
    const params = new URLSearchParams('q=x&mode=ai&kw=old&max=10');

    writeFilters(params, { brands: ['Acer'] });

    expect(params.toString()).toBe('q=x&mode=ai&brand=Acer');
  });

  it('leaves out what is malformed', () => {
    expect(
      filtersFromParams(
        new URLSearchParams('brand=&kw=&min=abc&max=-5&sort=random'),
      ),
    ).toEqual({});
    expect(filtersFromParams(new URLSearchParams('min=&max=0'))).toEqual({
      maxPrice: 0,
    });
  });

  it('keeps what the search could not filter', () => {
    const params = writeUnsupported(new URLSearchParams('unsupported=old'), [
      'azul',
      '8 GB',
    ]);

    expect(params.toString()).toBe('unsupported=azul&unsupported=8+GB');
    expect(unsupportedFromParams(params)).toEqual(['azul', '8 GB']);
    expect(unsupportedFromParams(writeUnsupported(params, []))).toEqual([]);
  });
});
