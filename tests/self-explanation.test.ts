import { restoreDisagreementBaseline } from './disagreement-context-baseline';
import { restoreAutonomousBaseline } from './autonomous-goals-baseline';
import { restoreStressBaseline } from './stress-learning-baseline';
import { restoreCalibrationBaseline } from './policy-explanation-baseline';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import raw from '../content/public.json';
import assertionsRaw from '../content/evidence-assertions.json';
import taxonomyRaw from '../content/evidence-taxonomy.json';
import pathsRaw from '../content/learning-paths.json';
import {content,validateRelationships} from '../lib/content';
import {claimRelationships,relationshipHasRole,sourceClaims,sourceType,sourceChecks} from '../lib/evidence';
import {evidenceAssertions,evidenceTargetDescription,validateEvidenceAssertions} from '../lib/evidence-assertions';
import {SourceAssertions} from '../components/evidence/SourceAssertions';
import {readFileSync} from 'node:fs';
import {EvidenceDeskSources} from '../features/observatory/EvidenceDesk';
import {restoreRetrievalBaseline,boundaryNote,boundaryHistory} from './self-explanation-baseline';
const hash=(x:unknown)=>createHash('sha256').update(JSON.stringify(restoreDisagreementBaseline(restoreAutonomousBaseline(restoreCalibrationBaseline(x))))).digest('hex');
const c=content.claims.find(x=>x.id==='CL-retrieval-retention-transfer')!;
const s=content.sources.find(x=>x.id==='R90')!;
const e=evidenceAssertions.edges[115];
const escape=(x:string)=>x.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;');

test('one contextual source and edge preserve the exact full prior baseline after only authorized reversal',()=>{
  assert.equal(hash(raw.sources[89]),'61e1ccfca66c657fffde5109e24571415bcd0a4082af4ff0338dd29487ecbaa1');
  assert.equal(hash(assertionsRaw.edges[115]),'4037dc2ec60bc207790dead69e226db7d78da5a448264f74c365ed2f7fda08fd');
  assert.equal(hash(restoreStressBaseline(raw.claims.find(x=>x.id===c.id))),'26787238088521feeb54c7996c21648c32d1c16e9215c7fd08566d1f3ebd2dae');
  assert.deepEqual(validateRelationships(),[]);assert.deepEqual(validateEvidenceAssertions(content),[]);
  assert.equal(content.claims.length,30);assert.equal(content.sources.length,99);assert.equal(content.models.length,4);assert.equal(evidenceAssertions.edges.length,125);
  assert.deepEqual(raw.sources.slice(89,90).map(x=>x.id),['R90']);
  const prior=structuredClone(raw);prior.sources=prior.sources.slice(0,89);
  assert.equal(hash(restoreRetrievalBaseline(restoreStressBaseline(prior))),'edbee8723aee47c0af1b73e4de2c18b9585d3a0563ee9859fd1cf4f8b1271bfc');
  const priorEdges=structuredClone(assertionsRaw);priorEdges.edges=priorEdges.edges.slice(0,115);
  assert.equal(hash(priorEdges),'08854a5e039f84b0fc3fbace07b136be015bb19ee07ffff33076abe4f3175bf6');
  assert.equal(hash(taxonomyRaw),'03393ae8c75a3de8f497ce5bd05280f09356a84bbd8ceeb6abf6ad56b1433e39');
  assert.equal(hash(pathsRaw),'6e2e2a4aaf2e0fea2f55abc637c60c01e0a8c6307f8723531b48caeb4860ac49');
  assert.equal(c.contentVersion,'1.2');assert.deepEqual(c.history[1],boundaryHistory);assert.equal(c.limitations[4],boundaryNote);
});

test('reversal rejects changed, missing or extra allowed fields rather than hiding drift',()=>{
  const original=restoreStressBaseline(raw.claims.find(x=>x.id===c.id)!) as typeof raw.claims[number];
  for(const mutate of [(x:typeof original)=>x.limitations.push('extra'),(x:typeof original)=>x.limitations[4]='different',(x:typeof original)=>x.sourceIds.push('R89'),(x:typeof original)=>x.contentVersion='1.2',(x:typeof original)=>x.history[1].change='different']){
    const copy=structuredClone(original);mutate(copy);assert.throws(()=>restoreRetrievalBaseline(copy));
  }
  const copy=structuredClone(original);copy.statement='unexpected substantive change';assert.notEqual(createHash('sha256').update(JSON.stringify(restoreRetrievalBaseline(copy))).digest('hex'),createHash('sha256').update(JSON.stringify(restoreRetrievalBaseline(original))).digest('hex'));
});

test('R90 maps only to the new limitation as context, never the retrieval statement',()=>{
  assert.equal(e.claimId,c.id);assert.equal(e.sourceId,'R90');assert.equal(e.relation,'context');assert.equal(e.target,c.id+'.limitations[4]');assert.equal(evidenceTargetDescription(e.target,c),boundaryNote);
  const links=sourceClaims('R90',content.claims);assert.equal(links.length,1);assert.equal(links[0].role,'context');
  const r=claimRelationships(c).find(x=>x.sourceId==='R90')!;assert.equal(r.role,'context');assert.equal(r.assertions?.length,1);assert.equal(relationshipHasRole(r,'supports'),false);assert.equal(relationshipHasRole(r,'qualifies'),false);
  assert.ok(!content.models.some(m=>m.sourceIds.includes('R90')));
  const html=renderToStaticMarkup(createElement(SourceAssertions,{relationship:r,claim:c}));assert.ok(html.includes(escape(boundaryNote)));assert.doesNotMatch(html,/CL-retrieval-retention-transfer\.limitations/);
  const desk=renderToStaticMarkup(createElement(EvidenceDeskSources,{claim:c}));assert.ok(desk.includes('data-source-id="R90" data-role="context"'));assert.ok(desk.includes('/evidence/claims/retrieval-retention-transfer#connection-R90'));
});

test('exact child procedure and interpretation limits survive in visible source details',()=>{
  assert.equal(sourceType(s),'Study');assert.equal(s.sampleSize,46);assert.equal(s.year,2023);assert.equal(s.url,'https://doi.org/10.1111/desc.13274');
  assert.match(s.design,/23 per arm/);assert.match(s.design,/identical adult demonstrations/);assert.match(s.design,/alternating in two-trial blocks/);assert.match(s.design,/After adult and own choices/);assert.match(s.design,/which card was chosen/);assert.match(s.design,/No corrective feedback/);
  assert.match(s.summary,/not a separate transfer test or delayed retention/);assert.match(s.summary,/choosing the identical-pair card without comparing/);assert.match(s.summary,/not an experimentally established mediator/);assert.match(s.summary,/No adult comparison, IQ outcome or AI condition/);
  assert.match(s.sampleSizeNote!,/six additional children were excluded/);assert.match(s.sampleSizeNote!,/versions of this same report/);assert.match(s.accessDepth,/Selected Methods, Results and Discussion/);assert.match(s.accessDepth,/no raw-data\/code reanalysis or independent retraction check/);
  assert.equal(s.retractionStatus,'unknown');assert.equal(sourceChecks(s).find(x=>x.label==='Retraction check')?.state,'unknown');
  // SourceRecord imports CSS through its companion; exact rendered values are separately checked in the production export.
  const component=readFileSync('components/evidence/SourceRecord.tsx','utf8');for(const expression of ['source.summary','source.design','source.accessDepth','sampleDescription(source)','sample.text','sourceType(source)','relationshipLabels[role]'])assert.ok(component.includes(expression),expression);
});
