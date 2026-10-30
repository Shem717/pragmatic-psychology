import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AgeQualification } from '../components/evidence/AgeQualification';
import { ageQualification as note } from '../lib/age-source-qualification';
const pins={"content/evidence-taxonomy.json": "9db9da1816e278706a8b5f430629dc34c255e8b64bd3161cd57dde281423c279", "content/learning-paths.json": "2627bae588c023d87131bf18603fe2fc08adaebacb207fc1b4024a2414d18d5f", "content/evidence-assertions.json": "939adf08ef7a4d2d8a12670797b50b78631f3ff44641435c04ef77b1cb900b32", "content/pilot-provenance.json": "7ba6ac0ad70d1c56e9e63091bd200a88d4e464335076fd927e04184d3dfb7e27", "content/public.json": "f6a5be37e6714f23815c620dd3c3fc64eaf4beb288311acf0e738858802bafd3", "lib/source-qualifications.ts": "ba671002489389559ae6200bee597169b8cbd28b62024df09a7cec5ddbbfe515"};

test('age source note preserves all canonical data and existing caffeine copy',()=>{
 for(const [path,pin] of Object.entries(pins))assert.equal(createHash('sha256').update(readFileSync(path)).digest('hex'),pin);
});
test('age note retains denominator, adjusted model and selection boundaries',()=>{
 const text=note.paragraphs.join(' ');assert.match(text,/cross-sectional association does not establish/);assert.match(text,/1,546.*1,491.*1,550.*55-person.*Do not invent exclusions/);
 assert.match(text,/excluded diagnosed dementia.*non-English/);assert.match(text,/six positive\/negative self-reports.*Individual scales differed/);
 assert.match(text,/Removing education and marital-status.*not be called entirely unadjusted/);assert.match(text,/not independent replications/);
 assert.match(text,/full methods remain unverified.*not a definitive refutation, personal countdown or bereavement mechanism/);
 assert.match(text,/Do not dismiss grief, depression or support needs/);
});
test('age section renders direct primary links and distinct accessible anchor',()=>{
 const html=renderToStaticMarkup(createElement(AgeQualification));assert.match(html,/id="age-groups-and-aging"/);assert.match(html,/aria-labelledby="age-qualification-title"/);
 for(const url of ['https://pmc.ncbi.nlm.nih.gov/articles/PMC5461877/','https://www.psychiatrist.com/wp-content/uploads/2024/02/v77n0813-SM.pdf','https://pubmed.ncbi.nlm.nih.gov/18605841/'])assert.ok(html.includes('href="'+url+'"'));
 assert.doesNotMatch(html,/<iframe|<script/);assert.match(readFileSync('app/evidence/source-qualifications/page.tsx','utf8'),/<AgeQualification/);
});
