import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { content, validateRelationships } from '../lib/content';
import { restoreCharismaBaseline } from './charisma-baseline';
import { sourceType } from '../lib/evidence';
import { evidenceAssertions } from '../lib/evidence-assertions';
const claim=content.claims.find(c=>c.id==='CL-charisma-speech-impressions')!;
test('charisma addition preserves exact prior content and rejects drift',()=>{
 const hashes:Record<string,string>={"public.json": "9035c36436b48346d637f7e7cd5d06a4cf982cbcef524ef8ea5102b13ffe3b02", "evidence-assertions.json": "1e568f6b9559ee279ed7628ebcd0dd7e328101c174ba0330956591619cefc50e", "evidence-taxonomy.json": "2ed8e6a34127436cec76b56dd0c5fd8b92f9d108f9f3894aab194958d4f1fcdb"};
 for(const [file,hash] of Object.entries(hashes))assert.equal(createHash('sha256').update(JSON.stringify(restoreCharismaBaseline(JSON.parse(readFileSync('content/'+file,'utf8'))))).digest('hex'),hash);
 const bad=structuredClone(content);bad.claims.find(c=>c.id===claim.id)!.statement='guaranteed';assert.throws(()=>restoreCharismaBaseline(bad),/Unexpected charisma addition drift/);
});
test('charisma is confined to immediate conditional observer ratings',()=>{
 assert.equal(claim.confidence,'limited'); assert.match(claim.reviewer,/human scientific review pending/);
 assert.deepEqual(claim.sourceIds,['R119']); assert.match(claim.statement,/no-audience training condition/); assert.match(claim.statement,/immediate/);
 assert.match(claim.limitations[1],/not an audience-pooled effect/); assert.match(claim.limitations[1],/does not establish equal effects/);
 assert.match(claim.limitations[3],/retention.*not measured/i); assert.match(claim.notImplied.join(' '),/original broad source assertion remains held/);
 assert.equal(sourceType(content.sources.find(s=>s.id==='R119')!),'Study');
 const edges=evidenceAssertions.edges.filter(e=>e.claimId===claim.id);assert.equal(edges.length,3);assert.equal(new Set(edges.map(e=>e.studyLineage)).size,1);assert.deepEqual(validateRelationships(),[]);
});
