import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { content, validateRelationships } from '../lib/content';
import { restoreWorktimeBaseline } from './worktime-baseline';
import { sourceType } from '../lib/evidence';
import { evidenceAssertions } from '../lib/evidence-assertions';
const claim=content.claims.find(c=>c.id==='CL-worktime-stress-boundaries')!;
test('worktime addition preserves exact prior content and rejects drift',()=>{
 const hashes:Record<string,string>={"public.json": "42c2f3814e0a64ed8f5a6e6f1e6a39ff89d4a7c41a1869760bfe66f3be410c0e", "evidence-assertions.json": "cc8b70483a4f55fd69150ce6244382c411bad0ad9e7ae9e6ba7899ef7b27a320", "evidence-taxonomy.json": "8128c72739567e1a0379eba42dd76cc69148e719f3d00fd66456eec5f5d14d31"};
 for(const [file,hash] of Object.entries(hashes)) {
 const value=JSON.parse(readFileSync('content/'+file,'utf8'));
 assert.equal(createHash('sha256').update(JSON.stringify(restoreWorktimeBaseline(value))).digest('hex'),hash);
 }
 const bad=structuredClone(content);bad.claims.find(c=>c.id===claim.id)!.statement='guaranteed';assert.throws(()=>restoreWorktimeBaseline(bad),/Unexpected worktime addition drift/);
});
test('worktime remains a supported package with selected self-report outcomes',()=>{
 assert.equal(claim.confidence,'limited');assert.match(claim.reviewer,/human scientific review pending/);assert.deepEqual(claim.sourceIds,['R112']);
 assert.match(claim.statement,/analysis of 580/);assert.match(claim.statement,/preserved salary and replacement-staff funding/);
 assert.match(claim.limitations[0],/919.*821.*642.*580/);assert.match(claim.limitations[0],/19 intervention\/43 control/);
 assert.match(claim.limitations[1],/assigned to control rather than randomized/);assert.match(claim.limitations[2],/25%.*20%/);
 assert.match(claim.limitations[3],/does not establish/);assert.match(claim.notImplied.join(' '),/No new exercise/);
 assert.equal(sourceType(content.sources.find(s=>s.id==='R112')!),'Study');
 const edges=evidenceAssertions.edges.filter(e=>e.claimId===claim.id);assert.equal(edges.length,3);assert.equal(new Set(edges.map(e=>e.studyLineage)).size,1);assert.deepEqual(validateRelationships(),[]);
});
