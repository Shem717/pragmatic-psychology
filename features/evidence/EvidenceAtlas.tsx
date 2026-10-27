import Link from 'next/link';
import { ArrowDown, ArrowUpRight, Compass } from 'lucide-react';
import type { Claim } from '@/lib/content';
import { evidenceTaxonomy, topicClaimCount, type EvidenceCatalog } from '@/lib/evidence-taxonomy';
import styles from './EvidenceAtlas.module.css';

export function EvidenceAtlas({ selected, claims, disciplines, models, onSelect }: {
  selected: string; claims: Claim[]; disciplines: EvidenceCatalog['disciplines']; models: EvidenceCatalog['models']; onSelect: (id: string) => void;
}) {
  const domain = evidenceTaxonomy.domains.find((item) => item.id === selected);
  const count = domain ? topicClaimCount(domain.id, claims) : claims.length;
  return <section className={styles.atlas} aria-labelledby="evidence-atlas-title">
    <div className={styles.heading}>
      <div><span className={styles.eyebrow}>AN ATLAS OF INQUIRY</span><h2 id="evidence-atlas-title">Enter through a question.</h2><p>One canonical claim, many useful connections. Choose a subject, then inspect what the evidence actually says.</p></div>
      <a href="#claim-index">Use the readable index <ArrowDown size={15} aria-hidden="true" /></a>
      <svg className={styles.ornament} viewBox="0 0 180 180" fill="none" aria-hidden="true"><circle cx="90" cy="90" r="74"/><circle cx="90" cy="90" r="62"/><ellipse cx="90" cy="90" rx="83" ry="28" transform="rotate(-28 90 90)"/><path d="M90 25v130M25 90h130M90 60l8 22 22 8-22 8-8 22-8-22-22-8 22-8z"/></svg>
    </div>
    <div className={styles.domains} role="group" aria-label="Evidence topic domains">
      {evidenceTaxonomy.domains.map((item, index) => <button key={item.id} aria-pressed={selected === item.id} onClick={() => onSelect(item.id)} aria-controls="topic-reading-room">
        <span className={styles.number} aria-hidden="true">{['I','II','III','IV','V','VI'][index] || String(index + 1)}</span>
        <span className={styles.domainName}>{item.title}</span><span className={styles.question}>{item.question}</span>
        <span className={styles.count}>{topicClaimCount(item.id, claims)} canonical {topicClaimCount(item.id, claims) === 1 ? 'claim' : 'claims'}<ArrowUpRight size={14} aria-hidden="true" /></span>
      </button>)}
    </div>
    <div className={styles.atlasFoot}><button aria-pressed={selected === 'all'} onClick={() => onSelect('all')}>All topics · {claims.length} claims</button><p>Counts are distinct records within each topic, before other filters. Topics overlap; their counts must not be added.</p></div>
    <div className={styles.readingRoom} id="topic-reading-room">
      {domain ? <>
        <div className={styles.topicScope}><span className={styles.eyebrow}>SELECTED TOPIC / EDITORIAL MAP</span><h3>{domain.title}</h3><p>{domain.summary}</p><p className={styles.fine}>Membership is a subject-matter link, not supporting evidence or a higher confidence rating. Clinical and animal records retain their own scope.</p>
          {count > 0 && <a href="#claim-index">Read the matching claims <ArrowDown size={14} aria-hidden="true" /></a>}
          {count === 0 && <div className={styles.empty}><strong>No dedicated canonical claim in this topic yet.</strong><p>This is an honest coverage gap. The curriculum links are educational destinations, not research findings or a completed review.</p></div>}
        </div>
        <div className={styles.connections}><details><summary>Related curriculum · {domain.disciplineLinks.length} disciplines</summary><p className={styles.fine}>Editorial relevance, not evidence that the eight disciplines form a validated assessment or scientifically independent constructs.</p>{domain.disciplineLinks.map((link) => <div key={link.discipline}><Link href={`/learn/curriculum/${link.discipline}`}>{disciplines.find((item) => item.slug === link.discipline)?.title || link.discipline} <ArrowUpRight size={13} aria-hidden="true" /></Link><p>{link.rationale}</p></div>)}</details>
          <details><summary>Explanatory accounts · {domain.modelLinks.length} models</summary><p className={styles.fine}>Related, potentially competing or nonexclusive accounts—not proven mechanisms of this site.</p>{domain.modelLinks.length ? domain.modelLinks.map((link) => <div key={link.modelId}><Link href={`/evidence/models#model-${link.modelId}`}>{models.find((model) => model.id === link.modelId)?.title || link.modelId} <ArrowUpRight size={13} aria-hidden="true" /></Link><p>{link.rationale}</p></div>) : <p>No explanatory model is assigned to this topic yet.</p>}</details>
        </div>
      </> : <div className={styles.allTopics}><Compass size={26} aria-hidden="true" /><div><strong>Browse the whole register—or narrow your inquiry.</strong><p>Topics organize subject matter. Evidence type describes the kind of proposition. Disposition summarizes its bounded position; review status describes the checking process. None is a truth score.</p></div></div>}
    </div>
  </section>;
}
