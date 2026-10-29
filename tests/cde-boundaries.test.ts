import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { content, validateRelationships } from '../lib/content';
import { sourceType } from '../lib/evidence';
import { evidenceAssertions } from '../lib/evidence-assertions';
import { restoreCdeBaseline } from './cde-baseline';
const grief=content.claims.find(c=>c.id==='CL-grief-pattern-sequence-boundaries')!;
const meditation=content.claims.find(c=>c.id==='CL-meditation-adverse-ascertainment')!;
test('D/E addition preserves every prior public object and rejects drift',()=>{
 const hashes:Record<string,string>={
  "public.json": "5892061141409865c15c8ad2b7002832ad95cfb4ec76af06741ea17224197ad9",
  "evidence-assertions.json": "7b919a84213e36c17bfb73ed710e40b4d32dade61d2e242d3c42b4930bd14aae",
  "evidence-taxonomy.json": "e8db27f9980e5e42e1bb62e02e54dd2fd0aa208cb3e00f2cabaa22bbc4b5b492"
};
 for(const [file,hash] of Object.entries(hashes))assert.equal(createHash('sha256').update(JSON.stringify(restoreCdeBaseline(JSON.parse(readFileSync('content/'+file,'utf8'))))).digest('hex'),hash);
 for(const claim of [grief,meditation]){const bad=structuredClone(content);bad.claims.find(c=>c.id===claim.id)!.statement='guaranteed';assert.throws(()=>restoreCdeBaseline(bad),/Unexpected CDE addition drift/);}
});
test('grief preserves positive interpretation and does not convert group peaks to individual frequency',()=>{
 assert.match(grief.limitations[0],/interpreted.*support for stage theory/);assert.match(grief.limitations[0],/one randomly selected complete observation per person/);assert.match(grief.limitations[0],/Yearning.*rather than bargaining/);
 assert.match(grief.limitations[3],/selected bereaved samples, including spouse-bereaved cohorts/);assert.match(grief.limitations[4],/does not establish a numerical hardly-ever claim/);assert.match(grief.notImplied.join(' '),/original broad source assertion remains held/);
 assert.match(grief.limitations[1],/Low depressive scores are not proof of no grief/);assert.match(grief.limitations[2],/not independent replications/);
 assert.ok(content.sources.find(s=>s.id==='R120')!.correctionUrl);assert.match(content.sources.find(s=>s.id==='R121')!.sampleSizeNote!,/precise prevalence is held/);
});
test('meditation preserves reports and impairment without universal safety or dose claims',()=>{
 assert.match(meditation.statement,/including reported impairment and duration/);assert.match(meditation.statement,/do not establish the population incidence or causal attribution/);
 assert.match(meditation.limitations[0],/Not seeking assistance or not stopping practice is not, by itself/);assert.match(meditation.limitations[2],/recurrent major depression in remission or partial remission/);
 assert.match(meditation.limitations[3],/differ in statistical significance/);assert.match(meditation.notImplied.join(' '),/original compound source assertion remains mixed\/incomplete/);assert.match(meditation.limitations[4],/do not establish.*safe duration threshold/);
});
test('D/E has six report families with scoped evidence roles and no automatic acceptance',()=>{
 assert.deepEqual(grief.sourceIds,['R120','R121','R122']);assert.deepEqual(meditation.sourceIds,['R123','R124','R125']);
 const edges=evidenceAssertions.edges.filter(e=>[grief.id,meditation.id].includes(e.claimId));assert.equal(edges.length,12);assert.equal(new Set(edges.map(e=>e.studyLineage)).size,6);
 assert.equal(sourceType(content.sources.find(s=>s.id==='R125')!),'Research synthesis');for(const id of ['R120','R121','R122','R123','R124'])assert.equal(sourceType(content.sources.find(s=>s.id===id)!),'Study');
 for(const claim of [grief,meditation]){assert.equal(claim.confidence,'limited');assert.match(claim.reviewer,/human scientific review pending/);assert.match(claim.notImplied.join(' '),/No .*recommendation|No practice/);}
 assert.deepEqual(validateRelationships(),[]);assert.equal(content.claims.length,43);assert.equal(content.sources.length,126);assert.equal(evidenceAssertions.edges.length,183);
 assert.ok(!content.claims.some(c=>/jingle/.test(c.id)));
});
