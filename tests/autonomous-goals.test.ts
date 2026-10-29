import { restoreRepetitionBaseline } from './repetition-truth-baseline';
import { restoreDisagreementBaseline } from './disagreement-context-baseline';
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
import {restoreAutonomousBaseline,autonomousBoundaryNote,autonomousBoundaryHistory} from './autonomous-goals-baseline';
const hash=(x:unknown)=>createHash('sha256').update(JSON.stringify(restoreRepetitionBaseline(restoreDisagreementBaseline(x)))).digest('hex');
const c=content.claims.find(x=>x.id==='CL-action-planning-timing')!;
const ids=['R95','R96','R97'];
const escape=(x:string)=>x.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;');
test('autonomous-goal context reverses to the entire R94 public projection and all 120 assertions',()=>{
 assert.equal(content.claims.length,42);assert.equal(content.sources.length,125);assert.equal(content.models.length,4);assert.equal(evidenceAssertions.edges.length,180);
 assert.deepEqual(validateRelationships(),[]);assert.deepEqual(validateEvidenceAssertions(content),[]);
 assert.deepEqual(raw.sources.slice(94,97).map(x=>x.id),ids);
 const prior=structuredClone(raw);prior.sources=prior.sources.slice(0,94);
 assert.equal(hash(restoreAutonomousBaseline(prior)),'6790ea9041cb38430806e9c6dde14f40a522f8085917f4410be5964076b5b963');
 const oldEdges=structuredClone(assertionsRaw);oldEdges.edges=oldEdges.edges.slice(0,120);
 assert.equal(hash(oldEdges),'3dc2a7c2c8aa8c9dcdc435e85bf73fe0f58684b5718b575577ba5a332ab753ee');
 assert.equal(c.limitations[5],autonomousBoundaryNote);assert.deepEqual(c.history.at(-1),autonomousBoundaryHistory);
});
test('autonomous rollback rejects unauthorized structural changes and exposes other drift',()=>{
 const original=raw.claims.find(x=>x.id===c.id)!;
 for(const mutate of [(x:typeof original)=>x.limitations.push('extra'),(x:typeof original)=>x.limitations[5]='changed',(x:typeof original)=>x.sourceIds.push('R91'),(x:typeof original)=>x.contentVersion='1.2',(x:typeof original)=>x.history[1].change='changed']){const copy=structuredClone(original);mutate(copy);assert.throws(()=>restoreAutonomousBaseline(copy));}
 const copy=structuredClone(original);copy.statement='changed';assert.notEqual(hash(restoreAutonomousBaseline(copy)),hash(restoreAutonomousBaseline(original)));
});
test('three Study reports remain context-only to the goal-selection boundary, never R66 support',()=>{
 assert.deepEqual(evidenceAssertions.edges.slice(120,123).map(x=>x.sourceId),ids);
 for(const id of ids){
 const s=content.sources.find(x=>x.id===id)!;assert.equal(sourceType(s),'Study');assert.equal(s.retractionStatus,'unknown');
 const e=evidenceAssertions.edges.find(x=>x.sourceId===id)!;assert.equal(e.claimId,c.id);assert.equal(e.relation,'context');assert.equal(e.target,c.id+'.limitations[5]');assert.equal(evidenceTargetDescription(e.target,c),autonomousBoundaryNote);
 const r=claimRelationships(c).find(x=>x.sourceId===id)!;assert.equal(r.role,'context');assert.equal(r.assertions?.length,1);assert.equal(relationshipHasRole(r,'supports'),false);assert.equal(relationshipHasRole(r,'qualifies'),false);assert.ok(!content.models.some(m=>m.sourceIds.includes(id)));
 const html=renderToStaticMarkup(createElement(SourceAssertions,{relationship:r,claim:c}));assert.ok(html.includes(escape(autonomousBoundaryNote)));assert.doesNotMatch(html,/CL-action-planning-timing\.limitations/);
 }
 const r66=claimRelationships(c).find(x=>x.sourceId==='R66')!;assert.equal(relationshipHasRole(r66,'supports'),true);
 assert.equal(hash(assertionsRaw.edges.filter(x=>x.claimId===c.id&&x.sourceId==='R66')),'30eee80d6b22b0770f97443275dc6ae3b867eb3bc22da3457b1e2a6849869c6f');
});
test('goal-context source records retain self-report, nulls, denominators and numerical-integrity caveats',()=>{
 const [a,b,d]=ids.map(id=>content.sources.find(x=>x.id===id)!);
 assert.match(a.sampleSizeNote!,/at least six of eight/);assert.match(a.sampleSizeNote!,/reuse previously reported datasets/);assert.match(a.summary,/does not randomize goal choice/);
 assert.match(b.summary,/authors reported higher self-concordance ratings after reflection in a planned contrast/);assert.match(b.summary,/neither intervention demonstrated a one-month progress benefit/);assert.match(b.summary,/F\(1,55\)=3.53/);assert.match(b.summary,/not author-corrected results/);assert.match(b.summary,/not percentages of people with verified completion/);assert.match(b.sampleSizeNote!,/36 of 61/);
 assert.match(d.summary,/Without a neutral arm/);assert.match(d.summary,/Persistence interactions were not conventionally significant/);assert.match(d.summary,/not author corrections or evidence of fabrication/);assert.match(d.accessDepth!,/additional interaction flags from extracted text only/);
});
test('approved boundary adds no autonomous-goal efficacy claim, confidence upgrade or new practice',()=>{
 assert.match(autonomousBoundaryNote,/do not establish that selecting personally authentic goals improves sustained real-world completion/);
 assert.equal(c.contentVersion,'1.1');assert.equal(c.confidence,'limited');assert.equal(c.limitations.length,6);
 assert.equal(hash(restoreAutonomousBaseline(raw.claims.find(x=>x.id===c.id))),'cace15103e752f7f71751861ee03da3b6528f03ef42f1376d6c25f4d79938b41');
 assert.equal(c.reviewedAt,'2026-10-27');assert.equal(c.history.length,2);
});
