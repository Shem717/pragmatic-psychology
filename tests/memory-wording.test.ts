import test from 'node:test';
import assert from 'node:assert/strict';
import { content,validateRelationships } from '../lib/content';
import { evidenceAssertions } from '../lib/evidence-assertions';
import { restoreMemoryBaseline } from './memory-wording-baseline';
const c=content.claims.find(c=>c.id==='CL-pragmatic-recall-boundaries')!;
test('recall derivative retains single-study scoring and parent-hold boundaries',()=>{
 assert.match(c.scope,/Researcher-authored derivative/);assert.match(c.statement,/one selected sentence-recall experiment/);
 assert.match(c.limitations[0],/25 Illinois undergraduates/);assert.match(c.limitations[1],/20.5%.*26.4%.*30.6%/);assert.match(c.limitations[1],/not proportions of people deceived/);
 assert.match(c.limitations[3],/does not isolate.*initial comprehension/);assert.match(c.limitations[4],/remain mixed\/incomplete/);
 assert.match(c.implications[0],/not tested as an intervention/);assert.match(c.reviewer,/human scientific review pending/);assert.equal(c.confidence,'limited');
});
test('new recall source has exactly one evidence lineage and no unreviewed corroboration',()=>{
 assert.deepEqual(c.sourceIds,['R126']);const s=content.sources.find(s=>s.id==='R126')!;assert.equal(s.sampleSize,25);assert.equal(s.url,'https://doi.org/10.3758/BF03197414');
 const edges=evidenceAssertions.edges.filter(e=>e.claimId===c.id);assert.equal(edges.length,3);assert.equal(new Set(edges.map(e=>e.studyLineage)).size,1);assert.deepEqual(validateRelationships(),[]);
});
test('prior content restoration rejects any drift in the narrow derivative',()=>{
 const bad=structuredClone(content);bad.claims.find(x=>x.id===c.id)!.statement='Deception works';assert.throws(()=>restoreMemoryBaseline(bad),/Unexpected memory-wording addition drift/);
});
