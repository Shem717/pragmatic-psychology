"use client";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Search, X } from "lucide-react";
import type { Claim, Source } from "@/lib/content";
import { sourceType, sourceTypes, sourceClaims } from "@/lib/evidence";

const PAGE_SIZE = 8;
const subscribeToHydration = () => () => {};
const defaults = { q: "", type: "all", claim: "all", video: false, page: 1 };
export function SourceLibrary({ sources, claims, entries, videoIds }: { sources: Source[]; claims: Claim[]; entries: ReactNode[]; videoIds: string[] }) {
  const [filters, setFilters] = useState(defaults);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const hydrated = useSyncExternalStore(subscribeToHydration, () => true, () => false);
  const hashTarget = useRef<string | null>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const pathname = location.pathname;
    const read = () => {
      if (location.pathname !== pathname) return;
      const p = new URLSearchParams(location.search);
      const id = location.hash.replace("#source-", "");
      const index = location.hash.startsWith("#source-") ? sources.findIndex((s) => s.id === id) : -1;
      if (index >= 0) {
        hashTarget.current = id;
        setFilters({ ...defaults, page: Math.floor(index / PAGE_SIZE) + 1 });
      } else setFilters({ q: p.get("q") ?? "", type: p.get("type") ?? "all", claim: p.get("claim") ?? "all", video: p.get("video") === "1", page: Math.max(1, Math.floor(Number(p.get("page"))) || 1) });
    };
    read();
    window.addEventListener("popstate", read);
    window.addEventListener("hashchange", read);
    return () => { window.removeEventListener("popstate", read); window.removeEventListener("hashchange", read); };
  }, [sources]);
  const visible = sources.filter((source) => {
    const linked = sourceClaims(source.id, claims);
    return (filters.type === "all" || sourceType(source) === filters.type)
      && (filters.claim === "all" || linked.some(({ claim }) => claim.slug === filters.claim))
      && (!filters.video || videoIds.includes(source.id))
      && `${source.id} ${source.title} ${source.authors.join(" ")} ${source.summary} ${source.design} ${linked.map(({ claim }) => claim.title).join(" ")}`.toLowerCase().includes(filters.q.trim().toLowerCase());
  });
  const pages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const page = Math.min(filters.page, pages);
  const shown = hydrated ? visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) : sources;
  useEffect(() => {
    if (!hashTarget.current) return;
    const element = document.getElementById("source-" + hashTarget.current);
    if (element) {
      const details = element.querySelector("details");
      if (details) details.open = true;
      element.scrollIntoView({ block: "start" });
      hashTarget.current = null;
    }
  }, [filters]);
  const update = (next: Partial<typeof defaults>) => {
    hashTarget.current = null;
    const selection = { ...filters, page: 1, ...next };
    const p = new URLSearchParams();
    if (selection.q) p.set("q", selection.q);
    if (selection.type !== "all") p.set("type", selection.type);
    if (selection.claim !== "all") p.set("claim", selection.claim);
    if (selection.video) p.set("video", "1");
    if (selection.page > 1) p.set("page", String(selection.page));
    const hash = location.hash.startsWith("#source-") ? "" : location.hash;
    history.replaceState(null, "", location.pathname + (p.size ? "?" + p : "") + hash);
    setFilters(selection);
  };
  const changePage = (next: number) => {
    update({ page: next });
    resultHeading.current?.focus();
  };
  const filtered = filters.q || filters.type !== "all" || filters.claim !== "all" || filters.video;
  return <section className="source-library" aria-label="Searchable source library">
    <div className="research-filters source-filters">
      <label className="research-search"><span>Search sources</span><div><Search size={18} aria-hidden="true" /><input type="search" placeholder="Title, author, topic or source ID…" value={filters.q} onChange={(e) => update({ q: e.target.value })} /></div></label>
      <button className="research-filter-toggle" aria-expanded={filtersOpen} aria-controls="source-filter-controls" onClick={() => setFiltersOpen(!filtersOpen)}>{filtersOpen ? "Hide filters" : "Show filters"}{(filters.type !== "all" || filters.claim !== "all") && " · Active filters"}</button>
      <div id="source-filter-controls" className="research-filter-controls" data-open={filtersOpen}>
      <label>Source type<select value={filters.type} onChange={(e) => update({ type: e.target.value })}><option value="all">All source types</option>{sourceTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
      <label>Used by claim<select value={filters.claim} onChange={(e) => update({ claim: e.target.value })}><option value="all">All claims & background</option>{claims.map((claim) => <option key={claim.id} value={claim.slug}>{claim.title}</option>)}</select></label>
      </div>
    </div>
    <noscript><p className="research-fine">All sources are shown. Search and pagination are available with JavaScript.</p></noscript>
    <div className="research-results-bar"><h2 ref={resultHeading} tabIndex={-1} className="research-result-count" aria-live="polite">{visible.length ? `${(page - 1) * PAGE_SIZE + 1}–${hydrated ? Math.min(page * PAGE_SIZE, visible.length) : sources.length} of ${visible.length} sources` : "No matching sources"}</h2><label className="check-label"><input type="checkbox" checked={filters.video} onChange={(e) => update({ video: e.target.checked })} />With video context</label>{filtered && <button className="research-text-button" onClick={() => update(defaults)}><X size={15} aria-hidden="true" />Clear filters</button>}</div>
    <div className="source-record-list">{shown.map((source) => <div key={source.id}>{entries[sources.indexOf(source)]}</div>)}</div>
    {!visible.length && <div className="research-empty"><Search size={30} aria-hidden="true" /><h3>No source matches this combination.</h3><p>Try a broader term, or clear the filters to return to the full bibliography.</p><button onClick={() => update(defaults)}>Show all sources</button></div>}
    {hydrated && pages > 1 && <nav className="source-pagination" aria-label="Source pages"><button disabled={page === 1} onClick={() => changePage(page - 1)}><ArrowLeft size={16} aria-hidden="true" />Previous</button><span>Page {page} of {pages}</span><button disabled={page === pages} onClick={() => changePage(page + 1)}>Next<ArrowRight size={16} aria-hidden="true" /></button></nav>}
  </section>;
}
