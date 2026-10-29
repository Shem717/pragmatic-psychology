import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { content, validateRelationships } from '../lib/content';
import { restoreAcademicInterestBaseline } from './academic-interest-baseline';
import { sourceType } from '../lib/evidence';
import { evidenceAssertions } from '../lib/evidence-assertions';
const claim=content.claims.find(c=>c.id==='CL-academic-interest-boundaries')!;
test('academic interest addition preserves exact prior content and rejects drift',()=>{
 const hashes:Record<string,string>={"public.json": "fe93dfce00a37b3259ee22265e94e25adc11df3342d0186de759cb8147c28024", "evidence-assertions.json": "f1a35c3ce9a34a9a6c7770d1800b3c49ffc456dc499c96061779a0f55c3f8b73", "evidence-taxonomy.json": "d945907d726a632a322b49469dff59aeb4a06e490b8daa54c3babe4808f5d833"};
 for(const [file,hash] of Object.entries(hashes))assert.equal(createHash('sha256').update(JSON.stringify(restoreAcademicInterestBaseline(JSON.parse(readFileSync('content/'+file,'utf8'))))).digest('hex'),hash);
 const bad=structuredClone(content);bad.claims.find(c=>c.id===claim.id)!.statement='guaranteed';assert.throws(()=>restoreAcademicInterestBaseline(bad),/Unexpected academic interest addition drift/);
});
test('academic interest stays conditional and distinct from career fit',()=>{
 assert.equal(claim.confidence,'limited');assert.match(claim.reviewer,/human scientific review pending/);assert.deepEqual(claim.sourceIds,['R113']);
 assert.match(claim.statement,/relatively low initial identification/);assert.match(claim.statement,/does not establish better career fit/);
 assert.match(claim.limitations[0],/580.*32.7%/);assert.match(claim.limitations[1],/modeled contrast/);assert.match(claim.limitations[1],/not preregistered/);
 assert.match(claim.limitations[2],/532 and 229/);assert.match(claim.limitations[3],/p=.082 and p=.016/);assert.match(claim.notImplied.join(' '),/No new exercise/);
 assert.equal(sourceType(content.sources.find(s=>s.id==='R113')!),'Study');
 const edges=evidenceAssertions.edges.filter(e=>e.claimId===claim.id);assert.equal(edges.length,3);assert.equal(new Set(edges.map(e=>e.studyLineage)).size,1);assert.deepEqual(validateRelationships(),[]);
});
