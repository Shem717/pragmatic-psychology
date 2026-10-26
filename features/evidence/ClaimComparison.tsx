"use client";
import { useRef, type ReactNode } from "react";
import Link from "next/link";
import { Columns3, X, ArrowRight } from "lucide-react";
import type { Claim } from "@/lib/content";
import { claimRelationships, relationshipLabels } from "@/lib/evidence";

const rows: { label: string; render: (claim: Claim) => ReactNode }[] = [
  { label: "Scoped finding / proposition", render: (c) => <p>{c.statement}</p> },
  { label: "Population & context", render: (c) => <p>{c.population}</p> },
  { label: "Scope", render: (c) => <p>{c.scope}</p> },
  { label: "Evidence type", render: (c) => <p>{c.kind.replaceAll("-", " ")}</p> },
  { label: "Editorial confidence", render: (c) => <><strong>{c.confidence}</strong><p>{c.confidenceRationale}</p></> },
  { label: "Limitations", render: (c) => <ul>{c.limitations.map((limit) => <li key={limit}>{limit}</li>)}</ul> },
  { label: "What does not follow", render: (c) => <ul>{c.notImplied.map((limit) => <li key={limit}>{limit}</li>)}</ul> },
  { label: "Source relationships", render: (c) => claimRelationships(c).length ? <ul className="comparison-source-links">{claimRelationships(c).map((r) => <li key={r.sourceId}><Link href={`/evidence/sources#source-${r.sourceId}`}>{r.sourceId}</Link> · {relationshipLabels[r.role]}</li>)}</ul> : <p>No direct source evidence for the integration proposal.</p> },
  { label: "Integrated product outcome", render: () => <p>Not assessed.</p> },
];
export function ClaimComparison({ claims, onRemove, onClear }: { claims: Claim[]; onRemove: (id: string) => void; onClear: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  return <>
    {claims.length > 0 && <aside className="comparison-tray" aria-label="Claim comparison selection">
      <div className="comparison-tray-heading"><Columns3 size={21} aria-hidden="true" /><span><strong>{claims.length} of 3 selected</strong><small>{claims.length < 2 ? "Add another claim to compare" : "Ready to compare the same questions"}</small></span></div>
      <div className="comparison-chips">{claims.map((c) => <button key={c.id} onClick={() => onRemove(c.id)} aria-label={`Remove ${c.title} from comparison`}><span>{c.title}</span><X size={14} aria-hidden="true" /></button>)}</div>
      <div className="comparison-tray-actions"><button className="research-text-button" onClick={onClear}>Clear</button><button ref={trigger} className="primary" disabled={claims.length < 2} onClick={() => dialog.current?.showModal()}>Compare<ArrowRight size={17} aria-hidden="true" /></button></div>
    </aside>}
    <dialog ref={dialog} className="research-comparison-dialog" aria-labelledby="comparison-title" aria-describedby="comparison-description" onClose={() => trigger.current?.focus()}>
      <div className="research-dialog-heading"><div><p className="research-eyebrow">SIDE BY SIDE / {claims.length} CLAIMS</p><h2 id="comparison-title">Compare the scope.</h2><p id="comparison-description">Read each proposition on its own terms. Editorial confidence is not an efficacy score.</p></div><button autoFocus onClick={() => dialog.current?.close()} aria-label="Close claim comparison"><X size={20} aria-hidden="true" /><span>Close</span></button></div>
      <div className="research-table-scroll" tabIndex={0} role="region" aria-label="Aligned claim comparison; scroll horizontally on small screens"><table className="research-comparison-table"><caption>Shared questions, aligned answers. Scroll across to see every selected claim.</caption><thead><tr><th scope="col">Question</th>{claims.map((claim) => <th key={claim.id} scope="col"><Link href={`/evidence/claims/${claim.slug}`}>{claim.title}</Link></th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.label}><th scope="row">{row.label}</th>{claims.map((claim) => <td key={claim.id}>{row.render(claim)}</td>)}</tr>)}</tbody></table></div>
    </dialog>
  </>;
}
