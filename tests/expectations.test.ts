import test from 'node:test';
import assert from 'node:assert/strict';
import { content, validateRelationships } from '../lib/content';
import { restoreExpectationsBaseline } from './expectations-baseline';
import { claimFacet } from '../lib/evidence-taxonomy';
const claim=content.claims.find(c=>c.id==='CL-interpersonal-expectation-boundaries')!;
test('expectation synthesis preserves selected context and denominator qualifications',()=>{
 assert.equal(claim.confidence,'limited');assert.match(claim.statement,/does not mean.*usually.*mistreatment/);
 assert.match(claim.limitations[0],/58.*39.*not men.*not a universal sex difference/);
 assert.match(claim.limitations[1],/not a literal rejection.*did not show a significant/);
 assert.match(claim.limitations[2],/71.*eight.*63.*28.*one control and four disclosure.*23/);
 assert.match(claim.limitations[3],/one-minute.*not actual relationship acceptance.*not randomly assigned.*p=.056/);
 assert.match(claim.limitations[4],/abstract only.*not randomized advice.*sample were not verified/);
 assert.match(claim.limitations[5],/not interchangeable.*clinical causation/);
 assert.match(claim.implications.join(' '),/unvalidated.*credible threats.*take responsibility/);
 assert.deepEqual(validateRelationships(),[]);assert.equal(claimFacet(claim.id),undefined);
});
test('expectation restoration only removes the exact approved bounded objects',()=>{
 const restored=restoreExpectationsBaseline(content) as typeof content;assert.equal(restored.claims.length,43);assert.equal(restored.sources.length,128);
 const bad=structuredClone(content);bad.claims.find(c=>c.id===claim.id)!.statement='Optimism guarantees acceptance';assert.throws(()=>restoreExpectationsBaseline(bad),/Unexpected interpersonal expectation addition drift/);
});
