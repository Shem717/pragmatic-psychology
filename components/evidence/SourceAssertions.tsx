import type { Claim } from '@/lib/content';
import { evidenceAssertions, evidenceTargetDescription } from '@/lib/evidence-assertions';
import { relationshipLabels, type SourceRelationship } from '@/lib/evidence';

export function SourceAssertions({ relationship, claim }: { relationship: SourceRelationship; claim: Claim }) {
  const assertions = relationship.assertions ?? [];
  if (!assertions.length) return null;
  const multiple = assertions.length > 1;
  return <details className="dossier-assertion">
    <summary>{multiple ? `All ${assertions.length} scoped assertions & study lineage` : 'Exact proposition & study lineage'}</summary>
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
