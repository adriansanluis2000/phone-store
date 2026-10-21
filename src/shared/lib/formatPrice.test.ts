import { describe, expect, it } from 'vitest';
import { formatPrice } from './formatPrice';

// Intl separates the amount from the symbol with a non-breaking space
const NBSP = ' ';

describe('formatPrice', () => {
  it('formats whole euros without decimals', () => {
    expect(formatPrice(170)).toBe(`170${NBSP}€`);
  });

  it('keeps two decimals when there are cents', () => {
    expect(formatPrice(170.5)).toBe(`170,50${NBSP}€`);
  });

  it('says so when there is no price', () => {
    expect(formatPrice(null)).toBe('Precio no disponible');
  });
});
