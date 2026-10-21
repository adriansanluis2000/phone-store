/** Lower case and without accents, so that "Ácer" and "acer" compare equal. */
export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}
