import { restoreExpectationsBaseline } from './expectations-baseline';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { caffeineQualification as note } from '../lib/source-qualifications';
import { content } from '../lib/content';
import { evidenceAssertions } from '../lib/evidence-assertions';
const pins={"content/evidence-taxonomy.json": "9db9da1816e278706a8b5f430629dc34c255e8b64bd3161cd57dde281423c279", "content/learning-paths.json": "2627bae588c023d87131bf18603fe2fc08adaebacb207fc1b4024a2414d18d5f", "content/evidence-assertions.json": "a3ebeacdd1ca01721e7d6dd2e63b804207d252ad2e155d139b7ba550db74ae0a", "content/pilot-provenance.json": "7ba6ac0ad70d1c56e9e63091bd200a88d4e464335076fd927e04184d3dfb7e27", "content/public.json": "1b93402eb5822509a342c20410e7c227f3e20c422f5a64d7a6ea1a51b8fe6720"};

test('source qualification does not inflate or modify the canonical evidence corpus',()=>{
 for(const [path,pin] of Object.entries(pins))assert.equal(createHash('sha256').update(['content/public.json','content/evidence-assertions.json'].includes(path) ? JSON.stringify(restoreExpectationsBaseline(JSON.parse(readFileSync(path,'utf8'))),null,2)+'\n' : readFileSync(path)).digest('hex'),pin);
 assert.equal(content.claims.length,44);assert.equal(content.sources.length,131);assert.equal(evidenceAssertions.edges.length,196);
});
test('caffeine note preserves attributed uncertainty and distinct measurements',()=>{
 assert.match(note.summary,/sometimes binds with greater affinity/);assert.match(note.summary,/Unestablished does not mean disproven/);
 assert.match(note.status,/Researcher-authored.*human scientific review pending/);assert.match(note.holds,/not pooled as interchangeable replications/);
 assert.match(note.attribution,/editorial safeguard.*not an accusation/);assert.match(note.measurements,/occupancy, receptor density, affinity, wakefulness and reported tiredness/);
 assert.equal(note.videoUrl,'https://www.youtube.com/watch?v=nm1TxQj9IsQ');assert.equal(note.references.length,6);
 assert.match(note.references[0].text,/cat.*regional/);assert.match(note.references[1].text,/mouse.*Full methods were not verified/);
 assert.match(note.references[2].text,/sample-description discrepancy.*no participant count/);assert.match(note.references[3].text,/cannot simply be transferred to humans/);
 assert.match(note.references[4].text,/not the same question.*single day/);assert.match(note.references[5].text,/Platelets are not brain/);
});
test('source qualification has bounded semantic navigation and no embedded tracking or treatment CTA',()=>{
 const page=readFileSync('components/evidence/CaffeineQualification.tsx','utf8');
 assert.match(page,/id=\{note.id\}/);assert.match(page,/aria-labelledby="qualification-title"/);assert.match(page,/Original source video/);
 assert.doesNotMatch(page,/<iframe|<script|fetch\(|dose|Start treatment/);
 assert.match(readFileSync('app/evidence/page.tsx','utf8'),/source-qualifications/);
});
