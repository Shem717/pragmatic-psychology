import { relationshipProvenance, relationshipProvenanceLabels } from '@/lib/pilot-provenance';
import type { Claim } from '@/lib/content';
import { evidenceAssertions, evidenceTargetDescription } from '@/lib/evidence-assertions';
import { relationshipLabels, type SourceRelationship } from '@/lib/evidence';

export function SourceAssertions({ relationship, claim }: { relationship: SourceRelationship; claim: Claim }) {
  const assertions = relationship.assertions ?? [];
  const provenance = relationshipProvenance(assertions);
  if (!assertions.length) return <details className="dossier-assertion" data-relationship-provenance="legacy"><summary>{relationshipProvenanceLabels.legacy}</summary><p className="research-fine">This reading aid predates the scoped assertion ledger. Missing structured provenance does not disprove a claim or its source. Read the source scope and limits; independent human scientific review is not established by this label.</p></details>;
  const multiple = assertions.length > 1;
  return <details className="dossier-assertion" data-relationship-provenance={provenance}>
    <summary>{multiple ? `All ${assertions.length} scoped assertions & study lineage` : 'Exact proposition & study lineage'}</summary>
    <p className="research-fine">{relationshipProvenanceLabels[provenance]}. This describes the record’s traceability, not evidence strength. Independent human scientific review remains pending.</p>
    {assertions.map((assertion) => <div className="source-assertion-block" key={JSON.stringify([assertion.target,assertion.relation])} data-assertion-role={assertion.relation}>
      <dl><div><dt>Role for this proposition</dt><dd>{relationshipLabels[assertion.relation]}</dd></div>
        <div><dt>Proposition addressed</dt><dd>{evidenceTargetDescription(assertion.target, claim)}</dd></div>
        {multiple && <div><dt>Scope of this role</dt><dd>{assertion.scope}</dd></div>}
        <div><dt>Study / report lineage</dt><dd>{assertion.studyLineage}</dd></div></dl>
    </div>)}
    <p className="research-fine">A lineage label tracks a report or protocol; it does not certify independent replication. Source records are not counts of independent studies.</p>
    <p className="research-fine">{evidenceAssertions.review.reviewer}. Scoped review: {evidenceAssertions.review.date}. {evidenceAssertions.review.scope}</p>
  </details>;
}
