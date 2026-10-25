import type { Draft } from "./notebook-data";
export function makeDraft(type: Draft["type"], title: string): Draft {
  const now = new Date().toISOString();
  return {
    schemaVersion: 1,
    id: crypto.randomUUID(),
    type,
    createdAt: now,
    updatedAt: now,
    contentVersion: "2.0",
    title,
    fields: {},
    observations: [],
  };
}
