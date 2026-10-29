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
import { claimRelationships, relationshipHasRole, sampleDescription, sourceChecks, sourceType } from '../lib/evidence';
import { evidenceAssertions, evidenceTargetDescription, validateEvidenceAssertions } from '../lib/evidence-assertions';
import { claimFacet, filterEvidenceClaims, initialEvidenceFilters } from '../lib/evidence-taxonomy';
import { SourceAssertions } from '../components/evidence/SourceAssertions';
import { EvidenceDeskSources } from '../features/observatory/EvidenceDesk';
const hash=(value:unknown)=>createHash('sha256').update(JSON.stringify(restoreRepetitionBaseline(restoreDisagreementBaseline(restoreAutonomousBaseline(restoreRetrievalBaseline(restoreCalibrationBaseline(restoreStressBaseline(value)))))))).digest('hex');
const ids=['R78','R79','R80','R81'];
// Later cognitive-training additions are fingerprinted in brain-training.test.ts.
const laterSources=["R82","R83","R84","R85","R86","R87","R88","R89","R90","R91","R92","R93","R94","R95","R96","R97","R98","R99"];
const laterClaims=["CL-cognitive-training-transfer","CL-gratitude-writing-comparators","CL-helping-liking-attraction"];
const c=content.claims.find(item=>item.id==='CL-delay-outcome-associations')!;
const source=(id:string)=>content.sources.find(item=>item.id===id)!;
const relationships=claimRelationships(c);
const escape=(text:string)=>text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;');
// Exact approved v2 projection fingerprints; existing public records are unchanged.
const expectedRecords:Record<string,string>={
  "R78": "c4cb010d3506ce19af033c19b8ac74f51e2cffcfa666d184dd003a1a8b939863",
  "R79": "65f7130becfef087f5896a723be54c403a402dc23de977061d1dddb4ccd8cfd1",
  "R80": "3cc458cb9341200704772d1b8bbb1d5fc23d61356d6bee6f128628c0a149f1c1",
  "R81": "d0441ff998a6dab9b65837c002a3f71bd9741c1aba1575561c51ef48167acd28",
  "CL-delay-outcome-associations": "9348b1a312e2b81c039d9466cbfce90974ffb31ccf35f12364f91144864ca671"
};

test('delay adds one reviewed card and four reports while every previous public field and facet stays unchanged',()=>{
  assert.deepEqual(validateRelationships(),[]);assert.deepEqual(validateEvidenceAssertions(content),[]);
  assert.equal(content.claims.length,39);assert.equal(content.sources.length,118);assert.equal(content.models.length,4);
  assert.deepEqual(content.sources.slice(77,81).map(s=>s.id),ids);assert.deepEqual(content.claims.slice(26,27).map(c=>c.id),[c.id]);
  assert.equal(new Set(content.sources.map(s=>s.id)).size,118);assert.equal(new Set(content.claims.map(c=>c.id)).size,39);
  for(const record of [...raw.sources,...raw.claims])if(expectedRecords[record.id])assert.equal(hash(record),expectedRecords[record.id],record.id);
  const previous=structuredClone(raw);previous.sources=previous.sources.filter(s=>![...ids,...laterSources].includes(s.id));previous.claims=previous.claims.filter(item=>![c.id,...laterClaims].includes(item.id));assert.equal(hash(previous),'820886ab56f1bc7955eb3335556a5236d4df197e47246c7c8289612a2db9f3c1');
  const previousTaxonomy=structuredClone(taxonomyRaw);previousTaxonomy.claimFacets=previousTaxonomy.claimFacets.filter(f=>![c.id,...laterClaims].includes(f.claimId));assert.equal(hash(previousTaxonomy),'2116fc51e66a1f93b6bbe29bece1da23a01c966e1aeefd96f529611c8679d7b7');const delayTaxonomy=structuredClone(taxonomyRaw);delayTaxonomy.claimFacets=delayTaxonomy.claimFacets.filter(f=>!laterClaims.includes(f.claimId));assert.equal(hash(delayTaxonomy),'867987ac3b894e292a817627e26df731172af8cafbd26930bae08929c24ee118');
  assert.equal(hash(evidenceAssertions.edges.slice(0,85)),'6e2bc467b6055341847bdc904541418aac204567e3f5ee59c6ccb38db93af75e');assert.equal(hash(evidenceAssertions.edges.slice(85,92)),'78cb3354a29ea585f0a48d35f50fdf781a22985358a1ed6849655125e4a4cb9f');
});

test('seven exact assertions remain four source connections with mixed design context rather than whole-card support',()=>{
  const added=evidenceAssertions.edges.slice(85,92);assert.equal(added.length,7);assert.equal(evidenceAssertions.edges.length,165);assert.equal(relationships.length,4);
  assert.equal(new Set(added.map(e=>JSON.stringify([e.claimId,e.sourceId]))).size,4);assert.ok(added.every(e=>e.target.startsWith(c.id+'.limitations[')));
  for(const id of ['R78','R79','R81']){const r=relationships.find(r=>r.sourceId===id)!;assert.equal(r.role,'multiple');assert.equal(r.assertions?.length,2);assert.equal((['supports','context'] as const).every(role=>relationshipHasRole(r,role)),true);assert.equal((['supports','qualifies'] as const).every(role=>relationshipHasRole(r,role)),false);assert.equal((['qualifies','context'] as const).some(role=>relationshipHasRole(r,role)),true);}
  const r80=relationships.find(r=>r.sourceId==='R80')!;assert.equal(r80.role,'supports');assert.equal(r80.assertions?.length,1);assert.equal(r80.target,c.id+'.limitations[2]');assert.equal(relationshipHasRole(r80,'context'),false);
});

test('all seven report-specific targets, scopes and lineage labels survive assertion rendering without raw field keys',()=>{
  let rendered=0;
  for(const r of relationships){
    const html=renderToStaticMarkup(createElement(SourceAssertions,{relationship:r,claim:c}));rendered+=(html.match(/data-assertion-role=/g)||[]).length;
    for(const a of r.assertions!){const resolved=evidenceTargetDescription(a.target,c);assert.notEqual(resolved,a.target);assert.equal(html.split(`<dd>${escape(resolved)}</dd>`).length-1,1);assert.ok(html.includes(escape(a.studyLineage)));if(r.assertions!.length>1)assert.ok(html.includes(escape(a.scope)));else assert.equal(r.note,a.scope);}
    assert.doesNotMatch(html,/CL-delay-outcome-associations\.limitations\[/);
  }
  assert.equal(rendered,7);
});

test('R80 keeps genuinely unknown sample extraction and limited access instead of an invented denominator note',()=>{
  const s=source('R80');assert.equal(sourceType(s),'Study');assert.equal(s.sampleSize,null);assert.equal(s.sampleSizeNote,undefined);assert.equal(sampleDescription(s).state,'unknown');assert.match(sampleDescription(s).text,/Not independently extracted/);
  assert.match(s.accessDepth,/abstract.*CAPTCHA.*rate limit.*prevented full Methods\/Results/);
  assert.match(c.limitations[2],/sample sizes remain unverified/);
  for(const id of ids){assert.equal(sourceType(source(id)),'Study');assert.equal(source(id).retractionStatus,'unknown');assert.equal(sourceChecks(source(id)).find(check=>check.label==='Retraction check')?.state,'unknown');}
  for(const id of ['R78','R79','R81'])assert.equal(sampleDescription(source(id)).text,source(id).sampleSizeNote);
});

test('each SECCYD source contains its own public shared-cohort disclosure without relying on wrapper metadata',()=>{
  for(const id of ['R79','R80','R81']){
    assert.match(source(id).summary,/reuse the NICHD SECCYD cohort with different subsets, outcomes and analyses/);
    assert.match(source(id).summary,/Participant-level intersections were not independently reconstructed/);
    assert.match(source(id).summary,/not three independent replications; do not sum their sample sizes/);
    assert.equal(Object.hasOwn(raw.sources.find(s=>s.id===id)!, 'sourceFamilyNote'),false);
  }
  assert.match(c.limitations[5],/two cohort families, not four independent samples/);
});

test('separate denominators, adjustment sets and continuous-versus-categorical findings stay explicit',()=>{
  assert.match(source('R78').sampleSizeNote!,/185 returned.*94.*35/);assert.equal(source('R78').sampleSize,185);
  assert.match(source('R79').sampleSizeNote!,/918 analyzed: 552.*366/);assert.match(c.limitations[1],/\.24 unadjusted, \.08.*\.05.*p=\.140/);
  assert.equal(source('R81').sampleSize,702);assert.match(source('R81').sampleSizeNote!,/not 702 observations for every endpoint/);
  assert.match(source('R81').summary,/Fully adjusted continuous-delay.*nine age-26 outcomes/);assert.match(source('R81').summary,/exploratory, nonpreregistered full-seven-minute.*BMI.*without multiplicity adjustment/);assert.match(source('R81').summary,/Other categorical specifications yielded different patterns/);
  assert.match(c.limitations[3],/Nondetection is not equivalence/);assert.match(c.notImplied[2],/No proof that waiting predicts nothing/);
});

test('qualified navigation and limited confidence preserve association-versus-training boundaries without adding practices',()=>{
  assert.equal(claimFacet(c.id)?.disposition,'qualified');assert.equal(c.confidence,'limited');assert.match(c.reviewer,/human scientific review pending/);
  assert.equal(claimFacet(c.id)?.domainLinks.find(link=>link.domainId==='identity-habits')?.relation,'boundary-context');
  assert.ok(filterEvidenceClaims(content.claims,{...initialEvidenceFilters,domain:'agency-self-command'}).some(item=>item.id===c.id));
  assert.match(c.limitations[4],/not proof that all possible training benefits are absent/);assert.match(c.notImplied[0],/No individual life-success forecast, child ranking/);assert.match(c.notImplied[1],/No home testing, food restriction/);
  assert.equal(hash(learningPathsRaw),'6e2e2a4aaf2e0fea2f55abc637c60c01e0a8c6307f8723531b48caeb4860ac49');assert.equal(content.videos.length,7);
});

test('Observatory delay source list retains four separate scoped-role blocks and stable dossier-connection links',()=>{
  const html=renderToStaticMarkup(createElement(EvidenceDeskSources,{claim:c}));assert.equal((html.match(/data-source-id=/g)||[]).length,4);assert.equal((html.match(/<div><strong>[^<]+<\/strong><\/div><a /g)||[]).length,4);
  for(const r of relationships){assert.equal(html.split(`data-source-id="${r.sourceId}"`).length-1,1);assert.ok(html.includes(`data-role="${r.role}"`));assert.ok(html.includes(`/evidence/claims/${c.slug}#connection-${r.sourceId}`));}
  assert.doesNotMatch(html,/Recorded supporting sources|Counterevidence recorded/);
});

test('delay internal markers, invalid targets and duplicate narrative variants cannot enter public assertions',()=>{
  for(const marker of ['DG-S2','DG-C1','DG-A3'])for(const field of ['scope','target','studyLineage'] as const){const copy=structuredClone(evidenceAssertions);copy.edges[85][field]=marker;assert.match(validateEvidenceAssertions(content,copy).join('\n'),/Draft or private context/);}
  const copy=structuredClone(evidenceAssertions);copy.edges.push({...copy.edges[85],scope:'Different wording',studyLineage:'Different lineage wording'});assert.match(validateEvidenceAssertions(content,copy).join('\n'),/Duplicate evidence assertion/);
  for(const target of [c.id+'.limitations[99]',c.id+'.limitations[-1]',c.id+'.limitations[01]','CL-imagery.limitations[0]']){const invalid=structuredClone(evidenceAssertions);invalid.edges[85].target=target;assert.match(validateEvidenceAssertions(content,invalid).join('\n'),/Unresolved assertion target/);}
  assert.doesNotMatch(JSON.stringify([raw,taxonomyRaw,evidenceAssertions]),/(?:HM|BL|LT|ER|AG|PC|DG)-[SCA]\d|\/workspace\/|sourcePacketSha256|internalSourceMapping|internalPropositionLineage|sourceMetadataNotes|sourceFamilyNote|collisionCheck|private-reference/);
});
