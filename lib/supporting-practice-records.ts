import { chamberFieldLabel } from './perspective-records';
import { supportingPractices } from './supporting-practices';
import { learningPathFieldLabel, learningPathRecordSummary, pathFieldKey, pathRecordFields, PILOT_DISCIPLINE, PILOT_PATH_SLUG } from './learning-path-records';

/** Fields extend an existing discipline record; IDs and schema versions do not change. */
export function supportingPracticeFieldKey(practiceId: string, fieldKey: string) {
  return `practice_${practiceId}_${fieldKey}`;
}
export function isSupportingPracticeField(key: string) {
  return supportingPractices.some((practice) => practice.fields.some((field) => supportingPracticeFieldKey(practice.id, field.key) === key));
}
export function notebookFieldLabel(key: string) {
  if (key === 'learningLocation') return 'Resume activity and step';
  for (const practice of supportingPractices) {
    const field = practice.fields.find((field) => supportingPracticeFieldKey(practice.id, field.key) === key);
    if (field) return `${practice.title} — ${field.label}`;
  }
  return learningPathFieldLabel(key) ?? chamberFieldLabel(key) ?? key;
}
export function learningResumeHref(fields: Record<string, string>) {
  const disciplineHref = `/learn/curriculum/${fields.discipline}`;
  if (fields.discipline !== PILOT_DISCIPLINE || fields.learningLocation === 'discipline') return disciplineHref;
  const savedStep = /^reflection-step-([1-6])$/.exec(fields.learningLocation || '')?.[1];
  const firstWritten = pathRecordFields.find(({ key }) => fields[pathFieldKey(key)]?.trim());
  const step = savedStep || firstWritten?.stage;
  return step ? `/learn/paths/${PILOT_PATH_SLUG}/#reflection-step-${step}` : disciplineHref;
}
export function learningRecordSummary(fields: Record<string, string>) {
  if (fields.learningLocation?.startsWith('reflection-step-')) {
    const reflection = learningPathRecordSummary(fields);
    if (reflection) return reflection;
  }
  if (fields.note?.trim()) return fields.note;
  for (const practice of supportingPractices.filter((item) => item.discipline === fields.discipline)) {
    const recorded = practice.fields.map((field) => fields[supportingPracticeFieldKey(practice.id, field.key)]).find((value) => value?.trim());
    if (recorded) return `${practice.title}: ${recorded.slice(0, 180)}${recorded.length > 180 ? '…' : ''}`;
  }
  return learningPathRecordSummary(fields) ?? 'Working draft';
}
