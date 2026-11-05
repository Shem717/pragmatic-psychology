"use client";
import { useState } from "react";
import { Search, ArrowUpRight, Plus } from "lucide-react";
import { selectResearchClaims, verdictLabels, researchVideoHref, type ResearchClaim } from "@/lib/research-review";

export function ResearchReview({ videos, claims }: { videos: { id: string; title: string }[]; claims: ResearchClaim[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [video, setVideo] = useState("all");
  const filtered = selectResearchClaims(claims, search, category, video);
  const categories = [
    { id: "all", label: "All records", note: "The complete register", count: claims.length },
    { id: "assessed", label: "Assessed", note: "Bounded evidence reviews", count: claims.filter((claim) => claim.category === "assessed").length },
    { id: "pending", label: "Pending", note: "Evidence still unresolved", count: claims.filter((claim) => claim.category === "pending").length },
    { id: "anecdote", label: "Anecdotes", note: "Accounts & proposals", count: claims.filter((claim) => claim.category === "anecdote").length },
  ];
  return <section className="review-browser" aria-label="Browse transcript evidence">
    <div className="review-tools">
    <div className="review-category-nav" role="group" aria-label="Review category">
      {categories.map((item) => <button key={item.id} type="button" aria-pressed={category === item.id} data-category={item.id} onClick={() => setCategory(item.id)}><span className="review-category-label">{item.label}</span><strong>{item.count}</strong><span className="review-category-note">{item.note}</span></button>)}
    </div>
    <div className="review-filters">
      <label className="research-search">Search claims and evidence<div><Search size={18} aria-hidden="true" /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Attention, memory, social connection…" /></div></label>
      <label>Video<select value={video} onChange={(event) => setVideo(event.target.value)}><option value="all">All six videos</option>{videos.map((item) => <option value={item.id} key={item.id}>{item.title}</option>)}</select></label>
    </div>
    <div className="review-results"><p role="status" aria-live="polite">{filtered.length} of {claims.length} claim records</p><button type="button" onClick={() => { setSearch(""); setCategory("all"); setVideo("all"); }}>Reset filters</button></div>
    </div>
    {!filtered.length && <p className="review-empty">No claims match these filters. Try another term or reset the filters.</p>}
    {videos.map((item, videoIndex) => {
      const items = filtered.filter((claim) => claim.videoId === item.id);
      if (!items.length) return null;
      return <section className="review-video" key={item.id} aria-labelledby={`video-${item.id}`}>
        <header><div><p className="research-eyebrow">SOURCE {String(videoIndex + 1).padStart(2, "0")} <span>{items.length} {items.length === 1 ? "record" : "records"}</span></p><h2 id={`video-${item.id}`}>{item.title}</h2></div><a href={`https://www.youtube.com/watch?v=${item.id}`} target="_blank" rel="noopener noreferrer">Watch source <ArrowUpRight size={15} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a></header>
        <div className="review-claims">{items.map((claim) => <details className="review-claim" key={claim.id} id={claim.id}>
          <summary><span className="review-status" data-category={claim.category} data-verdict={claim.verdict}>{verdictLabels[claim.verdict]}</span><h3>{claim.claim}</h3><span className="review-time"><span>{claim.timestamps}</span><span>{claim.sources.length} linked {claim.sources.length === 1 ? "source" : "sources"}</span></span><span className="review-expand" aria-hidden="true"><Plus size={18} /></span><span className="sr-only">View evidence and limits</span></summary>
          <div className="review-claim-body"><p className="review-assessment">{claim.summary}</p><p className="review-design"><strong>Evidence type:</strong> {claim.evidenceType}</p>
            {claim.reviewScope && <p className="research-fine"><strong>Review scope:</strong> {claim.reviewScope}</p>}
            <h4>Limits and next questions</h4><ul>{claim.limits.map((limit) => <li key={limit}>{limit}</li>)}</ul>
            {claim.sources.length > 0 && <><h4>Research and original sources</h4><ul className="review-sources">{claim.sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}<ArrowUpRight size={13} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>{source.design && <p>{source.design}</p>}{source.limits && <p className="research-fine">{source.limits}</p>}</li>)}</ul></>}
            <p className="research-fine">Transcript assertion paraphrased for review · <a href={researchVideoHref(claim.videoId, claim.timestamps)} target="_blank" rel="noopener noreferrer">View source passage<span className="sr-only"> (opens in a new tab)</span></a> · <a href={`#${claim.id}`}>Link to this claim</a></p>
          </div>
        </details>)}</div>
      </section>;
    })}
  </section>;
}
