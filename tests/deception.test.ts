import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { content, validateRelationships } from '../lib/content';
import { restoreDeceptionBaseline } from './deception-baseline';
import { sourceType } from '../lib/evidence';
import { evidenceAssertions } from '../lib/evidence-assertions';
const claim=content.claims.find(c=>c.id==='CL-nonverbal-deception-boundaries')!;
test('deception additions preserve exact prior records and reject drift',()=>{
 const expected:Record<string,string>={"public.json": "3c7852eb9f55ad69d07259d3ba4cdafccdd87e2409bcbe670e8e7906a2aa4f7a", "evidence-assertions.json": "11979afb7d8f517338e3e9127b46b66cd6ae1daa5cc07e2d46bad7236e7f15e0", "evidence-taxonomy.json": "b9ec351ac451dc14e34138873a0b2f020e192ebdfb413b863435b3c6a87574da"};
 for(const [file,hash] of Object.entries(expected)) {
  const value=JSON.parse(readFileSync('content/'+file,'utf8'));
  assert.equal(createHash('sha256').update(JSON.stringify(restoreDeceptionBaseline(value))).digest('hex'),hash);
 }
 const bad=structuredClone(content);bad.claims.find(c=>c.id===claim.id)!.statement='guaranteed';
 assert.throws(()=>restoreDeceptionBaseline(bad),/Unexpected deception addition drift/);
});
test('deception dossier retains scoped null and stimulus limits without guilt inference',()=>{
 assert.equal(claim.confidence,'limited');assert.match(claim.reviewer,/human scientific review pending/);
 assert.match(claim.statement,/did not demonstrate an improvement/);
 assert.deepEqual(claim.sourceIds,['R109','R110','R111']);
 assert.match(claim.limitations[2],/144 versus 143.*142 demographic records.*one missing/);
 assert.match(claim.limitations[3],/not three wholly independent datasets/);
 assert.match(claim.limitations[4],/not the probability/);
 assert.match(claim.limitations[5],/self-soothing remain outside/);
 assert.match(claim.notImplied.join(' '),/No lie-detection technique/);
 for(const id of claim.sourceIds)assert.equal(sourceType(content.sources.find(s=>s.id===id)!),'Study');
 const edges=evidenceAssertions.edges.filter(e=>e.claimId===claim.id);
 assert.equal(edges.length,6);assert.equal(new Set(edges.map(e=>e.sourceId)).size,3);
 for(const id of claim.sourceIds) assert.equal(new Set(edges.filter(e=>e.sourceId===id).map(e=>e.studyLineage)).size,1);
 assert.deepEqual(validateRelationships(),[]);
});
