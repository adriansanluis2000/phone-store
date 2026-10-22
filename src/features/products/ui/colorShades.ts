import { normalizeText } from '../../../shared/lib/normalizeText';

// The API names colours with words only (docs/api-notes.md), so these shades
// are an approximation, chosen by hand for every name in the catalogue. The
// name is always shown next to the swatch.
const SHADES: Record<string, string> = {
  black: '#1d1d1f',
  'mystic black': '#1b1c24',
  'gentle black': '#2a2a2d',
  'titanium black': '#2c2e33',
  'titan black': '#2c2e33',
  'soft-touch black': '#232323',
  'rock black': '#1f2023',
  'graphite black': '#33363a',
  white: '#f8f8f6',
  'pure white': '#ffffff',
  'ceramic white': '#f3efe6',
  'essential white': '#f5f5f1',
  'classic white': '#f7f4ec',
  pearl: '#ede7dc',
  silver: '#c7c9cc',
  'sandy silver': '#d4ccbd',
  steel: '#7b8490',
  gray: '#8e8e93',
  'titanium gray': '#8a8d91',
  'titanium grey': '#8a8d91',
  'gentle grey': '#a0a3a8',
  red: '#c8102e',
  'dark red': '#8b0f1a',
  'burgundy red': '#7d1128',
  'metallic red': '#a3161f',
  'wine red': '#722f37',
  'pearl red': '#b3262f',
  cherry: '#9b111e',
  'ferrari edition': '#d40000',
  pink: '#f2a7c1',
  'fragrant pink': '#f6b5c9',
  blue: '#1f5fbf',
  'dark blue': '#1c2b52',
  'sky blue': '#86bde6',
  lagoon: '#239a98',
  green: '#2f8a57',
  'aquamarine green': '#5ccfb0',
  gold: '#d2ae5b',
  'sunshine yellow': '#ffd23f',
};

// For names not listed above: the first colour word they contain
const COLOUR_WORDS: [word: string, shade: string][] = [
  ['black', '#1d1d1f'],
  ['white', '#f8f8f6'],
  ['silver', '#c7c9cc'],
  ['grey', '#8e8e93'],
  ['gray', '#8e8e93'],
  ['red', '#c8102e'],
  ['pink', '#f2a7c1'],
  ['blue', '#1f5fbf'],
  ['green', '#2f8a57'],
  ['gold', '#d2ae5b'],
  ['yellow', '#ffd23f'],
  ['orange', '#f28c28'],
  ['purple', '#6b3fa0'],
];

const MULTICOLOUR =
  'conic-gradient(#e53935, #fdd835, #43a047, #1e88e5, #8e24aa, #e53935)';

/**
 * A CSS background that approximates a colour name: a solid shade, two halves
 * for combinations such as "Black/White", or undefined when the name holds no
 * colour we know, so that no colour is made up.
 */
export function swatchFor(name: string): string | undefined {
  const normalized = normalizeText(name).trim().replace(/\s+/g, ' ');
  if (normalized === 'various') {
    return MULTICOLOUR;
  }

  // "Ceramic White and Pearl Red with 3 exchangeable battery covers"
  const parts = normalized.replace(/ with .*$/, '').split(/ ?\/ ?| and /);
  const shades = parts
    .map(shadeOf)
    .filter((shade): shade is string => shade !== undefined);
  const [first, second] = shades;
  if (shades.length !== parts.length || !first) {
    return undefined;
  }
  return second
    ? `linear-gradient(135deg, ${first} 50%, ${second} 50%)`
    : first;
}

function shadeOf(part: string): string | undefined {
  return (
    SHADES[part] ?? COLOUR_WORDS.find(([word]) => part.includes(word))?.[1]
  );
}
