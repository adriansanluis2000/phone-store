import { describe, expect, it } from 'vitest';
import { filterProducts } from './filterProducts';
import type { Product } from './product';

function product(brand: string, model: string): Product {
  return { id: model, brand, model, price: null, imageUrl: '' };
}

const products = [
  product('Acer', 'Iconia Tab 10 A3-A40'),
  product('Acer', 'Liquid Jade 2'),
  product('alcatel', 'Flash (2017)'),
];

function models(query: string) {
  return filterProducts(products, query).map(({ model }) => model);
}

describe('filterProducts', () => {
  it('keeps every product when the query is blank', () => {
    expect(models('')).toHaveLength(3);
    expect(models('   ')).toHaveLength(3);
  });

  it('matches the brand or the model', () => {
    expect(models('alcatel')).toEqual(['Flash (2017)']);
    expect(models('jade')).toEqual(['Liquid Jade 2']);
  });

  it('ignores case and accents', () => {
    expect(models('ÁLCATEL')).toEqual(['Flash (2017)']);
    expect(models('Lìquid')).toEqual(['Liquid Jade 2']);
  });

  it('needs every word, in any order and across brand and model', () => {
    expect(models('tab acer')).toEqual(['Iconia Tab 10 A3-A40']);
    expect(models('acer flash')).toEqual([]);
  });

  it('matches parts of words, so results narrow while typing', () => {
    expect(models('ico')).toEqual(['Iconia Tab 10 A3-A40']);
  });
});
