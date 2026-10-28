import { pilotProvenance } from '@/lib/pilot-provenance';

/** Optional reading aid. The ledger records provenance, not a new appraisal or a certainty score. */
export function ProvenanceDisclosure({ subjectId }: { subjectId: string }) {
  const allPath = subjectId === 'LP-perspective-fit';
  const revisions = pilotProvenance.revisions.filter((item) => allPath || item.entity.id === subjectId);
  if (!revisions.length) return null;
  const decisionIds = new Set(revisions.flatMap((item) => item.decisionIds));
  const decisions = pilotProvenance.decisions.filter((item) => decisionIds.has(item.id));
  const locatorIds = new Set(decisions.flatMap((item) => item.evidenceLocatorIds));
  const locators = pilotProvenance.locators.filter((item) => locatorIds.has(item.id));
  return <details className="dossier-assertion" data-pilot-provenance={subjectId}>
    <summary>Trace this conclusion</summary>
    <p className="research-fine">Recorded AI-assisted reviews; independent human scientific review is pending. These links preserve the basis and limits of the existing educational wording. Adding structure is not new evidence or validation.</p>
    <p className="research-fine">{revisions.map((item) => `${item.entity.id} · version ${item.entity.version}`).join('; ')}. Earlier revision snapshots are unavailable in this ledger; dated history notes are not reconstructed versions.</p>
    <details className="dossier-assertion"><summary>Sources and recorded passage locations</summary>
      <p className="research-fine">{pilotProvenance.locatorMappingNotice}</p>
      <ul>{locators.map((locator) => {
        const report = pilotProvenance.reports.find((item) => item.id === locator.reportVersionId)!;
        return <li key={locator.id}><a href={locator.url} target="_blank" rel="noreferrer">{report.canonicalSourceId} · {report.role.replaceAll('-', ' ')}</a><p>{locator.locatorText}</p><p className="research-fine">{locator.precision === 'not-recorded' ? 'Precise span unknown—not a claim of exact passage verification.' : 'Recorded locator, not a new source read or a character-exact quotation.'} {report.accessDepth}</p></li>;
      })}</ul>
    </details>
    <details className="dossier-assertion"><summary>Decisions, unresolved questions and corrections</summary>
      {decisions.map((decision) => <section className="source-assertion-block" key={decision.id}>
        <h4>{decision.decisionType.replaceAll('-', ' ')} · {decision.status === 'unresolved' ? 'Unresolved within the stated scope' : decision.status === 'held' ? 'Held' : 'Accepted with limits'}</h4>
        <p>{decision.rationale}</p><p className="research-fine">{decision.reviewer.label} · recorded review {decision.decisionDate}. Historical review transcription, not a new scientific decision.</p>
        {decision.resolution && <p className="research-fine">{decision.resolution}</p>}
      </section>)}
    </details>
    <p className="research-fine">{pilotProvenance.lineageCoverageNotice}</p>
    <p className="research-fine">Unknown participant overlap is not independence. A shared project, correction, comment or reply is not an extra independent study. This ledger does not count evidence votes or assign ranks.</p>
  </details>;
}
