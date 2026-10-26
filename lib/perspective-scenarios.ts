import type { Scenario } from './content';
import type { Draft } from '@/features/notebook-data';

/** Old default examples were saved without an ID. Never relabel their work. */
export function resolvePerspectiveScenario(draft: Draft | undefined, current: Scenario[], legacy: Scenario[]) {
  const id = draft?.fields.scenario;
  if (id) {
    const scenario = current.find((item) => item.id === id);
    if (scenario) return { scenario, kind: 'current' as const };
    const previous = legacy.find((item) => item.id === id);
    if (previous) return { scenario: previous, kind: 'legacy' as const };
    return { scenario: current[0], kind: 'unavailable' as const };
  }
  const hasEarlierState = draft && (Object.keys(draft.fields).length > 0 || draft.observations.length > 0);
  return hasEarlierState
    ? { scenario: legacy[0], kind: 'legacy' as const }
    : { scenario: current[0], kind: 'current' as const };
}

/** Pin the visible example on first edit; preserve all unrelated saved fields. */
export function patchPerspectiveField(draft: Draft, selectedId: string, field: string, value: string): Draft {
  return { ...draft, fields: { ...draft.fields, scenario: draft.fields.scenario || selectedId, [field]: value } };
}
