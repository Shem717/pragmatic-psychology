import type { Draft } from '@/features/notebook-data';
import { makeDraft, hasMeaningfulDraftWork } from '@/features/notebook-model';
import type { Scenario } from './content';
import { patchPerspectiveField } from './perspective-scenarios';

/** Selecting an example changes only viewing metadata, never the user's written plan. */
export function selectObservatoryScenario(draft: Draft, scenarioId: string): Draft {
  return { ...draft, fields: { ...draft.fields, scenario: scenarioId, frame: '0', compareA: '0', compareB: '1', revealed: '', choice: '' } };
}
export function editObservatoryField(draft: Draft, scenarioId: string, field: string, value: string): Draft {
  return patchPerspectiveField(draft, scenarioId, field, value);
}
export function observatoryTransferError(draft: Draft | undefined, unavailable = false): string | null {
  if (!draft) return 'Your working record is still loading. Please wait before continuing.';
  if (unavailable) return 'The saved example is unavailable. Choose a current example deliberately or open the full Rolodex; your notes have not been replaced.';
  if (draft.fields.personal === 'yes' && (!draft.fields.situation?.trim() || !draft.fields.facts?.trim())) return 'Describe your situation and what you actually observed before continuing. Unknowns may remain unknown.';
  if (!draft.fields.action?.trim()) return 'Name one observable, feasible action before continuing.';
  if (!draft.fields.prediction?.trim()) return 'Add a prediction you can check. Uncertainty is allowed; do not invent confidence.';
  if (!draft.fields.switchWhen?.trim()) return 'Name what would make you revise, stop or seek support before continuing.';
  return null;
}
export type ExistingIdentityEntry = { draft: Draft; persisted: boolean; dirty: boolean };
export function identityHandoffPolicy(entry: ExistingIdentityEntry | undefined, storageReady: boolean): 'wait' | 'save-existing' | 'ready' {
  if (!storageReady) return 'wait';
  if (entry && hasMeaningfulDraftWork(entry.draft) && (!entry.persisted || entry.dirty)) return 'save-existing';
  return 'ready';
}
/** A new ID preserves every earlier saved identity record; no storage is written here. */
export function buildObservatoryIdentityDraft(perspective: Draft, scenario: Scenario, lensIndex: number): Draft {
  const error = observatoryTransferError(perspective);
  if (error) throw new Error(error);
  if (!Number.isInteger(lensIndex) || lensIndex < 0 || lensIndex >= scenario.frames.length) throw new RangeError('Unknown perspective lens.');
  const personal = perspective.fields.personal === 'yes';
  const lens = scenario.frames[lensIndex];
  const draft = makeDraft('identity', 'Action plan from the Observatory');
  draft.fields = {
    identity: perspective.fields.action,
    action: perspective.fields.action,
    situation: personal ? perspective.fields.situation : scenario.title,
    prediction: perspective.fields.prediction,
    criterion: perspective.fields.switchWhen,
    source: 'Observatory telescope',
    sourceScenario: scenario.id,
    sourceFrame: lens.id,
    sourceFacts: personal ? perspective.fields.facts : scenario.facts.join('\n'),
    sourceUnknowns: personal ? perspective.fields.unknowns || '' : scenario.unknowns.join('\n'),
    sourceContext: personal ? 'Personal situation; the selected example lens was an illustration, not an assessment of this person or situation.' : 'Fictional educational example; the selected lens is a hypothesis, not established motive or evidence of effectiveness.',
  };
  return draft;
}
