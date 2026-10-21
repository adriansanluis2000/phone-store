import { describe, expect, it } from 'vitest';
import incompleteDetail from '../../../test/fixtures/product-detail-incomplete.json';
import detail from '../../../test/fixtures/product-detail.json';
import products from '../../../test/fixtures/products.json';
import { toProduct, toProductDetail } from './productMapper';

describe('toProduct', () => {
  it('maps a listed product', () => {
    expect(
      toProduct({
        id: 'ZmGrkLRPXOTpxsU4jjAcv',
        brand: 'Acer',
        model: 'Iconia Talk S',
        price: '170',
        imgUrl: 'https://example.com/a.jpg',
      }),
    ).toEqual({
      id: 'ZmGrkLRPXOTpxsU4jjAcv',
      brand: 'Acer',
      model: 'Iconia Talk S',
      price: 170,
      imageUrl: 'https://example.com/a.jpg',
    });
  });

  it('maps an empty price to null', () => {
    const prices = products.map((product) => toProduct(product).price);

    expect(prices.filter((price) => price === null)).toHaveLength(6);
    expect(prices.filter((price) => typeof price === 'number')).toHaveLength(
      94,
    );
  });
});

describe('toProductDetail', () => {
  it('fixes misspelt and swapped fields and joins split texts', () => {
    expect(toProductDetail(detail)).toEqual({
      id: 'g18mWn2tnbOq2HJx98pTb',
      brand: 'Acer',
      model: 'Iconia Tab A700',
      price: 230,
      imageUrl:
        'https://itx-frontend-test.onrender.com/images/g18mWn2tnbOq2HJx98pTb.jpg',
      cpu: 'Quad-core 1.3 GHz',
      ram: '1 GB RAM',
      os: 'Android 4.0 (Ice Cream Sandwich)',
      screenResolution: '1920 x 1200 pixels (~224 ppi pixel density)',
      battery: 'Non-removable Li-Ion 9800 mAh battery',
      primaryCamera: '5 MP, autofocus, LED flash',
      secondaryCamera: 'Yes',
      dimensions: '259 x 175 x 11 mm (10.20 x 6.89 x 0.43 in)',
      weightGrams: 665,
      colors: [
        { code: 1000, name: 'Titanium Gray' },
        { code: 1001, name: 'Metallic Red' },
      ],
      storages: [
        { code: 2000, name: '16 GB' },
        { code: 2001, name: '32 GB' },
        { code: 2002, name: '64 GB' },
      ],
    });
  });

  it('maps empty values and placeholders to null', () => {
    expect(toProductDetail(incompleteDetail)).toMatchObject({
      price: null,
      battery: null,
      weightGrams: null,
      dimensions: null,
    });
  });

  it('skips the empty items of split texts', () => {
    const product = toProductDetail({
      ...detail,
      cpu: ['Octa-core (4x2.0 GHz', '', '4x1.5 GHz)'],
    });

    expect(product.cpu).toBe('Octa-core (4x2.0 GHz, 4x1.5 GHz)');
  });
});
