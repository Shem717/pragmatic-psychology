import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import raw from '../content/public.json';
import edges from '../content/evidence-assertions.json';
import taxonomy from '../content/evidence-taxonomy.json';
import {content,validateRelationships} from '../lib/content';
import {validateEvidenceAssertions} from '../lib/evidence-assertions';
import {sourceType,claimRelationships} from '../lib/evidence';
import {validatePilotProvenance} from '../lib/pilot-provenance';
import {restoreRepetitionBaseline} from './repetition-truth-baseline';
const hash=(x:unknown)=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const claim=content.claims.find(c=>c.id==='CL-repetition-judged-truth')!;
test('repetition append restores exact c5bcd public, assertions and taxonomy records',()=>{
 assert.equal(hash(restoreRepetitionBaseline(raw)),'e4034a4028e76336a8ac6d910c8aed8b0065890cdc57e54f0fab68415989cb17');
 assert.equal(hash(restoreRepetitionBaseline(edges)),'4ec80439ae6c52b28e082db1d5b79102db5add0b2ef16d17b8e475233aac9824');
 assert.equal(hash(restoreRepetitionBaseline(taxonomy)),'03393ae8c75a3de8f497ce5bd05280f09356a84bbd8ceeb6abf6ad56b1433e39');
 assert.equal(content.claims.length,32); assert.equal(content.sources.length,104);assert.equal(content.models.length,4);assert.equal(edges.edges.length,133);
 assert.deepEqual(validateRelationships(),[]);assert.deepEqual(validateEvidenceAssertions(content),[]);assert.deepEqual(validatePilotProvenance(),[]);
 const bad=structuredClone(raw);bad.claims.find(c=>c.id==='CL-repetition-judged-truth')!.statement='invented';assert.throws(()=>restoreRepetitionBaseline(bad));
});
test('three primary report families map to factual truth judgments without mechanism or benefit claims',()=>{
 assert.deepEqual(claim.sourceIds,['R100','R101','R102']);
 for(const id of claim.sourceIds){const s=content.sources.find(x=>x.id===id)!;assert.equal(sourceType(s),'Study');assert.equal(s.sampleSize,null);assert.equal(s.retractionStatus,'unknown');assert.ok(claimRelationships(claim).some(r=>r.sourceId===id));}
 assert.equal(edges.edges.filter(e=>e.claimId===claim.id).length,4);
 assert.equal(edges.edges.filter(e=>e.claimId===claim.id).at(-1)!.target,claim.id+'.limitations[0]');assert.equal(edges.edges.filter(e=>e.claimId===claim.id).at(-1)!.relation,'qualifies');
 assert.match(claim.limitations[1],/not perceptual confidence/);assert.match(claim.limitations[4],/not a validated intervention/);assert.match(claim.notImplied[1],/No uniquely demonstrated/);
 assert.doesNotMatch(JSON.stringify([claim,...content.sources.slice(99,102),...edges.edges.slice(125,129)]),/hen-temperature|Begg|cebFWOlx848|\/workspace\/|seed-attribution|transcript/i);
});
test('report denominators, shared investigative programs and null boundaries remain explicit',()=>{
 const [f,b,h]=content.sources.slice(99,102);
 assert.match(f.sampleSizeNote!,/n=16.*not independently audited/);assert.match(f.summary,/across truth statuses/);
 assert.match(b.summary,/p=.133/);assert.match(b.summary,/not four independent research teams/);
 assert.match(h.sampleSizeNote!,/631 attempted/);assert.match(h.sampleSizeNote!,/567\/544\/532\/507/);assert.match(h.summary,/one longitudinal cohort, not four replications/);
 assert.match(claim.limitations[2],/No pooled unique participant total/);
});
test('pilot data and learning dependency bytes remain fixed',()=>{
 assert.equal(createHash('sha256').update(readFileSync('content/pilot-provenance.json')).digest('hex'),'7ba6ac0ad70d1c56e9e63091bd200a88d4e464335076fd927e04184d3dfb7e27');
 assert.equal(createHash('sha256').update(readFileSync('content/learning-paths.json')).digest('hex'),'2627bae588c023d87131bf18603fe2fc08adaebacb207fc1b4024a2414d18d5f');
 assert.equal(createHash('sha256').update(readFileSync('lib/learning-path-records.ts')).digest('hex'),'0649c7f78c96d4b1915cd56f13b4478ea5a4d1bfca0132e51de526f79eb576d3');
 assert.equal(createHash('sha256').update(readFileSync('features/notebook-data.ts')).digest('hex'),'0339ef1cdbd1ca8f05c42eb1359e98d528063d4fbff042cfb5f2bed109b282d6');
 assert.equal(createHash('sha256').update(readFileSync('features/notebook-model.ts')).digest('hex'),'4eb1f8a35a597a57c1107602f04438312f80cc38ba8763edf3fd4b92d9805aa3');
 assert.equal(createHash('sha256').update(readFileSync('features/useDraft.ts')).digest('hex'),'bb77f6f06e42db250dd8b4af383739372f1111c3e297ef122b0e8008abb01879');
});
