import test from 'node:test';
import assert from 'node:assert/strict';
import { content, publicSchema } from '../lib/content';
import { relationalScenarios } from '../lib/relational-scenarios';
import { resolvePerspectiveScenario, patchPerspectiveField } from '../lib/perspective-scenarios';
import { makeDraft, parseImport, serialize } from '../features/notebook-data';

test('seven original relational examples have complete four-lens workflows and distinct IDs', () => {
  assert.equal(relationalScenarios.length,7);
  assert.equal(new Set(relationalScenarios.map((scenario)=>scenario.id)).size,7);
  for(const scenario of relationalScenarios) {
    assert.ok(publicSchema.shape.scenarios.element.safeParse(scenario).success);
    assert.equal(scenario.frames.length,4);
    assert.equal(new Set(scenario.frames.map((frame)=>frame.id)).size,4);
    assert.ok(!content.scenarios.some((legacy)=>legacy.id===scenario.id));
    assert.match(scenario.id,/^REL-/);
    assert.ok(scenario.group && scenario.interpretation && scenario.emotionUrge);
    assert.ok(scenario.facts.length && scenario.unknowns.length && scenario.evidenceUpdates.length);
    for(const frame of scenario.frames) assert.ok(frame.action && frame.switchWhen && frame.ethicalBoundary && frame.supports.length && frame.challenges.length);
    for(const id of scenario.relatedClaimIds) assert.ok(content.claims.some((claim)=>claim.id===id));
  }
  assert.equal(content.scenarios.length,6);
  assert.equal(content.videos.length,7);
  assert.doesNotMatch(JSON.stringify(relationalScenarios),/reddit\.com|mumsnet\.com|u\//);
  assert.ok(relationalScenarios.some((scenario)=>scenario.resources?.some((resource)=>resource.href.includes('nqWsMb06W0I'))));
});

test('all legacy scenario IDs resolve to their unchanged original definitions after import', () => {
  for(const legacy of content.scenarios) {
    const draft=makeDraft('perspective','Earlier exploration');
    draft.fields={scenario:legacy.id,frame:'2',choice:legacy.frames[2].id,action:'Keep my earlier action',prediction:'Earlier prediction'};
    const restored=parseImport(serialize([draft]))[0];
    const result=resolvePerspectiveScenario(restored,relationalScenarios,content.scenarios);
    assert.equal(result.kind,'legacy');assert.deepEqual(result.scenario,legacy);
    assert.deepEqual(restored,draft);
  }
});

test('ID-less earlier default drafts retain Criticism; new drafts select relational default and pin it on first edit', () => {
  const earlier=makeDraft('perspective','Earlier default');earlier.fields={frame:'1',action:'My original work'};
  const result=resolvePerspectiveScenario(earlier,relationalScenarios,content.scenarios);
  assert.equal(result.kind,'legacy');assert.equal(result.scenario.id,'SC-criticism');
  const edited=patchPerspectiveField(earlier,result.scenario.id,'prediction','A later prediction');
  assert.equal(edited.fields.scenario,'SC-criticism');assert.equal(edited.fields.action,'My original work');
  const fresh=makeDraft('perspective','Fresh');
  const current=resolvePerspectiveScenario(fresh,relationalScenarios,content.scenarios);
  assert.equal(current.kind,'current');
  const newEdited=patchPerspectiveField(fresh,current.scenario.id,'action','A new relational action');
  assert.equal(newEdited.fields.scenario,relationalScenarios[0].id);
  assert.equal(resolvePerspectiveScenario(newEdited,relationalScenarios,content.scenarios).kind,'current');
  assert.deepEqual(parseImport(serialize([newEdited])),[newEdited]);
  assert.deepEqual(fresh.fields,{});
});

test('unavailable IDs are flagged rather than silently assigned; deliberate new selection preserves authored fields', () => {
  const draft=makeDraft('perspective','Unknown edition');draft.fields={scenario:'future-example',situation:'Private situation',action:'Preserved action'};
  assert.equal(resolvePerspectiveScenario(draft,relationalScenarios,content.scenarios).kind,'unavailable');
  const changed=patchPerspectiveField(draft,relationalScenarios[0].id,'scenario',relationalScenarios[1].id);
  assert.equal(changed.fields.scenario,relationalScenarios[1].id);
  assert.equal(changed.fields.situation,draft.fields.situation);assert.equal(changed.fields.action,draft.fields.action);
  assert.equal(changed.id,draft.id);assert.equal(changed.schemaVersion,1);
});
