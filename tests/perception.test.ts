import { restoreRepetitionBaseline } from './repetition-truth-baseline';
import { restoreDisagreementBaseline } from './disagreement-context-baseline';
import { restoreAutonomousBaseline } from './autonomous-goals-baseline';
import { restoreStressBaseline } from './stress-learning-baseline';
import { restoreCalibrationBaseline } from './policy-explanation-baseline';
import { restoreRetrievalBaseline } from './self-explanation-baseline';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import raw from '../content/public.json';
import taxonomyRaw from '../content/evidence-taxonomy.json';
import learningPathsRaw from '../content/learning-paths.json';
import { content, validateRelationships } from '../lib/content';
import { claimRelationships, relationshipHasRole, sampleDescription, sourceClaims, sourceType } from '../lib/evidence';
import { evidenceAssertions, evidenceTargetDescription, reviewedEvidenceEdges, validateEvidenceAssertions } from '../lib/evidence-assertions';
import { claimFacet, filterEvidenceClaims, initialEvidenceFilters } from '../lib/evidence-taxonomy';
import { SourceAssertions } from '../components/evidence/SourceAssertions';
import { EvidenceDeskSources } from '../features/observatory/EvidenceDesk';
const hash=(value:unknown)=>createHash('sha256').update(JSON.stringify(restoreRepetitionBaseline(restoreDisagreementBaseline(restoreAutonomousBaseline(restoreRetrievalBaseline(restoreCalibrationBaseline(restoreStressBaseline(value)))))))).digest('hex');
const newSources=['R72','R73','R74','R75','R76','R77'];
const newClaims=['CL-calibration-training-boundaries','CL-imagery-reality-confidence'];
// Later delay additions have exact fingerprints in delay-gratification.test.ts.
const laterSources=["R78","R79","R80","R81","R82","R83","R84","R85","R86","R87","R88","R89","R90","R91","R92","R93","R94","R95","R96","R97","R98","R99"];
const laterClaims=["CL-delay-outcome-associations","CL-cognitive-training-transfer","CL-gratitude-writing-comparators","CL-helping-liking-attraction"];
const source=(id:string)=>content.sources.find(item=>item.id===id)!;
const claim=(id:string)=>content.claims.find(item=>item.id===id)!;
const edge=(id:string,sourceId:string)=>claimRelationships(claim(id)).find(item=>item.sourceId===sourceId)!;
const escape=(text:string)=>text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;');
// Reconstructed from the approved public projection and frozen agency baseline, not a new appraisal.
const expectedRecords:Record<string,string>={
  "R21": "3e5bbd0940bbe92c751ff19b92e75e9509306efe4514b8b00d2316f1d38adf09",
  "R72": "3fe79835a0309611ab6efa76f36112e69711e73588b49ee1ec1823ac70c46e19",
  "R73": "25cba68741984063f72ef48c5223dfe8a5e96dd99287f3988c5979bdcce0a3af",
  "R74": "1c782365c52f188f9e38f901c9c3f8c4bb98de9a5303a1c19132bd5c67ad0e5a",
  "R75": "22f860a15018dce8e5e0a1319a71e129a9412ead0509830f7aafc2016bb2dd65",
  "R76": "89ab544b8786d41a6af8fc07f099626e31c37deaa52adbcbf4a5427c56882618",
  "R77": "ed645d8612c490e729978c2e51061a55e0b6e8e2e6850162f7b6ed29f7539626",
  "CL-imagery": "e028fbfe9aa1fbda13e76d3169c8300e3057e1b558e53a6eaf96a1b8a993ebd5",
  "CL-calibration-training-boundaries": "d3159718fbd4983c9532c8cfb91d9dd537d88ffd2e9914db8ee4b28d8340e5a1",
  "CL-imagery-reality-confidence": "ae5e55677a1ab326abd5016c6f202eeaace6266c9a7c628de3bc1e61cf05102c"
};

test('perception lands two exact claims and six reports with only reviewed R21 and imagery field upgrades',()=>{
  assert.deepEqual(validateRelationships(),[]);assert.deepEqual(validateEvidenceAssertions(content),[]);
  assert.equal(content.claims.length,37);assert.equal(content.sources.length,113);assert.equal(content.models.length,4);
  assert.equal(new Set(content.claims.map(item=>item.id)).size,37);assert.equal(new Set(content.sources.map(item=>item.id)).size,113);
  assert.deepEqual(content.sources.slice(71,77).map(item=>item.id),newSources);assert.deepEqual(content.claims.slice(24,26).map(item=>item.id),newClaims);
  for(const record of [...raw.sources,...raw.claims])if(expectedRecords[record.id])assert.equal(hash(record),expectedRecords[record.id],record.id);
  const prior=structuredClone(raw);prior.sources=prior.sources.filter(item=>!['R21',...newSources,...laterSources].includes(item.id));prior.claims=prior.claims.filter(item=>!['CL-imagery',...newClaims,...laterClaims].includes(item.id));assert.equal(hash(prior),'3ed0721427a468a5b7116bf87897bc73011356769eb4e3f45b29af303c279661');
  const priorTaxonomy=structuredClone(taxonomyRaw);priorTaxonomy.claimFacets=priorTaxonomy.claimFacets.filter(facet=>!laterClaims.includes(facet.claimId));assert.equal(hash(priorTaxonomy),'2116fc51e66a1f93b6bbe29bece1da23a01c966e1aeefd96f529611c8679d7b7');assert.equal(hash(evidenceAssertions.edges.slice(68,85)),'4afcc5529b9e4dc3e48e14ce7ba856a7f8a036ae19608f3f0e1d55511a8bd4e0');assert.equal(hash(evidenceAssertions.edges.slice(0,68)),'68605e285a2908b678389fce02d6a2471b90d21cc625b46b2e80d1b44994a237');
});

test('17 assertions retain eight new connections across seven reports without counting shared data as independent studies',()=>{
  const additions=evidenceAssertions.edges.slice(68,85);assert.equal(additions.length,17);assert.equal(evidenceAssertions.edges.length,154);
  assert.equal(new Set(additions.map(item=>JSON.stringify([item.claimId,item.sourceId]))).size,8);assert.equal(new Set(additions.map(item=>item.sourceId)).size,7);
  assert.equal([...newClaims,'CL-imagery'].reduce((sum,id)=>sum+claimRelationships(claim(id)).filter(item=>item.sourceId!=='R91').length,0),10,'Eight new scoped connections and retained R08/R09');
  assert.match(source('R74').sampleSizeNote!,/32-person control reused, not newly recruited/);
  assert.match(claim(newClaims[0]).limitations[4],/not an independent randomized two-arm replication/);
  assert.match(claim(newClaims[0]).notImplied[1],/No independent-replication count/);
});

test('every new exact target, role, scope and lineage survives full rendering once',()=>{
  for(const id of [...newClaims,'CL-imagery'])for(const r of claimRelationships(claim(id)).filter(item=>item.assertions?.length)){
    const html=renderToStaticMarkup(createElement(SourceAssertions,{relationship:r,claim:claim(id)}));
    assert.equal((html.match(/data-assertion-role=/g)||[]).length,r.assertions!.length);
    for(const a of r.assertions!){const text=evidenceTargetDescription(a.target,claim(id));assert.notEqual(text,a.target);assert.equal(html.split(`<dd>${escape(text)}</dd>`).length-1,1);assert.ok(html.includes(escape(a.studyLineage)));if(r.assertions!.length>1)assert.ok(html.includes(escape(a.scope)));}
    assert.doesNotMatch(html,/CL-[a-z-]+\.(?:statement|limitations\[)/);
  }
});

test('mixed confidence pairs preserve any/all role semantics while R21 remains only qualifying on the original emotion claim',()=>{
  const mixed=edge(newClaims[1],'R21');assert.equal(mixed.role,'multiple');assert.equal(mixed.assertions?.length,3);
  assert.equal((['supports','qualifies'] as const).every(role=>relationshipHasRole(mixed,role)),true);
  assert.equal((['supports','context'] as const).every(role=>relationshipHasRole(mixed,role)),false);
  assert.equal((['context','qualifies'] as const).some(role=>relationshipHasRole(mixed,role)),true);
  const original=edge('CL-imagery','R21');assert.equal(original.role,'qualifies');assert.equal(original.assertions?.length,2);assert.equal(relationshipHasRole(original,'supports'),false);
  assert.deepEqual(claim('CL-imagery').sourceIds,['R08','R09','R21']);assert.deepEqual(claim('CL-imagery').challengeSourceIds,[]);
  const backlinks=sourceClaims('R21',content.claims);assert.equal(backlinks.length,2);assert.equal(backlinks.find(item=>item.claim.id==='CL-imagery')?.role,'qualifies');
});

test('original imagery R21 remains a single qualifying desk connection after moving out of challenge membership',()=>{
  const c=claim('CL-imagery'),html=renderToStaticMarkup(createElement(EvidenceDeskSources,{claim:c}));
  assert.equal(html.split('data-source-id="R21"').length-1,1);assert.match(html,/data-source-id="R21" data-role="qualifies"/);assert.match(html,/imagery#connection-R21/);assert.doesNotMatch(html,/Recorded supporting sources|Counterevidence recorded/);
  assert.equal(edge('CL-imagery','R08').role,'supports');assert.equal(edge('CL-imagery','R09').role,'supports');
  assert.equal(reviewedEvidenceEdges('CL-imagery','R21').length,2);
});

test('denominator discrepancies and selected access remain unresolved rather than transformed into corrections',()=>{
  for(const id of [...newSources,'R21']){assert.equal(sampleDescription(source(id)).text,source(id).sampleSizeNote);assert.equal(source(id).correctionUrl,undefined);assert.equal(source(id).retractionStatus,'unknown');}
  assert.equal(source('R73').sampleSize,61);assert.equal(source('R74').sampleSize,null);
  assert.match(source('R77').sampleSizeNote!,/122 and 123.*108 and 96.*unresolved/);assert.match(source('R21').sampleSizeNote!,/400 recruited.*272.*461 collected.*339.*Reused imaging sample 35/);
  assert.match(source('R21').accessDepth,/Selected.*CAPTCHA stopped/);
  assert.match(claim(newClaims[1]).limitations[1],/272 analyzed.*274 in Figure 2/);assert.match(claim(newClaims[1]).limitations[2],/51 and 111 responses/);
  assert.equal(source('R52').sampleSizeNote,undefined);assert.equal(sampleDescription(source('R52')).state,'unknown');
});

test('measurement methods remain theory and commentary while no existing clinical or competence inference is promoted',()=>{
  assert.equal(sourceType(source('R72')),'Theory & commentary');for(const id of newSources.slice(1))assert.equal(sourceType(source(id)),'Study');assert.equal(sourceType(source('R21')),'Study');
  assert.match(claim(newClaims[0]).limitations[0],/not the same construct as self-efficacy/);
  assert.match(claim(newClaims[0]).notImplied[2],/Nonsignificant results do not establish no effect/);
  assert.match(claim(newClaims[1]).notImplied[1],/No diagnosis, treatment recommendation/);
  assert.match(claim('CL-imagery').limitations[0],/clinical imagery intervention is not equivalent/);
  assert.equal(hash(learningPathsRaw),'6e2e2a4aaf2e0fea2f55abc637c60c01e0a8c6307f8723531b48caeb4860ac49');assert.equal(content.videos.length,7);
});

test('duplicate narrative variants and malformed perception targets cannot evade assertion validation',()=>{
  const copy=structuredClone(evidenceAssertions);const original=copy.edges[68];copy.edges.push({...original,scope:'Different wording',studyLineage:'Different lineage wording'});assert.match(validateEvidenceAssertions(content,copy).join('\n'),/Duplicate evidence assertion/);
  for(const target of ['CL-calibration-training-boundaries.limitations[99]','CL-calibration-training-boundaries.limitations[-1]','CL-calibration-training-boundaries.limitations[01]','CL-imagery.limitations[0]']){const invalid=structuredClone(evidenceAssertions);invalid.edges[68].target=target;assert.match(validateEvidenceAssertions(content,invalid).join('\n'),/Unresolved assertion target/);}
});

test('PC draft markers and internal packet wrappers remain rejected or absent from public records',()=>{
  for(const marker of ['PC-S1','PC-C2','PC-A3'])for(const field of ['scope','studyLineage','target'] as const){const invalid=structuredClone(evidenceAssertions);invalid.edges[68][field]=marker;assert.match(validateEvidenceAssertions(content,invalid).join('\n'),/Draft or private context/);}
  assert.doesNotMatch(JSON.stringify([raw,taxonomyRaw,evidenceAssertions]),/(?:HM|BL|LT|ER|AG|PC)-[SCA]\d|\/workspace\/|sourcePacketSha256|source_packet_id|internalSourceMapping|collisionCheck|source-cache|private-reference/);
});

test('new editorial navigation links preserve qualified disposition and human review pending without changing older facets',()=>{
  for(const id of newClaims){assert.equal(claimFacet(id)?.disposition,'qualified');assert.match(claim(id).reviewer,/human scientific review pending/);assert.ok(filterEvidenceClaims(content.claims,{...initialEvidenceFilters,domain:'perception-interpretation'}).some(item=>item.id===id));}
  assert.equal(claimFacet('CL-imagery')?.disposition,'supported-within-scope');assert.equal(claim('CL-imagery').confidence,'moderate');
  assert.equal(claimFacet(newClaims[1])?.domainLinks.find(link=>link.domainId==='emotion-regulation')?.relation,'boundary-context');
});
