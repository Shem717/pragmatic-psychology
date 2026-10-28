import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { pilotProvenance, pilotProvenanceSchema, validatePilotProvenance, provenanceHashInputs, canonicalSnapshot, relationshipProvenance, scientificMappingMetadata, isPublicSourceUrl } from '../lib/pilot-provenance';
import { content } from '../lib/content';
import { learningPathCatalog } from '../lib/learning-paths';
import { evidenceAssertions } from '../lib/evidence-assertions';
import { claimRelationships } from '../lib/evidence';
import { formativeRubricDefinitions, deriveLearningProfile } from '../lib/learning-path-records';
import { makeDraft } from '../features/notebook-data';
import { SourceAssertions } from '../components/evidence/SourceAssertions';
import { ProvenanceDisclosure } from '../components/evidence/ProvenanceDisclosure';
const digest = (value: unknown) => createHash('sha256').update(canonicalSnapshot(value)).digest('hex');
const changed = () => structuredClone(pilotProvenance);

test('pilot provenance resolves current snapshots, distinct records and learning dependencies', () => {
  assert.deepEqual(validatePilotProvenance(), []);
  for (const item of provenanceHashInputs()) assert.equal(digest(item.snapshot), item.hash, item.id);
  assert.equal(pilotProvenance.revisions.length, 7);
  assert.equal(pilotProvenance.dependencies.length, 7);
  assert.equal(pilotProvenance.assertionBindings.length, 5);
  assert.equal(content.claims.length, 32); assert.equal(content.sources.length, 104); assert.equal(evidenceAssertions.edges.length, 133);
});

test('the R32 dispute remains unresolved, not retraction or independent replication', () => {
  const decision = pilotProvenance.decisions.find((item) => item.id === 'decision-R32-dispute')!;
  assert.equal(decision.status, 'unresolved'); assert.equal(decision.resolution, null);
  assert.ok(decision.subjectRevisionIds.includes('revision-PILOT-P01-1.0'));
  assert.match(decision.rationale, /do not resolve/);
  assert.deepEqual(pilotProvenance.lineage.filter((item) => item.id.startsWith('lineage-R32')).map((item) => [item.relation,item.independence]), [['comment-on','not-applicable'],['reply-to','not-applicable']]);
  const invalid = changed(); invalid.decisions.find((item) => item.id === decision.id)!.resolution = 'Settled';
  assert.ok(validatePilotProvenance(invalid).some((error) => /Unresolved objection/.test(error)));
});

test('Denver shared-project lineage never asserts disjoint cohorts or exact overlap', () => {
  const lineage = pilotProvenance.lineage.find((item) => item.id === 'lineage-denver')!;
  assert.equal(lineage.participantOverlap, 'unknown'); assert.equal(lineage.independence, 'not-established');
  assert.equal(lineage.toId, 'study-R60-3');
  assert.match(lineage.rationale, /No independent-replication vote or pooled unique N/);
  const invalid = changed(); invalid.lineage.find((item) => item.id === lineage.id)!.participantOverlap = 'documented-shared';
  assert.ok(validatePilotProvenance(invalid).some((error) => /Unsupported participant overlap/.test(error)));
  assert.equal(pilotProvenance.samples.find((item) => item.id === 'sample-R16-raters')!.count, 22);
  assert.equal(pilotProvenance.samples.find((item) => item.id === 'sample-R16-participants')!.count, null);
});

test('R16 correction is linked without becoming a study or silently rewriting teaching', () => {
  const report = pilotProvenance.reports.find((item) => item.id === 'report-R16-correction')!;
  assert.equal(report.role, 'correction'); assert.equal(report.canonicalSourceId, 'R16');
  assert.equal(pilotProvenance.studies.some((item) => item.reportVersionIds.includes(report.id)), false);
  const decision = pilotProvenance.decisions.find((item) => item.id === 'decision-R16-correction')!;
  assert.match(decision.rationale, /Seven.*some secondary significance results changed/);
  for (const subject of decision.subjectRevisionIds) assert.ok(pilotProvenance.dependencies.some((item) => item.dependsOnRevisionIds.includes(subject) && item.decisionIds.includes(decision.id)));
  const inputs = { content: structuredClone(content), paths: structuredClone(learningPathCatalog), assertions: evidenceAssertions };
  inputs.content.sources.find((item) => item.id === 'R16')!.correctionNote = 'Changed result';
  assert.ok(validatePilotProvenance(pilotProvenance, inputs).some((error) => /Changed snapshot.*report-R16/.test(error)));
  inputs.paths.paths[0].passports[1].statement = 'An altered lesson proposition';
  assert.ok(validatePilotProvenance(pilotProvenance, inputs).some((error) => /Changed snapshot.*PILOT-P02/.test(error)));
  assert.ok(provenanceHashInputs(pilotProvenance, inputs.paths).some((item) => digest(item.snapshot) !== item.hash));
});

test('unknown spans and absent historical snapshots cannot be silently promoted', () => {
  assert.ok(pilotProvenance.locators.some((item) => item.kind === 'unknown' && item.precision === 'not-recorded'));
  assert.ok(pilotProvenance.revisions.every((item) => item.predecessorRevisionId === null && item.predecessorStatus === 'historical-snapshot-unavailable'));
  const invalid = changed(); invalid.locators.find((item) => item.kind === 'unknown')!.precision = 'recorded-point';
  assert.ok(validatePilotProvenance(invalid).some((error) => /Unknown locator/.test(error)));
  const fakeHistory = changed(); fakeHistory.revisions[0].predecessorRevisionId = fakeHistory.revisions[0].id; fakeHistory.revisions[0].predecessorStatus = 'recorded';
  assert.ok(validatePilotProvenance(fakeHistory).some((error) => /Unreviewed historical snapshot/.test(error)));
});

test('orphaned locators, wrong source bindings, held decisions and missing dependencies fail', () => {
  const a = changed(); a.locators[0].reportVersionId = 'missing'; assert.ok(validatePilotProvenance(a).some((error) => /Missing locator report/.test(error)));
  const b = changed(); b.assertionBindings[0].locatorIds = ['loc-R16-1']; assert.ok(validatePilotProvenance(b).some((error) => /Wrong assertion source locator/.test(error)));
  const c = changed(); c.decisions[0].status = 'held'; assert.ok(validatePilotProvenance(c).some((error) => /Held decision blocks/.test(error)));
  const d = changed(); d.dependencies.pop(); assert.ok(validatePilotProvenance(d).some((error) => /Incomplete pilot dependency/.test(error)));
  const e = changed(); e.revisions[0].snapshot.statement = 'Changed without review'; assert.ok(validatePilotProvenance(e).some((error) => /Changed snapshot/.test(error)));
  const f = changed(); f.assertionBindings[0].assertionSnapshot.scope = 'Unsupported'; assert.ok(validatePilotProvenance(f).some((error) => /Changed snapshot/.test(error)));
});

test('AI review, access limits and captions cannot become scientific assurance', () => {
  assert.ok(pilotProvenance.decisions.every((item) => item.independentHumanReview === 'pending' && item.recordType === 'historical-review-transcription'));
  const invalid = changed(); invalid.locators[0].basis = 'caption-attribution';
  assert.ok(validatePilotProvenance(invalid).some((error) => /Caption attribution is not scientific adjudication/.test(error)));
  assert.equal(pilotProvenanceSchema.safeParse({ ...pilotProvenance, humanScientificReview: 'complete' }).success, false);
  const check = changed(); check.reports[0].sourceCheckStatus = 'bounded-recorded-check'; assert.ok(validatePilotProvenance(check).some((error) => /No typed source-check event/.test(error)));
});

test('three provenance classes preserve legacy roles and reviewed assertions', () => {
  const legacyClaim = content.claims.find((item) => item.id === 'CL-fmt')!;
  const legacy = claimRelationships(legacyClaim)[0];
  assert.equal(relationshipProvenance(legacy.assertions), 'legacy');
  const ordinary = evidenceAssertions.edges.find((item) => item.claimId !== 'CL-flexibility')!;
  assert.equal(relationshipProvenance([ordinary]), 'reviewed');
  const pilot = evidenceAssertions.edges.filter((item) => item.claimId === 'CL-flexibility');
  assert.equal(relationshipProvenance(pilot), 'version-linked');
  const changedAssertion = { ...pilot[0], scope: 'Changed without a provenance decision' };
  assert.equal(relationshipProvenance([changedAssertion]), 'reviewed');
  const html = renderToStaticMarkup(createElement(SourceAssertions, { relationship: legacy, claim: legacyClaim }));
  assert.match(html, /Missing structured provenance does not disprove/); assert.match(html, /data-relationship-provenance="legacy"/);
});

test('trace UI is opt-in, public-safe and explicit about review limits', () => {
  const html = renderToStaticMarkup(createElement(ProvenanceDisclosure, { subjectId: 'LP-perspective-fit' }));
  assert.match(html, /<summary>Trace this conclusion<\/summary>/);
  assert.doesNotMatch(html, /<details[^>]*\sopen[\s=>]/);
  assert.match(html, /independent human scientific review is pending/);
  assert.match(html, /Precise span unknown/);
  assert.match(html, /Earlier revision snapshots are unavailable/);
  assert.doesNotMatch(html, /\/workspace\/|source-cache|docs\.google\.com|drive\.google\.com/);
  assert.equal(renderToStaticMarkup(createElement(ProvenanceDisclosure, { subjectId: 'CL-fmt' })), '');
  const invalid = changed(); invalid.scope = 'private-reference /workspace/source-cache';
  assert.ok(validatePilotProvenance(invalid).includes('Private material in pilot provenance'));
});

test('full formative definitions are additive and never transform saved self-ratings', () => {
  assert.deepEqual(formativeRubricDefinitions.map((item) => item.level), [0,1,2,3,4]);
  assert.match(formativeRubricDefinitions[4].meaning, /repeat, adapt, teach and acknowledge failure under independent scrutiny/);
  const draft = makeDraft('learning', 'Discernment');
  draft.fields = { ...draft.fields, discipline: 'discernment', rubric: '4' };
  const before = JSON.stringify(draft);
  assert.equal(deriveLearningProfile([draft]).find((item) => item.discipline === 'discernment')?.rating, 4);
  assert.equal(JSON.stringify(draft), before);
  const component = readFileSync('features/learning-paths/LearningProfile.tsx', 'utf8');
  assert.match(component, /Your stored scores are unchanged/);
  assert.match(component, /What the 0–4 self-rating means/);
  assert.match(readFileSync('features/learning-paths/LearningPath.module.css', 'utf8'), /\.rubric dl \{ display:block; \}/);
});


test('binding-only caption locator fails even when scientific decision locators remain intact (F1)', () => {
  const data = changed();
  data.locators.push({ ...data.locators[0], id: 'loc-caption-only', basis: 'caption-attribution' });
  data.assertionBindings[0].locatorIds = ['loc-caption-only'];
  assert.ok(validatePilotProvenance(data).some((error) => /Scientific assertion binding requires scientific-source/.test(error)));
  assert.ok(validatePilotProvenance(data).some((error) => /lacks recorded scientific decision/.test(error)));
  const assertion = evidenceAssertions.edges.find((item) => item.claimId === data.assertionBindings[0].assertionKey.claimId && item.sourceId === data.assertionBindings[0].assertionKey.sourceId)!;
  assert.equal(relationshipProvenance([assertion], data), 'reviewed');
});

test('lineage-only caption locator fails independently of scientific review decision locators (F1)', () => {
  const data = changed();
  data.locators.push({ ...data.locators[0], id: 'loc-caption-lineage', basis: 'caption-attribution' });
  data.lineage[0].locatorIds = ['loc-caption-lineage'];
  assert.ok(validatePilotProvenance(data).some((error) => /Scientific lineage requires scientific-source/.test(error)));
});

test('binding-only scientific locator needs a recorded scientific decision relationship', () => {
  const data = changed();
  data.locators.push({ ...data.locators[0], id: 'loc-unreviewed-scientific' });
  data.assertionBindings[0].locatorIds = ['loc-unreviewed-scientific'];
  assert.ok(validatePilotProvenance(data).some((error) => /lacks recorded scientific decision/.test(error)));
});

test('report and locator mapping edits invalidate reviewed metadata and dependent lessons (F3)', () => {
  for (const edit of [
    (data: typeof pilotProvenance) => { data.reports[0].url = 'https://example.com/not-the-source'; },
    (data: typeof pilotProvenance) => { data.locators[0].url = 'https://example.com/not-the-source'; },
    (data: typeof pilotProvenance) => { data.locators[0].locatorText = 'A different page'; },
    (data: typeof pilotProvenance) => { data.locators[0].precision = 'recorded-point'; },
    (data: typeof pilotProvenance) => { data.locators[0].reportVersionId = data.reports[1].id; },
    (data: typeof pilotProvenance) => { data.locators[0].basis = 'caption-attribution'; },
  ]) {
    const data = changed(); edit(data);
    const failures = provenanceHashInputs(data).filter((item) => digest(item.snapshot) !== item.hash);
    assert.ok(failures.some((item) => item.id === data.mappingVersion.id));
    assert.equal(failures.filter((item) => item.id.endsWith('-scientific-mapping')).length, 7);
  }
  const data = changed(); data.locators[0].url = 'https://example.com/not-the-source';
  data.mappingVersion.metadataHash = digest(scientificMappingMetadata(data));
  assert.ok(validatePilotProvenance(data).some((error) => /Changed scientific mapping dependency/.test(error)));
  assert.equal(provenanceHashInputs(data).filter((item) => item.id.endsWith('-scientific-mapping') && digest(item.snapshot) !== item.hash).length, 7);
});

test('URL hygiene rejects local hosts and IP literals without claiming DNS validation (F2)', () => {
  for (const url of ['https://192.168.1.1/private','https://10.0.0.1/','https://169.254.169.254/','https://127.1/','https://2130706433/','https://[::1]/','https://[fd00::1]/','https://[fe80::1]/','https://0.0.0.0/','https://localhost/','https://printer.local/','https://research.internal/','https://singlehost/','https://user:secret@example.org/']) {
    assert.equal(isPublicSourceUrl(url), false, url);
    const data = changed(); data.locators[0].url = url;
    assert.equal(pilotProvenanceSchema.safeParse(data).success, false, url);
  }
  for (const item of [...pilotProvenance.reports,...pilotProvenance.locators]) assert.equal(isPublicSourceUrl(item.url), true, item.url);
});

test('notices and reviews do not by themselves qualify as primary study records (F4)', () => {
  for (const reportVersionIds of [['report-R16-correction'], ['report-R32-methodological-comment','report-R32-author-reply'], ['report-R32']]) {
    const data = changed(); data.studies.push({ id: 'study-extra-notice', reportVersionIds, design: 'A notice is not a primary study', projectId: null });
    assert.ok(validatePilotProvenance(data).some((error) => /Study requires a primary report/.test(error)));
  }
});
