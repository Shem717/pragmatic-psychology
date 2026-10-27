import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import raw from '../content/public.json';
import { content, publicSchema, validateRelationships } from '../lib/content';
import { claimRelationships, sampleDescription, sourceChecks, sourceClaims, sourceType } from '../lib/evidence';
import { evidenceAssertions, evidenceAssertionsSchema, evidenceTargetDescription, validateEvidenceAssertions } from '../lib/evidence-assertions';
import { claimFacet, evidenceTaxonomy, filterEvidenceClaims, initialEvidenceFilters } from '../lib/evidence-taxonomy';
const hash = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const changedSources = ['R04','R11','R19','R20','R39','R40','R41','R42'];
const changedClaims = ['CL-reconsolidation','CL-habit-timescale','CL-habit-context'];
// Later reviewed cluster additions/upgrades are fingerprinted in their own tests.
const laterSources = ['R43','R44','R45','R46','R47','R48','R49','R36','R37','R50','R51','R52','R53','R54','R55','R56','R57','R15','R16','R32','R33','R34','R58','R59','R60','R61','R62'];
const laterClaims = ['CL-loneliness-isolation','CL-solitude-affect','CL-loneliness-interventions','CL-motor-imagery-scope','CL-retrieval-retention-transfer','CL-flexibility','CL-regulation-choice-outcome','CL-expression-experience','CL-acceptance-associations'];
const source = (id: string) => content.sources.find((item) => item.id === id)!;
const claim = (id: string) => content.claims.find((item) => item.id === id)!;
const edge = (claimId: string, sourceId: string) => claimRelationships(claim(claimId)).find((item) => item.sourceId === sourceId)!;
// Fingerprints derive from independently approved projection v3 and exact frozen taxonomy base,
// not a changed baseline: 4 source upgrades, 4 additions, 1 claim enrichment, 2 additions.
const expectedRecords: Record<string,string> = {
  "R04": "fe9da0a44a0f6441fc9e680aca3eef1f83abd0a22628043ef56290e588e87e5a",
  "R11": "57844149cc98e1b940d44e200821aea721337e72bb5d352ebed45fc05b9a9cdd",
  "R19": "1ba753ba2013849248fdd0e982ab33d19098e8487375d8feda312bd8ca0d7f9e",
  "R20": "98f93d9cabe6a7285842ae4a46d47c473c4c5e1a85413ab9e040201643aa780a",
  "R39": "b74349aa700bf8f1308b4ab8510bc2570d697736358d386683560a5494d29178",
  "R40": "6fb781a368de3df02d2651c3b627784f9fb8dc4bcf2a0d016b2e126e33d0c69a",
  "R41": "95045d003caa23ca3324d55c7844e00dbd5b4c27165acc19a7e3968db399205c",
  "R42": "5994e7e8a1ca1dff7e11e1aa7acfaaa8389aecb1a1d54d7fd4f47063640a23f6",
  "CL-reconsolidation": "3e331f1f03a07112b64291d1f51a5052fd553d9a5339139996e01782c5e17baf",
  "CL-habit-timescale": "81a84a3d5aacf78335d094cdccaf057308a67040831dcd5425b535badab58391",
  "CL-habit-context": "2e15f0a5b30daf36f7e57e254501be60d2ea1f4853cceeceeaea95b85938ac12"
};

test('the exact bounded public payload lands once and every unaffected public field is unchanged', () => {
  assert.deepEqual(validateRelationships(), []);
  assert.equal(content.claims.length, 21); assert.equal(content.sources.length, 62); assert.equal(content.models.length, 4);
  assert.equal(new Set(content.claims.map((item) => item.id)).size, 21);
  assert.equal(new Set(content.sources.map((item) => item.id)).size, 62);
  for (const record of [...raw.sources,...raw.claims]) if (expectedRecords[record.id]) assert.equal(hash(record), expectedRecords[record.id], record.id);
  const unchanged = structuredClone(raw);
  unchanged.sources = unchanged.sources.filter((item) => ![...changedSources,...laterSources].includes(item.id));
  unchanged.claims = unchanged.claims.filter((item) => ![...changedClaims,...laterClaims].includes(item.id));
  assert.equal(hash(unchanged), 'a7aa263b50775d0839b158a20c28db70e2316a757d274b9b7b1960cec418b81c');
  assert.deepEqual(content.sources.slice(38,42).map((item) => item.id), ['R39','R40','R41','R42']);
});

test('explicit source assertions preserve exact reviewed roles, targets and protocol lineage', () => {
  assert.deepEqual(validateEvidenceAssertions(content), []);
  assert.equal(evidenceAssertions.edges.length, 44);
  assert.equal(hash(evidenceAssertions.edges.slice(0,8)), '172013a30125e0e79e47a8c1542228d3ead5dbdcf31fe61110684a2993fcc1e9');
  assert.equal(edge('CL-habit-timescale','R39').role, 'supports');
  assert.equal(edge('CL-habit-timescale','R41').role, 'context', 'sourceIds does not imply support');
  assert.match(edge('CL-habit-timescale','R41').note, /does not support a human/);
  assert.equal(edge('CL-reconsolidation','R42').role, 'qualifies');
  assert.match(edge('CL-reconsolidation','R42').target!, /R20/);
  assert.match(edge('CL-reconsolidation','R11').target!, /R04.*directly replicated/);
  assert.equal(edge('CL-reconsolidation','R11').role, 'conflicts');
  assert.match(edge('CL-reconsolidation','R11').note, /Does not contradict the umbrella/);
  assert.equal(sourceClaims('R41',content.claims)[0].role, 'context');
  assert.equal(edge('CL-fmt','R27').role, 'conflicts');
  assert.match(edge('CL-fmt','R27').note, /does not contradict/);
});

test('assertion validation rejects broken endpoints, unlinked pairs, duplicate pairs and empty scope', () => {
  const copy = structuredClone(evidenceAssertions);
  copy.edges.push(copy.edges[0]);
  copy.edges[1].sourceId = 'missing-source';
  copy.edges[2].claimId = 'missing-claim';
  const errors = validateEvidenceAssertions(content,copy).join('\n');
  assert.match(errors,/Duplicate evidence assertion/); assert.match(errors,/Missing assertion source/);
  assert.match(errors,/Missing assertion claim/); assert.match(errors,/Unlinked assertion source/);
  const blank = structuredClone(evidenceAssertions); blank.edges[0].scope = '  ';
  assert.equal(evidenceAssertionsSchema.safeParse(blank).success,false);
  const invalidTarget = structuredClone(evidenceAssertions); invalidTarget.edges[0].target = 'CL-habit-timescale.notImplied[999]';
  assert.match(validateEvidenceAssertions(content,invalidTarget).join('\n'), /Unresolved assertion target/);
  const privateContext = structuredClone(evidenceAssertions); privateContext.edges[0].scope = '/workspace/private';
  assert.match(validateEvidenceAssertions(content,privateContext).join('\n'), /Draft or private context/);
});

test('canonical targets resolve to readable text while precise protocol propositions stay intact', () => {
  const c = claim('CL-habit-timescale');
  assert.equal(evidenceTargetDescription(`${c.id}.statement`,c), c.statement);
  assert.equal(evidenceTargetDescription(`${c.id}.notImplied[1]`,c), c.notImplied[1]);
  const target = edge('CL-reconsolidation','R11').target!;
  assert.equal(evidenceTargetDescription(target,claim('CL-reconsolidation')),target);
});

test('multiple extracted denominators are not confused with an unknown animal sample', () => {
  assert.equal(source('R04').sampleSize,null);
  assert.equal(sampleDescription(source('R04')).state,'reviewed');
  for(const count of ['65','126','19','18','70']) assert.ok(sampleDescription(source('R04')).text.includes(count));
  assert.doesNotMatch(sampleDescription(source('R04')).text,/Not independently extracted/);
  assert.equal(sampleDescription(source('R41')).state,'unknown');
  assert.equal(source('R41').sampleSizeNote,undefined);
  assert.match(sampleDescription(source('R39')).text,/82.*39/);
  assert.match(sampleDescription(source('R40')).text,/115.*47/);
  assert.match(sampleDescription(source('R42')).text,/91.*not independently extracted/);
  const oversized = structuredClone(raw); (oversized.sources[0] as {sampleSizeNote?:string}).sampleSizeNote = 'x'.repeat(2001);
  assert.equal(publicSchema.safeParse(oversized).success,false);
});

test('access scope, publication year, unknown retraction state and addendum dependence stay explicit', () => {
  for(const id of changedSources) { assert.equal(sourceType(source(id)),'Study'); assert.equal(sourceChecks(source(id)).find((item) => item.label === 'Retraction check')?.state,'unknown'); }
  assert.match(source('R39').accessDepth,/abstract.*indexed/i);
  assert.match(source('R41').accessDepth,/abstract/i); assert.equal(source('R41').year,1966);
  assert.equal(source('R04').correctionUrl,'https://www.nature.com/articles/s41586-018-0405-7');
  assert.match(source('R04').correctionNote!, /does not transparently reconcile.*Not independent corroboration/);
  assert.equal(content.sources.filter((item) => item.url === source('R04').correctionUrl).length,0);
});

test('new topic links are qualified editorial navigation, not promotion of personal efficacy', () => {
  for(const id of ['CL-habit-timescale','CL-habit-context']) {
    assert.equal(claimFacet(id)?.disposition,'qualified');
    assert.match(claim(id).reviewer,/human scientific review pending/);
    assert.equal(claim(id).reviewStatus,'educational-review');
    assert.ok(filterEvidenceClaims(content.claims,{...initialEvidenceFilters,domain:'identity-habits'}).some((item)=>item.id===id));
  }
  assert.equal(claimFacet('CL-habit-context')?.domainLinks.find((link)=>link.domainId==='agency-self-command')?.relation,'boundary-context');
  assert.equal(claimFacet('CL-reconsolidation')?.domainLinks.find((link)=>link.domainId==='emotion-regulation')?.relation,'boundary-context');
  assert.equal(claimFacet('CL-identity')?.disposition,'unresolved');
  const summary = evidenceTaxonomy.domains.find((item)=>item.id==='identity-habits')!.summary;
  assert.match(summary,/specific observational studies.*remains unestablished/);
  assert.equal(filterEvidenceClaims(content.claims,{...initialEvidenceFilters,domain:'relationships-belonging'}).length,4);
});

test('the integration has no draft research IDs or private wrappers, and details remain optional', () => {
  assert.doesNotMatch(JSON.stringify([raw,evidenceAssertions,evidenceTaxonomy]),/HM-[SCA]\d|\/workspace\/|sourcePacketSha256|source_packet_id|collisionCheck|source-cache|private-reference|docs\.google\.com/);
  const page = readFileSync('app/evidence/claims/[slug]/page.tsx','utf8');
  assert.match(page, /<SourceAssertions relationship=\{r\} claim=\{c\}/);
  const dossier = readFileSync('components/evidence/SourceAssertions.tsx','utf8');
  assert.match(dossier,/<details className="dossier-assertion"/);
  assert.match(dossier,/does not certify independent replication/);
  assert.match(dossier,/Source records are not counts of independent studies/);
  assert.match(dossier,/evidenceAssertions.review.reviewer/);
  assert.match(dossier,/evidenceTargetDescription\(assertion.target, claim\)/);
  assert.equal(content.videos.length,7);
});
