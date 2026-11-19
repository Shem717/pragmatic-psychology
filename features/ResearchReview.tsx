"use client";
import { useEffect, useRef, useState } from "react";
import { Search, ArrowUpRight, Plus } from "lucide-react";
import { defaultReviewFilters, readReviewLocation, reviewPageSize, reviewResultsHref, selectResearchClaims, verdictLabels, researchVideoHref, type ReviewFilters, type ResearchClaim } from "@/lib/research-review";

export function ResearchReview({ videos, claims }: { videos: { id: string; title: string }[]; claims: ResearchClaim[] }) {
  const [filters, setFilters] = useState(defaultReviewFilters);
  const [ready, setReady] = useState(false);
  const target = useRef<string | undefined>(undefined);
  const results = useRef<HTMLDivElement>(null);
  const { q, category, video, page } = filters;
  const filtered = selectResearchClaims(claims, q, category, video);
  const pages = Math.max(1, Math.ceil(filtered.length / reviewPageSize));
  const start = (page - 1) * reviewPageSize;
  const shown = filtered.slice(start, start + reviewPageSize);
  useEffect(() => {
    const read = () => {
      const state = readReviewLocation(location.search, location.hash, claims, videos);
      target.current = state.target;
      setFilters(state.filters);
      setReady(true);
    };
    read();
    window.addEventListener("popstate", read);
    window.addEventListener("hashchange", read);
    return () => { window.removeEventListener("popstate", read); window.removeEventListener("hashchange", read); };
  }, [claims, videos]);
  useEffect(() => {
    if (!ready || !target.current) return;
    const record = document.getElementById(target.current);
    if (record instanceof HTMLDetailsElement) {
      record.open = true;
      record.scrollIntoView({ block: "start" });
      target.current = undefined;
    }
  }, [ready, filters]);
  const update = (changes: Partial<ReviewFilters>, push = false) => {
    const next = { ...filters, page: 1, ...changes };
    target.current = undefined;
    const href = reviewResultsHref(next);
    if (href !== location.pathname + location.search + location.hash) {
      if (push) history.pushState(history.state, "", href);
      else history.replaceState(history.state, "", href);
    }
    setFilters(next);
  };
  const changePage = (next: number) => {
    update({ page: next }, true);
    requestAnimationFrame(() => { results.current?.focus({ preventScroll: true }); results.current?.scrollIntoView({ block: "start" }); });
  };
  const categories = [
    { id: "all", label: "All records", note: "The complete register", count: claims.length },
    { id: "assessed", label: "Assessed", note: "Bounded evidence reviews", count: claims.filter((claim) => claim.category === "assessed").length },
    { id: "pending", label: "Pending", note: "Evidence still unresolved", count: claims.filter((claim) => claim.category === "pending").length },
    { id: "anecdote", label: "Anecdotes", note: "Accounts & proposals", count: claims.filter((claim) => claim.category === "anecdote").length },
  ];
  const renderGroups = (records: ResearchClaim[], suffix = "") => videos.map((item, videoIndex) => {
      const items = records.filter((claim) => claim.videoId === item.id);
      const total = filtered.filter((claim) => claim.videoId === item.id).length;
      if (!items.length) return null;
      return <section className="review-video" key={item.id} aria-labelledby={`video-${item.id}${suffix}`}>
        <header><div><p className="research-eyebrow">SOURCE {String(videoIndex + 1).padStart(2, "0")} <span>{total} matching {total === 1 ? "record" : "records"}</span></p><h2 id={`video-${item.id}${suffix}`}>{item.title}</h2></div><a href={`https://www.youtube.com/watch?v=${item.id}`} target="_blank" rel="noopener noreferrer">Watch source <ArrowUpRight size={15} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a></header>
        <div className="review-claims">{items.map((claim) => <details className="review-claim" key={claim.id} id={claim.id}>
          <summary><span className="review-status" data-category={claim.category} data-verdict={claim.verdict}>{verdictLabels[claim.verdict]}</span><h3><span className={claim.category === "assessed" ? "review-claim-label" : "sr-only"}>Transcript claim</span>{" "}{claim.claim}</h3>
            {claim.category === "assessed" && <span className="review-finding"><strong>Review finding</strong>{claim.briefFinding ?? claim.summary}</span>}
            <span className="review-time"><span>{claim.timestamps}</span><span>{claim.sources.length} linked {claim.sources.length === 1 ? "source" : "sources"}</span></span><span className="review-expand" aria-hidden="true"><Plus size={18} /></span><span className="sr-only">View evidence and limits</span></summary>
          <div className="review-claim-body">{(claim.category !== "assessed" || claim.briefFinding) && <p className="review-assessment">{claim.summary}</p>}<p className="review-design"><strong>Evidence type:</strong> {claim.evidenceType}</p>
            {claim.reviewScope && <p className="research-fine"><strong>Review scope:</strong> {claim.reviewScope}</p>}
            <h4>Limits and next questions</h4><ul>{claim.limits.map((limit) => <li key={limit}>{limit}</li>)}</ul>
            {claim.sources.length > 0 && <><h4>Research and original sources</h4><ul className="review-sources">{claim.sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}<ArrowUpRight size={13} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>{source.design && <p>{source.design}</p>}{source.limits && <p className="research-fine">{source.limits}</p>}</li>)}</ul></>}
            <p className="research-fine">Transcript assertion paraphrased for review · <a href={researchVideoHref(claim.videoId, claim.timestamps)} target="_blank" rel="noopener noreferrer">View source passage<span className="sr-only"> (opens in a new tab)</span></a> · <a href={`#${claim.id}`}>Link to this claim</a></p>
          </div>
        </details>)}</div>
      </section>;
    });
  return <section className="review-browser" aria-label="Browse transcript evidence">
    <div className="review-tools">
    <div className="review-category-nav" role="group" aria-label="Review category">
      {categories.map((item) => <button key={item.id} type="button" aria-pressed={category === item.id} data-category={item.id} onClick={() => update({ category: item.id }, true)}><span className="review-category-label">{item.label}</span><strong>{item.count}</strong><span className="review-category-note">{item.note}</span></button>)}
    </div>
    <div className="review-filters">
      <label className="research-search">Search claims and evidence<div><Search size={18} aria-hidden="true" /><input type="search" maxLength={500} value={q} onChange={(event) => update({ q: event.target.value })} placeholder="Attention, memory, social connection…" /></div></label>
      <label><span id="review-video-label">Video</span><select aria-labelledby="review-video-label" value={video} onChange={(event) => update({ video: event.target.value }, true)}><option value="all">All six videos</option>{videos.map((item) => <option value={item.id} key={item.id}>{item.title}</option>)}</select></label>
    </div>
    <div className="review-results" id="review-results" ref={results} tabIndex={-1}><p role="status" aria-live="polite">{filtered.length} of {claims.length} claim records{ready && pages > 1 && ` · Showing ${start + 1}–${start + shown.length}`}</p><div><a href={`${reviewResultsHref(filters)}#review-results`}>Link to these results</a><button type="button" onClick={() => update(defaultReviewFilters, true)}>Reset filters</button></div></div>
    </div>
    {!filtered.length && <p className="review-empty">No claims match these filters. Try another term or reset the filters.</p>}
    {renderGroups(shown)}
    {!ready && <noscript>{renderGroups(filtered.slice(reviewPageSize), "-continued")}</noscript>}
    {ready && pages > 1 && <nav className="research-page-controls" aria-label="Transcript result pages"><button disabled={page === 1} onClick={() => changePage(page - 1)}>Previous page</button><span>Page {page} of {pages}</span><button disabled={page === pages} onClick={() => changePage(page + 1)}>Next page</button></nav>}
  </section>;
}
