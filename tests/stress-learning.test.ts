import { restoreRepetitionBaseline } from './repetition-truth-baseline';
import { restoreDisagreementBaseline } from './disagreement-context-baseline';
import { restoreAutonomousBaseline } from './autonomous-goals-baseline';
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
import {restoreStressBaseline,stressBoundaryNote,stressBoundaryHistory} from './stress-learning-baseline';
const hash=(x:unknown)=>createHash('sha256').update(JSON.stringify(restoreRepetitionBaseline(restoreDisagreementBaseline(restoreAutonomousBaseline(x))))).digest('hex');
const c=content.claims.find(x=>x.id==='CL-retrieval-retention-transfer')!;
const ids=['R92','R93','R94'];
const escape=(x:string)=>x.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;');
test('stress context reverses to the entire prior R91 public projection and all117 assertions',()=>{
 assert.equal(content.claims.length,43);assert.equal(content.sources.length,126);assert.equal(content.models.length,4);assert.equal(evidenceAssertions.edges.length,183);
 assert.deepEqual(validateRelationships(),[]);assert.deepEqual(validateEvidenceAssertions(content),[]);
 assert.deepEqual(raw.sources.slice(91,94).map(x=>x.id),ids);
 const prior=structuredClone(raw);prior.sources=prior.sources.slice(0,91);
 assert.equal(hash(restoreStressBaseline(prior)),'77f47962a2b87215271b36935bfdd6a6f689c0ba69eee715e63be359e08f8723');
 const oldEdges=structuredClone(assertionsRaw);oldEdges.edges=oldEdges.edges.slice(0,117);
 assert.equal(hash(oldEdges),'e3091d3a15a1d6417fef3c7ab54df6634ce94bf00d61fe4e2673a0a06ecc018e');
 assert.equal(c.limitations[5],stressBoundaryNote);assert.deepEqual(c.history.at(-1),stressBoundaryHistory);
});
test('stress rollback rejects unauthorized changes instead of masking drift',()=>{
 const original=raw.claims.find(x=>x.id===c.id)!;
 for(const mutate of [(x:typeof original)=>x.limitations.push('extra'),(x:typeof original)=>x.limitations[5]='changed',(x:typeof original)=>x.sourceIds.push('R91'),(x:typeof original)=>x.contentVersion='1.3',(x:typeof original)=>x.history[2].change='changed']){const copy=structuredClone(original);mutate(copy);assert.throws(()=>restoreStressBaseline(copy));}
 const copy=structuredClone(original);copy.statement='changed';assert.notEqual(hash(restoreStressBaseline(copy)),hash(restoreStressBaseline(original)));
});
test('three primary reports are context-only to the added limitation, never retrieval-practice support',()=>{
 assert.deepEqual(evidenceAssertions.edges.slice(117,120).map(x=>x.sourceId),ids);
 for(const id of ids){
 const s=content.sources.find(x=>x.id===id)!;assert.equal(sourceType(s),'Study');assert.equal(s.retractionStatus,'unknown');
 const e=evidenceAssertions.edges.find(x=>x.sourceId===id)!;assert.equal(e.claimId,c.id);assert.equal(e.relation,'context');assert.equal(e.target,c.id+'.limitations[5]');assert.equal(evidenceTargetDescription(e.target,c),stressBoundaryNote);
 const r=claimRelationships(c).find(x=>x.sourceId===id)!;assert.equal(r.role,'context');assert.equal(r.assertions?.length,1);assert.equal(relationshipHasRole(r,'supports'),false);assert.equal(relationshipHasRole(r,'qualifies'),false);assert.ok(!content.models.some(m=>m.sourceIds.includes(id)));
 const html=renderToStaticMarkup(createElement(SourceAssertions,{relationship:r,claim:c}));assert.ok(html.includes(escape(stressBoundaryNote)));assert.doesNotMatch(html,/CL-retrieval-retention-transfer\.limitations/);
 }
});
test('stress source records retain bounded comparisons, denominators and replication target',()=>{
 const [p1,p2,p3]=ids.map(id=>content.sources.find(x=>x.id===id)!);
 assert.equal(p1.sampleSize,60);assert.match(p1.summary,/No simple-effect post-hoc contrasts/);assert.match(p1.summary,/descriptive observation rather than an equivalence test/);assert.match(p1.summary,/Inconsistent printed main-effect eta values are not used/);
 assert.equal(p2.sampleSize,48);assert.match(p2.summary,/Retrieval stress was not varied/);assert.match(p2.summary,/no unique cortisol mechanism/);assert.match(p2.summary,/acquisition cannot be separated from consolidation/);
 assert.equal(p3.sampleSize,33);assert.match(p3.sampleSizeNote!,/not 65 independent cases/);assert.match(p3.summary,/Bolton and Robinson \(2017\), not Robinson and Rollings’s mood-context report/);assert.match(p3.summary,/pooled across both tasks/);assert.match(p3.summary,/without corresponding behavioral improvement/);assert.match(p3.summary,/nonsignificance does not prove no effect/);
});
test('stress boundary remains a selected-studies caution, not a new practice or universal arousal rule',()=>{
 assert.match(stressBoundaryNote,/selected laboratory studies do not establish/);assert.match(stressBoundaryNote,/not a reason to induce distress/);assert.match(stressBoundaryNote,/classroom or broad-transfer benefits/);
 assert.equal(c.contentVersion,'1.2');assert.equal(c.confidence,'limited');assert.match(c.statement,/retrieval practice favored delayed recall/);assert.equal(c.limitations.length,6);
 const prior=restoreStressBaseline(raw.claims.find(x=>x.id===c.id)) as typeof raw.claims[number];assert.equal(prior.contentVersion,'1.1');assert.equal(prior.limitations.length,5);assert.ok(prior.sourceIds.includes('R90'));assert.ok(content.sources.some(x=>x.id==='R91'));
});
