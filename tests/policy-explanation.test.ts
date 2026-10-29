import { restoreRepetitionBaseline } from './repetition-truth-baseline';
import { restoreDisagreementBaseline } from './disagreement-context-baseline';
import { restoreAutonomousBaseline } from './autonomous-goals-baseline';
import { restoreStressBaseline } from './stress-learning-baseline';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import raw from '../content/public.json';
import assertionsRaw from '../content/evidence-assertions.json';
import {content,validateRelationships} from '../lib/content';
import {claimRelationships,sourceType,relationshipHasRole} from '../lib/evidence';
import {evidenceAssertions,evidenceTargetDescription,validateEvidenceAssertions} from '../lib/evidence-assertions';
import {restoreCalibrationBaseline,policyBoundaryNote,policyBoundaryHistory} from './policy-explanation-baseline';
const hash=(x:unknown)=>createHash('sha256').update(JSON.stringify(restoreRepetitionBaseline(restoreDisagreementBaseline(restoreAutonomousBaseline(x))))).digest('hex');
const c=content.claims.find(x=>x.id==='CL-calibration-training-boundaries')!;
const s=content.sources.find(x=>x.id==='R91')!;
const e=evidenceAssertions.edges[116];
test('policy context append reverses to exact prior full public projection and all 116 assertions',()=>{
 assert.equal(content.claims.length,42);assert.equal(content.sources.length,125);assert.equal(content.models.length,4);assert.equal(evidenceAssertions.edges.length,180);
 assert.deepEqual(validateRelationships(),[]);assert.deepEqual(validateEvidenceAssertions(content),[]);
 assert.equal(hash(raw.sources[90]),'505badf2c4aad616904aaabd3e7e43998e3c845c075eee0df141e4d916bc2cef');assert.equal(hash(assertionsRaw.edges[116]),'38eaa61dd617e3f9688c183529147baac103cf761964b775a34371f1d3de143f');
 const prior=structuredClone(raw);prior.sources=prior.sources.slice(0,90);assert.equal(hash(restoreCalibrationBaseline(restoreStressBaseline(prior))),'41c71ef522d565164fff6da14e9c242c768fdc3ba44b3938bf85c3ea35844414');
 const edges=structuredClone(assertionsRaw);edges.edges=edges.edges.slice(0,116);assert.equal(hash(edges),'01a2068d3cd7224fbedf179c6de14d85ad79dedf3e89c0a61cfefbe5bcc32869');
 assert.equal(c.limitations[6],policyBoundaryNote);assert.deepEqual(c.history.at(-1),policyBoundaryHistory);
});
test('policy baseline reversal rejects drift in each permitted field and never masks a statement change',()=>{
 const original=raw.claims.find(x=>x.id===c.id)!;
 for(const mutate of [(x:typeof original)=>x.limitations.push('extra'),(x:typeof original)=>x.limitations[6]='changed',(x:typeof original)=>x.sourceIds.push('R90'),(x:typeof original)=>x.contentVersion='1.2',(x:typeof original)=>x.history[1].change='changed']){const copy=structuredClone(original);mutate(copy);assert.throws(()=>restoreCalibrationBaseline(copy));}
 const copy=structuredClone(original);copy.statement='changed';assert.notEqual(hash(restoreCalibrationBaseline(copy)),hash(restoreCalibrationBaseline(original)));
});
test('R91 context targets only adjacent calibration limitation and is never training efficacy support',()=>{
 assert.equal(e.claimId,c.id);assert.equal(e.sourceId,'R91');assert.equal(e.relation,'context');assert.equal(e.target,c.id+'.limitations[6]');assert.equal(evidenceTargetDescription(e.target,c),policyBoundaryNote);
 const r=claimRelationships(c).find(x=>x.sourceId==='R91')!;assert.equal(r.role,'context');assert.equal(r.assertions?.length,1);assert.equal(relationshipHasRole(r,'supports'),false);assert.equal(relationshipHasRole(r,'qualifies'),false);
 assert.ok(!content.models.some(m=>m.sourceIds.includes('R91')));assert.equal(sourceType(s),'Study');
 assert.match(policyBoundaryNote,/not evidence for the training interventions/);assert.match(policyBoundaryNote,/did not measure objectively calibrated understanding/);
});
test('policy report retains denominator, replication and outcome boundaries',()=>{
 assert.equal(s.sampleSize,1020);assert.equal(s.year,2021);assert.equal(s.url,'https://doi.org/10.1177/0956797620972367');assert.equal(s.retractionStatus,'unknown');
 assert.match(s.sampleSizeNote!,/679/);assert.match(s.sampleSizeNote!,/1020 is not a pooled outcome denominator/);assert.match(s.sampleSizeNote!,/not three independent research teams/);
 assert.match(s.summary,/did not reproduce/);assert.match(s.summary,/nonsignificance is not proof of universal absence/);assert.match(s.accessDepth,/not independently audited/);assert.match(s.summary,/do not establish objective calibration or durable depolarization/);
});
