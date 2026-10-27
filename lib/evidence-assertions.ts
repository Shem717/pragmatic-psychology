import { z } from 'zod';
import raw from '@/content/evidence-assertions.json';
import type { Claim, Source } from './content';
const text = z.string().trim().min(1).max(2000);
export const evidenceAssertionsSchema = z.object({
  version: text,
  review: z.object({ date: z.iso.date(), scope: text, reviewer: text }),
  edges: z.array(z.object({
    claimId: text, sourceId: text,
    relation: z.enum(['supports','qualifies','conflicts','context']),
    target: text, scope: text, studyLineage: text,
  })),
});
export const evidenceAssertions = evidenceAssertionsSchema.parse(raw);
export type EvidenceAssertion = z.infer<typeof evidenceAssertionsSchema>["edges"][number];
export function reviewedEvidenceEdges(claimId: string, sourceId: string) {
  return evidenceAssertions.edges.filter((edge) => edge.claimId === claimId && edge.sourceId === sourceId);
}
/** Canonical targets must address a supported field on this exact claim. */
function resolveCanonicalTarget(target: string, claim: Claim): string | undefined {
  const match = target.match(/^(CL-[a-z0-9-]+)\.(statement|(?:notImplied|limitations)\[(?:0|[1-9]\d*)\])$/);
  if (!match || match[1] !== claim.id) return undefined;
  if (match[2] === 'statement') return claim.statement;
  const field = match[2].match(/^(notImplied|limitations)\[(\d+)\]$/)!;
  return claim[field[1] as 'notImplied' | 'limitations'][Number(field[2])];
}
/** Resolve approved field references without changing the saved assertion. */
export function evidenceTargetDescription(target: string, claim: Claim) {
  return resolveCanonicalTarget(target, claim) ?? target;
}
export function validateEvidenceAssertions(data: { claims: Claim[]; sources: Source[] }, assertions = evidenceAssertions) {
  const errors: string[] = [];
  const assertionsSeen = new Set<string>();
  for (const edge of assertions.edges) {
    const key = JSON.stringify([edge.claimId, edge.sourceId, edge.target, edge.relation]);
    if (assertionsSeen.has(key)) errors.push(`Duplicate evidence assertion ${key}`);
    assertionsSeen.add(key);
    const claim = data.claims.find((item) => item.id === edge.claimId);
    if (!claim) errors.push(`Missing assertion claim ${edge.claimId}`);
    else if (![...claim.sourceIds,...claim.challengeSourceIds].includes(edge.sourceId)) errors.push(`Unlinked assertion source ${key}`);
    if (claim && /^CL(?:[-_.]|\b)/.test(edge.target) && resolveCanonicalTarget(edge.target, claim) === undefined) errors.push(`Unresolved assertion target ${key}`);
    if (!data.sources.some((source) => source.id === edge.sourceId)) errors.push(`Missing assertion source ${edge.sourceId}`);
  }
  if (/(?:HM|BL|LT|ER|AG)-[SCA]\d|\/workspace\/|docs\.google\.com|source-cache|private-reference/i.test(JSON.stringify(assertions))) errors.push('Draft or private context in public assertions');
  return errors;
}
