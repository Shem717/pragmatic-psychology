import Link from 'next/link';
import type { Claim } from '@/lib/content';
import { isRetiredClaim } from '@/lib/claim-status';

/** Navigation only: never changes a claim's evidence connections. */
export function RelatedClaims({ claim, claims }: { claim: Claim; claims: Claim[] }) {
  const related = (claim.relatedClaimIds ?? [])
    .map((id) => claims.find((item) => item.id === id))
    .filter((item): item is Claim => Boolean(item && !isRetiredClaim(item)));
  if (!related.length) return null;
  return <aside className="callout">
    <h3>Related questions—not supporting evidence</h3>
    <p>These dossiers address different questions. A link does not confirm this claim or transfer its evidence.</p>
    <ul>{related.map((item) => <li key={item.id}><Link href={`/evidence/claims/${item.slug}`}>{item.shortTitle}</Link></li>)}</ul>
  </aside>;
}
