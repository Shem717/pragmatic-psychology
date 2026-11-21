const combiningMarks = new RegExp('\\p{M}', 'gu');
const words = new RegExp('[\\p{L}\\p{N}]+', 'gu');
export const highlightWords = new RegExp("([\\p{L}\\p{N}]+(?:['’][\\p{L}\\p{N}]+)*)", 'u');

export function searchWords(text: string): string[] {
  const normalized = text.toLowerCase().normalize('NFKD').replace(combiningMarks, '').replace(/['’]/g, '');
  return normalized.match(words) ?? [];
}

// Keep matching on word boundaries, so "actions" finds "action" without finding "reactions".
export function singular(word: string): string {
  if (word.length <= 3) return word;
  if (word.endsWith('ies') && word.length > 4) return word.slice(0, -3) + 'y';
  if (/(?:ch|sh|ss|x|z)es$/.test(word)) return word.slice(0, -2);
  if (word.endsWith('s') && !/(ss|us|is|as)$/.test(word)) return word.slice(0, -1);
  return word;
}
