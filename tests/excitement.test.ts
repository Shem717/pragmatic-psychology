import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { content, publicSchema, validateRelationships } from '../lib/content';
import { restoreExcitementBaseline } from './excitement-baseline';
import { sourceType } from '../lib/evidence';
const claim = content.claims.find(c=>c.id==='CL-excitement-performance-boundaries')!;
test('excitement additions restore exact sleep-reviewed baseline and reject drift',()=>{
 const expected:Record<string,string>={"public.json": "78c6f37183730bee8f9384c5fa205a50a83f3caee86bce496763a29df4dee4db", "evidence-assertions.json": "0fc394e8137db4b2d5f1ef48980b28a7ad48352d81babf2aee5205162352cc97", "evidence-taxonomy.json": "7a67ae421ca93e83a1cbe90c93c276fc52fe34bbda38b76e09463cc098f8459f"};
 for(const [file,hash] of Object.entries(expected)) {
  const value=JSON.parse(readFileSync('content/'+file,'utf8'));
  assert.equal(createHash('sha256').update(JSON.stringify(restoreExcitementBaseline(value))).digest('hex'),hash);
 }
 const bad=structuredClone(content);bad.claims.find(c=>c.id===claim.id)!.statement='guaranteed';
 assert.throws(()=>restoreExcitementBaseline(bad),/Unexpected excitement addition drift/);
});
test('mixed evidence preserves comparator, replication and human-pending boundaries',()=>{
 assert.equal(claim.confidence,'limited');assert.match(claim.reviewer,/human scientific review pending/);
 assert.deepEqual(claim.sourceIds,['R105','R106','R107']);assert.deepEqual(claim.challengeSourceIds,['R106','R107']);
 assert.match(claim.statement,/findings are mixed/);assert.match(claim.limitations[1],/not proof of equivalence/);
 assert.match(claim.limitations[2],/conceptual test rather than an exact replication/);
 for(const id of claim.sourceIds)assert.equal(sourceType(content.sources.find(s=>s.id===id)!),'Study');
 assert.match(claim.notImplied.join(' '),/No treatment claim/);
});
test('related claims are optional, valid, unique and never self references',()=>{
 assert.deepEqual(validateRelationships(),[]);
 assert.deepEqual(claim.relatedClaimIds,['CL-threat','CL-regulation-choice-outcome']);
 assert.equal(content.claims[0].relatedClaimIds,undefined);
 const bad=structuredClone(content);bad.claims.find(c=>c.id===claim.id)!.relatedClaimIds=['CL-missing'];
 assert.ok(validateRelationships(bad).some(x=>x.includes('Invalid related claim')));
 bad.claims.find(c=>c.id===claim.id)!.relatedClaimIds=[claim.id];
 assert.ok(validateRelationships(bad).some(x=>x.includes('Invalid related claim')));
 bad.claims.find(c=>c.id===claim.id)!.relatedClaimIds=['CL-threat','CL-threat'];
 assert.equal(publicSchema.safeParse(bad).success,false);
 const page=readFileSync('components/evidence/RelatedClaims.tsx','utf8');
 assert.match(page,/Related questions—not supporting evidence/);assert.match(page,/A link does not confirm/);
 assert.match(page,/claim\.relatedClaimIds/);
});
test('dossier renders only declared non-confirming related links', async()=>{
 const { RelatedClaims } = await import('../components/evidence/RelatedClaims');
 const { renderToStaticMarkup } = await import('react-dom/server');
 const { createElement } = await import('react');
 const html=renderToStaticMarkup(createElement(RelatedClaims,{claim,claims:content.claims}));
 assert.match(html,/Related questions—not supporting evidence/);
 for(const id of claim.relatedClaimIds ?? []) {
  const related=content.claims.find(c=>c.id===id)!;
  assert.ok(html.includes(`/evidence/claims/${related.slug}`));
 }
 const old=renderToStaticMarkup(createElement(RelatedClaims,{claim:content.claims.find(c=>c.id==='CL-sleep-opportunity-attention')!,claims:content.claims}));
 assert.equal(old,'');
});
