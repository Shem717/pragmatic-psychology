import { restoreRepetitionBaseline } from './repetition-truth-baseline';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import raw from '../content/public.json';
import assertionsRaw from '../content/evidence-assertions.json';
import {content,validateRelationships} from '../lib/content';
import {claimRelationships,sourceType,relationshipHasRole} from '../lib/evidence';
import {evidenceAssertions,evidenceTargetDescription,validateEvidenceAssertions} from '../lib/evidence-assertions';
import {SourceAssertions} from '../components/evidence/SourceAssertions';
import {restoreDisagreementBaseline,disagreementBoundaryNote,disagreementBoundaryHistory} from './disagreement-context-baseline';
const hash=(x:unknown)=>createHash('sha256').update(JSON.stringify(restoreRepetitionBaseline(x))).digest('hex');
const c=content.claims.find(x=>x.id==='CL-expression-experience')!;
const ids=['R98','R99'];
const escape=(x:string)=>x.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;');
test('disagreement context exactly restores all R97 public content and 123 prior assertions',()=>{
 assert.equal(content.claims.length,44);assert.equal(content.sources.length,131);assert.equal(content.models.length,4);assert.equal(evidenceAssertions.edges.length,196);
 assert.deepEqual(validateRelationships(),[]);assert.deepEqual(validateEvidenceAssertions(content),[]);
 assert.deepEqual(raw.sources.slice(97,99).map(x=>x.id),ids);
 const prior=structuredClone(raw);prior.sources=prior.sources.slice(0,97);
 assert.equal(hash(restoreDisagreementBaseline(prior)),'1f5e0034f31804df88a148a75435691c4d1b3da4b664c0cc5c1132700bd92f63');
 const oldEdges=structuredClone(assertionsRaw);oldEdges.edges=oldEdges.edges.slice(0,123);
 assert.equal(hash(oldEdges),'43f894661e7cdb577e498a3fec8a4215b2f6ce2ac18e0af57ddc6ac30bf6df14');
 assert.equal(c.limitations[3],disagreementBoundaryNote);assert.deepEqual(c.history.at(-1),disagreementBoundaryHistory);
});
test('disagreement rollback rejects structural drift and leaves unrelated changes visible',()=>{
 const original=raw.claims.find(x=>x.id===c.id)!;
 for(const mutate of [(x:typeof original)=>x.limitations.push('extra'),(x:typeof original)=>x.limitations[3]='changed',(x:typeof original)=>x.sourceIds.push('R97'),(x:typeof original)=>x.contentVersion='1.2',(x:typeof original)=>x.history[1].change='changed']){const copy=structuredClone(original);mutate(copy);assert.throws(()=>restoreDisagreementBaseline(copy));}
 const copy=structuredClone(original);copy.statement='changed';assert.notEqual(hash(restoreDisagreementBaseline(copy)),hash(restoreDisagreementBaseline(original)));
});
test('two Study records map only to adjacent context, not suppression support or model efficacy',()=>{
 assert.deepEqual(evidenceAssertions.edges.slice(123,125).map(x=>x.sourceId),ids);
 for(const id of ids){
 const s=content.sources.find(x=>x.id===id)!;assert.equal(sourceType(s),'Study');assert.equal(s.retractionStatus,'unknown');
 const e=evidenceAssertions.edges.find(x=>x.sourceId===id)!;assert.equal(e.claimId,c.id);assert.equal(e.relation,'context');assert.equal(e.target,c.id+'.limitations[3]');assert.equal(evidenceTargetDescription(e.target,c),disagreementBoundaryNote);
 const r=claimRelationships(c).find(x=>x.sourceId===id)!;assert.equal(r.role,'context');assert.equal(r.assertions?.length,1);assert.equal(relationshipHasRole(r,'supports'),false);assert.equal(relationshipHasRole(r,'qualifies'),false);assert.ok(!content.models.some(m=>m.sourceIds.includes(id)));
 const html=renderToStaticMarkup(createElement(SourceAssertions,{relationship:r,claim:c}));assert.ok(html.includes(escape(disagreementBoundaryNote)));assert.doesNotMatch(html,/CL-expression-experience\.limitations/);
 }
 assert.deepEqual(claimRelationships(c).filter(r=>relationshipHasRole(r,'supports')).map(r=>r.sourceId),['R61','R62']);
});
test('rating endpoints, package comparator, selection and lineage remain explicit without held claims',()=>{
 const [a,b]=ids.map(id=>content.sources.find(x=>x.id===id)!);
 assert.equal(a.sampleSize,253);assert.match(a.summary,/Actual defensive behavior was not measured/);assert.match(a.summary,/more than pronouns alone/);
 assert.equal(b.sampleSize,null);assert.match(b.sampleSizeNote!,/771 final writers and 1,548 raters/);assert.match(b.sampleSizeNote!,/17.2% versus 12.6%/);assert.match(b.summary,/comparator was unrelated reading and natural response/);assert.match(b.summary,/later reuse of its data is not independent replication/);
 assert.doesNotMatch(JSON.stringify([a,b]),/53\.6|51\.6|55\.6|60\.3|2024|5897c9a7/);
});
test('exact reviewer note retains non-prescriptive safety and no confidence or practice upgrade',()=>{
 assert.match(disagreementBoundaryNote,/Neither study establishes that replacing “always” or “never,” describing a behavior specifically/);
 assert.match(disagreementBoundaryNote,/not demonstrated understanding or prevention of escalation/);
 assert.match(disagreementBoundaryNote,/do not create an obligation to disclose feelings, explain a boundary, hedge a refusal, remain in danger or manage another person's aggression/);
 assert.match(disagreementBoundaryNote,/not remedies for coercion or abuse/);
 assert.equal(c.contentVersion,'1.1');assert.equal(c.confidence,'limited');assert.equal(c.limitations.length,4);assert.equal(c.reviewedAt,'2026-10-27');
 assert.equal(hash(restoreDisagreementBaseline(raw.claims.find(x=>x.id===c.id))),'e473e2257cee84b68ac83ac3dd34a9519e0f22ed5b4f71cba86beb1718e11bf5');
});
