import test from 'node:test';
import assert from 'node:assert/strict';
import { makeDraft } from '../features/notebook-model';
import { parseImport, serialize } from '../features/notebook-data';
import { content } from '../lib/content';
import { relationalScenarios } from '../lib/relational-scenarios';
import { resolvePerspectiveScenario } from '../lib/perspective-scenarios';
import { buildObservatoryIdentityDraft, editObservatoryField, identityHandoffPolicy, observatoryTransferError, selectObservatoryScenario } from '../lib/observatory-workflow';

test('telescope selection and editing preserve authored notes and legacy scenario identity',()=>{
  const draft=makeDraft('perspective','Earlier work');draft.fields={action:'My earlier action',prediction:'An earlier prediction',switchWhen:'An earlier limit',facts:'My facts',choice:'old-scenario-frame'};
  const resolution=resolvePerspectiveScenario(draft,relationalScenarios,content.scenarios);
  assert.equal(resolution.kind,'legacy');
  const edited=editObservatoryField(draft,resolution.scenario.id,'frame','2');
  assert.equal(edited.fields.scenario,content.scenarios[0].id);assert.equal(edited.fields.action,draft.fields.action);
  const selected=selectObservatoryScenario(edited,relationalScenarios[2].id);
  assert.equal(selected.fields.action,draft.fields.action);assert.equal(selected.fields.facts,draft.fields.facts);assert.equal(selected.fields.frame,'0');assert.equal(selected.fields.choice,'');
  assert.equal(resolvePerspectiveScenario(selected,relationalScenarios,content.scenarios).kind,'current');
  assert.equal(draft.fields.scenario,undefined);
});
test('handoff creates a new compatible identity record with source facts and no synthetic observations',()=>{
  const perspective=makeDraft('perspective','Telescope');perspective.fields={action:'Ask one clear question',prediction:'I may receive clarification',switchWhen:'Stop if pressure continues'};
  const previous=makeDraft('identity','Earlier plan');previous.fields={identity:'Earlier capability',action:'Earlier action'};
  const snapshot=structuredClone(previous);
  const result=buildObservatoryIdentityDraft(perspective,relationalScenarios[0],2);
  assert.notEqual(result.id,previous.id);assert.notEqual(result.id,perspective.id);assert.deepEqual(previous,snapshot);
  assert.equal(result.fields.action,perspective.fields.action);assert.equal(result.fields.criterion,perspective.fields.switchWhen);assert.equal(result.fields.sourceScenario,relationalScenarios[0].id);assert.equal(result.fields.sourceFrame,relationalScenarios[0].frames[2].id);assert.deepEqual(result.observations,[]);
  assert.deepEqual(parseImport(serialize([previous,result])),[previous,result]);
});
test('custom context stays separate from illustrative lenses and transfer requires an actionable revision plan',()=>{
  const draft=makeDraft('perspective','Personal');draft.fields={personal:'yes',situation:'My situation',facts:'What I observed',unknowns:'Their reason',action:'Ask',prediction:'I may learn more',switchWhen:'Stop if asked'};
  assert.equal(observatoryTransferError(draft),null);
  const result=buildObservatoryIdentityDraft(draft,relationalScenarios[1],0);
  assert.equal(result.fields.situation,'My situation');assert.equal(result.fields.sourceFacts,'What I observed');assert.match(result.fields.sourceContext,/illustration, not an assessment/);
  for(const field of ['action','prediction','switchWhen','facts','situation'])assert.ok(observatoryTransferError({...draft,fields:{...draft.fields,[field]:''}}));
  assert.ok(observatoryTransferError(draft,true));assert.throws(()=>buildObservatoryIdentityDraft(draft,relationalScenarios[0],99),RangeError);
});
test('safe handoff blocks loading races and requires saving meaningful unsaved or dirty prior plans',()=>{
  const draft=makeDraft('identity','Earlier plan');draft.fields={identity:'A capability'};
  assert.equal(identityHandoffPolicy(undefined,false),'wait');
  assert.equal(identityHandoffPolicy({draft,persisted:false,dirty:true},true),'save-existing');
  assert.equal(identityHandoffPolicy({draft,persisted:true,dirty:true},true),'save-existing');
  assert.equal(identityHandoffPolicy({draft,persisted:true,dirty:false},true),'ready');
  const blank=makeDraft('identity','Empty');blank.fields={stage:'0'};
  assert.equal(identityHandoffPolicy({draft:blank,persisted:false,dirty:false},true),'ready');
});
