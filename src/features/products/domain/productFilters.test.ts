import { describe, expect, it } from 'vitest';
import type { Product } from './product';
import { applyFilters, type ProductFilters } from './productFilters';
import { textSearch } from './searchStrategy';

function product(brand: string, model: string, price: number | null): Product {
  return { id: model, brand, model, price, imageUrl: '' };
}

const products = [
  product('Acer', 'Iconia Tab 10 A3-A40', 230),
  product('Acer', 'Liquid Jade 2', null),
  product('Acer', 'Liquid Zest', 110),
  product('alcatel', 'Flash (2017)', 120),
];

function models(filters: ProductFilters) {
  return applyFilters(products, filters).map(({ model }) => model);
}

describe('applyFilters', () => {
  it('keeps every product, in order, without filters', () => {
    expect(models({})).toEqual(products.map(({ model }) => model));
  });

  it('keeps any of the brands, ignoring case and accents', () => {
    expect(models({ brands: ['ALCATEL'] })).toEqual(['Flash (2017)']);
    expect(models({ brands: ['álcatel', 'acer'] })).toHaveLength(4);
  });

  it('needs every keyword in the brand and model', () => {
    expect(models({ keywords: ['liquid'] })).toEqual([
      'Liquid Jade 2',
      'Liquid Zest',
    ]);
    expect(models({ keywords: ['liquid', 'zest'] })).toEqual(['Liquid Zest']);
  });

  it('keeps prices within the limits, both included, and never a missing price', () => {
    expect(models({ minPrice: 120 })).toEqual([
      'Iconia Tab 10 A3-A40',
      'Flash (2017)',
    ]);
    expect(models({ maxPrice: 120 })).toEqual(['Liquid Zest', 'Flash (2017)']);
    expect(models({ minPrice: 115, maxPrice: 200 })).toEqual(['Flash (2017)']);
  });

  it('sorts by price either way, with missing prices last', () => {
    expect(models({ sort: 'price-asc' })).toEqual([
      'Liquid Zest',
      'Flash (2017)',
      'Iconia Tab 10 A3-A40',
      'Liquid Jade 2',
    ]);
    expect(models({ sort: 'price-desc' })).toEqual([
      'Iconia Tab 10 A3-A40',
      'Flash (2017)',
      'Liquid Zest',
      'Liquid Jade 2',
    ]);
  });

  it('combines every filter without changing the catalogue', () => {
    const before = [...products];

    expect(
      models({
        brands: ['acer'],
        keywords: ['liquid'],
        maxPrice: 300,
        sort: 'price-desc',
      }),
    ).toEqual(['Liquid Zest']);
    expect(products).toEqual(before);
  });
});

describe('textSearch', () => {
  it('turns every word typed into a keyword, as the search of the statement', () => {
    expect(textSearch.interpret('  liquid   zest ')).toEqual({
      keywords: ['liquid', 'zest'],
    });
    expect(models(textSearch.interpret(''))).toHaveLength(4);
  });
});
