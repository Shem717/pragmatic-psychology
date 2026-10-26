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
  const ready = useRef(false);
  const lastSearch = useRef("");
  const hashTarget = useRef<string | null>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const read = () => {
      lastSearch.current = location.search;
      const p = new URLSearchParams(location.search);
      const id = location.hash.replace("#source-", "");
      const index = location.hash.startsWith("#source-") ? sources.findIndex((s) => s.id === id) : -1;
      if (index >= 0) {
        hashTarget.current = id;
        setFilters({ ...defaults, page: Math.floor(index / PAGE_SIZE) + 1 });
      } else setFilters({ q: p.get("q") ?? "", type: p.get("type") ?? "all", claim: p.get("claim") ?? "all", video: p.get("video") === "1", page: Math.max(1, Math.floor(Number(p.get("page"))) || 1) });
    };
    read(); ready.current = true;
    const onPopState = () => { if (location.search !== lastSearch.current) read(); };
    const onHashChange = () => { if (location.hash.startsWith("#source-")) read(); };
    window.addEventListener("popstate", onPopState);
    window.addEventListener("hashchange", onHashChange);
    return () => { window.removeEventListener("popstate", onPopState); window.removeEventListener("hashchange", onHashChange); };
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
    if (!ready.current) return;
    // Settle the address before a source link can begin a route transition.
    // A delayed history write can restore this page while its dossier is opening.
    const p = new URLSearchParams();
    if (filters.q) p.set("q", filters.q);
    if (filters.type !== "all") p.set("type", filters.type);
    if (filters.claim !== "all") p.set("claim", filters.claim);
    if (filters.video) p.set("video", "1");
    if (page > 1) p.set("page", String(page));
    history.replaceState(null, "", location.pathname + (p.size ? "?" + p : "") + location.hash);
    lastSearch.current = location.search;
  }, [filters, page]);
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
    if (location.hash.startsWith("#source-")) history.replaceState(null, "", location.pathname + location.search);
    setFilters((old) => ({ ...old, ...next, page: 1 }));
  };
  const changePage = (next: number) => {
    if (location.hash.startsWith("#source-")) history.replaceState(null, "", location.pathname + location.search);
    setFilters((old) => ({ ...old, page: next }));
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
