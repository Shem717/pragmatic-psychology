import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { makeDraft, parseImport, serialize } from '../features/notebook-data';
import { hasMeaningfulDraftWork } from '../features/notebook-model';
import { activatePerspectiveEntry, chamberFields, chosenPerspectiveLabel, hasChamberWork } from '../lib/perspective-records';
import { settleRecordSave, type WorkspaceEntry } from '../lib/workspace-records';
import { notebookFieldLabel } from '../lib/supporting-practice-records';
import { content } from '../lib/content';
import { relationalScenarios } from '../lib/relational-scenarios';
import { resolvePerspectiveScenario } from '../lib/perspective-scenarios';

const entry = (name: string, persisted = false): WorkspaceEntry => ({ draft: { ...makeDraft('perspective', name), fields: { action: name, scenario: relationalScenarios[0].id } }, persisted, dirty: true, status: persisted ? 'Saving changes…' : 'Not saved' });

test('separate cases keep old UUID, fields, observations and persistence state without mixing', () => {
  const previous = entry('Earlier action'); previous.draft.fields.unknown_extension = 'Keep unknown data';
  previous.draft.observations = [{ id: 'old-observation', date: previous.draft.createdAt, type: 'imagined', outcome: 'inconclusive', prediction: 'Old prediction', actual: 'Old observation', context: 'Old context', unintended: 'Old effect' }];
  const identity = { ...entry('Identity untouched'), draft: makeDraft('identity', 'Existing identity') };
  const next = entry('New action'); next.draft.fields.scenario = relationalScenarios[1].id;
  const original = structuredClone(previous);
  const changed = activatePerspectiveEntry({ perspective: previous, identity }, next);
  assert.equal(changed.perspective, next);
  assert.deepEqual(changed[`perspective-case-${previous.draft.id}`], original);
  assert.equal(changed.identity, identity);
  assert.equal(changed.perspective.persisted, false);
  assert.equal(changed.perspective.draft.fields.unknown_extension, undefined);
  assert.equal(changed.perspective.draft.observations.length, 0);
  assert.deepEqual(parseImport(serialize(Object.values(changed).map((item) => item.draft))), Object.values(changed).map((item) => item.draft));
});

test('resuming a previous case removes duplicate UUIDs and preserves the case being left', () => {
  const a = entry('A'), b = entry('B', true);
  const first = activatePerspectiveEntry({ perspective: a }, b);
  const resumed = activatePerspectiveEntry(first, a);
  assert.equal(resumed.perspective, a);
  assert.equal(resumed[`perspective-case-${b.draft.id}`], b);
  assert.equal(Object.values(resumed).filter((item) => item.draft.id === a.draft.id).length, 1);
  assert.equal(Object.values(resumed).filter((item) => item.draft.id === b.draft.id).length, 1);
});

test('an in-flight save settles the archived UUID, never the new unsaved active case', async () => {
  const a = entry('A'), b = entry('B');
  let entries: Record<string, WorkspaceEntry> = { perspective: a };
  let finish!: () => void;
  const storage = new Promise<void>((resolve) => { finish = resolve; });
  const save = storage.then(() => { entries = settleRecordSave(entries, a.draft); });
  entries = activatePerspectiveEntry(entries, b);
  finish(); await save;
  assert.equal(entries.perspective, b);
  assert.equal(entries.perspective.persisted, false);
  assert.equal(entries.perspective.status, 'Not saved');
  assert.equal(entries[`perspective-case-${a.draft.id}`].persisted, true);
  assert.equal(entries[`perspective-case-${a.draft.id}`].dirty, false);
});

test('in-flight errors follow their UUID; forgotten records are not recreated', () => {
  const a = entry('A'), b = entry('B');
  const switched = activatePerspectiveEntry({ perspective: a }, b);
  const failed = settleRecordSave(switched, a.draft, 'Device storage unavailable');
  assert.equal(failed.perspective, b);
  assert.equal(failed[`perspective-case-${a.draft.id}`].persisted, false);
  assert.equal(failed[`perspective-case-${a.draft.id}`].status, 'Device storage unavailable');
  const forgotten = { perspective: b };
  assert.equal(settleRecordSave(forgotten, a.draft), forgotten);
  assert.equal(settleRecordSave(forgotten, a.draft, 'Failed'), forgotten);
});

test('edits during a save remain dirty and eligible for later autosave even in the same millisecond', () => {
  const a = entry('A');
  const edited = { ...a, draft: { ...a.draft, fields: { ...a.draft.fields, action: 'Newer action' } } };
  const settled = settleRecordSave({ perspective: edited }, a.draft).perspective;
  assert.equal(settled.draft.fields.action, 'Newer action');
  assert.equal(settled.persisted, true);
  assert.equal(settled.dirty, true);
  assert.equal(settled.status, 'Saving changes…');
});

test('all new optional chamber fields trigger unsaved protection and have readable export labels', () => {
  for (const key of Object.keys(chamberFields)) {
    const draft = makeDraft('perspective', 'Optional field'); draft.fields[key] = 'Synthetic work';
    assert.equal(hasChamberWork(draft.fields), true, key);
    assert.equal(hasMeaningfulDraftWork(draft), true, key);
    assert.equal(notebookFieldLabel(key), chamberFields[key]);
    assert.deepEqual(parseImport(serialize([draft])), [draft]);
  }
  assert.equal(hasChamberWork({ scenario: 'REL-test', frame: '1', personal: 'yes' }), false);
});

test('viewing a frame is not choosing it; personal cases never adopt a fictional response label', () => {
  const frames = relationalScenarios[0].frames;
  assert.equal(chosenPerspectiveLabel({ frame: '1' }, frames), 'Not chosen');
  assert.equal(chosenPerspectiveLabel({ choice: frames[1].id }, frames), frames[1].name);
  assert.equal(chosenPerspectiveLabel({ personal: 'yes', choice: frames[1].id }, frames), 'Not chosen');
  assert.equal(chosenPerspectiveLabel({ personal: 'yes', choice: 'own-1' }, frames), 'Another explanation');
});

test('every earlier scenario and ID-less note retains its original resolution and full round-trip', () => {
  for (const scenario of [...content.scenarios, ...relationalScenarios]) {
    const draft = makeDraft('perspective', 'Retained'); draft.fields = { scenario: scenario.id, action: 'Unchanged', threat: 'substantial', choice: scenario.frames[0].id, custom: 'Unknown preserved field' };
    assert.equal(resolvePerspectiveScenario(parseImport(serialize([draft]))[0], relationalScenarios, content.scenarios).scenario.id, scenario.id);
  }
  const previous = makeDraft('perspective', 'Old default'); previous.fields = { action: 'Old work' };
  assert.equal(resolvePerspectiveScenario(previous, relationalScenarios, content.scenarios).scenario.id, 'SC-criticism');
});

test('chamber contract has five freely navigable stages, safe exit, no identity transfer and optional source context before writing', () => {
  const source = readFileSync('features/Perspectives.tsx', 'utf8');
  assert.match(source, /label: 'Situation'[\s\S]*label: 'Facts & meaning'[\s\S]*label: 'Perspectives'[\s\S]*label: 'Next response'[\s\S]*label: 'Revisit'/);
  assert.match(source, /aria-current=\{stage === index \? 'step'/);
  assert.match(source, /router\.push\('\/'\)\}>Leave the exercise now/);
  assert.doesNotMatch(source, /setDraft\("identity"|getDraft\("identity"|router\.push\("\/explore\/identity/);
  assert.ok(source.indexOf('A FICTIONAL MOMENT') < source.indexOf('Optional · the ideas behind this exercise'));
  assert.ok(source.indexOf('Optional · the ideas behind this exercise') < source.indexOf("field('situation'"));
  assert.match(source, /sourceContext\.anchors\.map/);
  assert.match(source, /Leaving does not erase notes, browsing history or other traces/);
  assert.match(source, /focusWorkingHeading\(stageHeading\.current\)/);
  const css = readFileSync('features/perspective-chamber/Chamber.module.css', 'utf8');
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /max-width: 900px/);
  assert.match(css, /pointer-events: none/);
});


test('unavailable examples use neutral ledger attribution rather than the fallback scenario', () => {
  const source = readFileSync('features/Perspectives.tsx', 'utf8');
  assert.match(source, /const context = resolution.kind === 'current'/);
  assert.match(source, /resolution.kind === 'unavailable' \? 'Saved case · example unavailable'/);
  assert.match(source, /const chosenLabel = resolution.kind === 'unavailable'/);
  assert.match(source, /resolution.kind !== 'unavailable' && context\?\.resources/);
});


test('working heading focus scrolls into view and ledger overrides global two-column definition lists', () => {
  const source = readFileSync('features/Perspectives.tsx', 'utf8');
  assert.match(source, /heading\.focus\(\{ preventScroll: true \}\)/);
  assert.match(source, /heading\.scrollIntoView\(\{ block: 'start', behavior: 'auto' \}\)/);
  const css = readFileSync('features/perspective-chamber/Chamber.module.css', 'utf8');
  assert.match(css, /\.ledger dl \{ display: block;/);
  assert.match(css, /\.responseCard dl \{ display: block;/);
  assert.doesNotMatch(css, /\.ledger dd[^}]*overflow-y/);
  assert.match(css, /scroll-margin-top: 24px/);
});
