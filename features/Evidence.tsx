"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowRight, Search, X, Network } from "lucide-react";
import type { Claim, Source } from "@/lib/content";
import { claimRelationships, relationshipLabels, formatEvidenceDate } from "@/lib/evidence";
import { Constellation } from "./evidence/Constellation";
import { ClaimComparison } from "./evidence/ClaimComparison";
import { EvidenceAtlas } from "./evidence/EvidenceAtlas";
import { ClaimTaxonomy } from "@/components/evidence/ClaimTaxonomy";
import { claimFacet, dispositionLabels, evidenceTaxonomy, filterEvidenceClaims, initialEvidenceFilters, parseEvidenceQuery, serializeEvidenceQuery, type EvidenceCatalog } from "@/lib/evidence-taxonomy";
import atlasStyles from "./evidence/EvidenceAtlas.module.css";

const initialFilters = initialEvidenceFilters;
export function Evidence({ claims, sources, disciplines, models }: { claims: Claim[]; sources: Source[]; disciplines: EvidenceCatalog["disciplines"]; models: EvidenceCatalog["models"] }) {
  const [filters, setFilters] = useState(initialFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selected, setSelected] = useState(claims[0]?.id ?? "");
  const [compare, setCompare] = useState<string[]>([]);
  const [view, setView] = useState<"claims" | "sources">("claims");
  const [ready, setReady] = useState(false);
  const lastSearch = useRef("");
  const inspector = useRef<HTMLElement>(null);
  useEffect(() => {
    const read = () => {
      lastSearch.current = location.search;
      const query = parseEvidenceQuery(location.search, claims);
      setFilters(query.filters); setSelected(query.selected); setCompare(query.compare);
      setReady(true);
    };
    read();
    const onPopState = () => { if (location.search !== lastSearch.current) read(); };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [claims]);
  useEffect(() => {
    if (!ready) return;
    // Keep shareable topic/query state ahead of navigation into a canonical dossier.
    const query = serializeEvidenceQuery(filters, selected, compare, claims);
    history.replaceState(null, "", location.pathname + (query ? "?" + query : "") + location.hash);
    lastSearch.current = location.search;
  }, [filters, selected, compare, claims, ready]);
  const visible = filterEvidenceClaims(claims, filters);
  const active = visible.find((c) => c.id === selected) || visible[0];
  const compared = compare.flatMap((id) => { const c = claims.find((c) => c.id === id); return c ? [c] : []; });
  const relationships = active ? claimRelationships(active) : [];
  const update = (next: Partial<typeof initialFilters>) => setFilters((old) => ({ ...old, ...next }));
  const toggleCompare = (id: string) => setCompare((old) => old.includes(id) ? old.filter((x) => x !== id) : old.length < 3 ? [...old, id] : old);
  const inspect = (id: string, scroll = false) => {
    setSelected(id);
    if (scroll || window.matchMedia("(max-width: 900px)").matches) requestAnimationFrame(() => {
      inspector.current?.focus({ preventScroll: true });
      inspector.current?.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.mode === "Focused" ? "instant" : "smooth" });
    });
  };
  const filtered = filters.q || Object.entries(filters).some(([k, v]) => k !== "q" && v !== "all");
  return <div className={compared.length ? "evidence-desk has-comparison" : "evidence-desk"}>
    <EvidenceAtlas selected={filters.domain} claims={claims} disciplines={disciplines} models={models} onSelect={(domain) => update({ domain })} />
    <div className="research-filters claim-filters" id="claim-search">
      <label className="research-search"><span>Search claims</span><div><Search size={18} aria-hidden="true" /><input type="search" maxLength={500} placeholder="Memory, imagery, confidence…" value={filters.q} onChange={(e) => update({ q: e.target.value })} /></div></label>
      <button className="research-filter-toggle" aria-expanded={filtersOpen} aria-controls="claim-filter-controls" onClick={() => setFiltersOpen(!filtersOpen)}>{filtersOpen ? "Hide filters" : "Show filters"}{[filters.kind, filters.population, filters.confidence].filter((value) => value !== "all").length > 0 && " · Active filters"}</button>
      <div id="claim-filter-controls" className="research-filter-controls" data-open={filtersOpen}>
      <label>Evidence type<select value={filters.kind} onChange={(e) => update({ kind: e.target.value })}><option value="all">All types</option>{Array.from(new Set(claims.map((c) => c.kind))).map((kind) => <option key={kind} value={kind}>{kind.replaceAll("-", " ")}</option>)}</select></label>
      <label>Population / context<select value={filters.population} onChange={(e) => update({ population: e.target.value })}><option value="all">All contexts</option>{Array.from(new Set(claims.map((c) => c.population))).map((population) => <option key={population}>{population}</option>)}</select></label>
      <label>Editorial confidence<select value={filters.confidence} onChange={(e) => update({ confidence: e.target.value })}><option value="all">All levels</option>{Array.from(new Set(claims.map((c) => c.confidence))).map((confidence) => <option key={confidence}>{confidence}</option>)}</select></label>
      </div>
    </div>
    <div className={atlasStyles.additionalFilters}>
      <label>Claim-level curriculum relevance<select value={filters.discipline} onChange={(event) => update({ discipline: event.target.value })}><option value="all">All eight disciplines</option>{disciplines.map((discipline) => <option key={discipline.slug} value={discipline.slug}>{discipline.title}</option>)}</select></label>
      <label>Bounded disposition<select value={filters.disposition} onChange={(event) => update({ disposition: event.target.value })}><option value="all">All disposition summaries</option>{Object.entries(dispositionLabels).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <p className={atlasStyles.filterNote}>The curriculum filter uses each claim’s recorded links; a topic’s broader learning links may differ. These express educational relevance, not validated constructs. Disposition summarizes a scoped proposition; editorial confidence and review process are separate. No filter is a truth or efficacy score.</p>
    </div>
    {filters.domain !== "all" && <div className={atlasStyles.topicResult}><span>Topic: {evidenceTaxonomy.domains.find((domain) => domain.id === filters.domain)?.title}</span><button onClick={() => setFilters({ ...initialFilters, domain: filters.domain })}>Clear other filters · keep this topic</button></div>}
    <div className="research-results-bar"><span role="status">{visible.length} of {claims.length} claims</span><a href="#claim-index">Go to the readable index <ArrowRight size={14} aria-hidden="true" /></a>{filtered && <button className="research-text-button" onClick={() => setFilters(initialFilters)}><X size={15} aria-hidden="true" />Clear filters</button>}</div>
    <div className="research-investigation">
      <Constellation claims={claims} visible={visible} active={active} sources={sources} view={view} onView={setView} onSelect={inspect} />
      <aside className="research-inspector" id="claim-inspector" ref={inspector} tabIndex={-1} aria-labelledby="inspector-title">
        <p className="research-eyebrow">02 / INSPECT THE CLAIM</p>
        {active ? <>
          <span className="research-kind">{active.kind.replaceAll("-", " ")}</span>
          <h2 id="inspector-title">{active.shortTitle}</h2><p className="research-inspector-statement">{active.statement}</p>
          <dl className="research-claim-facts"><div><dt>Population</dt><dd>{active.population}</dd></div><div><dt>Editorial confidence</dt><dd>{active.confidence}</dd></div></dl>
          <div className="research-boundary"><h3>What this does not establish</h3><p>{active.limitations[0]}</p></div>
          <div className="research-inspector-actions"><Link className="button primary" href={`/evidence/claims/${active.slug}`}>Open the dossier<ArrowUpRight size={16} aria-hidden="true" /></Link><button onClick={() => toggleCompare(active.id)} disabled={!compare.includes(active.id) && compare.length >= 3} aria-pressed={compare.includes(active.id)}>{compare.includes(active.id) ? "Added to comparison" : "Add to comparison"}</button></div>
          <ClaimTaxonomy claim={active} disciplines={disciplines} compact domainId={filters.domain} onChooseDomain={(domain) => { setFilters({ ...initialFilters, domain }); setSelected(active.id); }} />
          <div className="research-connections"><div className="research-connections-heading"><h3>{relationships.length} source connections</h3><a className="research-text-button" href="#evidence-constellation" onClick={() => setView("sources")}><Network size={16} aria-hidden="true" />Show on map</a></div>
            {relationships.length ? <ul>{relationships.map((r) => <li key={r.sourceId} data-role={r.role}><Link href={`/evidence/sources#source-${r.sourceId}`}><strong>{r.sourceId}</strong><span>{sources.find((s) => s.id === r.sourceId)?.title}</span><ArrowUpRight size={13} aria-hidden="true" /></Link><small>{relationshipLabels[r.role]}</small></li>)}</ul> : <p>No direct study establishes the integration’s additional efficacy.</p>}
          </div>
          <p className="research-fine">Editorial review <time dateTime={active.reviewedAt}>{formatEvidenceDate(active.reviewedAt)}</time>. <Link href="/evidence/sources#review-key">What review means</Link></p>
        </> : <div className="research-empty"><h2 id="inspector-title">No matching claims.</h2><p>Change the search or filters to return to a record.</p><button onClick={() => setFilters(initialFilters)}>Clear filters</button></div>}
      </aside>
    </div>
    <section className="research-claim-index" id="claim-index" aria-labelledby="claim-index-title"><div className="research-index-heading"><div><p className="research-eyebrow">03 / THE READING INDEX</p><h2 id="claim-index-title">Every claim, at a glance.</h2></div><p>Choose up to three to compare.<br />Selection stays with you while you browse this page.</p></div>
      {visible.map((claim) => <div className="research-claim-row" key={claim.id} data-selected={active?.id === claim.id}><span className="research-row-number">{String(claims.indexOf(claim) + 1).padStart(2, "0")}</span><div><button className="research-claim-select" onClick={() => inspect(claim.id, true)} aria-pressed={active?.id === claim.id}>{claim.title}</button><p>{claim.kind.replaceAll("-", " ")}<span aria-hidden="true"> · </span>{claim.population}</p><div className={atlasStyles.rowFacets}><span>{dispositionLabels[claimFacet(claim.id)?.disposition || 'not-appraised']}</span>{claimFacet(claim.id)?.domainLinks.map((link) => <button key={link.domainId} onClick={() => { setFilters({ ...initialFilters, domain: link.domainId }); setSelected(claim.id); }}>{evidenceTaxonomy.domains.find((domain) => domain.id === link.domainId)?.title}</button>)}</div></div><Link href={`/evidence/claims/${claim.slug}`} aria-label={`Read ${claim.title}`}>Dossier<ArrowUpRight size={14} aria-hidden="true" /></Link><label className="check-label"><input type="checkbox" checked={compare.includes(claim.id)} disabled={!compare.includes(claim.id) && compare.length === 3} onChange={() => toggleCompare(claim.id)} aria-label={`Compare ${claim.title}`} />Compare</label></div>)}
      {!visible.length && <p className="research-empty">No matching claims. <button onClick={() => setFilters(initialFilters)}>Clear filters</button></p>}
    </section>
    <ClaimComparison claims={compared} onRemove={(id) => setCompare((old) => old.filter((x) => x !== id))} onClear={() => setCompare([])} />
  </div>;
}
