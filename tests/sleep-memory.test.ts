import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { content, validateRelationships } from '../lib/content';
import { restoreSleepMemoryBaseline } from './sleep-memory-baseline';
import { sourceType } from '../lib/evidence';
import { evidenceAssertions } from '../lib/evidence-assertions';
const claim=content.claims.find(c=>c.id==='CL-sleep-word-pair-boundaries')!;
test('sleep memory addition preserves exact prior content and rejects drift',()=>{
 const hashes:Record<string,string>={"public.json": "aaf0d6fda909262697331d46aa74e0848fa13bfb7d7200e04f76579227a082ee", "evidence-assertions.json": "4ca180a3971530100dc56c4a366baa16a0bb882e642e545e8057147ee69f337a", "evidence-taxonomy.json": "c7fd355df13b9797c89356194e34159e0cc0e8b30effd02dd7f1128713706855"};
 for(const [file,hash] of Object.entries(hashes))assert.equal(createHash('sha256').update(JSON.stringify(restoreSleepMemoryBaseline(JSON.parse(readFileSync('content/'+file,'utf8'))))).digest('hex'),hash);
 const bad=structuredClone(content);bad.claims.find(c=>c.id===claim.id)!.statement='guaranteed';assert.throws(()=>restoreSleepMemoryBaseline(bad),/Unexpected sleep memory addition drift/);
});
test('sleep memory remains task-specific with mixed interference findings',()=>{
 assert.equal(claim.confidence,'limited');assert.match(claim.reviewer,/human scientific review pending/);assert.deepEqual(claim.sourceIds,['R115','R116','R117','R118']);
 assert.match(claim.statement,/some conditions/);assert.match(claim.statement,/findings on protection against later interference are mixed/);
 assert.match(claim.limitations[1],/separate delay groups/);assert.match(claim.limitations[2],/p=.12.*p=.54/);assert.match(claim.limitations[3],/15 were excluded and replaced/);
 assert.match(claim.limitations[4],/not equivalent/);assert.match(claim.notImplied.join(' '),/No new exercise/);
 for(const id of claim.sourceIds)assert.equal(sourceType(content.sources.find(s=>s.id===id)!),'Study');
 const edges=evidenceAssertions.edges.filter(e=>e.claimId===claim.id);assert.equal(edges.length,8);assert.equal(new Set(edges.map(e=>e.studyLineage)).size,4);assert.deepEqual(validateRelationships(),[]);
});
