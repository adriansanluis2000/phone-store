import { describe, expect, it } from 'vitest';
import colorNames from '../../../test/fixtures/color-names.json';
import { swatchFor } from './colorShades';

describe('swatchFor', () => {
  it('has a shade for every colour name in the catalogue', () => {
    const missing = colorNames.filter((name) => swatchFor(name) === undefined);

    expect(missing).toEqual([]);
  });

  it('ignores case and spacing', () => {
    expect(swatchFor('  Black ')).toBe(swatchFor('black'));
    expect(swatchFor('Titanium Grey')).toBe(swatchFor('titanium  gray'));
  });

  it('splits combinations into two halves', () => {
    expect(swatchFor('Black/White')).toBe(
      'linear-gradient(135deg, #1d1d1f 50%, #f8f8f6 50%)',
    );
    expect(
      swatchFor(
        'Ceramic White and Pearl Red with 3 exchangeable battery covers',
      ),
    ).toBe('linear-gradient(135deg, #f3efe6 50%, #b3262f 50%)');
  });

  it('falls back to the colour word of an unknown name', () => {
    expect(swatchFor('Midnight Black')).toBe(swatchFor('black'));
  });

  it('makes up no colour for names without one', () => {
    expect(swatchFor('Aurora')).toBeUndefined();
    expect(swatchFor('Black/Aurora')).toBeUndefined();
  });
});
