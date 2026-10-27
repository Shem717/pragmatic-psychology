"use client";
import { useState } from 'react';
import Link from 'next/link';
import { Search, ArrowUpRight } from 'lucide-react';
import { content, type Claim } from '@/lib/content';
import { claimRelationships, relationshipLabels } from '@/lib/evidence';
import { isRetiredClaim } from '@/lib/claim-status';
import { filterObservatoryClaims, resolveObservatoryClaim } from '@/lib/observatory-state';

/** The desk shares canonical scoped roles with the dossiers; membership alone is not support. */
export function EvidenceDeskSources({ claim }: { claim: Claim }) {
  const relationships = claimRelationships(claim);
  return <><h4>Source connections and their scoped roles</h4><p className="fine">Roles apply to the specified propositions, not automatically to the whole claim. Source records are not counts of independent studies.</p>
    <ul className="evidence-desk-sources">{relationships.map((relationship) => {
      const source = content.sources.find((item) => item.id === relationship.sourceId);
      if (!source) return null;
      return <li key={source.id} data-source-id={source.id} data-role={relationship.role}><strong>{source.id} · {relationshipLabels[relationship.role]}</strong><a href={source.url} target="_blank" rel="noopener">{source.title} <ArrowUpRight size={14} aria-hidden="true"/><span className="sr-only"> (new tab)</span></a><small>{source.design} · {source.population}</small><p className="fine">{relationship.note}</p><Link href={`/evidence/claims/${claim.slug}#connection-${source.id}`}>Inspect this connection’s exact scope and limitations</Link></li>;
    })}</ul>{!relationships.length && <p>No source connection is recorded for this entry. That absence is not proof that no counterevidence exists; inspect the limitations and source index.</p>}
  </>;
}

export function EvidenceDesk() {
  const [query,setQuery]=useState('');
  const [selected,setSelected]=useState('flexibility');
  const claims=filterObservatoryClaims(content.claims,query);
  const claim=resolveObservatoryClaim(claims,selected);
  return <section className="observatory-evidence" aria-labelledby="desk-title">
    <div className="observatory-panel-title"><Search size={27} aria-hidden="true"/><div><span className="eyebrow">III / THE EVIDENCE DESK</span><h2 id="desk-title">A claim, its basis, and what it cannot establish.</h2></div></div>
    <p>Inspect the existing evidence register. The room’s light and instruments are decoration—not a truth meter. Source summaries and confidence labels retain their stated limits.</p>
    <div className="evidence-desk-grid"><div className="evidence-desk-picker"><label>Find a proposition<input type="search" value={query} onChange={(event)=>setQuery(event.target.value)} placeholder="Perspective, learning, confidence…" /></label><p className="fine" role="status">{claims.length} matching current {claims.length===1?'claim':'claims'}</p><div className="evidence-desk-results">{claims.map((item)=><button key={item.id} aria-pressed={claim?.slug===item.slug} onClick={()=>setSelected(item.slug)}>{item.shortTitle}<span>{item.kind.replaceAll('-',' ')}</span></button>)}</div>{!claims.length&&<button onClick={()=>setQuery('')}>Clear search</button>}</div>
    {claim ? <article className="evidence-desk-record" aria-label="Selected evidence record"><span className="small-label">{claim.id} · {claim.kind.replaceAll('-',' ').toUpperCase()}</span><h3>{claim.title}</h3>{!isRetiredClaim(claim)&&<><p>{claim.statement}</p><dl><dt>Scope</dt><dd>{claim.scope}</dd><dt>Confidence label in the register</dt><dd>{claim.confidence}. {claim.confidenceRationale}</dd></dl><h4>Limitations</h4><ul>{claim.limitations.map((limit)=><li key={limit}>{limit}</li>)}</ul><h4>Not implied</h4><ul>{claim.notImplied.map((limit)=><li key={limit}>{limit}</li>)}</ul></>}
    <EvidenceDeskSources claim={claim} />
    <Link className="button primary" href={`/evidence/claims/${claim.slug}`}>Inspect the full claim record <ArrowUpRight size={16} aria-hidden="true"/></Link></article> : <article className="evidence-desk-record"><h3>No current claim matches this search.</h3><p>No record is selected. Clear the search or try a different term.</p></article>}</div>
    <div className="actions"><Link href="/evidence">All claims and models</Link><Link href="/evidence/sources">Original source index</Link><Link href="/research">Open research questions</Link></div>
  </section>;
}
