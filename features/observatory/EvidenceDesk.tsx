"use client";
import { useState } from 'react';
import Link from 'next/link';
import { Search, ArrowUpRight } from 'lucide-react';
import { content } from '@/lib/content';
import { isRetiredClaim } from '@/lib/claim-status';
import { filterObservatoryClaims, resolveObservatoryClaim } from '@/lib/observatory-state';

export function EvidenceDesk() {
  const [query,setQuery]=useState('');
  const [selected,setSelected]=useState('flexibility');
  const claims=filterObservatoryClaims(content.claims,query);
  const claim=resolveObservatoryClaim(claims,selected);
  const primary=content.sources.filter((source)=>claim?.sourceIds.includes(source.id));
  const counter=content.sources.filter((source)=>claim?.challengeSourceIds.includes(source.id));
  return <section className="observatory-evidence" aria-labelledby="desk-title">
    <div className="observatory-panel-title"><Search size={27} aria-hidden="true"/><div><span className="eyebrow">III / THE EVIDENCE DESK</span><h2 id="desk-title">A claim, its basis, and what it cannot establish.</h2></div></div>
    <p>Inspect the existing evidence register. The room’s light and instruments are decoration—not a truth meter. Source summaries and confidence labels retain their stated limits.</p>
    <div className="evidence-desk-grid"><div className="evidence-desk-picker"><label>Find a proposition<input type="search" value={query} onChange={(event)=>setQuery(event.target.value)} placeholder="Perspective, learning, confidence…" /></label><p className="fine" role="status">{claims.length} matching current {claims.length===1?'claim':'claims'}</p><div className="evidence-desk-results">{claims.map((item)=><button key={item.id} aria-pressed={claim?.slug===item.slug} onClick={()=>setSelected(item.slug)}>{item.shortTitle}<span>{item.kind.replaceAll('-',' ')}</span></button>)}</div>{!claims.length&&<button onClick={()=>setQuery('')}>Clear search</button>}</div>
    {claim ? <article className="evidence-desk-record" aria-label="Selected evidence record"><span className="small-label">{claim.id} · {claim.kind.replaceAll('-',' ').toUpperCase()}</span><h3>{claim.title}</h3>{!isRetiredClaim(claim)&&<><p>{claim.statement}</p><dl><dt>Scope</dt><dd>{claim.scope}</dd><dt>Confidence label in the register</dt><dd>{claim.confidence}. {claim.confidenceRationale}</dd></dl><h4>Limitations</h4><ul>{claim.limitations.map((limit)=><li key={limit}>{limit}</li>)}</ul><h4>Not implied</h4><ul>{claim.notImplied.map((limit)=><li key={limit}>{limit}</li>)}</ul></>}
    <h4>Recorded supporting sources</h4><ul className="evidence-desk-sources">{primary.map((source)=><li key={source.id}><a href={source.url} target="_blank" rel="noopener">{source.title} <ArrowUpRight size={14} aria-hidden="true"/><span className="sr-only"> (new tab)</span></a><small>{source.design} · {source.population}</small></li>)}</ul>{!primary.length&&<p>No supporting sources recorded for this entry.</p>}
    <h4>Counterevidence recorded in the register</h4>{counter.length ? <ul>{counter.map((source)=><li key={source.id}><a href={source.url} target="_blank" rel="noopener">{source.title} <ArrowUpRight size={14} aria-hidden="true"/><span className="sr-only"> (new tab)</span></a></li>)}</ul> : <p>No separate challenge source is linked here. That absence is not proof that no counterevidence exists; inspect the limitations and source index.</p>}
    <Link className="button primary" href={`/evidence/claims/${claim.slug}`}>Inspect the full claim record <ArrowUpRight size={16} aria-hidden="true"/></Link></article> : <article className="evidence-desk-record"><h3>No current claim matches this search.</h3><p>No record is selected. Clear the search or try a different term.</p></article>}</div>
    <div className="actions"><Link href="/evidence">All claims and models</Link><Link href="/evidence/sources">Original source index</Link><Link href="/research">Open research questions</Link></div>
  </section>;
}
