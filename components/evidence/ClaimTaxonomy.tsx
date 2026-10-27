import Link from 'next/link';
import type { Claim } from '@/lib/content';
import { claimFacet, dispositionLabels, domainRelationLabels, evidenceTaxonomy, type EvidenceCatalog } from '@/lib/evidence-taxonomy';
import styles from '@/features/evidence/EvidenceAtlas.module.css';

export function ClaimTaxonomy({ claim, disciplines, compact = false, domainId = 'all', onChooseDomain }: { claim: Claim; disciplines: EvidenceCatalog['disciplines']; compact?: boolean; domainId?: string; onChooseDomain?: (id: string) => void }) {
  const facet = claimFacet(claim.id);
  const connection = facet?.domainLinks.find((link) => link.domainId === domainId);
  return <section className={styles.claimFacets} aria-label="Claim classification and editorial topic connections">
    <div className={styles.disposition}><span className={styles.eyebrow}>BOUNDED DISPOSITION / NOT A SCORE</span><strong>{dispositionLabels[facet?.disposition || 'not-appraised']}</strong><p>{facet?.dispositionRationale || 'This claim remains in the canonical register. Its topic links and disposition summary have not yet been categorized.'}</p></div>
    <p className={styles.reviewProcess}><strong>Review process</strong><br />{claim.reviewer}. {claim.reviewStatus === 'educational-review' ? 'Editorial review is not clinical validation or a systematic-review certainty grade.' : `Recorded state: ${claim.reviewStatus}.`}</p>
    {connection && <p className={styles.mappingNote}><strong>{domainRelationLabels[connection.relation]}</strong> · {connection.rationale}</p>}
    <details><summary>{compact ? 'Topic & curriculum connections' : 'Where this claim connects—and why'}</summary>
      <p className={styles.fine}>These are editorial navigation links, not evidence of efficacy or validated curriculum relationships. A claim has one canonical dossier even when it appears in several topics.</p>
      <div className={styles.facetLinks}>{facet?.domainLinks.map((link) => <div key={link.domainId}>{onChooseDomain ? <button onClick={() => onChooseDomain(link.domainId)}>{evidenceTaxonomy.domains.find((domain) => domain.id === link.domainId)?.title || link.domainId}</button> : <Link href={`/evidence?domain=${link.domainId}&claim=${claim.slug}`}>{evidenceTaxonomy.domains.find((domain) => domain.id === link.domainId)?.title || link.domainId}</Link>}<small>{domainRelationLabels[link.relation]}</small><p>{link.rationale}</p></div>)}</div>
      <h4>Educational relevance</h4><div className={styles.facetLinks}>{facet?.disciplineLinks.map((link) => <div key={link.discipline}><Link href={`/learn/curriculum/${link.discipline}`}>{disciplines.find((discipline) => discipline.slug === link.discipline)?.title || link.discipline}</Link><p>{link.rationale}</p></div>)}</div>
      {!facet && <p>No category or curriculum links recorded yet. This does not change the claim’s existing scope, sources or review status.</p>}
    </details>
  </section>;
}
