import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SensoryQualification } from '../components/evidence/SensoryQualification';
import { sensoryQualification as note } from '../lib/sensory-source-qualification';
const pins={"content/evidence-taxonomy.json": "9db9da1816e278706a8b5f430629dc34c255e8b64bd3161cd57dde281423c279", "content/learning-paths.json": "2627bae588c023d87131bf18603fe2fc08adaebacb207fc1b4024a2414d18d5f", "content/evidence-assertions.json": "939adf08ef7a4d2d8a12670797b50b78631f3ff44641435c04ef77b1cb900b32", "content/pilot-provenance.json": "7ba6ac0ad70d1c56e9e63091bd200a88d4e464335076fd927e04184d3dfb7e27", "content/public.json": "f6a5be37e6714f23815c620dd3c3fc64eaf4beb288311acf0e738858802bafd3", "lib/source-qualifications.ts": "ba671002489389559ae6200bee597169b8cbd28b62024df09a7cec5ddbbfe515", "lib/age-source-qualification.ts": "ebca7f049bebdaef74ef1d07788397db051b1fb1a3596fb44c004fb03c649df9", "components/evidence/AgeQualification.tsx": "2e00282b405e6408702761fe949475aad513454cd711ce44809d40e2af8bbf19"};

test('sensory note leaves canonical data and earlier source notes exact',()=>{
 for(const [path,pin] of Object.entries(pins))assert.equal(createHash('sha256').update(readFileSync(path)).digest('hex'),pin);
});
test('sensory note preserves exact-kit hold, denominators and comparison boundaries',()=>{
 const text=note.paragraphs.join(' ');assert.match(text,/versus a measurement-only control/);assert.match(text,/do not establish the exact toolkit’s immediate grounding or calming efficacy/);
 assert.match(text,/1,108.*1,092.*1,054.*72.*107/);assert.match(text,/unpreregistered criterion.*similar sensitivity.*Separately.*interim analysis/);
 assert.match(text,/CEO\/founder coauthorship.*one study, not independent confirmation/);
 assert.match(text,/39.*37.*not show significant between-group.*nondetection is not equivalence/);
 assert.match(text,/No practice instructions.*Subjective safety is not objective safety/);
});
test('sensory qualification has semantic anchor and exact primary source links',()=>{
 const html=renderToStaticMarkup(createElement(SensoryQualification));assert.match(html,/id="sensory-kit-evidence"/);
 assert.ok(html.includes('href="https://pmc.ncbi.nlm.nih.gov/articles/PMC11981704/"'));
 assert.ok(html.includes('href="https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0319649"'));assert.doesNotMatch(html,/<script|<iframe/);
});
