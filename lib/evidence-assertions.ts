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
export function reviewedEvidenceEdge(claimId: string, sourceId: string) {
  return evidenceAssertions.edges.find((edge) => edge.claimId === claimId && edge.sourceId === sourceId);
}
/** Resolve approved canonical field references without changing the saved assertion. */
export function evidenceTargetDescription(target: string, claim: Claim) {
  if (target === `${claim.id}.statement`) return claim.statement;
  const field = target.match(/^(.+)\.notImplied\[(\d+)\]$/);
  if (field?.[1] === claim.id) return claim.notImplied[Number(field[2])] ?? target;
  return target;
}
export function validateEvidenceAssertions(data: { claims: Claim[]; sources: Source[] }, assertions = evidenceAssertions) {
  const errors: string[] = [];
  const pairs = new Set<string>();
  for (const edge of assertions.edges) {
    const key = `${edge.claimId}:${edge.sourceId}`;
    if (pairs.has(key)) errors.push(`Duplicate evidence assertion ${key}`);
    pairs.add(key);
    const claim = data.claims.find((item) => item.id === edge.claimId);
    if (!claim) errors.push(`Missing assertion claim ${edge.claimId}`);
    else if (![...claim.sourceIds,...claim.challengeSourceIds].includes(edge.sourceId)) errors.push(`Unlinked assertion source ${key}`);
    if (claim && /^CL-.*\.(?:statement|notImplied)/.test(edge.target) && evidenceTargetDescription(edge.target, claim) === edge.target) errors.push(`Unresolved assertion target ${key}`);
    if (!data.sources.some((source) => source.id === edge.sourceId)) errors.push(`Missing assertion source ${edge.sourceId}`);
  }
  if (/HM-[SCA]\d|\/workspace\/|docs\.google\.com|source-cache|private-reference/i.test(JSON.stringify(assertions))) errors.push('Draft or private context in public assertions');
  return errors;
}
