import type { Draft } from "./notebook-data";
import { isSupportingPracticeField } from "@/lib/supporting-practice-records";
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

/** Shared by navigation protection and worksheet tests; metadata alone is not authored work. */
export function hasMeaningfulDraftWork(draft: Draft): boolean {
  if (draft.observations.length) return true;
  return Object.entries(draft.fields).some(([field, value]) => value.trim() !== "" && (
    draft.type === "perspective"
      ? ["action", "prediction", "switchWhen", "situation", "facts", "unknowns"].includes(field)
      : draft.type === "identity"
        ? !["stage", "format", "baseline", "supportLevel", "testType", "outcome"].includes(field)
        : field === "note" || isSupportingPracticeField(field)
  ));
}
