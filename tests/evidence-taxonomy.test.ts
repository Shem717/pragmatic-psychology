import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { content, type Claim } from '../lib/content';
import { claimRelationships } from '../lib/evidence';
import { claimFacet, currentEvidenceClaims, evidenceTaxonomy, evidenceTaxonomySchema, filterEvidenceClaims, initialEvidenceFilters, parseEvidenceQuery, serializeEvidenceQuery, topicClaimCount, validateEvidenceTaxonomy } from '../lib/evidence-taxonomy';

test('taxonomy links canonical records without duplicating claims, sources or models', () => {
  assert.deepEqual(validateEvidenceTaxonomy(content), []);
  assert.equal(evidenceTaxonomy.domains.length, 6);
  assert.equal(evidenceTaxonomy.claimFacets.length, 36);
  assert.equal(content.claims.length, 36); assert.equal(content.sources.length, 112); assert.equal(content.models.length, 4);
  assert.equal(new Set(evidenceTaxonomy.domains.flatMap((domain) => domain.disciplineLinks.map((link) => link.discipline))).size, 8);
  assert.equal(topicClaimCount('relationships-belonging', content.claims), 6);
  assert.equal(topicClaimCount('perception-interpretation', content.claims), 10);
  assert.equal(topicClaimCount('emotion-regulation', content.claims), 15);
});

test('category labels never elevate disposition, confidence, review process or supporting sources', () => {
  const before = JSON.stringify(content);
  const flexibility = content.claims.find((claim) => claim.id === 'CL-flexibility')!;
  for (const link of claimFacet(flexibility.id)!.domainLinks) {
    const result = filterEvidenceClaims(content.claims, { ...initialEvidenceFilters, domain: link.domainId });
    assert.equal(result.find((claim) => claim.id === flexibility.id), flexibility);
    assert.equal(result.filter((claim) => claim.id === flexibility.id).length, 1);
  }
  assert.equal(claimFacet('CL-reconsolidation')!.disposition, 'qualified');
  assert.equal(claimFacet('CL-fmt')!.disposition, 'qualified');
  assert.equal(claimFacet('CL-identity')!.disposition, 'unresolved');
  assert.equal(evidenceTaxonomy.review.humanScientificReview, 'pending');
  assert.equal(JSON.stringify(content), before);
  assert.equal(claimRelationships(content.claims.find((claim) => claim.id === 'CL-fmt')!).find((edge) => edge.sourceId === 'R27')!.role, 'conflicts', 'Existing relation logic is not silently rewritten by taxonomy');
});

test('clinical and animal topic links remain boundary/context, not personalized regulation strategies', () => {
  for (const id of ['CL-therapy','CL-microbiota','CL-fmt','CL-medication']) {
    const link = claimFacet(id)!.domainLinks.find((edge) => edge.domainId === 'emotion-regulation')!;
    assert.equal(link.relation, 'boundary-context'); assert.ok(link.rationale.length > 30);
  }
  assert.equal(claimFacet('CL-plasticity')!.domainLinks[0].relation, 'boundary-context');
  for (const facet of evidenceTaxonomy.claimFacets) {
    assert.ok(facet.dispositionRationale.length > 40);
    for (const link of [...facet.domainLinks,...facet.disciplineLinks]) assert.ok(link.rationale.length > 20);
  }
});

test('validation rejects missing references, duplicate memberships and absent rationales', () => {
  const data = structuredClone(evidenceTaxonomy);
  data.claimFacets[0].claimId = 'CL-missing';
  data.claimFacets[0].domainLinks[0].domainId = 'missing-domain';
  data.claimFacets[0].disciplineLinks[0].discipline = 'missing-discipline';
  data.domains[0].modelLinks[0].modelId = 'missing-model';
  data.domains.push(data.domains[0]);
  const errors = validateEvidenceTaxonomy(content, data);
  for (const value of ['Missing canonical claim CL-missing','Missing domain missing-domain','Missing discipline missing-discipline','Missing model missing-model','Duplicate evidence domain']) assert.ok(errors.includes(value));
  const duplicate = structuredClone(evidenceTaxonomy);
  duplicate.claimFacets[0].domainLinks.push(duplicate.claimFacets[0].domainLinks[0]);
  assert.ok(validateEvidenceTaxonomy(content, duplicate).some((message) => message.includes('Duplicate CL-threat domain link')));
  const empty = structuredClone(evidenceTaxonomy); empty.claimFacets[0].domainLinks[0].rationale = '';
  assert.equal(evidenceTaxonomySchema.safeParse(empty).success, false);
});

test('future unassigned public claims stay searchable without an invented disposition or category', () => {
  const future = { ...content.claims[0], id: 'CL-future-reviewed', slug: 'future-reviewed', title: 'A future reviewed question' };
  const claims = [...content.claims, future];
  assert.equal(filterEvidenceClaims(claims, initialEvidenceFilters).length, 37);
  assert.equal(filterEvidenceClaims(claims, { ...initialEvidenceFilters, q: 'future reviewed' })[0], future);
  assert.equal(filterEvidenceClaims(claims, { ...initialEvidenceFilters, disposition: 'not-appraised' })[0], future);
  assert.equal(filterEvidenceClaims(claims, { ...initialEvidenceFilters, domain: 'relationships-belonging' }).length, 6);
  assert.equal(claimFacet(future.id), undefined);
  assert.deepEqual(validateEvidenceTaxonomy({ ...content, claims }), []);
});

test('withdrawn, superseded and held drafts never appear as current topic evidence', () => {
  const retired = [{ ...content.claims[0], reviewStatus: 'withdrawn' }, { ...content.claims[1], reviewStatus: 'superseded' }];
  const held = { ...content.claims[2], publicationStatus: 'draft' } as unknown as Claim;
  assert.equal(currentEvidenceClaims([...retired, held]).length, 0);
  assert.equal(filterEvidenceClaims([...retired, held], initialEvidenceFilters).length, 0);
  assert.deepEqual(parseEvidenceQuery('?compare=threat,reconsolidation,imagery', [...retired, held]).compare, []);
});

test('topic, discipline and disposition filters compose with original search and evidence facets', () => {
  const result = filterEvidenceClaims(content.claims, { ...initialEvidenceFilters, domain: 'agency-self-command', discipline: 'competence', disposition: 'unresolved' });
  assert.deepEqual(result.map((claim) => claim.id), ['CL-identity']);
  assert.equal(filterEvidenceClaims(content.claims, { ...initialEvidenceFilters, q: 'CL-imagery' })[0].id, 'CL-imagery');
  assert.equal(filterEvidenceClaims(content.claims, { ...initialEvidenceFilters, kind: 'empirical-finding', confidence: 'high' })[0].id, 'CL-therapy');
  assert.equal(filterEvidenceClaims(content.claims, initialEvidenceFilters).length, 36);
});

test('shareable URLs round-trip all filters, selection and distinct comparison without accepting unknown categories', () => {
  const filters = { ...initialEvidenceFilters, q: 'scope & learning', domain: 'learning-memory', discipline: 'understanding', disposition: 'qualified', kind: 'empirical-finding', population: content.claims[1].population, confidence: 'moderate' };
  const query = serializeEvidenceQuery(filters, 'CL-reconsolidation', ['CL-reconsolidation','CL-imagery','CL-imagery'], content.claims);
  const parsed = parseEvidenceQuery(query, content.claims);
  assert.deepEqual(parsed.filters, filters); assert.equal(parsed.selected, 'CL-reconsolidation');
  assert.deepEqual(parsed.compare, ['CL-reconsolidation','CL-imagery']);
  const invalid = parseEvidenceQuery('?domain=secret&discipline=unknown&disposition=proven&kind=wrong&population=wrong&confidence=100&claim=unknown&compare=bad,bad,threat', content.claims);
  assert.deepEqual(invalid.filters, initialEvidenceFilters); assert.deepEqual(invalid.compare, ['CL-threat']);
  assert.equal(serializeEvidenceQuery(initialEvidenceFilters, content.claims[0].id, [], content.claims), '');
  assert.equal(parseEvidenceQuery('?q='+ 'a'.repeat(600),content.claims).filters.q.length,500);
});

test('the narrowly verified R34 corrigendum provenance remains intact after later source reviews', () => {
  const source = content.sources.find((item) => item.id === 'R34')!;
  assert.equal(source.correctionUrl, 'https://journals.sagepub.com/doi/10.1177/0963721419847163');
  assert.match(source.correctionNote!, /Figure 2/); assert.match(source.correctionNote!, /remaining figure text was unchanged/);
  assert.equal(source.checkedAt, '2026-10-27'); assert.equal(source.retractionStatus, 'unknown');
  // Complete unaffected-record preservation and exact reviewed changes are checked in habit-memory.test.ts.
});

test('the atlas is additive to constellation, search and plain index, with human review and rationale visible', () => {
  const source = readFileSync('features/Evidence.tsx','utf8');
  for (const token of ['<EvidenceAtlas','<Constellation','<ClaimComparison','Search claims','claim-index','<ClaimTaxonomy']) assert.ok(source.includes(token));
  const atlas = readFileSync('features/evidence/EvidenceAtlas.tsx','utf8');
  assert.match(atlas,/No dedicated canonical claim in this topic yet/);
  assert.match(atlas,/None is a truth score/);
  const facet = readFileSync('components/evidence/ClaimTaxonomy.tsx','utf8');
  assert.match(facet,/claim\.reviewer/); assert.match(facet,/dispositionRationale/); assert.match(facet,/domainRelationLabels/);
  assert.doesNotMatch(source, /localStorage|indexedDB|writeDrafts/);
});


test('same-page category controls update local state rather than triggering a document reload', () => {
  const source = readFileSync('features/Evidence.tsx','utf8');
  assert.match(source,/onChooseDomain=\{\(domain\) =>/);
  assert.doesNotMatch(source,/href=\{`\?domain=/);
  const facet = readFileSync('components/evidence/ClaimTaxonomy.tsx','utf8');
  assert.match(facet,/onChooseDomain \? <button/);
});
