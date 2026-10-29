import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { content, validateRelationships } from '../lib/content';
import { restorePacedBreathingBaseline } from './paced-breathing-baseline';
import { sourceType } from '../lib/evidence';
import { evidenceAssertions } from '../lib/evidence-assertions';
const claim=content.claims.find(c=>c.id==='CL-paced-breathing-comparator-boundaries')!;
test('paced breathing addition preserves exact prior content and rejects drift',()=>{
 const hashes:Record<string,string>={"public.json": "deeaa9be784114d9a9ba842d9b2d4d0bc38cc645af8f65588395b03e16d6f295", "evidence-assertions.json": "39a1ae7fd4d581de18a895b4880d2e32a266aa5c6e8f6889ef601089c9d165cd", "evidence-taxonomy.json": "4fa16d845605b4a94f0bac3bb4c0d416c0199f4c73fd5a5e9414f36e130f2c3c"};
 for(const [file,hash] of Object.entries(hashes))assert.equal(createHash('sha256').update(JSON.stringify(restorePacedBreathingBaseline(JSON.parse(readFileSync('content/'+file,'utf8'))))).digest('hex'),hash);
 const bad=structuredClone(content);bad.claims.find(c=>c.id===claim.id)!.statement='guaranteed';assert.throws(()=>restorePacedBreathingBaseline(bad),/Unexpected paced breathing addition drift/);
});
test('paced breathing stays comparator-specific and does not prescribe practice',()=>{
 assert.equal(claim.confidence,'limited');assert.match(claim.reviewer,/human scientific review pending/);assert.deepEqual(claim.sourceIds,['R114']);
 assert.match(claim.statement,/statistically significant additional reduction/);assert.match(claim.statement,/matched normal-rate/);
 assert.match(claim.limitations[0],/201 slower-paced\/199/);assert.match(claim.limitations[0],/189\/190/);assert.match(claim.limitations[1],/not inactivity/);
 assert.match(claim.limitations[2],/does not establish equivalence/);assert.match(claim.limitations[3],/oxygenation were not measured/);assert.match(claim.notImplied.join(' '),/No exercise/);
 assert.equal(sourceType(content.sources.find(s=>s.id==='R114')!),'Study');
 const edges=evidenceAssertions.edges.filter(e=>e.claimId===claim.id);assert.equal(edges.length,3);assert.equal(new Set(edges.map(e=>e.studyLineage)).size,1);assert.deepEqual(validateRelationships(),[]);
});
