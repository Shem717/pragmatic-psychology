import Link from 'next/link';
import { sharedSourceBackground as background } from '@/lib/shared-source-background';
import { SourceMoment } from './SourceMoment';
import styles from './SourceCompanion.module.css';

/** Render once on the source index; claim-page source cards link to this canonical panel. */
export function SharedSourceBackground() {
  return <section id={background.id} className={`${styles.sharedPanel} ${styles.companion}`} aria-labelledby={`${background.id}-title`}>
    <div className={styles.heading}><span className="small-label">ONE SHARED RECORDING · SIX CONTEXT LINKS</span><span className={styles.relationship}>{background.relationship}</span></div>
    <h2 id={`${background.id}-title`}>{background.title}</h2>
    <p className={styles.byline}>{background.speaker} · 2018</p>
    <p><strong>Scope:</strong> {background.limitation}</p>
    <p className={styles.verification}><strong>Review note:</strong> Automatic-caption passages reviewed at 13:05–14:04 and 22:23–23:13. The second passage is the speaker’s hypothesis, not an established treatment mechanism. One recording does not independently confirm six sources.</p>
    {background.passages.map(passage => <div className={styles.passage} key={passage.url}><p>{passage.topic}</p><SourceMoment url={passage.url} label={passage.timestamp} /></div>)}
    <h3>Keep each source’s distinct scope</h3>
    <ul className={styles.connections}>{background.connections.map(connection => <li key={connection.source_id}>
      <Link href={`/evidence/sources#source-${connection.source_id}`}>{connection.source_id} · Source card</Link>{' · '}<a href={connection.source_url}>{connection.source_title}</a>
      <p>{connection.context}</p>
    </li>)}</ul>
  </section>;
}
