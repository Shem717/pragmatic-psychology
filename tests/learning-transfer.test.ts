import { restoreRepetitionBaseline } from './repetition-truth-baseline';
import { restoreDisagreementBaseline } from './disagreement-context-baseline';
import { restoreAutonomousBaseline } from './autonomous-goals-baseline';
import { restoreStressBaseline } from './stress-learning-baseline';
import { restoreCalibrationBaseline } from './policy-explanation-baseline';
import { restoreRetrievalBaseline } from './self-explanation-baseline';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import raw from '../content/public.json';
import taxonomyRaw from '../content/evidence-taxonomy.json';
import learningPathsRaw from '../content/learning-paths.json';
import { content, validateRelationships } from '../lib/content';
import { claimRelationships, sampleDescription, sourceChecks, sourceType } from '../lib/evidence';
import { evidenceAssertions, evidenceTargetDescription, validateEvidenceAssertions } from '../lib/evidence-assertions';
import { claimFacet, filterEvidenceClaims, initialEvidenceFilters, validateEvidenceTaxonomy } from '../lib/evidence-taxonomy';
const hash=(value:unknown)=>createHash('sha256').update(JSON.stringify(restoreRepetitionBaseline(restoreDisagreementBaseline(restoreAutonomousBaseline(restoreRetrievalBaseline(restoreCalibrationBaseline(restoreStressBaseline(value)))))))).digest('hex');
const newSources=['R50','R51','R52','R53','R54','R55','R56','R57'];
const newClaims=['CL-motor-imagery-scope','CL-retrieval-retention-transfer'];
const upgradedSources=['R36','R37'];
// Exact later emotion upgrades and additions are fingerprinted in emotion.test.ts.
const laterSources=["R15","R16","R32","R33","R34","R58","R59","R60","R61","R62","R63","R64","R65","R66","R67","R68","R69","R70","R71","R21","R72","R73","R74","R75","R76","R77","R78","R79","R80","R81","R82","R83","R84","R85","R86","R87","R88","R89","R90","R91","R92","R93","R94","R95","R96","R97","R98","R99"];
const laterClaims=["CL-flexibility","CL-regulation-choice-outcome","CL-expression-experience","CL-acceptance-associations","CL-habit-context","CL-situation-instruction-package","CL-action-planning-timing","CL-depletion-belief-boundaries","CL-imagery","CL-calibration-training-boundaries","CL-imagery-reality-confidence","CL-delay-outcome-associations","CL-cognitive-training-transfer","CL-gratitude-writing-comparators","CL-helping-liking-attraction"];
const source=(id:string)=>content.sources.find(item=>item.id===id)!;
const claim=(id:string)=>content.claims.find(item=>item.id===id)!;
const edge=(id:string,sourceId:string)=>claimRelationships(claim(id)).find(item=>item.sourceId===sourceId)!;
// Fingerprints derive from independently approved v2 data and the frozen belonging base.
const expectedRecords:Record<string,string>={
  "R36": "479b3b1754c9f7cce9ff79ed175871fdedde009145f4c76805cf77887dfe772e",
  "R37": "7de482b9ffdf4c07b203b3f3b7e98ac3032d8e55461e6379c9dcc728b123c945",
  "R50": "5e7afe17bca62c005962bad8382d16c131e0b551a38965c123a880741d99b356",
  "R51": "cef30a2109e43049bf7214c5560bd424ebc48e5b8c6cac819f892355e919dbf6",
  "R52": "f6fa1deb222c258df05fb6f99f0506b1d37096804d507d43a1e877dc86d7d5e2",
  "R53": "ed1cf8b0694354379c1601fa747409e3e6c196af5d4ae5801383129982e4d4fa",
  "R54": "8d73590762037c6795193d74fd5a651ca5c210ccaeb7240a701794b512907079",
  "R55": "5de63c7bb054c1e335682ede6263341c83839099ea64091938c64793161df4d4",
  "R56": "e706a8f727285c957b5ecf7f98a8a0d21fb64308f54c682ccd711dc2a77a0877",
  "R57": "17780e95c6dabe9f11bd96b2132692aab3cf535cab698d2e56ccc13184713c70",
  "CL-motor-imagery-scope": "8784806b8ca17c81b46095f78995aec706f751c1c24f40a0106fccc4cc9b9170",
  "CL-retrieval-retention-transfer": "fcabccab117711989f7bccd1a504ca1fecdb05881089f3914e41405b184167e5"
};

test('learning adds exactly two canonical claims and eight sources with only two approved prior-source upgrades',()=>{
  assert.deepEqual(validateRelationships(),[]);assert.deepEqual(validateEvidenceTaxonomy(content),[]);assert.deepEqual(validateEvidenceAssertions(content),[]);
  assert.equal(content.claims.length,40);assert.equal(content.sources.length,119);assert.equal(content.models.length,4);
  assert.equal(new Set(content.claims.map(item=>item.id)).size,40);assert.equal(new Set(content.sources.map(item=>item.id)).size,119);
  assert.deepEqual(content.sources.slice(49,57).map(item=>item.id),newSources);assert.deepEqual(content.claims.slice(16,18).map(item=>item.id),newClaims);
  for(const record of [...raw.sources,...raw.claims])if(expectedRecords[record.id])assert.equal(hash(record),expectedRecords[record.id],record.id);
  const prior=structuredClone(raw);prior.sources=prior.sources.filter(item=>![...newSources,...upgradedSources,...laterSources].includes(item.id));prior.claims=prior.claims.filter(item=>![...newClaims,...laterClaims].includes(item.id));
  assert.equal(hash(prior),'842f56154466bb7b9cad6b4c8c9b70fe14a9f4d0f62b191b37887ae15bd760ff');
});

test('reviewed learning taxonomy and ten exact source-edge roles remain unpromoted',()=>{
  const priorTaxonomy=structuredClone(taxonomyRaw);priorTaxonomy.claimFacets=priorTaxonomy.claimFacets.filter(facet=>['CL-flexibility','CL-habit-context','CL-imagery'].includes(facet.claimId)||!laterClaims.includes(facet.claimId));
  assert.equal(hash(priorTaxonomy),'cba077aa559905deebdd856e88a211aa3afd88e604676a6a31def3797e6969f1');assert.equal(hash(evidenceAssertions.edges.slice(16,26)),'de0987028497fa89260b8471b64a4351671574aa445a367fa9ad81aaeb72a920');
  for(const id of newClaims){assert.equal(claimFacet(id)?.disposition,'qualified');assert.match(claim(id).reviewer,/human scientific review pending/);assert.ok(filterEvidenceClaims(content.claims,{...initialEvidenceFilters,domain:'learning-memory'}).some(item=>item.id===id));}
  assert.equal(edge(newClaims[0],'R51').role,'qualifies');assert.equal(edge(newClaims[0],'R52').role,'context');
  assert.equal(edge(newClaims[1],'R36').role,'context');assert.equal(edge(newClaims[1],'R37').role,'context');
  assert.match(edge(newClaims[1],'R37').note,/no support for delayed benefits/);
  for(const e of evidenceAssertions.edges.slice(16,26)){assert.notEqual(evidenceTargetDescription(e.target,claim(e.claimId)),e.target);}
});

test('an unextracted R52 sample stays unknown while known multiple-experiment and aggregate notes survive',()=>{
  assert.equal(source('R52').sampleSize,null);assert.equal(source('R52').sampleSizeNote,undefined);assert.equal(sampleDescription(source('R52')).state,'unknown');
  assert.match(source('R52').accessDepth,/abstract/i);
  for(const id of ['R36','R50','R51','R55','R56','R57']){assert.equal(source(id).sampleSize,null);assert.equal(sampleDescription(source(id)).state,'reviewed');assert.equal(sampleDescription(source(id)).text,source(id).sampleSizeNote);}
  assert.match(source('R51').sampleSizeNote!,/37 studies, 115 effects.*participant total not independently extracted/);
  assert.match(source('R50').sampleSizeNote!,/18.*15.*not a pooled trial/);
  assert.match(source('R37').sampleSizeNote!,/149.*8 of 157/);
});

test('report-type classification does not imply a new confidence grade or retraction audit',()=>{
  for(const id of [...newSources,...upgradedSources]){
    assert.equal(sourceType(source(id)),['R36','R51'].includes(id)?'Research synthesis':'Study');
    assert.equal(sourceChecks(source(id)).find(item=>item.label==='Retraction check')?.state,'unknown');
    assert.equal(source(id).retractionStatus,'unknown');
  }
  assert.match(source('R36').design,/not a new experiment or systematic pooled estimate/);
  assert.match(source('R36').accessDepth,/Selected full text/);assert.match(source('R37').accessDepth,/supplementary file not read/);
});

test('effect-size disclosure stays attached without being called a formal erratum or independent recalculation',()=>{
  assert.equal(source('R56').correctionUrl,'https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2016.01977/full#footnote1');
  assert.match(source('R56').correctionNote!,/standard-deviation calculation error/);
  assert.match(source('R56').correctionNote!,/No formal erratum was located and no independent recalculation performed/);
  assert.match(edge(newClaims[1],'R56').note,/effect-size disclosure must remain attached/);
  assert.equal(content.sources.filter(item=>item.url===source('R56').correctionUrl).length,0);
});

test('motor and retrieval scope never turns task allocations, neural similarity or prompted transfer into universal efficacy',()=>{
  assert.match(claim(newClaims[0]).notImplied.join(' '),/No universal 70–90% effectiveness.*identical neural firing/);
  assert.match(claim(newClaims[0]).limitations.join(' '),/115 effects from 37 studies as independent/);
  assert.match(edge(newClaims[0],'R52').note,/allocations of trials.*not.*universal replacement rate/);
  assert.match(claim(newClaims[1]).limitations.join(' '),/spontaneous everyday application was not tested/);
  assert.match(claim(newClaims[1]).notImplied.join(' '),/Not all difficulty is beneficial/);
  assert.match(edge(newClaims[1],'R36').note,/overlap.*not independent replication/);
  assert.match(edge(newClaims[1],'R57').studyLineage!,/replication-extension/);
});

test('PILOT-P05 and the full existing learning catalog remain exactly unchanged',()=>{
  assert.equal(hash(learningPathsRaw),'6e2e2a4aaf2e0fea2f55abc637c60c01e0a8c6307f8723531b48caeb4860ac49');
  assert.ok(JSON.stringify(learningPathsRaw).includes('PILOT-P05'));
  for(const id of ['CL-imagery','CL-confidence','CL-plasticity'])assert.ok(claim(id));
  assert.equal(content.videos.length,7);
});

test('public learning projection contains no research-packet wrapper or private draft IDs',()=>{
  assert.doesNotMatch(JSON.stringify([raw,taxonomyRaw,evidenceAssertions]),/(?:HM|BL|LT)-[SCA]\d|\/workspace\/|sourcePacketSha256|source_packet_id|collisionCheck|source-cache|private-reference|docs\.google\.com/);
  assert.equal(evidenceAssertions.edges.length,168);
});
