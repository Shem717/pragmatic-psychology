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
const ids=['R88','R89'];
const c=content.claims.find(item=>item.id==='CL-helping-liking-attraction')!;
const source=(id:string)=>content.sources.find(item=>item.id===id)!;
const relationships=claimRelationships(c);
const escape=(text:string)=>text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;');
// Exact approved public v2 fingerprints; not a new scientific appraisal.
const expectedRecords:Record<string,string>={R88:'acb9d3cc3e2cfc65bea3ca4011d00424bafcef88c89188194560d293b4074deb',R89:'2d0f9ec4ec44d068074313261120ba2e2da31482e4fc1a3a2e731a91d11ba39a','CL-helping-liking-attraction':'7dfe0ec4e7f854bd2bd75faa933264a8cd4d4cd52177f4bd30392664e68414f7'};

test('favor/liking appends exact approved records while preserving every prior public object, facet and assertion',()=>{
  assert.deepEqual(validateRelationships(),[]);assert.deepEqual(validateEvidenceAssertions(content),[]);
  assert.equal(content.claims.length,39);assert.equal(content.sources.length,118);assert.equal(content.models.length,4);
  assert.deepEqual(content.sources.slice(87,89).map(s=>s.id),ids);assert.deepEqual(content.claims.slice(29,30).map(item=>item.id),[c.id]);
  assert.equal(new Set(content.sources.map(s=>s.id)).size,118);assert.equal(new Set(content.claims.map(item=>item.id)).size,39);
  for(const record of [...raw.sources,...raw.claims])if(expectedRecords[record.id])assert.equal(hash(record),expectedRecords[record.id],record.id);
  const prior=structuredClone(raw);prior.sources=prior.sources.slice(0,87);prior.claims=prior.claims.slice(0,29);assert.equal(hash(prior),'9e5a47c297d762b2c7cc737cbad157bfc3060f525ab083118ff79409a49d0d2a');
  const priorTaxonomy=structuredClone(taxonomyRaw);priorTaxonomy.claimFacets=priorTaxonomy.claimFacets.filter(f=>f.claimId!==c.id);assert.equal(hash(priorTaxonomy),'9a056af9e4ba54d68ad9fc870ccfb2e99fabdb20c2ee64db4cc80c9ba78fcc70');
  assert.equal(hash(taxonomyRaw.claimFacets.filter(f=>f.claimId===c.id)),'b49e088fde9228e84a74ac5df5a80d5265fc2a06852798691e19fb5c8519ad8f');
  const priorAssertions=structuredClone(assertionsRaw);priorAssertions.edges=priorAssertions.edges.slice(0,107);assert.equal(hash(priorAssertions),'e1423fa11c043724e641158c1de067aec2170556ca39972de2d08b6c92c7b236');
  assert.equal(hash(evidenceAssertions.edges.slice(107,115)),'6d877d64f059f966a4012ceaa786716397868fcb702228f17141fee42ba17502');
});

test('eight assertions remain one mixed R88 connection and one context-only R89 connection',()=>{
  const added=evidenceAssertions.edges.slice(107,115);assert.equal(added.length,8);assert.equal(evidenceAssertions.edges.length,165);assert.equal(relationships.length,2);
  assert.equal(new Set(added.map(e=>JSON.stringify([e.claimId,e.sourceId]))).size,2);
  for(const id of ids){const r=relationships.find(r=>r.sourceId===id)!;assert.equal(r.role,id==='R88'?'multiple':'context');assert.equal(r.assertions?.length,id==='R88'?5:3);
    assert.deepEqual(r.assertions?.map(a=>a.relation),id==='R88'?['supports','context','supports','context','context']:['context','context','context']);
    assert.deepEqual(r.assertions?.map(a=>a.target),(id==='R88'?[0,1,2,3,6]:[4,5,6]).map(index=>`${c.id}.limitations[${index}]`));
    assert.equal(relationshipHasRole(r,'supports'),id==='R88');assert.equal(relationshipHasRole(r,'context'),true);assert.equal(relationshipHasRole(r,'qualifies'),false);assert.match(r.note,/not to the whole claim/);}
  const r89=sourceClaims('R89',content.claims);assert.equal(r89.length,1);assert.equal(r89[0].role,'context');assert.equal(relationshipHasRole(r89[0],'supports'),false);
});

test('all eight canonical limitation targets, scopes and lineage labels render exactly without raw references',()=>{
  let rendered=0;for(const r of relationships){const html=renderToStaticMarkup(createElement(SourceAssertions,{relationship:r,claim:c}));rendered+=(html.match(/data-assertion-role=/g)||[]).length;
    for(const a of r.assertions!){const resolved=evidenceTargetDescription(a.target,c);assert.notEqual(resolved,a.target);assert.equal(html.split(`<dd>${escape(resolved)}</dd>`).length-1,1);assert.ok(html.includes(escape(a.studyLineage)));assert.ok(html.includes(escape(a.scope)));}
    assert.doesNotMatch(html,/CL-helping-liking-attraction\.limitations\[/);}
  assert.equal(rendered,8);
});

test('both reports are Studies with exact sample notes and unknown integrity, not inflated pooled samples',()=>{
  for(const id of ids){assert.equal(sourceType(source(id)),'Study');assert.equal(source(id).retractionStatus,'unknown');assert.equal(sourceChecks(source(id)).find(check=>check.label==='Retraction check')?.state,'unknown');assert.equal(sampleDescription(source(id)).text,source(id).sampleSizeNote);}
  assert.equal(source('R88').sampleSize,83);assert.match(source('R88').sampleSizeNote!,/83 reported participants/);assert.match(source('R88').sampleSizeNote!,/not interpret 83 as a verified initial-recruitment count/);
  assert.equal(source('R89').sampleSize,null);assert.match(source('R89').sampleSizeNote!,/83 completers: 57 students and 26 employees/);assert.match(source('R89').sampleSizeNote!,/99 initially, 16 withdrawals and 4 incomplete cases, leaving 79/);assert.match(source('R89').sampleSizeNote!,/Exact four-cell allocation remains unreconciled/);assert.match(source('R89').sampleSizeNote!,/No report-wide pooled participant total/);
});

test('source access depths preserve selected-original reading and unverified binary completeness',()=>{
  assert.match(source('R88').accessDepth,/Selected original accepted-manuscript/);assert.match(source('R88').accessDepth,/Publisher\/direct binary access failed/);assert.match(source('R88').accessDepth,/no local PDF-byte or visual table verification, complete-document read or raw-data reanalysis/);
  assert.match(source('R89').accessDepth,/Selected original Studies 5–6/);assert.match(source('R89').accessDepth,/not all six studies adjudicated/);assert.match(source('R89').accessDepth,/not byte-certified/);assert.match(source('R89').design,/random allocation for its directness factor and Study 6 was not established/);
});

test('outcome boundary is not a romantic efficacy claim or a universal null effect',()=>{
  assert.equal(c.takeaway,'Keep helping behavior, immediate liking and romantic interest separate; agreeing to a request does not by itself establish romantic interest.');
  assert.match(c.statement,/do not establish that giving favors creates romantic attraction or durable attachment/);assert.match(c.limitations[0],/not a romantic-desire measure/);assert.match(c.notImplied[1],/No universal absence of a romantic effect is claimed/);
  assert.match(c.notImplied[2],/No favor-escalation, repayment-withholding or pressure tactic/);assert.match(c.notImplied[2],/unsafe or unwanted contact/);assert.match(c.implications[0],/freedom to decline/);
});

test('both helping groups and bundled request features prevent an isolated-mechanism claim',()=>{
  assert.match(source('R88').design,/Both groups helped/);assert.match(c.limitations[1],/Requester identity, authority and wording changed together/);assert.match(c.limitations[1],/does not isolate doing a favor itself/);
  assert.match(c.limitations[2],/nonsignificant comparator liking changes do not establish zero change/);assert.match(c.limitations[2],/country interaction is not equivalence/);assert.match(c.limitations[2],/US instruction condition, perceived closeness did increase significantly even though liking did not/);assert.match(c.limitations[3],/costly or pressured requests/);
});

test('compliance context retains hypothetical motives, complete-case flow and bundled capped outcome',()=>{
  assert.match(c.limitations[4],/not reports of actual field recipients’ motives/);assert.match(c.limitations[4],/higher indirect-request estimate was not statistically significant/);
  assert.match(c.limitations[5],/Direct verbal requests and silently handed-out flyers also differed in contact and return logistics/);assert.match(c.limitations[5],/Nonreturns were assigned a capped value/);assert.match(c.limitations[5],/not an isolated pressure mechanism or an attraction test/);
  assert.match(source('R89').summary,/not confirmations of Niiya’s liking finding/);
});

test('versions, country samples and indexed coauthor names never become extra source votes',()=>{
  assert.match(source('R88').summary,/Online 2015 and issue 2016 are one report/);assert.match(source('R88').summary,/two country samples and multiple outcomes are not independent report votes/);
  assert.deepEqual(source('R89').authors,['Francis J. Flynn','Vanessa K. B. Lake']);assert.match(source('R89').summary,/later indexed as Vanessa K. Bohns; this is one report, not two/);
  assert.match(c.limitations[6],/must not be pooled into a participant total or counted as independent confirmations/);assert.match(c.limitations[7],/not a systematic field review, formal certainty assessment, raw-data reanalysis or validation of a custom method/);
  assert.doesNotMatch(JSON.stringify([c,...ids.map(source)]),/Jecker|Landy/);
});

test('qualified relationship navigation adds no model, practice or human scientific approval',()=>{
  const facet=claimFacet(c.id)!;assert.equal(facet.disposition,'qualified');assert.deepEqual(facet.domainLinks.map(link=>[link.domainId,link.relation]),[['relationships-belonging','subject']]);assert.deepEqual(facet.disciplineLinks.map(link=>link.discipline),['understanding','discernment','stewardship']);
  assert.ok(filterEvidenceClaims(content.claims,{...initialEvidenceFilters,domain:'relationships-belonging'}).some(item=>item.id===c.id));for(const id of ids){assert.deepEqual(sourceClaims(id,content.claims).map(item=>item.claim.id),[c.id]);assert.ok(!content.models.some(model=>model.sourceIds.includes(id)));}
  assert.equal(c.confidence,'limited');assert.equal(c.reviewStatus,'educational-review');assert.match(c.reviewer,/independent human scientific review pending/);assert.deepEqual(c.researchQuestionIds,[]);
  assert.equal(hash(learningPathsRaw),'6e2e2a4aaf2e0fea2f55abc637c60c01e0a8c6307f8723531b48caeb4860ac49');assert.equal(content.videos.length,7);
});

test('unchanged source component consumes exact approved summary, design, sample and access fields',()=>{
  const component=readFileSync('components/evidence/SourceRecord.tsx','utf8');for(const expression of ['source.summary','source.design','source.accessDepth','sampleDescription(source)','sample.text','sourceType(source)','relationshipLabels[role]'])assert.ok(component.includes(expression),expression);
  for(const id of ids){const s=source(id);assert.ok(s.summary.length>100);assert.ok(s.accessDepth.length>100);assert.equal(sampleDescription(s).text,s.sampleSizeNote);}
});

test('Observatory shows one neutral mixed-role block and one context-only block with exact dossier links',()=>{
  const html=renderToStaticMarkup(createElement(EvidenceDeskSources,{claim:c}));assert.equal((html.match(/data-source-id=/g)||[]).length,2);
  for(const id of ids){assert.equal(html.split(`data-source-id="${id}"`).length-1,1);assert.ok(html.includes(`data-source-id="${id}" data-role="${id==='R88'?'multiple':'context'}"`));assert.ok(html.includes(`/evidence/claims/${c.slug}#connection-${id}`));}
  assert.doesNotMatch(html,/Recorded supporting sources|Counterevidence recorded/);
});

test('private draft prefixes, duplicate identities and unresolved targets remain rejected',()=>{
  for(const marker of ['FL-R1','FL-P2','FL-A3','FL-C1','FL-S1','GW-R1','GW-P2','GW-A3'])for(const field of ['scope','target','studyLineage'] as const){const copy=structuredClone(evidenceAssertions);copy.edges[107][field]=marker;assert.match(validateEvidenceAssertions(content,copy).join('\n'),/Draft or private context/);}
  const copy=structuredClone(evidenceAssertions);copy.edges.push({...copy.edges[107],scope:'Different wording',studyLineage:'Different lineage wording'});assert.match(validateEvidenceAssertions(content,copy).join('\n'),/Duplicate evidence assertion/);
  for(const target of [c.id+'.limitations[99]',c.id+'.limitations[-1]',c.id+'.limitations[01]','CL-gratitude-writing-comparators.limitations[0]']){const invalid=structuredClone(evidenceAssertions);invalid.edges[107].target=target;assert.match(validateEvidenceAssertions(content,invalid).join('\n'),/Unresolved assertion target/);}
  assert.doesNotMatch(JSON.stringify([raw,taxonomyRaw,evidenceAssertions]),/(?:HM|BL|LT|ER|AG|PC|DG|BT|GW|FL)-[SRCAP]\d|\/workspace\/|sourcePacketSha256|internalSourceMapping|internalPropositionLineage|sourceMetadataNotes|sourceFamilyNote|collisionCheck|private-reference|mindplicit/);
});
