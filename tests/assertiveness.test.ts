import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { content, validateRelationships } from '../lib/content';
import { restoreAssertivenessBaseline } from './assertiveness-baseline';
import { sourceType } from '../lib/evidence';
import { evidenceAssertions } from '../lib/evidence-assertions';
const claim = content.claims.find(c=>c.id==='CL-assertiveness-training-boundaries')!;
test('assertiveness addition preserves exact prior content and rejects drift',()=>{
 const expected:Record<string,string>={"public.json": "23a4ffd9eb667c3d133f80bfb68f0c4b7947a5f04975728c50c6ba508fe38831", "evidence-assertions.json": "fcba08858c9de1b63bced9c72866e0c0505262f5259ee5dd7e144ca3a2a7fc49", "evidence-taxonomy.json": "3ebc377fec395b3c7bd513d7d0d1ec2df8e879ac83558e1153f3c026e33ecd7c"};
 for(const [file,hash] of Object.entries(expected)) {
  const value=JSON.parse(readFileSync('content/'+file,'utf8'));
  assert.equal(createHash('sha256').update(JSON.stringify(restoreAssertivenessBaseline(value))).digest('hex'),hash);
 }
 const bad=structuredClone(content);bad.claims.find(c=>c.id===claim.id)!.statement='guaranteed';
 assert.throws(()=>restoreAssertivenessBaseline(bad),/Unexpected assertiveness addition drift/);
});
test('assertiveness remains one limited self-report package trial with missingness and no script efficacy',()=>{
 assert.equal(claim.confidence,'limited');assert.match(claim.reviewer,/human scientific review pending/);
 assert.deepEqual(claim.sourceIds,['R108']); assert.match(claim.statement,/eight-week online CBT package/);
 assert.match(claim.statement,/self-rated/);assert.match(claim.statement,/does not establish/);
 assert.match(claim.limitations[1],/35\/67.*50\/70.*61\/68/);
 assert.match(claim.limitations[2],/not a concurrent untreated/);
 assert.match(claim.notImplied.join(' '),/No exercise/);
 const source=content.sources.find(s=>s.id==='R108')!;assert.equal(sourceType(source),'Study');
 assert.deepEqual(source.authors,['Tobias Hagberg','Patrik Manhem','Martin Oscarsson','Fiona Michel','Gerhard Andersson','Per Carlbring']);
 const edges=evidenceAssertions.edges.filter(e=>e.claimId===claim.id);
 assert.equal(edges.length,3);assert.equal(new Set(edges.map(e=>e.studyLineage)).size,1);
 assert.deepEqual(validateRelationships(),[]);
});
