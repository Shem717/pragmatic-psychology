import { content } from '@/lib/content';
import { editionPassages, makeCompanionEdition, type CompanionPassage } from './companion-edition';
import { searchWords, singular } from './search-words';

export type LibraryCategoryId = 'perspectives' | 'practice' | 'connection';
export type LibraryCategory = { id: LibraryCategoryId; title: string; description: string; roman: string };
export type LibraryVolume = {
  id: string;
  category: LibraryCategoryId;
  number: number;
  title: string;
  shortTitle: string;
  summary: string;
  color: string;
};
export const libraryCategories: LibraryCategory[] = [
  { id: 'perspectives', title: 'Perspectives & evidence', description: 'Examine predictions, situation-fitting responses and the limits of an explanation.', roman: 'I' },
  { id: 'practice', title: 'Practice & change', description: 'Rehearse a useful action, adapt the conditions and learn from repetition.', roman: 'II' },
  { id: 'connection', title: 'Agency & connection', description: 'Consider self-direction alongside competence, care and meaningful contact.', roman: 'III' },
];
const bindings: Record<string, { category: LibraryCategoryId; shortTitle: string; color: string }> = {
  TOTW_bsKkbE: { category: 'perspectives', shortTitle: 'Prediction & feeling', color: '#28444a' },
  eX1_yI7scug: { category: 'practice', shortTitle: 'Practice a response', color: '#67443b' },
  AipBMvDBw70: { category: 'perspectives', shortTitle: 'Evidence & limits', color: '#344463' },
  ieR3n0laLAg: { category: 'practice', shortTitle: 'Adapt your practice', color: '#665137' },
  nqWsMb06W0I: { category: 'connection', shortTitle: 'Agency & connection', color: '#4f405a' },
  EB5E24TSBuk: { category: 'perspectives', shortTitle: 'Situation & response', color: '#38564b' },
  CorAKleaql4: { category: 'practice', shortTitle: 'Habit & repetition', color: '#6b4435' },
};
/** Seven real companions, not an invented inventory of unreadable books. */
export const libraryVolumes: LibraryVolume[] = content.videos.map((video) => {
  const binding = bindings[video.youtubeId];
  if (!binding) throw new Error(`Selected video has no library binding: ${video.youtubeId}`);
  return { id: video.youtubeId, number: video.episode, title: video.title, summary: video.summary, ...binding };
});
export function getLibraryVolume(id: string) {
  return libraryVolumes.find((volume) => volume.id === id);
}
const collection = libraryVolumes.map(volume => {
  const video = content.videos.find(item => item.youtubeId === volume.id)!;
  const wing = libraryCategories.find(item => item.id === volume.category)!;
  const edition = makeCompanionEdition(video, volume.shortTitle, wing.title);
  const passages = editionPassages(edition).map(passage => {
    const title = searchWords(passage.title);
    const body = searchWords(passage.text);
    const words = [...title, ...body, ...searchWords(passage.label)];
    return {
      passage,
      titlePhrase: ' ' + title.join(' ') + ' ',
      bodyPhrase: ' ' + body.join(' ') + ' ',
      words: new Set(words.map(singular)),
    };
  });
  return { volume, edition, passages };
});

export function getCompanionEdition(id: string) {
  return collection.find(item => item.volume.id === id)?.edition;
}

export type LibrarySearchResult = { volume: LibraryVolume; matches: CompanionPassage[] };

export function searchLibraryVolumes(query: string, category: LibraryCategoryId | null = null): LibrarySearchResult[] {
  const books = collection.filter(item => !category || item.volume.category === category);
  if (!query.trim()) return books.map(({ volume }) => ({ volume, matches: [] }));
  const words = searchWords(query);
  if (!words.length) return [];
  const phrase = ' ' + words.join(' ') + ' ';
  const terms = Array.from(new Set(words.map(singular)));
  const results = books.flatMap(({ volume, passages }) => {
    const found = new Set<string>();
    const matches = passages.flatMap(item => {
      const hits = terms.filter(term => item.words.has(term));
      if (!hits.length) return [];
      hits.forEach(term => found.add(term));
      const exact = item.titlePhrase.includes(phrase) ? 2 : Number(item.bodyPhrase.includes(phrase));
      return [{ passage: item.passage, hits: hits.length, exact }];
    }).sort((a, b) => b.hits - a.hits || b.exact - a.exact);
    return found.size === terms.length ? [{ volume, matches }] : [];
  });
  results.sort((a, b) => b.matches[0].hits - a.matches[0].hits || b.matches[0].exact - a.matches[0].exact || a.volume.number - b.volume.number);
  return results.map(({ volume, matches }) => ({ volume, matches: matches.map(match => match.passage) }));
}

// The room and older catalogue callers use the volume-only view of the same search.
export function filterLibraryVolumes(query: string, category: LibraryCategoryId | null = null) {
  return searchLibraryVolumes(query, category).map(result => result.volume);
}
export const bookChapters = ['Overview', 'Takeaways', 'Practice', 'Sources', 'Watch'] as const;
export type BookReaderState = { bookId: string; page: number };
export type BookReaderAction = { type: 'open'; bookId: string } | { type: 'next' } | { type: 'previous' } | { type: 'chapter'; page: number } | { type: 'reset' };
export function createBookReaderState(bookId: string): BookReaderState {
  return { bookId, page: 0 };
}
export function navigateBookReader(state: BookReaderState, action: BookReaderAction): BookReaderState {
  if (action.type === 'open') return getLibraryVolume(action.bookId) ? createBookReaderState(action.bookId) : state;
  if (action.type === 'reset') return { ...state, page: 0 };
  const requested = action.type === 'next' ? state.page + 1 : action.type === 'previous' ? state.page - 1 : action.page;
  if (!Number.isFinite(requested)) return state;
  return { ...state, page: Math.max(0, Math.min(bookChapters.length - 1, Math.trunc(requested))) };
}
