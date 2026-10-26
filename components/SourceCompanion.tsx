import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { getSourceCompanion } from '@/lib/source-companions';
import { SourceMoment } from './SourceMoment';
import styles from './SourceCompanion.module.css';

/** Secondary context stays below the original source and its scope/correction notes. */
export function SourceCompanion({ sourceId }: { sourceId: string }) {
  const companion = getSourceCompanion(sourceId);
  if (!companion) return null;
  if (companion.sharedGroup) return <aside className={styles.companion} aria-label={`Shared video context for ${sourceId}`}>
    <div className={styles.heading}><span className="small-label">SHARED VIDEO CONTEXT</span><span className={styles.relationship}>{companion.relationship}</span></div>
    <p>{companion.adds}</p>
    <p className={styles.verification}>One 2018 conversation shared across six sources, not six independent confirmations. No psychiatric approval or DIY FMT is implied.</p>
    <Link className={styles.official} href={`/evidence/sources#${companion.sharedGroup}`}>Open the shared background and its limits</Link>
  </aside>;
  return <aside className={styles.companion} aria-label={`Reviewed video companion for ${sourceId}`}>
    <div className={styles.heading}><span className="small-label">VIDEO COMPANION</span><span className={styles.relationship}>{companion.relationship}</span></div>
    <h4>{companion.title}</h4>
    <p className={styles.byline}>{companion.speaker}</p>
    <p><strong>What this adds:</strong> {companion.adds}</p>
    <p><strong>Scope:</strong> {companion.limitation}</p>
    <p className={styles.verification}><strong>Review note:</strong> {companion.verification}</p>
    {companion.requiredLinks?.length ? <div className={styles.counterevidence}><strong>Read alongside this video</strong><ul>{companion.requiredLinks.map(link => <li key={link.url}><a href={link.url}>{link.title} <ArrowUpRight size={13} aria-hidden="true" /></a></li>)}</ul></div> : null}
    {!companion.playbackUrl ? <p className={styles.verification}>Passage guide: {companion.passage}</p> : null}
    {companion.playbackUrl ? <SourceMoment url={companion.playbackUrl} label={companion.passage} /> : null}
    {!companion.playbackUrl || companion.publicUrl !== companion.playbackUrl ? <a className={styles.official} href={companion.publicUrl} target="_blank" rel="noopener noreferrer">{companion.playbackUrl ? 'Official video and transcript' : 'Watch on the official publisher page'} <ArrowUpRight size={13} aria-hidden="true" /><span className="sr-only"> (opens a new tab)</span></a> : null}
  </aside>;
}
