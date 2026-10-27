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
import { claimRelationships, relationshipHasRole, sampleDescription, sourceAuthorText, sourceChecks, sourceType } from '../lib/evidence';
import { evidenceAssertions, evidenceTargetDescription, reviewedEvidenceEdges, validateEvidenceAssertions } from '../lib/evidence-assertions';
import { claimFacet } from '../lib/evidence-taxonomy';
import { SourceAssertions } from '../components/evidence/SourceAssertions';
import { RelatedPublications } from '../components/evidence/RelatedPublications';
const hash=(value:unknown)=>createHash('sha256').update(JSON.stringify(restoreRetrievalBaseline(restoreCalibrationBaseline(value)))).digest('hex');
const newSources=['R63','R64','R65','R66','R67','R68','R69','R70','R71'];
const newClaims=['CL-situation-instruction-package','CL-action-planning-timing','CL-depletion-belief-boundaries'];
// Later perception upgrades/additions have exact fingerprints in perception.test.ts.
const laterSources=["R21","R72","R73","R74","R75","R76","R77","R78","R79","R80","R81","R82","R83","R84","R85","R86","R87","R88","R89","R90","R91"];
const laterClaims=["CL-imagery","CL-calibration-training-boundaries","CL-imagery-reality-confidence","CL-delay-outcome-associations","CL-cognitive-training-transfer","CL-gratitude-writing-comparators","CL-helping-liking-attraction"];
const source=(id:string)=>content.sources.find(item=>item.id===id)!;
const claim=(id:string)=>content.claims.find(item=>item.id===id)!;
const edge=(id:string,sourceId:string)=>claimRelationships(claim(id)).find(item=>item.sourceId===sourceId)!;
const escape=(text:string)=>text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;');
const expectedRecords:Record<string,string>={
  "R63": "d53b2ef7e8b9e80331cf5cc642f4babb94166219d7cafcb103e619382e1b5168",
  "R64": "c657e696a919dbbccab33bd37c86297189739b2918919287f29fc8ff53569a3d",
  "R65": "1e8b6872f33d7b95e774a4e9e5cb783161a973fe7a73b422cfbad44cdc27cf30",
  "R66": "eccfb114086065c981cd391ba05a08e5ad2acd2324f93e3755976e9aa2c8560c",
  "R67": "004c9f665e0116bfb3a43454d1ba32790c8ccbb6c1690cd16614a6dcc336602a",
  "R68": "a641c30d6447f3ea701bb7ce1e9780da3929e0fcbc9f2d0c1407a1bd7876242a",
  "R69": "bd5654255936fa5ec84e8b73d73d78b74e7b6c871eb079f92a1ea00931cdd94b",
  "R70": "1a19313f4b3bebaeb2d18be12aeb9dac1f7580e9c5b16b594e80e7ca4bc114ac",
  "R71": "814378bdb3880621df800c2f7d17703814af6f6235004792e35d7a95a2e21780",
  "CL-habit-context": "edbb676f316e79bcfe29db7318fecced2db34942e477f9167cfd77c67b77920d",
  "CL-situation-instruction-package": "f34d036a6cac689b9ad65959c93869ce4d35eeacd8cc056e0e0b30a6f0a31560",
  "CL-action-planning-timing": "cace15103e752f7f71751861ee03da3b6528f03ef42f1376d6c25f4d79938b41",
  "CL-depletion-belief-boundaries": "6a53ba3e14f692d3021b3a3e844d193e1c5255839226cf078390f999a27c49e5"
};

test('agency adds the exact three claims and nine reports with only the approved habit-context enrichment',()=>{
  assert.deepEqual(validateRelationships(),[]);assert.deepEqual(validateEvidenceAssertions(content),[]);
  assert.equal(content.claims.length,30);assert.equal(content.sources.length,91);assert.equal(content.models.length,4);
  assert.equal(new Set(content.claims.map(item=>item.id)).size,30);assert.equal(new Set(content.sources.map(item=>item.id)).size,91);
  assert.deepEqual(content.sources.slice(62,71).map(item=>item.id),newSources);assert.deepEqual(content.claims.slice(21,24).map(item=>item.id),newClaims);
  for(const record of [...raw.sources,...raw.claims])if(expectedRecords[record.id])assert.equal(hash(record),expectedRecords[record.id],record.id);
  const prior=structuredClone(raw);prior.sources=prior.sources.filter(item=>![...newSources,...laterSources].includes(item.id));prior.claims=prior.claims.filter(item=>![...newClaims,'CL-habit-context',...laterClaims].includes(item.id));assert.equal(hash(prior),'e2039a2c0bf62fd3edd5703cdad39bc4d7b8421258c0aa7ee671c38b18d61f12');
  const priorTaxonomy=structuredClone(taxonomyRaw);priorTaxonomy.claimFacets=priorTaxonomy.claimFacets.filter(facet=>facet.claimId==='CL-imagery'||!laterClaims.includes(facet.claimId));assert.equal(hash(priorTaxonomy),'726091586c6743cab320db635436aa9d40c9ccb28897fb4f2a656564afb7ce70');assert.equal(hash(evidenceAssertions.edges.slice(44,68)),'aa6a11962bd279e37ba57c00b75b85b5018ac812f2e7dcbec335a6dd431302be');
});

test('24 new assertions mean nine new source connections, not 24 independent studies',()=>{
  const additions=evidenceAssertions.edges.slice(44,68);assert.equal(additions.length,24);assert.equal(evidenceAssertions.edges.length,117);
  assert.equal(new Set(additions.map(item=>JSON.stringify([item.claimId,item.sourceId]))).size,9);assert.equal(new Set(additions.map(item=>item.sourceId)).size,9);
  assert.equal([...newClaims,'CL-habit-context'].reduce((sum,id)=>sum+claimRelationships(claim(id)).length,0),10,'Nine new connections plus the original R40 connection');
  const r40=reviewedEvidenceEdges('CL-habit-context','R40');assert.equal(r40.length,1);assert.equal(r40[0].relation,'supports');assert.match(r40[0].scope,/no randomized causal inference/);
});

test('each complete agency assertion is rendered once and mixed overviews preserve any/all role semantics',()=>{
  for(const id of [...newClaims,'CL-habit-context'])for(const relationship of claimRelationships(claim(id))){
    const html=renderToStaticMarkup(createElement(SourceAssertions,{relationship,claim:claim(id)}));const assertions=relationship.assertions!;
    assert.equal((html.match(/data-assertion-role=/g)||[]).length,assertions.length);
    for(const assertion of assertions){assert.equal(html.split(`<dd>${escape(evidenceTargetDescription(assertion.target,claim(id)))}</dd>`).length-1,1);assert.ok(html.includes(escape(assertion.studyLineage)));if(assertions.length>1)assert.ok(html.includes(escape(assertion.scope)));}
  }
  const r64=edge('CL-habit-context','R64');assert.equal(r64.role,'multiple');assert.equal(relationshipHasRole(r64,'context'),true);assert.equal(relationshipHasRole(r64,'qualifies'),true);assert.equal(relationshipHasRole(r64,'supports'),false);
  assert.equal((['context','qualifies'] as const).every(role=>relationshipHasRole(r64,role)),true);assert.equal((['supports','qualifies'] as const).every(role=>relationshipHasRole(r64,role)),false);assert.equal((['supports','qualifies'] as const).some(role=>relationshipHasRole(r64,role)),true);
});

test('cited-report retraction notices name the affected citation without changing either host status or source counts',()=>{
  const url='https://journals.sagepub.com/doi/full/10.1177/09567976261488042';
  for(const id of ['R63','R65']){
    const s=source(id),related=s.relatedPublications!;assert.equal(related.length,1);assert.equal(related[0].relation,'cited-report-retraction');assert.equal(related[0].url,url);
    assert.match(related[0].note,/Ariely and Wertenbroch \(2002\).*not this citing report/);assert.match(related[0].note,/not thereby retracted/);
    assert.equal(s.correctionUrl,undefined);assert.equal(s.retractionStatus,'unknown');assert.equal(sourceChecks(s).find(item=>item.label==='Retraction check')?.state,'unknown');
    const html=renderToStaticMarkup(createElement(RelatedPublications,{sourceId:id,publications:related}));assert.match(html,/Retraction of a cited report/);assert.match(html,/not automatically this host/);assert.ok(html.includes(url));assert.doesNotMatch(html,/Published update/);
  }
  assert.equal(content.sources.filter(item=>item.url===url).length,0);
});

test('the shared related-publication introduction supports comments, replies and notices without calling notices studies',()=>{
  const html=renderToStaticMarkup(createElement(RelatedPublications,{sourceId:'R32',publications:source('R32').relatedPublications}));
  assert.match(html,/comments, replies and notices are context links, not additional source records/);assert.match(html,/Methodological comment/);assert.match(html,/Authors’ reply/);
  assert.equal(source('R32').relatedPublications?.length,2);assert.equal(source('R32').correctionUrl,undefined);
  const invalid=structuredClone(raw);const s=invalid.sources.find(item=>item.id==='R63')! as unknown as {relatedPublications:{relation:string;url:string;title:string;note:string}[]};s.relatedPublications[0].relation='host-retraction';assert.equal(publicSchema.safeParse(invalid).success,false);s.relatedPublications[0].relation='cited-report-retraction';s.relatedPublications[0].note='';assert.equal(publicSchema.safeParse(invalid).success,false);
});

test('verified partial author arrays are disclosed without fabricated collaborator entries or altered old metadata',()=>{
  for(const id of ['R67','R68','R69']){const s=source(id);assert.equal(s.authorListComplete,false);assert.match(sourceAuthorText(s),/and other authors \(partial list\)$/);assert.equal(sourceAuthorText(s),s.authors.join(' · ')+' · and other authors (partial list)');assert.ok(s.authors.every(name=>!/(?:et al\.|other authors|collaborators)/i.test(name)));}
  for(const s of content.sources.slice(0,62)){assert.equal(s.authorListComplete,undefined);assert.equal(sourceAuthorText(s),s.authors.join(' · '));}
  assert.equal(sourceAuthorText({...source('R67'),authors:[]}), '');
  assert.match(readFileSync('components/evidence/SourceRecord.tsx','utf8'),/sourceAuthorText\(source\)/);
  const invalid=structuredClone(raw);(invalid.sources.find(item=>item.id==='R67')! as unknown as {authorListComplete:unknown}).authorListComplete='false';assert.equal(publicSchema.safeParse(invalid).success,false);
});

test('separate samples, endpoints and incomplete denominators remain explicit rather than pooled or inferred',()=>{
  assert.equal(sourceType(source('R63')),'Theory & commentary');for(const id of newSources.slice(1))assert.equal(sourceType(source(id)),'Study');
  for(const id of newSources){assert.equal(sampleDescription(source(id)).text,source(id).sampleSizeNote);assert.equal(source(id).retractionStatus,'unknown');}
  assert.match(source('R69').sampleSizeNote!,/not recruited denominator/);assert.match(source('R65').sampleSizeNote!,/recruited denominator unknown/);
  assert.match(claim(newClaims[2]).limitations.join(' '),/primary error-rate.*secondary reaction-time/);
  assert.match(claim(newClaims[2]).limitations.join(' '),/did not directly replicate the induced-belief studies/);
  assert.match(claim(newClaims[2]).limitations.join(' '),/fatigue is imaginary/);
  assert.equal(sampleDescription(source('R52')).state,'unknown');
});

test('all three new dispositions stay qualified and original paths, pilot records and habit confidence stay unpromoted',()=>{
  for(const id of newClaims){assert.equal(claimFacet(id)?.disposition,'qualified');assert.match(claim(id).reviewer,/human scientific review pending/);}
  assert.equal(claimFacet('CL-habit-context')?.disposition,'qualified');assert.equal(claim('CL-habit-context').confidence,'limited');assert.match(claim('CL-habit-context').confidenceRationale,/not causal confirmation/);
  assert.equal(hash(learningPathsRaw),'6e2e2a4aaf2e0fea2f55abc637c60c01e0a8c6307f8723531b48caeb4860ac49');assert.equal(content.videos.length,7);
});

test('internal agency source maps and private packet identifiers do not enter public records',()=>{
  assert.doesNotMatch(JSON.stringify([raw,taxonomyRaw,evidenceAssertions]),/(?:HM|BL|LT|ER|AG)-[SCA]\d|\/workspace\/|sourcePacketSha256|source_packet_id|internalSourceMapping|collisionCheck|source-cache|private-reference/);
});


test('one-source dossiers use a singular label while multi-source counts remain explicit',()=>{
  const page=readFileSync('app/evidence/claims/[slug]/page.tsx','utf8');
  assert.match(page,/relationships.length === 1 \? "source" : "sources"/);
  assert.equal(claimRelationships(claim('CL-action-planning-timing')).length,1);
  assert.equal(claimRelationships(claim('CL-habit-context')).length,2);
});
