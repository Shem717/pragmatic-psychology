import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SourceQualificationNote } from '../components/evidence/SourceQualificationNote';
import { sourceNoteLinkLabels, sourceNoteSections } from '../lib/source-note-navigation';
import { ageQualification as note0 } from '../lib/age-source-qualification';
import { alcoholQualification as note1 } from '../lib/alcohol-source-qualification';
import { cardiacQualification as note2 } from '../lib/cardiac-source-qualification';
import { cholineQualification as note3 } from '../lib/choline-source-qualification';
import { hrvQualification as note4 } from '../lib/hrv-source-qualification';
import { meditationBenefitQualification as note5 } from '../lib/meditation-benefit-qualification';
import { postpartumQualification as note6 } from '../lib/postpartum-source-qualification';
import { ratioQualification as note7 } from '../lib/ratio-source-qualification';
import { relaxationQualification as note8 } from '../lib/relaxation-source-qualification';
import { sensoryQualification as note9 } from '../lib/sensory-source-qualification';
import { mriQualification as note10 } from "../lib/mri-source-qualification";
import { sleepLatencyQualification as note11 } from "../lib/sleep-latency-source-qualification";
import { traumaTransmissionQualification as note12 } from "../lib/trauma-transmission-source-qualification";
import { freezingAssaultQualification as note13 } from "../lib/freezing-assault-source-qualification";
import { panicDiagnosticQualification as note14 } from "../lib/panic-diagnostic-source-qualification";
import { insomniaDepressionQualification as note15 } from "../lib/insomnia-depression-source-qualification";
import { behavioralActivationQualification as note16 } from "../lib/behavioral-activation-source-qualification";
import { adhdDiagnosticQualification as note17 } from "../lib/adhd-diagnostic-source-qualification";
import { lightTherapyQualification as note18 } from "../lib/light-therapy-source-qualification";
import { resilienceTrainingQualification as note19 } from "../lib/resilience-training-source-qualification";
import { movementLearningQualification as note20 } from "../lib/movement-learning-source-qualification";
const notes=[note0,note1,note2,note3,note4,note5,note6,note7,note8,note9,note10,note11,note12,note13,note14,note15,note16,note17,note18,note19,note20];
const pins={
  "content/evidence-taxonomy.json": "9db9da1816e278706a8b5f430629dc34c255e8b64bd3161cd57dde281423c279",
  "content/learning-paths.json": "2627bae588c023d87131bf18603fe2fc08adaebacb207fc1b4024a2414d18d5f",
  "content/evidence-assertions.json": "939adf08ef7a4d2d8a12670797b50b78631f3ff44641435c04ef77b1cb900b32",
  "content/pilot-provenance.json": "7ba6ac0ad70d1c56e9e63091bd200a88d4e464335076fd927e04184d3dfb7e27",
  "content/public.json": "f6a5be37e6714f23815c620dd3c3fc64eaf4beb288311acf0e738858802bafd3",
  "lib/sensory-source-qualification.ts": "1432b9bfb03764d991f138d8895dd55e89c7de871b81d95d548476d62bc8b8cd",
  "lib/source-qualifications.ts": "ba671002489389559ae6200bee597169b8cbd28b62024df09a7cec5ddbbfe515",
  "lib/ratio-source-qualification.ts": "19d23e1b927c9ecdfb68abbedfc5554f8bbd36ae63cc5c74f51c0519e0fbf075",
  "lib/alcohol-source-qualification.ts": "714f756440cb42577765ddf83ab189c6754f7a8d3f3d804c91effd407853bb07",
  "lib/choline-source-qualification.ts": "bcf85d0e154457dcf92174a4d85a172bcad316a6a9dbe33ad5df0c4d7b2d53d4",
  "lib/meditation-benefit-qualification.ts": "354987ba4a034f4eb06ec605fe386a6f5df1fce55ffe07796e8546bab7985270",
  "lib/postpartum-source-qualification.ts": "29e4477a6f8876c62193c3de3e52638decc20a6b6d2617fbc04f6758b5d6caec",
  "lib/relaxation-source-qualification.ts": "4217ac16950f723860ef4a8a51f2363655dc94babb030a90ac879c996e7bcebf",
  "lib/hrv-source-qualification.ts": "34fa1bac1e7d24faa288be283626bd5b968362d331e5af453f374688f08195bb",
  "lib/cardiac-source-qualification.ts": "485870ba6c2cd78f99beeaecfa1c90cc9bd562d16e80802a51cb87e9ee0e66bb",
  "lib/age-source-qualification.ts": "ebca7f049bebdaef74ef1d07788397db051b1fb1a3596fb44c004fb03c649df9"
};
const escaped=(s:string)=>renderToStaticMarkup(createElement('span',null,s)).replace(/^<span>|<\/span>$/g,'');
test('source-note readability preserves exact scientific modules and canonical data',()=>{for(const [p,h] of Object.entries(pins))assert.equal(createHash('sha256').update(readFileSync(p)).digest('hex'),h);});
test('every scientific paragraph renders exactly once in original order with reversible known link labels',()=>{
 const allUrls=new Set<string>();
 for(const note of notes){
  const html=renderToStaticMarkup(createElement(SourceQualificationNote,{note,titleId:note.id+'-test-title'}));
  const paras=Array.from(html.matchAll(/<p data-source-paragraph="(\d+)">([\s\S]*?)<\/p>/g));
  assert.equal(paras.length,note.paragraphs.length);
  paras.forEach((match,index)=>{assert.equal(Number(match[1]),index);const restored=match[2].replace(/<a href="([^"]+)" target="_blank" rel="noreferrer">([\s\S]*?)<\/a>/g,(_:string,href:string,label:string)=>{
   const url=href.replaceAll('&amp;','&');assert.ok(sourceNoteLinkLabels[url],url);assert.equal(label,escaped(sourceNoteLinkLabels[url]));allUrls.add(url);return escaped(url);
  });assert.equal(restored,escaped(note.paragraphs[index]));});
  const expected=note.paragraphs.flatMap(s=>s.match(/https:\/\/[^\s]+/g)||[]).sort();
  const actual=Array.from(html.matchAll(/<a href="(https:[^"]+)"/g)).map(x=>x[1].replaceAll('&amp;','&')).sort();assert.deepEqual(actual,expected);
  assert.deepEqual(sourceNoteSections[note.id].flatMap(x=>x.indices),note.paragraphs.map((_,i)=>i));
  assert.equal((html.match(/href="#source-note-topics"/g)||[]).length,2);assert.doesNotMatch(html,/<details|<summary| hidden|aria-hidden|<script|<iframe/);
 }
 assert.deepEqual(Array.from(allUrls).sort(),Object.keys(sourceNoteLinkLabels).sort());
});
test('compact index precedes hero and preserves all stable note targets with visible status',()=>{
 const page=readFileSync('app/evidence/source-qualifications/page.tsx','utf8');assert.ok(page.indexOf('id="source-note-topics"')<page.indexOf('<EvidenceHeading'));
 assert.ok(page.includes('not additional canonical claims or scientific acceptance'));assert.ok(page.includes('Independent human scientific review remains pending'));
 for(const note of notes)assert.ok(page.includes('href="#'+note.id+'"'));assert.ok(page.includes('href="#caffeine-and-adenosine"'));
 assert.ok(page.includes('Original source video — nm1TxQj9IsQ'));assert.ok(page.includes('Read the cited primary source'));
 const css=readFileSync('app/evidence/source-qualifications/source-notes.css','utf8');assert.match(css,/:focus-visible/);assert.match(css,/forced-colors/);assert.doesNotMatch(css,/position:\s*(fixed|sticky)|display:\s*none|overflow:\s*hidden/);
});
