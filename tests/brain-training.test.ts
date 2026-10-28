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
const ids=['R82','R83','R84','R85'];
// Later gratitude additions are fingerprinted in gratitude.test.ts.
const laterClaims=["CL-gratitude-writing-comparators","CL-helping-liking-attraction"];
const c=content.claims.find(item=>item.id==='CL-cognitive-training-transfer')!;
const source=(id:string)=>content.sources.find(item=>item.id===id)!;
const relationships=claimRelationships(c);
const escape=(text:string)=>text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;');
// Exact approved public v2 fingerprints; not a new scientific appraisal.
const expectedRecords:Record<string,string>={
  R82:'51eceb92a94261810045103cffa99e506877669e01e2800ff42e47d8b85654a2',
  R83:'ff301f921f4146c529e3e5848da6d12abc6b699a5f432e19e8d1b7cdedff202f',
  R84:'39740fa1a248a4e275f1f5080790c1c3f76558953175a142290dfbf9872fb619',
  R85:'5da2ab78ffb91631c6d265387bedbf2a86bdbc2785cffc282e09a6793f9e5467',
  'CL-cognitive-training-transfer':'1a5370d09118ceb98c0e349dad241b0fb5fcc6f34cf584c9ce55e6b205e2b416',
};

test('cognitive training appends only approved records while all 27 prior claims, 81 reports and other public collections stay exact',()=>{
  assert.deepEqual(validateRelationships(),[]);assert.deepEqual(validateEvidenceAssertions(content),[]);
  assert.equal(content.claims.length,33);assert.equal(content.sources.length,107);assert.equal(content.models.length,4);
  assert.deepEqual(content.sources.slice(81,85).map(s=>s.id),ids);assert.deepEqual(content.claims.slice(27,28).map(item=>item.id),[c.id]);
  assert.equal(new Set(content.sources.map(s=>s.id)).size,107);assert.equal(new Set(content.claims.map(item=>item.id)).size,33);
  for(const record of [...raw.sources,...raw.claims])if(expectedRecords[record.id])assert.equal(hash(record),expectedRecords[record.id],record.id);
  const prior=structuredClone(raw);prior.sources=prior.sources.slice(0,81);prior.claims=prior.claims.slice(0,27);assert.equal(hash(prior),'295a64807a15059d6714a132453f0ee14187aa6521ecc3a76e0fd44c8a5b06ea');
  const priorTaxonomy=structuredClone(taxonomyRaw);priorTaxonomy.claimFacets=priorTaxonomy.claimFacets.filter(f=>![c.id,...laterClaims].includes(f.claimId));assert.equal(hash(priorTaxonomy),'867987ac3b894e292a817627e26df731172af8cafbd26930bae08929c24ee118');
  assert.equal(hash(taxonomyRaw.claimFacets.filter(f=>f.claimId===c.id)),'80d621101a1779efa2c87f0bd6fad00ef34bb985c3bd44642a0d450eb9e71454');
  const priorAssertions=structuredClone(assertionsRaw);priorAssertions.edges=priorAssertions.edges.slice(0,92);assert.equal(hash(priorAssertions),'25f603e89fa9d80436105de187d68bcd1f174e6a2f14f40f4363a55df4ebd860');
  assert.equal(hash(evidenceAssertions.edges.slice(92,100)),'e4d901e469af6f41033db73015fe3efb9e5eb5d42cdc295cdbee40cda83936aa');
});

test('eight exact cognitive-training assertions remain four mixed-role connections, never eight votes or blanket source support',()=>{
  const added=evidenceAssertions.edges.slice(92,100);assert.equal(added.length,8);assert.equal(evidenceAssertions.edges.length,139);assert.equal(relationships.length,4);
  assert.equal(new Set(added.map(e=>JSON.stringify([e.claimId,e.sourceId]))).size,4);
  for(let index=0;index<ids.length;index++){
    const id=ids[index];
    const r=relationships.find(r=>r.sourceId===id)!;assert.equal(r.role,'multiple');assert.equal(r.assertions?.length,2);
    assert.deepEqual(r.assertions?.map(a=>a.relation),['supports','context']);
    assert.equal(r.assertions?.[0].target,`${c.id}.limitations[${index}]`);assert.equal(r.assertions?.[1].target,`${c.id}.limitations[4]`);
    assert.equal((['supports','context'] as const).every(role=>relationshipHasRole(r,role)),true);
    assert.equal((['supports','qualifies'] as const).every(role=>relationshipHasRole(r,role)),false);
    assert.match(r.note,/not to the whole claim/);
  }
});

test('each cognitive-training assertion renders its exact resolved target, scope and lineage once without raw field references',()=>{
  let rendered=0;
  for(const r of relationships){
    const html=renderToStaticMarkup(createElement(SourceAssertions,{relationship:r,claim:c}));rendered+=(html.match(/data-assertion-role=/g)||[]).length;
    for(const a of r.assertions!){const resolved=evidenceTargetDescription(a.target,c);assert.notEqual(resolved,a.target);assert.equal(html.split(`<dd>${escape(resolved)}</dd>`).length-1,1);assert.ok(html.includes(escape(a.studyLineage)));assert.ok(html.includes(escape(a.scope)));}
    assert.doesNotMatch(html,/CL-cognitive-training-transfer\.limitations\[/);
  }
  assert.equal(rendered,8);
});

test('three experiments and one overlapping research synthesis keep explicit samples and unknown retraction checks',()=>{
  for(const id of ids){assert.equal(sourceType(source(id)),id==='R85'?'Research synthesis':'Study');assert.equal(source(id).retractionStatus,'unknown');assert.equal(sourceChecks(source(id)).find(check=>check.label==='Retraction check')?.state,'unknown');assert.equal(sampleDescription(source(id)).text,source(id).sampleSizeNote);}
  assert.equal(source('R85').sampleSize,null);assert.match(source('R85').sampleSizeNote!,/87 publications and 145 reported comparisons/);assert.match(source('R85').sampleSizeNote!,/not 145 independently verified samples/);assert.match(source('R85').sampleSizeNote!,/No unique participant total/);
});

test('enrollment, retained analysis and endpoint denominators remain distinct without resolving the omitted session threshold',()=>{
  assert.equal(source('R82').sampleSize,11430);assert.match(source('R82').sampleSizeNote!,/52,617 registered.*11,430.*4,678.*4,014.*2,738/);assert.match(source('R82').sampleSizeNote!,/not initial randomized denominators.*control dropout was greater/);assert.doesNotMatch(source('R82').design+' '+source('R82').sampleSizeNote,/at least two|more than two|minimum.*sessions/i);
  assert.equal(source('R83').sampleSize,69);assert.match(source('R83').sampleSizeNote!,/70 initially.*35 training and 35 control.*34 training and 35 control/);
  assert.equal(source('R84').sampleSize,73);assert.match(source('R84').sampleSizeNote!,/130 at least pretested; 75 completed.*two control completers excluded.*24 n-back, 29 visual-search and 20 control/);assert.match(source('R84').sampleSizeNote!,/Some cognitive endpoints have smaller denominators/);
});

test('positive exceptions and nondetection survive rather than becoming universal zero-effect or no-benefit claims',()=>{
  assert.match(source('R82').summary,/small and positive \(d=\.17 and \.22/);assert.match(source('R82').summary,/other memory results differed by endpoint and sometimes favored control/);
  assert.match(source('R83').summary,/positive training-by-session interaction.*partial η²=\.07/);
  assert.match(source('R84').summary,/article-stated α=\.01 threshold; this does not exclude small effects/);assert.doesNotMatch(source('R84').summary,/prespecified|equivalence/);
  assert.match(c.limitations[3],/reading-comprehension \(g=\.15\).*delayed-arithmetic \(g=\.22\).*sensitivity analyses \(\.08 and \.14\)/);assert.match(c.limitations[3],/inaccurate to describe every estimate as zero or nonsignificant/);
  assert.match(c.notImplied[0],/Not all cognitive training is ineffective/);assert.match(c.limitations[6],/Nondetection is not proof of zero effect/);
});

test('study-family overlap and later Jaeggi augmentation are visible in each relevant public summary, not private metadata',()=>{
  assert.match(source('R82').summary,/synthesis listed here excluded this report/);
  assert.match(source('R83').summary,/author-supplied active-control data and working-memory outcomes absent from the original article/);assert.match(source('R83').summary,/do not change the original passive-control design/);
  assert.match(source('R84').summary,/included in the 2016 synthesis.*not an additional independent confirmation/);assert.match(source('R84').summary,/2012 online-first and 2013 issue publication are one report/);
  assert.match(source('R85').summary,/includes Jaeggi and Redick study families but excludes Owen/);assert.match(source('R85').summary,/Review and included reports are not independent confirmations/);
  assert.match(c.limitations[5],/Shared controls and included trials prevent counting comparisons or reports as independent confirmation votes/);
});

test('unchanged source-record component consumes public summaries, design, sample notes and access scope directly',()=>{
  const component=readFileSync('components/evidence/SourceRecord.tsx','utf8');
  for(const expression of ['source.summary','source.design','source.accessDepth','sampleDescription(source)','sample.text','sourceType(source)','relationshipLabels[role]'])assert.ok(component.includes(expression),expression);
  for(const id of ids){const s=source(id);assert.ok(s.summary.length>100);assert.ok(s.accessDepth.length>100);assert.equal(sampleDescription(s).text,s.sampleSizeNote);}
});

test('training, timing, everyday and clinical boundaries retain limited confidence and pending human review',()=>{
  assert.equal(c.confidence,'limited');assert.match(c.reviewer,/independent human scientific review pending/);
  assert.match(c.scope,/bounded report comparison, not a comprehensive review/);assert.match(c.limitations[6],/not a systematic field review, formal certainty assessment or raw-data reanalysis/);
  assert.match(source('R82').summary,/end of training, not delayed retention/);assert.match(source('R83').summary,/1–2 days after training/);assert.match(source('R84').summary,/actual behavior was not verified.*No delayed retention test/);
  assert.match(source('R85').population,/not healthy-only or a targeted rehabilitation efficacy estimate/);assert.match(source('R85').summary,/Follow-up was sparse and varied/);
  assert.match(c.limitations[4],/do not establish general everyday competence, dementia prevention or targeted clinical rehabilitation efficacy/);assert.match(c.limitations[6],/none of these findings validates the site’s integrated learning method/);
});

test('qualified learning navigation adds no support to retrieval, motor imagery, existing models or educational practices',()=>{
  const facet=claimFacet(c.id)!;assert.equal(facet.disposition,'qualified');assert.deepEqual(facet.domainLinks.map(link=>[link.domainId,link.relation]),[['learning-memory','subject']]);assert.deepEqual(facet.disciplineLinks.map(link=>link.discipline),['understanding','competence','discernment']);
  assert.ok(filterEvidenceClaims(content.claims,{...initialEvidenceFilters,domain:'learning-memory'}).some(item=>item.id===c.id));
  for(const id of ids){assert.deepEqual(sourceClaims(id,content.claims).map(item=>item.claim.id),[c.id]);assert.ok(!content.models.some(model=>model.sourceIds.includes(id)));}
  for(const id of ['CL-retrieval-retention-transfer','CL-motor-imagery-scope'])assert.ok(!content.claims.find(item=>item.id===id)!.sourceIds.some(sourceId=>ids.includes(sourceId)));
  assert.equal(hash(learningPathsRaw),'6e2e2a4aaf2e0fea2f55abc637c60c01e0a8c6307f8723531b48caeb4860ac49');assert.equal(content.videos.length,7);
});

test('Observatory training sources retain four neutral scoped-role blocks with exact dossier-connection links',()=>{
  const html=renderToStaticMarkup(createElement(EvidenceDeskSources,{claim:c}));assert.equal((html.match(/data-source-id=/g)||[]).length,4);
  for(const id of ids){assert.equal(html.split(`data-source-id="${id}"`).length-1,1);assert.ok(html.includes(`data-source-id="${id}" data-role="multiple"`));assert.ok(html.includes(`/evidence/claims/${c.slug}#connection-${id}`));}
  assert.doesNotMatch(html,/Recorded supporting sources|Counterevidence recorded/);
});

test('training draft markers, duplicates, invalid and cross-claim target references are rejected without exposing private research wrappers',()=>{
  for(const marker of ['BT-S1','BT-C2','BT-A3'])for(const field of ['scope','target','studyLineage'] as const){const copy=structuredClone(evidenceAssertions);copy.edges[92][field]=marker;assert.match(validateEvidenceAssertions(content,copy).join('\n'),/Draft or private context/);}
  const copy=structuredClone(evidenceAssertions);copy.edges.push({...copy.edges[92],scope:'Different wording',studyLineage:'Different lineage wording'});assert.match(validateEvidenceAssertions(content,copy).join('\n'),/Duplicate evidence assertion/);
  for(const target of [c.id+'.limitations[99]',c.id+'.limitations[-1]',c.id+'.limitations[01]','CL-motor-imagery-scope.limitations[0]']){const invalid=structuredClone(evidenceAssertions);invalid.edges[92].target=target;assert.match(validateEvidenceAssertions(content,invalid).join('\n'),/Unresolved assertion target/);}
  assert.doesNotMatch(JSON.stringify([raw,taxonomyRaw,evidenceAssertions]),/(?:HM|BL|LT|ER|AG|PC|DG|BT)-[SCA]\d|\/workspace\/|sourcePacketSha256|internalSourceMapping|internalPropositionLineage|sourceMetadataNotes|sourceFamilyNote|collisionCheck|private-reference/);
});
