import { content } from '@/lib/content';

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
export function filterLibraryVolumes(query: string, category: LibraryCategoryId | null = null) {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return libraryVolumes.filter((volume) => {
    if (category && volume.category !== category) return false;
    const haystack = `${volume.title} ${volume.shortTitle} ${volume.summary} ${libraryCategories.find((item) => item.id === volume.category)?.title ?? ''}`.toLocaleLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
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
