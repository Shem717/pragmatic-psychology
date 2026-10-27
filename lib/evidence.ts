import type { Claim, Source } from "./content";
import { isRetiredClaim } from "./claim-status";
import { reviewedEvidenceEdge } from "./evidence-assertions";

export const sourceTypes = ["Study", "Research synthesis", "Theory & commentary", "Guidance", "Methods & reporting"] as const;
export type SourceType = (typeof sourceTypes)[number];
// Catalogue classifications describe the saved public record, not a new paper appraisal.
const sourceTypeIds: Record<SourceType, readonly string[]> = {
  Study: ["R03", "R04", "R08", "R09", "R11", "R13", "R16", "R17", "R19", "R20", "R21", "R22", "R23", "R24", "R25", "R29", "R33", "R35", "R37", "R39", "R40", "R41", "R42"],
  "Research synthesis": ["R10", "R18", "R26", "R27", "R28", "R32"],
  "Theory & commentary": ["R01", "R02", "R06", "R12", "R14", "R15", "R34", "R36"],
  Guidance: ["R05", "R07", "R30", "R31"],
  "Methods & reporting": ["R38"],
};
export function sourceType(source: Source): SourceType | "Unclassified" {
  return sourceTypes.find((type) => sourceTypeIds[type].includes(source.id)) ?? "Unclassified";
}
export const relationshipLabels = {
  supports: "Supporting evidence", qualifies: "Qualifying evidence",
  conflicts: "Conflicting finding", context: "Context & transfer limits",
} as const;
export type Relationship = keyof typeof relationshipLabels;
type RelationshipNote = { role: Relationship; note: string; target?: string; studyLineage?: string };
const relationshipNotes: Record<string, Record<string, RelationshipNote>> = {
  "CL-threat": { R14: { role: "context", note: "Foundational self-efficacy theory; not an individual anxiety calculator." } },
  "CL-reconsolidation": {
    R03: { role: "supports", note: "Animal pharmacology establishes a restricted experimental basis, not self-guided treatment efficacy." },
    R04: { role: "supports", note: "Human proof of concept; read with its 2018 addendum and the R11 replication." },
    R19: { role: "qualifies", note: "Prediction error matters within a particular pharmacological paradigm." },
    R20: { role: "qualifies", note: "Retrieval conditions constrain interpretation; mismatch is not a universal dose rule." },
    R11: { role: "conflicts", note: "No reactivation benefit in a registered replication of a specific human protocol. This does not refute all reconsolidation research." },
  },
  "CL-imagery": { R21: { role: "qualifies", note: "Reality-judgment tasks do not establish memory rewriting, treatment efficacy or real-world skill." } },
  "CL-confidence": { R14: { role: "context", note: "A theoretical foundation; perceived capability is not an objective skill measurement." } },
  "CL-flexibility": {
    R15: { role: "context", note: "Conceptual support for a repertoire; the custom Rolodex has not been validated." },
    R16: { role: "qualifies", note: "Associations depend on controllability of stress; this is not randomized treatment evidence." },
  },
  "CL-fmt": {
    R25: { role: "supports", note: "Different endpoints gave different results: symptom-score benefits did not establish a week-8 remission difference." },
    R26: { role: "qualifies", note: "Mixed trial and cohort designs; standardized effects are not percentages." },
    R27: { role: "conflicts", note: "A null pooled result contrasts with favorable efficacy interpretations. It does not contradict the claim’s caution about endpoints." },
    R28: { role: "qualifies", note: "Full-text reconciliation, populations and overlapping trials remain unresolved." },
    R30: { role: "context", note: "Regulatory context does not establish psychiatric approval." },
  },
  "CL-medication": { R31: { role: "context", note: "Condition- and medication-specific guidance, not a single efficacy finding." } },
};
export function claimRelationships(claim: Claim): Array<RelationshipNote & { sourceId: string }> {
  return Array.from(new Set([...claim.sourceIds, ...claim.challengeSourceIds])).map((sourceId) => {
    const reviewed = reviewedEvidenceEdge(claim.id, sourceId);
    if (reviewed) return { sourceId, role: reviewed.relation, note: reviewed.scope, target: reviewed.target, studyLineage: reviewed.studyLineage };
    // Preserve the legacy reading aids for edges not explicitly appraised in this slice.
    return { sourceId, ...(relationshipNotes[claim.id]?.[sourceId] ?? {
      role: claim.challengeSourceIds.includes(sourceId) ? "qualifies" as const : "supports" as const,
      note: "Read this source within the claim’s stated population, design and limitations.",
    }) };
  });
}
export function sourceClaims(id: string, claims: Claim[]) {
  return claims.filter((c) => !isRetiredClaim(c)).flatMap((claim) => {
    const relationship = claimRelationships(claim).find((r) => r.sourceId === id);
    return relationship ? [{ claim, ...relationship }] : [];
  });
}
export type CheckState = "reviewed" | "verified" | "unknown" | "not-applicable";
export type SourceCheck = { label: string; state: CheckState; detail: string; date?: string };
export const checkLabels: Record<CheckState, string> = {
  reviewed: "Reviewed", verified: "Verified", unknown: "Unknown", "not-applicable": "Not applicable",
};
export function sourceChecks(source: Source): SourceCheck[] {
  const type = sourceType(source);
  const checks: SourceCheck[] = [{
    label: "Editorial record", state: "reviewed", date: source.checkedAt,
    detail: "Saved record checkpoint. Access scope: " + source.accessDepth,
  }];
  // Specific verifications already recorded in the summaries. Actual check
  // dates are absent; never borrow the generic checkpoint date for them.
  if (source.id === "R05") checks.push({ label: "Main recommendation", state: "verified", detail: "The saved review records verification of the guidance’s main recommendation; no fresh verification is implied." });
  if (source.id === "R10") checks.push({ label: "Abstract study counts", state: "verified", detail: "The saved review records verification of 26 studies and 1,103 participants in the abstract; this is not full-text appraisal." });
  checks.push(type === "Guidance"
    ? { label: "Journal retraction check", state: "not-applicable", detail: "This is a guidance page, not a journal article. Current guidance status is a separate check." }
    : { label: "Retraction check", state: "unknown", detail: "No independent, dated retraction check is recorded. Unknown does not mean clear." });
  if (type === "Guidance") checks.push({ label: "Guidance currency", state: "unknown", detail: "No dated check of the current guidance version is recorded." });
  return checks;
}
export function sampleDescription(source: Source) {
  if (source.sampleSizeNote) return { state: "reviewed" as const, text: source.sampleSizeNote };
  if (source.sampleSize !== null) return { state: "reviewed" as const, text: `${source.sampleSize.toLocaleString("en-US")} · see design and population for scope` };
  const type = sourceType(source);
  if (type === "Guidance" || type === "Theory & commentary" || type === "Methods & reporting") return { state: "not-applicable" as const, text: "Not applicable · no single recruited study sample." };
  return { state: "unknown" as const, text: type === "Research synthesis" ? "Aggregate sample not independently extracted; any source-reported counts remain in the summary." : "Not independently extracted in the saved review." };
}
export function formatEvidenceDate(date: string) {
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(date + "T12:00:00Z"));
}
export const claimMapLabels: Record<string, string> = {
  threat: "Threat & coping", reconsolidation: "Memory updating", imagery: "Imagery & emotion",
  therapy: "Therapy evidence", confidence: "Belief & competence", flexibility: "Context & flexibility",
  identity: "Integrated learning", plasticity: "Neural plasticity", microbiota: "Gut–brain context",
  fmt: "Human FMT outcomes", medication: "Medication roles",
  "habit-timescale": "Habit timelines", "habit-context": "Habits & context",
};
