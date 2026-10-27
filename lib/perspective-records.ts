import type { Draft } from '@/features/notebook-data';

export const chamberFields: Record<string, string> = {
  chamber_interpretation: 'My first interpretation', chamber_feelingUrge: 'Feeling or urge',
  chamber_responseKind: 'Kind of next response', chamber_boundary: 'A boundary I want to keep',
  chamber_actionWhen: 'When or in what situation', chamber_reviewDate: 'Review date (no reminder)',
  chamber_reviewType: 'Observation context', chamber_reviewActual: 'What actually happened',
  chamber_reviewMeaning: 'What the observation supports and does not establish',
  chamber_reviewAdjustment: 'Keep, change or stop',
};
export const personalLenses = ['My first reading', 'Another explanation', 'A limit or need', 'What is still unknown'];
for (let i = 0; i < personalLenses.length; i++) {
  chamberFields[`chamber_lens${i}`] = `${personalLenses[i]} — possible reading`;
  chamberFields[`chamber_support${i}`] = `${personalLenses[i]} — supporting observations`;
  chamberFields[`chamber_challenge${i}`] = `${personalLenses[i]} — challenges or missing evidence`;
}
export function hasChamberWork(fields: Record<string, string>) {
  return Object.keys(chamberFields).some((key) => fields[key]?.trim());
}
export function chamberFieldLabel(key: string) { return chamberFields[key]; }

/** Switching/resuming a case never mixes its fields or loses the previous in-tab case.
 * Saving remains an explicit operation; this function never writes to storage. */
export function activatePerspectiveEntry<T extends { draft: Draft }>(entries: Record<string, T>, next: T): Record<string, T> {
  const active = entries.perspective;
  const result = Object.fromEntries(Object.entries(entries).filter(([, entry]) => entry.draft.id !== next.draft.id));
  if (active && active.draft.id !== next.draft.id && (Object.keys(active.draft.fields).length || active.draft.observations.length)) {
    result[`perspective-case-${active.draft.id}`] = active;
  }
  result.perspective = next;
  return result;
}

export function chosenPerspectiveLabel(fields: Record<string, string>, frames: { id: string; name: string }[]) {
  if (fields.personal === 'yes') {
    const own = /^own-([0-3])$/.exec(fields.choice || '');
    return own ? personalLenses[Number(own[1])] : 'Not chosen';
  }
  return frames.find((frame) => frame.id === fields.choice)?.name || (fields.choice === 'need-information' ? 'Need more information' : 'Not chosen');
}
