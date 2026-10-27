import { chamberFieldLabel } from './perspective-records';
import { supportingPractices } from './supporting-practices';
import { learningPathFieldLabel, learningPathRecordSummary } from './learning-path-records';

/** Fields extend an existing discipline record; IDs and schema versions do not change. */
export function supportingPracticeFieldKey(practiceId: string, fieldKey: string) {
  return `practice_${practiceId}_${fieldKey}`;
}
export function isSupportingPracticeField(key: string) {
  return supportingPractices.some((practice) => practice.fields.some((field) => supportingPracticeFieldKey(practice.id, field.key) === key));
}
export function notebookFieldLabel(key: string) {
  for (const practice of supportingPractices) {
    const field = practice.fields.find((field) => supportingPracticeFieldKey(practice.id, field.key) === key);
    if (field) return `${practice.title} — ${field.label}`;
  }
  return learningPathFieldLabel(key) ?? chamberFieldLabel(key) ?? key;
}
export function learningRecordSummary(fields: Record<string, string>) {
  if (fields.note?.trim()) return fields.note;
  for (const practice of supportingPractices.filter((item) => item.discipline === fields.discipline)) {
    const recorded = practice.fields.map((field) => fields[supportingPracticeFieldKey(practice.id, field.key)]).find((value) => value?.trim());
    if (recorded) return `${practice.title}: ${recorded.slice(0, 180)}${recorded.length > 180 ? '…' : ''}`;
  }
  return learningPathRecordSummary(fields) ?? 'Working draft';
}
