import type { Draft } from '@/features/notebook-data';

export type WorkspaceEntry = { draft: Draft; persisted: boolean; dirty: boolean; status: string };

/** A save belongs to a record UUID, not whichever case now occupies its former key. */
export function settleRecordSave<T extends WorkspaceEntry>(entries: Record<string, T>, snapshot: Draft, error?: string): Record<string, T> {
  let changed = false;
  const next = Object.fromEntries(Object.entries(entries).map(([key, entry]) => {
    if (entry.draft.id !== snapshot.id) return [key, entry];
    changed = true;
    if (error) return [key, { ...entry, status: error }];
    // Identity comparison also catches edits made within the same millisecond.
    const dirty = entry.draft !== snapshot;
    return [key, { ...entry, persisted: true, dirty, status: dirty ? 'Saving changes…' : 'Saved on this device' }];
  }));
  return changed ? next : entries;
}
