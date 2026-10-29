import test from 'node:test';
import assert from 'node:assert/strict';
import { content,validateRelationships } from '../lib/content';
import { evidenceAssertions } from '../lib/evidence-assertions';
import { restoreThreatPhysiologyBaseline } from './threat-physiology-baseline';
const c=content.claims.find(c=>c.id==='CL-threat')!;
test('threat extension preserves central model and distinguishes acute physiological outcomes',()=>{
 assert.equal(c.statement,'What a situation demands and what resources you believe you have are separate appraisals—not a literal anxiety calculator.');assert.equal(c.confidence,'moderate');assert.equal(c.kind,'theoretical-model');
 assert.match(c.limitations[3],/Results vary across tasks/);assert.match(c.limitations[4],/not independent confirmations/);assert.match(c.limitations[5],/not an exact replication or evidence of equivalence/);
 assert.match(c.limitations[6],/229.*189/);assert.match(c.limitations[6],/increased in both conditions.*not absolute vasodilation/);assert.match(c.limitations[7],/do not validate the Sovereignty Method/);
 assert.match(c.notImplied.join(' '),/wound-protection explanation remains untested/);assert.match(c.limitations[8],/not physiological diagnosis or a proven treatment/);
});
test('mixed threat evidence reuses R17 and keeps correction within one report family',()=>{
 assert.equal(content.sources.filter(s=>s.url==='https://pmc.ncbi.nlm.nih.gov/articles/PMC3410434/').length,1);assert.equal(content.sources.find(s=>s.id==='R127')!.correctionUrl,'https://onlinelibrary.wiley.com/doi/10.1111/psyp.14298');
 assert.equal(evidenceAssertions.edges.filter(e=>e.claimId===c.id&&['R127','R128'].includes(e.sourceId)).length,4);assert.deepEqual(validateRelationships(),[]);
});
test('exact threat predecessor restoration rejects unapproved central changes',()=>{
 const bad=structuredClone(content);bad.claims.find(x=>x.id===c.id)!.statement='Guaranteed health';assert.throws(()=>restoreThreatPhysiologyBaseline(bad),/Unexpected threat physiology claim drift/);
});

test('threat predecessor restoration is idempotent without accepting altered predecessors',()=>{
 const restored=restoreThreatPhysiologyBaseline(content);assert.deepEqual(restoreThreatPhysiologyBaseline(restored),restored);
 const bad=structuredClone(restored) as typeof content;bad.claims.find(x=>x.id===c.id)!.takeaway='Unapproved drift';assert.throws(()=>restoreThreatPhysiologyBaseline(bad),/Unexpected threat physiology claim drift/);
});
