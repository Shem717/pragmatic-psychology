import type { Draft } from "@/features/notebook-data";
import { disciplineSlugs } from "./indices";

/** A bounded extension of an existing discipline draft, never a new storage schema. */
export const PILOT_PATH_SLUG = "perspective-fit";
export const PILOT_DISCIPLINE = "discernment";
export const pathRecordFields = [
  { key: "facts", label: "Observable facts", stage: 1 },
  { key: "context", label: "Context and unknowns", stage: 1 },
  { key: "alternatives", label: "Alternative interpretations", stage: 2 },
  { key: "emotion", label: "Emotional experience", stage: 2 },
  { key: "urge", label: "Urge, separate from action", stage: 2 },
  { key: "conduct", label: "Chosen conduct and boundaries", stage: 3 },
  { key: "prediction", label: "Observable prediction", stage: 4 },
  { key: "switchWhen", label: "What would change the plan?", stage: 4 },
  { key: "observationType", label: "Observation setting", stage: 5 },
  { key: "outcome", label: "Outcome status", stage: 5 },
  { key: "observed", label: "What was actually observed?", stage: 5 },
  { key: "revision", label: "Revision after feedback", stage: 5 },
  { key: "reviewWhen", label: "When to revisit", stage: 6 },
  { key: "transferContext", label: "Later or different context", stage: 6 },
  { key: "transferObserved", label: "Later observation", stage: 6 },
  { key: "transferLimits", label: "Transfer limits and unresolved questions", stage: 6 },
] as const;
export type PathField = (typeof pathRecordFields)[number]["key"];
export function pathFieldKey(field: PathField) {
  return `path_${PILOT_PATH_SLUG}_${field}`;
}
export function isLearningPathField(key: string, discipline = PILOT_DISCIPLINE) {
  return discipline === PILOT_DISCIPLINE && pathRecordFields.some((field) => pathFieldKey(field.key) === key);
}
export function learningPathFieldLabel(key: string) {
  const field = pathRecordFields.find((field) => pathFieldKey(field.key) === key);
  return field ? `Perspective-fit path — ${field.label}` : undefined;
}
export function hasLearningPathWork(fields: Record<string, string>) {
  return fields.discipline === PILOT_DISCIPLINE && pathRecordFields.some(({ key }) =>
    Boolean(fields[pathFieldKey(key)]?.trim()),
  );
}
/** A selected menu value deserves navigation protection, but is not a written reflection. */
export function hasLearningPathReflection(fields: Record<string, string>) {
  return fields.discipline === PILOT_DISCIPLINE && pathRecordFields.some(({ key }) =>
    key !== "observationType" && key !== "outcome" && Boolean(fields[pathFieldKey(key)]?.trim()),
  );
}
export function learningPathRecordSummary(fields: Record<string, string>) {
  if (fields.discipline !== PILOT_DISCIPLINE) return undefined;
  for (const field of pathRecordFields) {
    const value = fields[pathFieldKey(field.key)]?.trim();
    if (value) return `Perspective-fit path: ${value.slice(0, 180)}${value.length > 180 ? "…" : ""}`;
  }
}

const rubricLabels = ["Unassessed", "Can describe", "Can practice with guidance", "Can demonstrate in context", "Can transfer and teach back"] as const;
/** Describes self-reported records only. No mastery, rank, treatment or transfer inference. */
export function deriveLearningProfile(records: Draft[]) {
  return disciplineSlugs.map((discipline) => {
    const matching = records.filter((record) => record.type === "learning" && record.fields.discipline === discipline)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    const rated = matching.find((record) => /^[0-4]$/.test(record.fields.rubric ?? ""));
    const rating = rated ? Number(rated.fields.rubric) : 0;
    const pathRecords = discipline === PILOT_DISCIPLINE ? matching.filter((record) => hasLearningPathReflection(record.fields)) : [];
    return {
      discipline,
      recordCount: matching.length,
      rating,
      ratingLabel: rubricLabels[rating],
      hasNote: matching.some((record) => Boolean(record.fields.note?.trim())),
      pathRecordCount: pathRecords.length,
      outcomes: pathRecords.flatMap((record) => {
        const outcome = record.fields[pathFieldKey("outcome")];
        return ["observed", "failed", "inconclusive"].includes(outcome) ? [outcome] : [];
      }),
      hasDelayedObservation: pathRecords.some((record) => Boolean(record.fields[pathFieldKey("transferObserved")]?.trim())),
    };
  });
}

export const proposedMilestones = [
  { title: "Observer", requirement: "Distinguish observation from inference and explain the limits of what is known." },
  { title: "Discerner", requirement: "Compare traceable claims and revise an interpretation for stated reasons." },
  { title: "Integrator", requirement: "Combine compatible insights while keeping unresolved contradictions visible." },
  { title: "Commander", requirement: "Document chosen conduct and bounded skill in an ordinary setting, including misses and limits." },
  { title: "Steward", requirement: "Document retention, varied-context transfer, repair and teach-back, with their limits." },
] as const;
