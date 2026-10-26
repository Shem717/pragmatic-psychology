"use client";
import Link from "next/link";
import type { Claim, Source } from "@/lib/content";
import { claimMapLabels, claimRelationships, relationshipLabels } from "@/lib/evidence";

function position(index: number, count: number) {
  const angle = (index * 2 * Math.PI) / count - Math.PI / 2;
  return { x: 50 + Math.cos(angle) * 37, y: 50 + Math.sin(angle) * 38 };
}
export function Constellation({ claims, visible, active, sources, view, onView, onSelect }: {
  claims: Claim[]; visible: Claim[]; active?: Claim; sources: Source[];
  view: "claims" | "sources"; onView: (view: "claims" | "sources") => void; onSelect: (id: string) => void;
}) {
  const relationships = active ? claimRelationships(active) : [];
  return <section id="evidence-constellation" tabIndex={-1} className="research-constellation" aria-labelledby="constellation-title">
    <div className="research-section-top"><div><p className="research-eyebrow">01 / EXPLORE</p><h2 id="constellation-title">The constellation</h2></div><div className="research-segmented" role="group" aria-label="Constellation view"><button aria-pressed={view === "claims"} onClick={() => onView("claims")}>Claims</button><button aria-pressed={view === "sources"} onClick={() => onView("sources")}>Source connections</button></div></div>
    <div className={`research-starfield ${view === "sources" ? "is-source-view" : ""}`}>
      <svg className="research-orbits" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <ellipse cx="50" cy="50" rx="37" ry="38" /><ellipse cx="50" cy="50" rx="26" ry="27" /><path d="M50 4v92M4 50h92" />
        {view === "sources" && relationships.map((r, index) => { const p = position(index, relationships.length); return <line key={r.sourceId} x1="50" y1="50" x2={p.x} y2={p.y} data-role={r.role} />; })}
      </svg>
      <div className="research-map-core" aria-hidden="true"><span className="research-core-star">✦</span><span>{view === "claims" ? "THE OPEN QUESTION" : "SELECTED CLAIM"}</span><strong>{view === "claims" ? <>What enables<br /> lasting change?</> : active ? claimMapLabels[active.slug] ?? active.shortTitle : "No matching claim"}</strong>{view === "sources" && <small>{relationships.length} source connections</small>}</div>
      {view === "claims" ? visible.map((claim) => { const p = position(claims.indexOf(claim), claims.length); return <button key={claim.id} className="research-claim-star" style={{ left: p.x + "%", top: p.y + "%" }} aria-pressed={active?.id === claim.id} aria-label={`Inspect ${claim.title}`} aria-controls="claim-inspector" onClick={() => onSelect(claim.id)}><span className="research-star-dot" aria-hidden="true" /><span>{claimMapLabels[claim.slug] ?? claim.shortTitle}</span>{active?.id === claim.id && <small>Selected</small>}</button>; }) : relationships.map((r, index) => {
        const source = sources.find((s) => s.id === r.sourceId);
        if (!source) return null;
        const p = position(index, relationships.length);
        return <Link className="research-source-star" key={r.sourceId} href={`/evidence/sources#source-${r.sourceId}`} data-role={r.role} style={{ left: p.x + "%", top: p.y + "%" }} title={`${source.title} · ${relationshipLabels[r.role]}`}><span>{r.sourceId}<span aria-hidden="true"> ↗</span></span><strong>{source.title}</strong><small>{relationshipLabels[r.role]}</small></Link>;
      })}
      {view === "sources" && !relationships.length && <p className="research-map-empty">{active ? "Original integration proposal. No direct source connection is recorded." : "Change the search or filters to inspect a claim."}</p>}
    </div>
    {view === "sources" && relationships.length > 0 && <div className="research-relationship-key" aria-label="Source relationship key">{Array.from(new Set(relationships.map((r) => r.role))).map((role) => <span key={role} data-role={role}>{relationshipLabels[role]}</span>)}</div>}
    <p className="research-map-note">{view === "claims" ? "Select a claim, then trace its sources." : "Lines connect the selected claim to its recorded sources."} Position, distance and size do not measure evidence strength.</p>
  </section>;
}
