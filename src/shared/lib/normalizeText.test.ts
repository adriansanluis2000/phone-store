import { describe, expect, it } from 'vitest';
import { normalizeText } from './normalizeText';

describe('normalizeText', () => {
  it('removes case and accents', () => {
    expect(normalizeText('Ácer ICONIA Señal')).toBe('acer iconia senal');
  });
});
