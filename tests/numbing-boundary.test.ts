import test from 'node:test';
import assert from 'node:assert/strict';
import { content } from '../lib/content';
import { restoreNumbingBaseline } from './numbing-baseline';
const c=content.claims.find(c=>c.id==='CL-expression-experience')!;
test('numbing qualification retains distinct constructs and safety without a new efficacy claim',()=>{
 assert.equal(c.confidence,'limited');assert.match(c.limitations[4],/should not be treated as proof.*grief removes love.*disappointment removes hope.*time horizons require separate evidence/);
 assert.match(c.notImplied.join(' '),/No obligation.*tolerate mistreatment.*no treatment recommendation/);
 assert.deepEqual(c.sourceIds,['R61','R62','R98','R99']);assert.equal(content.claims.length,44);assert.equal(content.sources.length,131);
});
test('numbing predecessor restoration is exact, idempotent and rejects mutation',()=>{
 const x=restoreNumbingBaseline(content);assert.deepEqual(restoreNumbingBaseline(x),x);
 const bad=structuredClone(content);bad.claims.find(x=>x.id===c.id)!.statement='Avoidance removes all emotion';assert.throws(()=>restoreNumbingBaseline(bad),/Unexpected numbing boundary drift/);
});
