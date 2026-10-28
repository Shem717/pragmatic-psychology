import { z } from 'zod';
import raw from '@/content/pilot-provenance.json';
import { content } from './content';
import { learningPathCatalog } from './learning-paths';
import { evidenceAssertions, type EvidenceAssertion } from './evidence-assertions';

const text = z.string().trim().min(1).max(10000);
const id = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9.-]*$/);
const ids = z.array(id).refine((values) => new Set(values).size === values.length, 'Duplicate reference');
const hash = z.string().regex(/^[a-f0-9]{64}$/);
/** Syntax/local-destination screening only: no DNS or public-routability assurance. */
export function isPublicSourceUrl(value: string) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase().replace(/\.$/, '');
    return url.protocol === 'https:' && !url.username && !url.password
      && host.includes('.') && !host.startsWith('[') && !/^\d+(?:\.\d+){3}$/.test(host)
      && !/(?:^|\.)(?:localhost|local|internal|lan|home|test|invalid)$/.test(host);
  } catch { return false; }
}
const publicUrl = z.url().refine(isPublicSourceUrl, 'HTTPS scholarly URL without credentials, IP literal or local hostname required');
const assertionKey = z.object({ claimId: id, sourceId: id, target: text, relation: z.enum(['supports','qualifies','conflicts','context']) }).strict();
const record = z.record(z.string(), z.unknown());
export const pilotProvenanceSchema = z.object({
  schemaVersion: z.literal('1.0'), scope: text, provenanceRecordedAt: z.iso.date(), historicalSnapshotNotice: text,
  humanScientificReview: z.literal('pending'), locatorMappingNotice: text, lineageCoverageNotice: text,
  mappingVersion: z.object({ id, recordedAt: z.iso.date(), metadataHash: hash, notice: text }).strict(),
  reports: z.array(z.object({
    id, canonicalSourceId: id, role: z.enum(['primary-report','review','framework','correction','methodological-comment','author-reply']),
    url: publicUrl, versionLabel: text, versionIdentity: z.enum(['identified-edition','retrieved-version-unspecified']),
    accessDepth: text, recordedReviewDate: z.iso.date(), sourceCheckStatus: z.enum(['not-assessed','bounded-recorded-check']),
    snapshot: record.nullable(), snapshotHash: hash.nullable(),
  }).strict()),
  locators: z.array(z.object({
    id, reportVersionId: id, kind: z.enum(['printed-pages','pdf-pages','section','table','footnote','abstract','timestamp','unknown']),
    locatorText: text, precision: z.enum(['recorded-range','recorded-section','recorded-point','not-recorded']), url: publicUrl,
    basis: z.enum(['scientific-source','caption-attribution']),
  }).strict()),
  studies: z.array(z.object({ id, reportVersionIds: ids, design: text, projectId: id.nullable() }).strict()),
  samples: z.array(z.object({ id, studyId: id, role: z.enum(['primary-participants','separate-raters']), description: text, count: z.number().int().positive().nullable(), countBasis: text }).strict()),
  lineage: z.array(z.object({
    id, fromId: id, toId: id, relation: z.enum(['shared-project','same-study-report','correction-of','comment-on','reply-to']),
    participantOverlap: z.enum(['unknown','documented-shared','not-applicable']), independence: z.enum(['not-established','not-applicable']),
    locatorIds: ids.min(1), rationale: text,
  }).strict()),
  revisions: z.array(z.object({
    id, entity: z.object({ kind: z.enum(['claim','passport']), id, version: text }).strict(), snapshot: record, snapshotHash: hash,
    predecessorRevisionId: id.nullable(), predecessorStatus: z.enum(['recorded','historical-snapshot-unavailable']),
    provenanceRecordedAt: z.iso.date(), historicalReviewDate: z.iso.date(), decisionIds: ids.min(1),
  }).strict()),
  decisions: z.array(z.object({
    id, recordType: z.literal('historical-review-transcription'), subjectRevisionIds: ids.min(1),
    decisionType: z.enum(['editorial-disposition','scientific-objection','correction-handling','lineage-limitation']),
    reviewer: z.object({ label: text, kind: z.enum(['ai-assisted','independent-ai']) }).strict(),
    decisionDate: z.iso.date(), status: z.enum(['accepted-with-limits','unresolved','held']), rationale: text,
    objections: z.array(text), resolution: text.nullable(), blockingScope: z.array(text), evidenceLocatorIds: ids,
    independentHumanReview: z.literal('pending'),
  }).strict()),
  dependencies: z.array(z.object({
    id, consumer: z.object({ pathId: z.literal('LP-perspective-fit'), pathVersion: text, passportId: id.nullable(), passportVersion: text.nullable() }).strict(),
    mappingVersionId: id, mappingHash: hash, consumerSnapshotHash: hash, dependsOnRevisionIds: ids.min(1), reportVersionIds: ids, decisionIds: ids.min(1), state: z.enum(['current-recorded-basis','review-required']),
  }).strict()),
  assertionBindings: z.array(z.object({
    id, assertionKey, assertionSnapshot: record, assertionSnapshotHash: hash, revisionId: id, decisionIds: ids.min(1), locatorIds: ids.min(1),
  }).strict()),
}).strict();
export type PilotProvenance = z.infer<typeof pilotProvenanceSchema>;
export const pilotProvenance = pilotProvenanceSchema.parse(raw);

/** Canonical JSON for reproducible snapshot hashes. No browser storage or network operations. */
export function canonicalSnapshot(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalSnapshot).join(',')}]`;
  if (value !== null && typeof value === 'object') return `{${Object.entries(value).sort(([a],[b]) => a < b ? -1 : a > b ? 1 : 0).map(([key,item]) => `${JSON.stringify(key)}:${canonicalSnapshot(item)}`).join(',')}}`;
  return JSON.stringify(value);
}
export function sameAssertion(a: { claimId: string; sourceId: string; target: string; relation: string }, b: typeof a) {
  return a.claimId === b.claimId && a.sourceId === b.sourceId && a.target === b.target && a.relation === b.relation;
}
export type ProvenanceInputs = { content: typeof content; paths: typeof learningPathCatalog; assertions: typeof evidenceAssertions };
const currentInputs = { content, paths: learningPathCatalog, assertions: evidenceAssertions };
export function validatePilotProvenance(input: unknown = pilotProvenance, current: ProvenanceInputs = currentInputs): string[] {
  const parsed = pilotProvenanceSchema.safeParse(input);
  if (!parsed.success) return parsed.error.issues.map((issue) => `Pilot provenance ${issue.path.join('.')}: ${issue.message}`);
  const data = parsed.data;
  const errors: string[] = [];
  const collections = [data.reports,data.locators,data.studies,data.samples,data.lineage,data.revisions,data.decisions,data.dependencies,data.assertionBindings];
  const allIds = collections.flatMap((items) => items.map((item) => item.id));
  if (new Set(allIds).size !== allIds.length) errors.push('Duplicate provenance ID');
  const ref = (target: string, items: {id: string}[], label: string) => { if (!items.some((item) => item.id === target)) errors.push(`Missing ${label} ${target}`); };
  const equal = (a: unknown, b: unknown, label: string) => { if (canonicalSnapshot(a ?? null) !== canonicalSnapshot(b ?? null)) errors.push(`Changed snapshot; review required: ${label}`); };
  const path = current.paths.paths.find((item) => item.id === 'LP-perspective-fit');
  if (!path) errors.push('Missing pilot learning path');
  const permittedSources = new Set([...(path?.passports.flatMap((item) => [...item.sourceIds,...item.qualificationSourceIds]) ?? []), ...(current.content.claims.find((item) => item.id === 'CL-flexibility')?.sourceIds ?? [])]);
  for (const report of data.reports) {
    if (!permittedSources.has(report.canonicalSourceId)) errors.push(`Source outside bounded pilot ${report.canonicalSourceId}`);
    const source = current.content.sources.find((item) => item.id === report.canonicalSourceId);
    if (!source) errors.push(`Missing canonical source ${report.canonicalSourceId}`);
    if ((report.snapshot === null) !== (report.snapshotHash === null)) errors.push(`Incomplete report snapshot ${report.id}`);
    if (report.snapshot) {
      equal(report.snapshot, source, report.id);
      if (source && report.url !== source.url) errors.push(`Changed canonical report URL ${report.id}`);
    }
    else if (!['correction','methodological-comment','author-reply'].includes(report.role)) errors.push(`Missing source snapshot ${report.id}`);
    if (report.sourceCheckStatus !== 'not-assessed') errors.push(`No typed source-check event supports assurance ${report.id}`);
    if (source && ['correction','methodological-comment','author-reply'].includes(report.role)) {
      const urls = [source.correctionUrl, ...(source.relatedPublications?.map((item) => item.url) ?? [])];
      if (!urls.includes(report.url)) errors.push(`Unlinked notice ${report.id}`);
    }
  }
  for (const locator of data.locators) {
    ref(locator.reportVersionId, data.reports, 'locator report');
    if ((locator.kind === 'unknown') !== (locator.precision === 'not-recorded')) errors.push(`Unknown locator precision mismatch ${locator.id}`);
  }
  for (const study of data.studies) {
    for (const reportId of study.reportVersionIds) ref(reportId, data.reports, 'study report');
    if (!study.reportVersionIds.some((reportId) => data.reports.find((report) => report.id === reportId)?.role === 'primary-report')) errors.push(`Study requires a primary report, not notices or reviews: ${study.id}`);
  }
  for (const sample of data.samples) ref(sample.studyId, data.studies, 'sample study');
  for (const link of data.lineage) {
    const entities = [...data.reports,...data.studies];
    ref(link.fromId, entities, 'lineage endpoint'); ref(link.toId, entities, 'lineage endpoint');
    for (const locatorId of link.locatorIds) {
      ref(locatorId, data.locators, 'lineage locator');
      if (data.locators.find((locator) => locator.id === locatorId)?.basis !== 'scientific-source') errors.push(`Scientific lineage requires scientific-source locator ${link.id}`);
    }
    if (link.fromId === link.toId) errors.push(`Self-referential lineage ${link.id}`);
    if (link.relation === 'shared-project' && (link.participantOverlap !== 'unknown' || link.independence !== 'not-established')) errors.push(`Unsupported participant overlap assurance ${link.id}`);
    if (['correction-of','comment-on','reply-to'].includes(link.relation) && (link.participantOverlap !== 'not-applicable' || link.independence !== 'not-applicable')) errors.push(`A notice is not an independent cohort ${link.id}`);
  }
  for (const revision of data.revisions) {
    const item = revision.entity.kind === 'claim' ? current.content.claims.find((claim) => claim.id === revision.entity.id) : path?.passports.find((passport) => passport.id === revision.entity.id);
    equal(revision.snapshot, item, revision.id);
    if (revision.entity.kind === 'claim' && (revision.entity.id !== 'CL-flexibility' || revision.entity.version !== current.content.claims.find((claim) => claim.id === revision.entity.id)?.contentVersion)) errors.push(`Unsupported claim revision ${revision.id}`);
    if (revision.entity.kind === 'passport' && revision.entity.version !== path?.version) errors.push(`Passport version mismatch ${revision.id}`);
    if (revision.predecessorRevisionId) ref(revision.predecessorRevisionId, data.revisions, 'predecessor');
    if ((revision.predecessorRevisionId === null) !== (revision.predecessorStatus === 'historical-snapshot-unavailable')) errors.push(`Unknown predecessor mismatch ${revision.id}`);
    // This first ledger captures no historical predecessor snapshots.
    if (revision.predecessorRevisionId !== null) errors.push(`Unreviewed historical snapshot ${revision.id}`);
    for (const decisionId of revision.decisionIds) {
      ref(decisionId, data.decisions, 'revision decision');
      if (!data.decisions.find((decision) => decision.id === decisionId)?.subjectRevisionIds.includes(revision.id)) errors.push(`Decision does not address revision ${decisionId}`);
    }
  }
  const expectedSubjects = ['CL-flexibility', ...(path?.passports.map((item) => item.id) ?? [])];
  if (data.revisions.length !== expectedSubjects.length || expectedSubjects.some((id) => data.revisions.filter((revision) => revision.entity.id === id).length !== 1)) errors.push('Incomplete pilot revision coverage');
  for (const decision of data.decisions) {
    for (const revisionId of decision.subjectRevisionIds) {
      ref(revisionId, data.revisions, 'decision subject');
      if (!data.revisions.find((revision) => revision.id === revisionId)?.decisionIds.includes(decision.id)) errors.push(`Missing reciprocal revision decision ${decision.id}`);
    }
    for (const locatorId of decision.evidenceLocatorIds) {
      ref(locatorId, data.locators, 'decision locator');
      if (data.locators.find((locator) => locator.id === locatorId)?.basis === 'caption-attribution') errors.push(`Caption attribution is not scientific adjudication ${decision.id}`);
    }
    if (decision.status === 'unresolved' && decision.resolution !== null) errors.push(`Unresolved objection has a resolution ${decision.id}`);
  }
  for (const dependency of data.dependencies) {
    if (dependency.mappingVersionId !== data.mappingVersion.id || dependency.mappingHash !== data.mappingVersion.metadataHash) errors.push(`Changed scientific mapping dependency; review required: ${dependency.id}`);
    if (dependency.state !== 'current-recorded-basis') errors.push(`Learning dependency requires review ${dependency.id}`);
    if (!path || dependency.consumer.pathVersion !== path.version) errors.push(`Changed learning version ${dependency.id}`);
    if ((dependency.consumer.passportId === null) !== (dependency.consumer.passportVersion === null)) errors.push(`Incomplete passport dependency ${dependency.id}`);
    for (const revisionId of dependency.dependsOnRevisionIds) {
      ref(revisionId, data.revisions, 'learning revision');
      const revision = data.revisions.find((item) => item.id === revisionId);
      if (dependency.consumer.passportId && (revision?.entity.id !== dependency.consumer.passportId || revision.entity.version !== dependency.consumer.passportVersion)) errors.push(`Wrong passport dependency ${dependency.id}`);
      for (const decisionId of revision?.decisionIds ?? []) if (!dependency.decisionIds.includes(decisionId)) errors.push(`Missing dependent decision ${dependency.id}`);
    }
    for (const reportId of dependency.reportVersionIds) ref(reportId, data.reports, 'learning report');
    for (const decisionId of dependency.decisionIds) {
      ref(decisionId, data.decisions, 'learning decision');
      const decision = data.decisions.find((item) => item.id === decisionId);
      if (decision?.status === 'held') errors.push(`Held decision blocks learning dependency ${dependency.id}`);
      for (const locatorId of decision?.evidenceLocatorIds ?? []) {
        const locator = data.locators.find((item) => item.id === locatorId);
        if (locator && !dependency.reportVersionIds.includes(locator.reportVersionId)) errors.push(`Missing dependent report ${dependency.id}`);
      }
    }
  }
  if (data.dependencies.length !== expectedSubjects.length || data.revisions.some((revision) => !data.dependencies.some((dependency) => dependency.dependsOnRevisionIds.includes(revision.id)))) errors.push('Incomplete pilot dependency coverage');
  for (const binding of data.assertionBindings) {
    const assertion = current.assertions.edges.find((edge) => sameAssertion(edge, binding.assertionKey));
    equal(binding.assertionSnapshot, assertion, binding.id);
    ref(binding.revisionId, data.revisions, 'assertion revision');
    if (binding.assertionKey.claimId !== 'CL-flexibility' || data.revisions.find((revision) => revision.id === binding.revisionId)?.entity.id !== binding.assertionKey.claimId) errors.push(`Wrong assertion revision ${binding.id}`);
    for (const decisionId of binding.decisionIds) {
      ref(decisionId, data.decisions, 'assertion decision');
      if (!data.decisions.find((decision) => decision.id === decisionId)?.subjectRevisionIds.includes(binding.revisionId)) errors.push(`Wrong assertion decision ${binding.id}`);
    }
    for (const locatorId of binding.locatorIds) {
      ref(locatorId, data.locators, 'assertion locator');
      const locator = data.locators.find((item) => item.id === locatorId);
      const report = data.reports.find((item) => item.id === locator?.reportVersionId);
      if (report && report.canonicalSourceId !== binding.assertionKey.sourceId) errors.push(`Wrong assertion source locator ${binding.id}`);
      if (locator?.basis !== 'scientific-source') errors.push(`Scientific assertion binding requires scientific-source locator ${binding.id}`);
      if (!binding.decisionIds.some((decisionId) => data.decisions.find((decision) => decision.id === decisionId)?.evidenceLocatorIds.includes(locatorId))) errors.push(`Assertion locator lacks recorded scientific decision relationship ${binding.id}`);
    }
  }
  const bindings = data.assertionBindings.map((binding) => canonicalSnapshot(binding.assertionKey));
  if (new Set(bindings).size !== bindings.length) errors.push('Duplicate assertion provenance binding');
  const serialized = JSON.stringify(data);
  if (/\/workspace\/|source-cache|private-reference|READABLE-THREAD|docs\.google\.com|drive\.google\.com|supplement_local_path|caption_text|raw_transcript/i.test(serialized)) errors.push('Private material in pilot provenance');
  return errors;
}
/** Hash the entire reviewed mapping, not only canonical source payloads. Metadata, never paper bytes. */
export function scientificMappingMetadata(data = pilotProvenance) {
  return { reports: data.reports, locators: data.locators, studies: data.studies, samples: data.samples,
    lineage: data.lineage, decisions: data.decisions, assertionBindings: data.assertionBindings };
}
export function provenanceHashInputs(data = pilotProvenance, paths = learningPathCatalog) {
  const path = paths.paths.find((item) => item.id === 'LP-perspective-fit');
  const mapping = scientificMappingMetadata(data);
  return [
    { id: data.mappingVersion.id, snapshot: mapping, hash: data.mappingVersion.metadataHash },
    ...data.dependencies.map((item) => ({ id: `${item.id}-scientific-mapping`, snapshot: mapping, hash: item.mappingHash })),
    ...data.reports.filter((item) => item.snapshot !== null).map((item) => ({ id: item.id, snapshot: item.snapshot, hash: item.snapshotHash! })),
    ...data.revisions.map((item) => ({ id: item.id, snapshot: item.snapshot, hash: item.snapshotHash })),
    ...data.assertionBindings.map((item) => ({ id: item.id, snapshot: item.assertionSnapshot, hash: item.assertionSnapshotHash })),
    ...data.dependencies.map((item) => ({ id: item.id, snapshot: item.consumer.passportId ? path?.passports.find((passport) => passport.id === item.consumer.passportId) : path, hash: item.consumerSnapshotHash })),
  ];
}
export const relationshipProvenanceLabels = {
  legacy: 'Legacy relationship summary',
  reviewed: 'Reviewed scoped assertion',
  'version-linked': 'Reviewed scoped assertion · version-linked provenance',
} as const;
export function relationshipProvenance(assertions: EvidenceAssertion[] = [], data = pilotProvenance): keyof typeof relationshipProvenanceLabels {
  if (!assertions.length) return 'legacy';
  return assertions.every((assertion) => data.assertionBindings.some((binding) => sameAssertion(binding.assertionKey, assertion) && canonicalSnapshot(binding.assertionSnapshot) === canonicalSnapshot(assertion)
    && binding.locatorIds.every((locatorId) => data.locators.find((locator) => locator.id === locatorId)?.basis === 'scientific-source'
      && binding.decisionIds.some((decisionId) => data.decisions.find((decision) => decision.id === decisionId)?.evidenceLocatorIds.includes(locatorId))))) ? 'version-linked' : 'reviewed';
}
