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
import learningPathsRaw from '../content/learning-paths.json';
import { content, publicSchema, validateRelationships } from '../lib/content';
import { aggregateReviewedRelationship, claimRelationships, relationshipHasRole, relationshipLabels, sampleDescription, sourceClaims, sourceType } from '../lib/evidence';
import { evidenceAssertions, evidenceTargetDescription, reviewedEvidenceEdges, validateEvidenceAssertions } from '../lib/evidence-assertions';
import { claimFacet, filterEvidenceClaims, initialEvidenceFilters } from '../lib/evidence-taxonomy';
import { SourceAssertions } from '../components/evidence/SourceAssertions';
import { RelatedPublications } from '../components/evidence/RelatedPublications';
const hash=(value:unknown)=>createHash('sha256').update(JSON.stringify(restoreRepetitionBaseline(restoreDisagreementBaseline(restoreAutonomousBaseline(restoreRetrievalBaseline(restoreCalibrationBaseline(restoreStressBaseline(value)))))))).digest('hex');
const newSources=['R58','R59','R60','R61','R62'];
const upgradedSources=['R15','R16','R32','R33','R34'];
const newClaims=['CL-regulation-choice-outcome','CL-expression-experience','CL-acceptance-associations'];
// Separate agency additions and the habit-context enrichment have exact fingerprints in agency.test.ts.
const laterSources=["R63","R64","R65","R66","R67","R68","R69","R70","R71","R21","R72","R73","R74","R75","R76","R77","R78","R79","R80","R81","R82","R83","R84","R85","R86","R87","R88","R89","R90","R91","R92","R93","R94","R95","R96","R97","R98","R99"];
const laterClaims=["CL-habit-context","CL-situation-instruction-package","CL-action-planning-timing","CL-depletion-belief-boundaries","CL-imagery","CL-calibration-training-boundaries","CL-imagery-reality-confidence","CL-delay-outcome-associations","CL-cognitive-training-transfer","CL-gratitude-writing-comparators","CL-helping-liking-attraction"];
const source=(id:string)=>content.sources.find(item=>item.id===id)!;
const claim=(id:string)=>content.claims.find(item=>item.id===id)!;
const edge=(id:string,sourceId:string)=>claimRelationships(claim(id)).find(item=>item.sourceId===sourceId)!;
const escape=(text:string)=>text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;');
// Exact reviewed v3 public projection and taxonomy v2 fingerprints.
const expectedRecords:Record<string,string>={
  "R15": "4d49eae2e94129857e88557c31771cf54f1a659bb9908b81100aa8aaf88cc83f",
  "R16": "205fed6b79bc30b8b0124b3e5951cc8ced91b68e1ddbf5ac135076aada0e4026",
  "R32": "f9695599bf09c690ec0cb8286cdc8cb91012616c7fa5a1c4ed4b2688191459de",
  "R33": "c0cfd0c1dc09fa9d6f30ab136e2c0f497c8dab31cda70417a4c7bddf524dabf1",
  "R34": "9daeb0948db4cb7f912f404c942a75ca58006430a5afe40c7f389b0ebaa1d47c",
  "R58": "266f02018fd537cd91549de03892c9f0ba88625d0c0f0ce8172764c87f81172b",
  "R59": "c6a0a7da696019287b5bdc7ea981d4578bf37f5cbb7a1bf5571bf8bf50b83e83",
  "R60": "f2585e7944cd158bbe5084e7185813ad55c3377de07e71465292765e3d32e74b",
  "R61": "fcfc187d56bf82d5c51e0013b040ad59c104f6247d58b40574a7bb46d999b059",
  "R62": "ca42d4a1cbafc4a90a46cf103273f908a47c368cf50f35ba7c21ba0296f99dfa",
  "CL-flexibility": "3322749b66bf87f43bb08fd411ad150c16160a11d85c92c19a4e39d9377e4038",
  "CL-regulation-choice-outcome": "e3d9dc590a3158c65d511779190d0cd8437b3d5df55a6d43af5bc12d07b7d093",
  "CL-expression-experience": "e473e2257cee84b68ac83ac3dd34a9519e0f22ed5b4f71cba86beb1718e11bf5",
  "CL-acceptance-associations": "db02c2b1bde9ccf1c8095332ac496e8d6fe41680e50f84af7ebe0761b99fa36a"
};

test('emotion lands the exact reviewed delta and preserves every other public record',()=>{
  assert.deepEqual(validateRelationships(),[]);assert.deepEqual(validateEvidenceAssertions(content),[]);
  assert.equal(content.claims.length,44);assert.equal(content.sources.length,131);assert.equal(content.models.length,4);
  assert.equal(new Set(content.claims.map(item=>item.id)).size,44);assert.equal(new Set(content.sources.map(item=>item.id)).size,131);
  assert.deepEqual(content.sources.slice(57,62).map(item=>item.id),newSources);assert.deepEqual(content.claims.slice(18,21).map(item=>item.id),newClaims);
  for(const record of [...raw.sources,...raw.claims])if(expectedRecords[record.id])assert.equal(hash(record),expectedRecords[record.id],record.id);
  const prior=structuredClone(raw);prior.sources=prior.sources.filter(item=>![...newSources,...upgradedSources,...laterSources].includes(item.id));prior.claims=prior.claims.filter(item=>![...newClaims,'CL-flexibility',...laterClaims].includes(item.id));assert.equal(hash(prior),'943c4bfbe0283eddffdc82d190a1cd6d63d7cfd98b6ed1a1c3bbc4cbc53907fb');
  const priorTaxonomy=structuredClone(taxonomyRaw);priorTaxonomy.claimFacets=priorTaxonomy.claimFacets.filter(facet=>['CL-habit-context','CL-imagery'].includes(facet.claimId)||!laterClaims.includes(facet.claimId));
  assert.equal(hash(priorTaxonomy),'5bfc7158012af14a46b3632df1b7e19b7a02de34e831419d0f9b27683df9d48a');assert.equal(hash(evidenceAssertions.edges.slice(26,44)),'e6a9c7a6a497dc36c91ce6d11b8f399e1a9abfc45fe1bb2602840104991a8446');
});

test('18 new assertions retain ten unique claim-source connections and nine distinct connected reports',()=>{
  const additions=evidenceAssertions.edges.slice(26,44);assert.equal(additions.length,18);assert.equal(evidenceAssertions.edges.length,196);
  assert.equal(new Set(additions.map(item=>JSON.stringify([item.claimId,item.sourceId]))).size,10);assert.equal(new Set(additions.map(item=>item.sourceId)).size,9);
  assert.equal([...newClaims,'CL-flexibility'].reduce((sum,id)=>sum+claimRelationships(claim(id)).filter(r=>!["R98","R99"].includes(r.sourceId)).length,0),10);
  for(const id of [...newClaims,'CL-flexibility']){
    const relationships=claimRelationships(claim(id)).filter(r=>!["R98","R99"].includes(r.sourceId));assert.equal(new Set(relationships.map(item=>item.sourceId)).size,relationships.length);
    assert.equal(relationships.flatMap(item=>item.assertions??[]).length,additions.filter(item=>item.claimId===id).length);
  }
});

test('mixed-role sources use a neutral overview and match each actual role without blanket all-role claims',()=>{
  const r58=edge(newClaims[0],'R58');assert.equal(r58.role,'multiple');assert.equal(relationshipLabels[r58.role],'Multiple scoped roles');
  assert.equal(r58.assertions?.length,2);assert.equal(relationshipHasRole(r58,'supports'),true);assert.equal(relationshipHasRole(r58,'qualifies'),true);assert.equal(relationshipHasRole(r58,'context'),false);assert.equal(relationshipHasRole(r58,'conflicts'),false);
  const relationships=claimRelationships(claim(newClaims[0]));
  assert.deepEqual(relationships.filter(item=>relationshipHasRole(item,'supports')).map(item=>item.sourceId).sort(),['R58','R59']);
  assert.deepEqual(relationships.filter(item=>relationshipHasRole(item,'qualifies')).map(item=>item.sourceId).sort(),['R58','R59']);
  assert.deepEqual(relationships.filter(item=>relationshipHasRole(item,'context')).map(item=>item.sourceId),['R33']);
  assert.deepEqual(relationships.filter(item=>(['supports','qualifies'] as const).every(role=>relationshipHasRole(item,role))).map(item=>item.sourceId).sort(),['R58','R59']);
  assert.deepEqual(relationships.filter(item=>(['supports','context'] as const).every(role=>relationshipHasRole(item,role))).map(item=>item.sourceId),[],'All-role matching is not any-role matching');
  assert.deepEqual(relationships.filter(item=>(['supports','context'] as const).some(role=>relationshipHasRole(item,role))).map(item=>item.sourceId).sort(),['R33','R58','R59']);
  assert.equal(sourceClaims('R16',content.claims).find(item=>item.claim.id==='CL-flexibility')?.role,'multiple');
});

test('same-role multi-target aggregation retains every target and unchanged single/legacy semantics',()=>{
  const assertions=reviewedEvidenceEdges(newClaims[0],'R58').map(item=>({...item,relation:'qualifies' as const}));
  const same=aggregateReviewedRelationship('R58',assertions)!;assert.equal(same.role,'qualifies');assert.equal(same.assertions?.length,2);assert.equal(relationshipHasRole(same,'supports'),false);
  const single=edge('CL-habit-timescale','R39');assert.equal(single.role,'supports');assert.equal(single.target,'CL-habit-timescale.statement');assert.match(single.note,/not a universal deadline/);
  const legacy=edge('CL-fmt','R27');assert.equal(legacy.role,'conflicts');assert.match(legacy.note,/does not contradict/);assert.equal(legacy.assertions,undefined);
  assert.equal(aggregateReviewedRelationship('R58',[]),undefined);
});

test('assertion uniqueness is the four-field key, not pair-only or narrative-dependent',()=>{
  assert.deepEqual(validateEvidenceAssertions(content),[]);
  const copy=structuredClone(evidenceAssertions);const duplicate={...copy.edges[26],scope:'Different wording must not duplicate an assertion',studyLineage:'different-narrative-label'};copy.edges.push(duplicate);
  assert.match(validateEvidenceAssertions(content,copy).join('\n'),/Duplicate evidence assertion/);
  const valid=structuredClone(evidenceAssertions);valid.edges.push({...valid.edges[26],relation:'context'});assert.deepEqual(validateEvidenceAssertions(content,valid),[],'Distinct reviewed relation is a distinct assertion; this is only schema validation, not review approval');
});

test('the full dossier renders each approved target, role, scope and lineage exactly once per source',()=>{
  for(const id of [...newClaims,'CL-flexibility'])for(const relationship of claimRelationships(claim(id))){
    const html=renderToStaticMarkup(createElement(SourceAssertions,{relationship,claim:claim(id)}));const assertions=relationship.assertions!;
    assert.equal((html.match(/data-assertion-role=/g)||[]).length,assertions.length);
    for(const assertion of assertions){
      const target=escape(evidenceTargetDescription(assertion.target,claim(id)));assert.equal(html.split(`<dd>${target}</dd>`).length-1,1,assertion.target);
      assert.ok(html.includes(escape(relationshipLabels[assertion.relation])));assert.ok(html.includes(escape(assertion.studyLineage)));
      if(assertions.length>1)assert.ok(html.includes(escape(assertion.scope)));
      else assert.equal(relationship.note,assertion.scope,'Single-edge exact scope remains immediately above the disclosure');
    }
    assert.doesNotMatch(html,/CL-[a-z-]+\.(?:statement|limitations|notImplied)\[/);assert.match(html,/human scientific review pending/);assert.match(html,/not counts of independent studies/);
  }
});

test('R32 methodological comment and author reply both render as related publications, not extra studies or errata',()=>{
  const related=source('R32').relatedPublications!;assert.deepEqual(related.map(item=>item.relation),['methodological-comment','author-reply']);
  const html=renderToStaticMarkup(createElement(RelatedPublications,{sourceId:'R32',publications:related}));
  for(const item of related){assert.ok(html.includes(`href="${item.url}"`));assert.ok(html.includes(escape(item.note)));}
  assert.match(html,/Methodological comment/);assert.match(html,/Authors’ reply/);assert.match(html,/not additional source records/);assert.equal(source('R32').correctionUrl,undefined);
  assert.match(readFileSync('components/evidence/SourceRecord.tsx','utf8'),/<RelatedPublications sourceId=\{id\} publications=\{source.relatedPublications\}/);
  assert.equal(content.sources.filter(item=>related.some(link=>link.url===item.url)).length,0);
});

test('related-publication schema rejects invented roles, unsafe URLs, duplicate links and oversized metadata',()=>{
  for(const mutate of [
    (item:Record<string,unknown>)=>{item.relation='retraction';},
    (item:Record<string,unknown>)=>{item.url='http://example.com/paper';},
    (item:Record<string,unknown>)=>{item.title='x'.repeat(301);},
    (item:Record<string,unknown>)=>{item.note='x'.repeat(2001);},
  ]){const data=structuredClone(raw);const s=data.sources.find(item=>item.id==='R32')! as unknown as {relatedPublications:Record<string,unknown>[]};mutate(s.relatedPublications[0]);assert.equal(publicSchema.safeParse(data).success,false);}
  const data=structuredClone(raw);const r32=data.sources.find(item=>item.id==='R32')! as unknown as {relatedPublications:unknown[]};r32.relatedPublications.push(r32.relatedPublications[0]);assert.equal(publicSchema.safeParse(data).success,false);
});

test('bibliographic publication year 2011 is allowed without weakening narrative/private-marker checks',()=>{
  assert.equal(source('R59').year,2011);assert.equal(publicSchema.safeParse(raw).success,true);assert.deepEqual(validateRelationships(),[]);
  const narrative=structuredClone(content);narrative.claims[0].scope+=' Private narrative 2011';assert.ok(validateRelationships(narrative).includes('Private source context in public projection'));
  for(const marker of ['docs.google.com','private-reference','READABLE-THREAD']){const copy=structuredClone(content);copy.sources[0].summary=marker;assert.ok(validateRelationships(copy).includes('Private source context in public projection'));}
  const invalid=structuredClone(raw);(invalid.sources[0] as unknown as {year:unknown}).year='2011';assert.equal(publicSchema.safeParse(invalid).success,false);assert.ok(validateRelationships(invalid as unknown as typeof content).includes('Private source context in public projection'));
});

test('source classifications, separate sample denominators and correction links remain scoped',()=>{
  for(const id of newSources)assert.equal(sourceType(source(id)),'Study');
  assert.equal(sourceType(source('R15')),'Theory & commentary');assert.equal(sourceType(source('R34')),'Theory & commentary');assert.equal(sourceType(source('R32')),'Research synthesis');
  for(const id of ['R33','R58','R59','R60','R62']){assert.equal(sampleDescription(source(id)).state,'reviewed');assert.equal(sampleDescription(source(id)).text,source(id).sampleSizeNote);}
  assert.match(source('R16').population,/Shared larger Denver project.*exact participant intersection unresolved/);
  assert.ok(source('R16').correctionUrl);assert.equal(source('R34').correctionUrl,'https://journals.sagepub.com/doi/10.1177/0963721419847163');
  assert.match(source('R34').correctionNote!,/remaining figure text was unchanged/);assert.equal(sampleDescription(source('R52')).state,'unknown');
});

test('new dispositions stay qualified and all original learning-path passports remain untouched',()=>{
  for(const id of newClaims){assert.equal(claimFacet(id)?.disposition,'qualified');assert.match(claim(id).reviewer,/human scientific review pending/);assert.ok(filterEvidenceClaims(content.claims,{...initialEvidenceFilters,domain:'emotion-regulation'}).some(item=>item.id===id));}
  assert.equal(claimFacet('CL-flexibility')?.disposition,'qualified');assert.match(claim('CL-flexibility').confidenceRationale,/Neither these reports nor topic links validate/);
  assert.equal(hash(learningPathsRaw),'6e2e2a4aaf2e0fea2f55abc637c60c01e0a8c6307f8723531b48caeb4860ac49');assert.ok(JSON.stringify(learningPathsRaw).includes('PILOT-P01'));assert.ok(JSON.stringify(learningPathsRaw).includes('PILOT-P02'));assert.equal(content.videos.length,7);
});

test('new cluster draft markers are rejected and neutral overview consumers share one role label',()=>{
  for(const marker of ['ER-C1','AG-S2']){const copy=structuredClone(evidenceAssertions);copy.edges[0].scope=marker;assert.match(validateEvidenceAssertions(content,copy).join('\n'),/Draft or private context/);}
  assert.doesNotMatch(JSON.stringify([raw,taxonomyRaw,evidenceAssertions]),/(?:HM|BL|LT|ER|AG)-[SCA]\d|\/workspace\/|sourcePacketSha256|source_packet_id|collisionCheck|source-cache|private-reference/);
  for(const file of ['features/Evidence.tsx','features/evidence/Constellation.tsx','features/evidence/ClaimComparison.tsx','components/evidence/SourceRecord.tsx'])assert.match(readFileSync(file,'utf8'),/relationshipLabels\[/);
  assert.match(readFileSync('app/evidence/evidence.css','utf8'),/\[data-role="multiple"\]/);
});
