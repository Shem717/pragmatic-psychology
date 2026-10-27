import { ArrowUpRight } from 'lucide-react';
import type { Source } from '@/lib/content';
const labels = { 'methodological-comment': 'Methodological comment', 'author-reply': 'Authors’ reply' } as const;

export function RelatedPublications({ sourceId, publications }: { sourceId: string; publications: Source['relatedPublications'] }) {
  if (!publications?.length) return null;
  return <section className="source-related-publications" aria-label={`Related publications for ${sourceId}`}>
    <h4>Related publications</h4><p>Commentary and replies are not additional independent studies.</p>
    <ul>{publications.map((publication) => <li key={`${publication.relation}:${publication.url}`}>
      <span>{labels[publication.relation]}</span><a href={publication.url}>{publication.title}<ArrowUpRight size={14} aria-hidden="true" /></a><p>{publication.note}</p>
    </li>)}</ul>
  </section>;
}
