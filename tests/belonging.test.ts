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
import { content, validateRelationships } from '../lib/content';
import { claimRelationships, sampleDescription, sourceChecks, sourceType } from '../lib/evidence';
import { evidenceAssertions, evidenceTargetDescription, validateEvidenceAssertions } from '../lib/evidence-assertions';
import { claimFacet, evidenceTaxonomy, filterEvidenceClaims, initialEvidenceFilters, validateEvidenceTaxonomy } from '../lib/evidence-taxonomy';
const hash=(value:unknown)=>createHash('sha256').update(JSON.stringify(restoreRepetitionBaseline(restoreDisagreementBaseline(restoreAutonomousBaseline(restoreRetrievalBaseline(restoreCalibrationBaseline(restoreStressBaseline(value)))))))).digest('hex');
const sourceIds=['R43','R44','R45','R46','R47','R48','R49'];
const claimIds=['CL-loneliness-isolation','CL-solitude-affect','CL-loneliness-interventions'];
// Later learning records/upgrades have their own exact fingerprints.
const laterSources=["R36","R37","R50","R51","R52","R53","R54","R55","R56","R57","R15","R16","R32","R33","R34","R58","R59","R60","R61","R62","R63","R64","R65","R66","R67","R68","R69","R70","R71","R21","R72","R73","R74","R75","R76","R77","R78","R79","R80","R81","R82","R83","R84","R85","R86","R87","R88","R89","R90","R91","R92","R93","R94","R95","R96","R97","R98","R99"];
const laterClaims=["CL-motor-imagery-scope","CL-retrieval-retention-transfer","CL-flexibility","CL-regulation-choice-outcome","CL-expression-experience","CL-acceptance-associations","CL-habit-context","CL-situation-instruction-package","CL-action-planning-timing","CL-depletion-belief-boundaries","CL-imagery","CL-calibration-training-boundaries","CL-imagery-reality-confidence","CL-delay-outcome-associations","CL-cognitive-training-transfer","CL-gratitude-writing-comparators","CL-helping-liking-attraction"];
const source=(id:string)=>content.sources.find(item=>item.id===id)!;
const claim=(id:string)=>content.claims.find(item=>item.id===id)!;
const edge=(id:string,sourceId:string)=>claimRelationships(claim(id)).find(item=>item.sourceId===sourceId)!;
// Fingerprints are calculated from the independently approved v3 public projection.
const expectedRecords:Record<string,string>={
  "R43": "53054ff8cf16a07863a3cc185409c4ca8dfbf166d97914ec48ca4ca9bc2e2117",
  "R44": "d6e039d68126acdfc60ff0233e2882935653d0581b0a7c5a1195a087c26ccacb",
  "R45": "1b57b5a953717db1ad1164a02055cfcad1075e264506f9afe9674b648d474e68",
  "R46": "7326fecd157a8c39c1cd1e0fbcd3d86cecbf70ba34bfcf958544dd99dee1b4e1",
  "R47": "c770dc50a0f617b3531588638fc475cfe51e76c1dc9a190b1eb723753baa1fe5",
  "R48": "f0ddd3a3a959762ebf7c286b351a7be8b01a71b27e2786c27c38513f0588053b",
  "R49": "ef3d03e257ed97c56756115ad019533f0f9abffbd70ab9a35061041ec114c7d0",
  "CL-loneliness-isolation": "811309e3fd5304e54b2c5a11320a62af5064e8a7a459a193141d720ea2e1ef01",
  "CL-solitude-affect": "25fbbd3d5a668755683466effbc6e4d42503e4062da866878645aa8630277b14",
  "CL-loneliness-interventions": "606fafb10b03c412035972c0dd3d3990780029d4da143c990409c411a3200301"
};

test('the belonging payload adds exactly three canonical claims and seven source records without changing prior content',()=>{
  assert.deepEqual(validateRelationships(),[]);assert.deepEqual(validateEvidenceTaxonomy(content),[]);assert.deepEqual(validateEvidenceAssertions(content),[]);
  assert.equal(content.claims.length,40);assert.equal(content.sources.length,119);assert.equal(content.models.length,4);
  assert.equal(new Set(content.claims.map(item=>item.id)).size,40);assert.equal(new Set(content.sources.map(item=>item.id)).size,119);
  assert.deepEqual(content.sources.slice(42,49).map(item=>item.id),sourceIds);assert.deepEqual(content.claims.slice(13,16).map(item=>item.id),claimIds);
  for(const record of [...raw.sources,...raw.claims])if(expectedRecords[record.id])assert.equal(hash(record),expectedRecords[record.id],record.id);
  const prior=structuredClone(raw);prior.sources=prior.sources.filter(item=>![...sourceIds,...laterSources].includes(item.id));prior.claims=prior.claims.filter(item=>![...claimIds,...laterClaims].includes(item.id));
  assert.equal(hash(prior),'7125e274fcb2b5736cb53d88e35153f878ac16c11b268c69c5fd498f4bbf255e');
});

test('reviewed belonging taxonomy and eight exact-target relations remain unchanged',()=>{
  const priorTaxonomy=structuredClone(taxonomyRaw);priorTaxonomy.claimFacets=priorTaxonomy.claimFacets.filter(facet=>['CL-flexibility','CL-habit-context','CL-imagery'].includes(facet.claimId)||!laterClaims.includes(facet.claimId));
  assert.equal(hash(priorTaxonomy),'f9547aada5399be51957eefc44cb004346d572737105b707207719c5b839e94f');
  assert.equal(hash(evidenceAssertions.edges.slice(8,16)),'88b09779d0d51c861d197242db4852a6436279d7bf4bfd80e6e86a662642d3de');
  for(const id of claimIds){assert.equal(claimFacet(id)?.disposition,'qualified');assert.match(claim(id).reviewer,/independent human scientific review pending/);}
  assert.deepEqual(filterEvidenceClaims(content.claims,{...initialEvidenceFilters,domain:'relationships-belonging'}).map(item=>item.id),[...claimIds,'CL-expression-experience','CL-helping-liking-attraction','CL-assertiveness-training-boundaries']);
  assert.equal(edge('CL-loneliness-isolation','R44').role,'context');assert.equal(edge('CL-loneliness-isolation','R45').role,'context');
  assert.equal(edge('CL-loneliness-interventions','R49').role,'qualifies');assert.match(edge('CL-loneliness-interventions','R49').note,/includes R48.*not independent/);
  assert.equal(edge('CL-loneliness-isolation','R46').studyLineage,edge('CL-solitude-affect','R46').studyLineage,'One report may inform two claims, not two independent reports');
});

test('limitations references resolve to exact readable text without changing saved target keys',()=>{
  for(const item of evidenceAssertions.edges.filter(item=>item.target.includes('.limitations['))){
    const c=claim(item.claimId);const index=Number(item.target.match(/\[(\d+)\]$/)![1]);
    assert.equal(evidenceTargetDescription(item.target,c),c.limitations[index]);assert.notEqual(evidenceTargetDescription(item.target,c),item.target);
  }
  const c=claim('CL-habit-timescale');assert.equal(evidenceTargetDescription(`${c.id}.notImplied[1]`,c),c.notImplied[1]);
  assert.equal(evidenceTargetDescription(`${c.id}.statement`,c),c.statement);
  assert.equal(evidenceTargetDescription('retrieval alone is sufficient for memory destabilization',c),'retrieval alone is sufficient for memory destabilization');
});

test('target validation rejects unknown fields, malformed indices, wrong claims and out-of-range references',()=>{
  const id='CL-loneliness-isolation';
  for(const target of [`${id}.limitations[-1]`,`${id}.limitations[01]`,`${id}.limitations[1.5]`,`${id}.limitations[999]`,`${id}.limitations[x]`,`${id}.limitations`,`${id}.unsupported[0]`,`${id}.statement[0]`,`${id}.statement.trailing`,'CL-solitude-affect.limitations[0]','CL_loneliness-isolation.limitations[0]']){
    const copy=structuredClone(evidenceAssertions);copy.edges[10].target=target;
    assert.match(validateEvidenceAssertions(content,copy).join('\n'),/Unresolved assertion target/,target);
  }
});

test('multiple-study and aggregate denominators remain reviewed notes, not missing single samples',()=>{
  for(const id of ['R46','R49']){assert.equal(source(id).sampleSize,null);assert.equal(sampleDescription(source(id)).state,'reviewed');assert.equal(sampleDescription(source(id)).text,source(id).sampleSizeNote);}
  assert.match(source('R46').population,/Study|studies/i);assert.match(source('R49').sampleSizeNote!,/31|28|3039|3,039/);
  for(const id of sourceIds){assert.equal(sourceType(source(id)),id==='R49'?'Research synthesis':'Study');assert.equal(sourceChecks(source(id)).find(item=>item.label==='Retraction check')?.state,'unknown');}
  assert.equal(sampleDescription(source('R41')).state,'unknown');
});

test('correction and synthesis overlap stay attached to their original report, not independent confirmation',()=>{
  assert.equal(source('R44').correctionUrl,'https://www.nature.com/articles/s41593-021-01004-2');
  assert.match(source('R44').correctionNote!,/Figure 5.*not counted as independent/);
  assert.equal(content.sources.filter(item=>item.url===source('R44').correctionUrl).length,0);
  assert.match(source('R49').summary,/Käll pilot.*not an independent replication/);assert.match(claim('CL-loneliness-interventions').limitations.join(' '),/not an independent replication/);
  assert.match(source('R45').accessDepth,/AI reviewer/);
});

test('mixed outcomes, nonidentity, consent and no custom-cure boundaries survive projection',()=>{
  assert.match(claim('CL-loneliness-isolation').limitations.join(' '),/nonidentity does not mean zero correlation/);
  assert.match(claim('CL-solitude-affect').statement,/positive and negative high-arousal/);
  assert.match(claim('CL-solitude-affect').notImplied.join(' '),/No universal benefit.*20-percent/);
  for(const text of [source('R47').summary,claim('CL-loneliness-interventions').limitations[0],edge('CL-loneliness-interventions','R47').note])assert.match(text,/no statistically significant between-group change was detected/);
  for(const id of claimIds)assert.match(claim(id).notImplied.join(' '),/unsafe|safety/);
  assert.match(claim('CL-loneliness-interventions').notImplied.join(' '),/not a personal treatment recommendation/);
});

test('future cluster draft markers and private wrapper fields cannot pass sidecar validation',()=>{
  for(const marker of ['HM-S4','BL-C2','LT-A1']){const copy=structuredClone(evidenceAssertions);copy.edges[0].scope=marker;assert.match(validateEvidenceAssertions(content,copy).join('\n'),/Draft or private context/);}
  assert.doesNotMatch(JSON.stringify([raw,evidenceAssertions,evidenceTaxonomy]),/(?:HM|BL|LT)-[SCA]\d|\/workspace\/|sourcePacketSha256|source_packet_id|collisionCheck|source-cache|private-reference|docs\.google\.com/);
  assert.equal(content.videos.length,7);
});
