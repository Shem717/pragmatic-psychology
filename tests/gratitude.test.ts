import { restoreRepetitionBaseline } from './repetition-truth-baseline';
import { restoreDisagreementBaseline } from './disagreement-context-baseline';
import { restoreAutonomousBaseline } from './autonomous-goals-baseline';
import { restoreStressBaseline } from './stress-learning-baseline';
import { restoreCalibrationBaseline } from './policy-explanation-baseline';
import { restoreRetrievalBaseline } from './self-explanation-baseline';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import raw from '../content/public.json';
import taxonomyRaw from '../content/evidence-taxonomy.json';
import assertionsRaw from '../content/evidence-assertions.json';
import learningPathsRaw from '../content/learning-paths.json';
import { content, validateRelationships } from '../lib/content';
import { claimRelationships, relationshipHasRole, sampleDescription, sourceChecks, sourceClaims, sourceType } from '../lib/evidence';
import { evidenceAssertions, evidenceTargetDescription, validateEvidenceAssertions } from '../lib/evidence-assertions';
import { claimFacet, filterEvidenceClaims, initialEvidenceFilters } from '../lib/evidence-taxonomy';
import { SourceAssertions } from '../components/evidence/SourceAssertions';
import { EvidenceDeskSources } from '../features/observatory/EvidenceDesk';
const hash=(value:unknown)=>createHash('sha256').update(JSON.stringify(restoreRepetitionBaseline(restoreDisagreementBaseline(restoreAutonomousBaseline(restoreRetrievalBaseline(restoreCalibrationBaseline(restoreStressBaseline(value)))))))).digest('hex');
const ids=['R86','R87'];
// Later favor/liking additions are fingerprinted in favor-liking.test.ts.
const laterClaims=['CL-helping-liking-attraction'];
const c=content.claims.find(item=>item.id==='CL-gratitude-writing-comparators')!;
const source=(id:string)=>content.sources.find(item=>item.id===id)!;
const relationships=claimRelationships(c);
const escape=(text:string)=>text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;');
// Exact approved public v2 fingerprints; not a new scientific appraisal.
const expectedRecords:Record<string,string>={R86:'8f6540fc329d6cbec55a951606335443a536c1ef380e7201d0920ed08fac022c',R87:'d50408a6ce44e1b286fce5ef079f290dd8f60d7185895f6c389416f46065b71e','CL-gratitude-writing-comparators':'c3c9ccd06602f09d042b12353c9b078f0ee67ea97f87bbd894d747ec3037b15b'};

test('gratitude appends exact approved records, preserving all prior public objects, facets and assertions',()=>{
  assert.deepEqual(validateRelationships(),[]);assert.deepEqual(validateEvidenceAssertions(content),[]);
  assert.equal(content.claims.length,31);assert.equal(content.sources.length,102);assert.equal(content.models.length,4);
  assert.deepEqual(content.sources.slice(85,87).map(s=>s.id),ids);assert.deepEqual(content.claims.slice(28,29).map(item=>item.id),[c.id]);
  assert.equal(new Set(content.sources.map(s=>s.id)).size,102);assert.equal(new Set(content.claims.map(item=>item.id)).size,31);
  for(const record of [...raw.sources,...raw.claims])if(expectedRecords[record.id])assert.equal(hash(record),expectedRecords[record.id],record.id);
  const prior=structuredClone(raw);prior.sources=prior.sources.slice(0,85);prior.claims=prior.claims.slice(0,28);assert.equal(hash(prior),'074fda558e2cadcc9d80a89c96a978c7f8399dec4bc14bd92b6639cc1a5daccf');
  const priorTaxonomy=structuredClone(taxonomyRaw);priorTaxonomy.claimFacets=priorTaxonomy.claimFacets.filter(f=>![c.id,...laterClaims].includes(f.claimId));assert.equal(hash(priorTaxonomy),'f3cdaa800aa09a1a446cbb047e67d410fa6cfc02eae431efcdacea1b38147f15');
  assert.equal(hash(taxonomyRaw.claimFacets.filter(f=>f.claimId===c.id)),'81f5c7704cb80cb777f492e5c7ab3a599ef7f3f4c85a437fcfc53e7b4c071ca7');
  const priorAssertions=structuredClone(assertionsRaw);priorAssertions.edges=priorAssertions.edges.slice(0,100);assert.equal(hash(priorAssertions),'e4eb999348ef23560d000f9894782a3a058c851d850701128a2083a3b8bb0ae1');
  assert.equal(hash(evidenceAssertions.edges.slice(100,107)),'e03871ec74a5da7fdaacf741004b23a59c7b1c95515e922886c484986efc7fba');
});

test('seven gratitude assertions remain two mixed-role connections rather than independent votes',()=>{
  const added=evidenceAssertions.edges.slice(100,107);assert.equal(added.length,7);assert.equal(evidenceAssertions.edges.length,129);assert.equal(relationships.length,2);
  assert.equal(new Set(added.map(e=>JSON.stringify([e.claimId,e.sourceId]))).size,2);
  for(const id of ids){const r=relationships.find(r=>r.sourceId===id)!;assert.equal(r.role,'multiple');assert.equal(r.assertions?.length,id==='R86'?4:3);
    assert.deepEqual(r.assertions?.map(a=>a.relation),id==='R86'?['supports','supports','context','context']:['supports','supports','context']);
    assert.deepEqual(r.assertions?.map(a=>a.target),(id==='R86'?[0,1,2,5]:[3,4,5]).map(index=>`${c.id}.limitations[${index}]`));
    assert.equal((['supports','context'] as const).every(role=>relationshipHasRole(r,role)),true);assert.equal(relationshipHasRole(r,'qualifies'),false);assert.match(r.note,/not to the whole claim/);}
});

test('all seven resolved target texts, scopes and lineage labels render without raw field references',()=>{
  let rendered=0;for(const r of relationships){const html=renderToStaticMarkup(createElement(SourceAssertions,{relationship:r,claim:c}));rendered+=(html.match(/data-assertion-role=/g)||[]).length;
    for(const a of r.assertions!){const resolved=evidenceTargetDescription(a.target,c);assert.notEqual(resolved,a.target);assert.equal(html.split(`<dd>${escape(resolved)}</dd>`).length-1,1);assert.ok(html.includes(escape(a.studyLineage)));assert.ok(html.includes(escape(a.scope)));}
    assert.doesNotMatch(html,/CL-gratitude-writing-comparators\.limitations\[/);}
  assert.equal(rendered,7);
});

test('source classification, completer sample and overlapping synthesis counts remain exact and qualified',()=>{
  for(const id of ids){assert.equal(sourceType(source(id)),id==='R87'?'Research synthesis':'Study');assert.equal(source(id).retractionStatus,'unknown');assert.equal(sourceChecks(source(id)).find(check=>check.label==='Retraction check')?.state,'unknown');assert.equal(sampleDescription(source(id)).text,source(id).sampleSizeNote);}
  assert.equal(source('R86').sampleSize,129);assert.match(source('R86').sampleSizeNote!,/129 included completers\/adherers: 47 gratitude, 42 comparative pride and 40 semantic memory/);assert.match(source('R86').sampleSizeNote!,/Initial recruitment\/randomization totals and arm-specific attrition remain unknown/);
  assert.equal(source('R87').sampleSize,null);assert.match(source('R87').sampleSizeNote!,/26 manuscripts and 32 reported samples/);assert.match(source('R87').sampleSizeNote!,/do not sum them into unique participants or independent confirmations/);
});

test('occasion-specific nondetection is not zero effect or continuing differential improvement',()=>{
  assert.match(source('R86').summary,/statistically significant overall condition effect only at five weeks; the immediate and one-week tests were not statistically significant/);assert.match(source('R86').summary,/does not demonstrate continuing differential improvement/);
  assert.match(c.limitations[1],/time-by-condition interaction was not statistically significant/);assert.match(c.limitations[1],/nondetection is not proof of zero differences/);assert.match(c.limitations[0],/composite does not establish each component separately/);
});

test('specific comparators, expectancy uncertainty, populations and descriptive schedule remain bounded',()=>{
  assert.match(c.limitations[2],/superiority to others/);assert.match(c.limitations[2],/do not represent all memory writing, pride or positive activities/);assert.match(c.limitations[2],/equal expectancy was not established/);assert.match(c.limitations[2],/descriptive, not an optimal-dose recommendation/);
  assert.match(source('R86').population,/Do not assume every participant was an adult/);assert.match(source('R87').population,/Not an adult-writing-only estimate/);
});

test('synthesis positive estimates, nondetection and sensitivity are not flattened into a guarantee or null',()=>{
  assert.match(source('R87').summary,/d=\.14, 95% CI \.01 to \.27/);assert.match(source('R87').summary,/d=−\.03, −\.13 to \.07/);assert.match(c.limitations[3],/nondetection does not establish equivalence/);
  assert.match(c.limitations[4],/method-dependent sensitivity, not a corrected true effect or proof that gratitude activities are ineffective/);assert.match(c.limitations[4],/does not provide a separately established long-term persistence estimate/);
});

test('repeated follow-ups and overlapping synthesis subsets do not become independent confirmations',()=>{
  assert.match(source('R86').summary,/Follow-ups belong to one experiment, not separate replications/);assert.match(source('R86').summary,/participant-level independence was not verified/);assert.match(source('R87').summary,/Watkins 2008 appears.*Watkins 2015 report was not found/);
  assert.match(source('R87').summary,/does not certify participant-level independence/);assert.match(c.limitations[5],/comparator and outcome subsets overlap and cannot be added as independent confirmations/);
});

test('unchanged source-record component consumes exact approved summary, design, sample and access fields',()=>{
  const component=readFileSync('components/evidence/SourceRecord.tsx','utf8');for(const expression of ['source.summary','source.design','source.accessDepth','sampleDescription(source)','sample.text','sourceType(source)','relationshipLabels[role]'])assert.ok(component.includes(expression),expression);
  for(const id of ids){const s=source(id);assert.ok(s.summary.length>100);assert.ok(s.accessDepth.length>100);assert.equal(sampleDescription(s).text,s.sampleSizeNote);assert.match(s.accessDepth,/No local|no local/);}
});

test('qualified emotion navigation adds no practice, sleep report, existing-model support or guarantee',()=>{
  const facet=claimFacet(c.id)!;assert.equal(facet.disposition,'qualified');assert.deepEqual(facet.domainLinks.map(link=>[link.domainId,link.relation]),[['emotion-regulation','subject']]);assert.deepEqual(facet.disciplineLinks.map(link=>link.discipline),['understanding','discernment','stewardship']);
  assert.ok(filterEvidenceClaims(content.claims,{...initialEvidenceFilters,domain:'emotion-regulation'}).some(item=>item.id===c.id));for(const id of ids){assert.deepEqual(sourceClaims(id,content.claims).map(item=>item.claim.id),[c.id]);assert.ok(!content.models.some(model=>model.sourceIds.includes(id)));}
  assert.equal(c.confidence,'limited');assert.equal(c.reviewStatus,'educational-review');assert.match(c.reviewer,/independent human scientific review pending/);assert.match(c.notImplied[1],/No clinical prescription or obligation/);assert.match(c.notImplied[1],/does not replace addressing harm/);
  assert.doesNotMatch(JSON.stringify([c,...ids.map(source)]),/\bWood\b|\bMendes\b|\bsleep\b/i);assert.equal(hash(learningPathsRaw),'6e2e2a4aaf2e0fea2f55abc637c60c01e0a8c6307f8723531b48caeb4860ac49');assert.equal(content.videos.length,7);
});

test('Observatory retains two neutral scoped-role blocks with exact dossier-connection links',()=>{
  const html=renderToStaticMarkup(createElement(EvidenceDeskSources,{claim:c}));assert.equal((html.match(/data-source-id=/g)||[]).length,2);for(const id of ids){assert.equal(html.split(`data-source-id="${id}"`).length-1,1);assert.ok(html.includes(`data-source-id="${id}" data-role="multiple"`));assert.ok(html.includes(`/evidence/claims/${c.slug}#connection-${id}`));}assert.doesNotMatch(html,/Recorded supporting sources|Counterevidence recorded/);
});

test('draft markers, duplicate assertions and invalid targets are rejected without exporting private wrappers',()=>{
  for(const marker of ['GW-R1','GW-P2','GW-A3','GW-C1','GW-S1'])for(const field of ['scope','target','studyLineage'] as const){const copy=structuredClone(evidenceAssertions);copy.edges[100][field]=marker;assert.match(validateEvidenceAssertions(content,copy).join('\n'),/Draft or private context/);}
  const copy=structuredClone(evidenceAssertions);copy.edges.push({...copy.edges[100],scope:'Different wording',studyLineage:'Different lineage wording'});assert.match(validateEvidenceAssertions(content,copy).join('\n'),/Duplicate evidence assertion/);
  for(const target of [c.id+'.limitations[99]',c.id+'.limitations[-1]',c.id+'.limitations[01]','CL-cognitive-training-transfer.limitations[0]']){const invalid=structuredClone(evidenceAssertions);invalid.edges[100].target=target;assert.match(validateEvidenceAssertions(content,invalid).join('\n'),/Unresolved assertion target/);}
  assert.doesNotMatch(JSON.stringify([raw,taxonomyRaw,evidenceAssertions]),/(?:HM|BL|LT|ER|AG|PC|DG|BT|GW)-[SRCAP]\d|\/workspace\/|sourcePacketSha256|internalSourceMapping|internalPropositionLineage|sourceMetadataNotes|sourceFamilyNote|collisionCheck|private-reference/);
});
