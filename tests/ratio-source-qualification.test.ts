import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { RatioQualification } from '../components/evidence/RatioQualification';
import { ratioQualification as note } from '../lib/ratio-source-qualification';
const pins={"content/evidence-taxonomy.json": "9db9da1816e278706a8b5f430629dc34c255e8b64bd3161cd57dde281423c279", "content/learning-paths.json": "2627bae588c023d87131bf18603fe2fc08adaebacb207fc1b4024a2414d18d5f", "content/evidence-assertions.json": "939adf08ef7a4d2d8a12670797b50b78631f3ff44641435c04ef77b1cb900b32", "content/pilot-provenance.json": "7ba6ac0ad70d1c56e9e63091bd200a88d4e464335076fd927e04184d3dfb7e27", "content/public.json": "f6a5be37e6714f23815c620dd3c3fc64eaf4beb288311acf0e738858802bafd3", "lib/source-qualifications.ts": "ba671002489389559ae6200bee597169b8cbd28b62024df09a7cec5ddbbfe515", "lib/age-source-qualification.ts": "ebca7f049bebdaef74ef1d07788397db051b1fb1a3596fb44c004fb03c649df9", "lib/sensory-source-qualification.ts": "1432b9bfb03764d991f138d8895dd55e89c7de871b81d95d548476d62bc8b8cd"};
test('ratio note preserves canonical data and all prior source notes',()=>{for(const [p,h] of Object.entries(pins))assert.equal(createHash('sha256').update(readFileSync(p)).digest('hex'),h);});
test('ratio note preserves cohort, measurement, ambiguity and safety boundaries',()=>{
 const t=note.paragraphs.join(' ');
 for(const phrase of ['79 married couples','73 in the four-year','5.10 for husbands and 5.06 for wives','aggregate ratios','different coding system','positive/(positive+negative)','negative/(positive+negative)','not divorce prediction','42 returning couples','100 distressed married couples','not randomize a five-to-one','No numeric practice is prescribed','cannot numerically cancel coercion'])assert.ok(t.includes(phrase),phrase);
 assert.ok(t.includes('not a systematic synthesis'));assert.ok(t.includes('no correction was located in the bounded search'));
});
test('ratio note renders four primary links and no calculator',()=>{const html=renderToStaticMarkup(createElement(RatioQualification));assert.match(html,/id="relationship-ratios"/);for(const url of ['https://bpl.berkeley.edu/docs/41-Marital%20Processes92.pdf','https://doi.org/10.1037/0022-006X.61.1.6','https://bpl.studentorg.berkeley.edu/docs/55-What%20predicts%20change99.pdf','https://doi.org/10.1207/s15327698jfc0503_1'])assert.ok(html.includes('href="'+url+'"'));assert.doesNotMatch(html,/<input|<script|<iframe/);});
