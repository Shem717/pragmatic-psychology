import { useRef, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { claimMapLabels } from "@/lib/evidence";
import type { Claim } from "@/lib/content";

const pageSize = 8;
export function CompactClaimList({ claims, active, expanded, compared, onExpand, onCompare, onPage, children }: {
  claims: Claim[]; active?: Claim; expanded: string | null; compared: string[];
  onExpand: (id: string) => void; onCompare: (id: string) => void; onPage: (id: string) => void; children: ReactNode;
}) {
  const list = useRef<HTMLDivElement>(null);
  if (!claims.length) return <p className="research-map-empty">No matching claims. Change the search or clear the filters above.</p>;
  const page = Math.floor(Math.max(0, claims.findIndex((claim) => claim.id === active?.id)) / pageSize);
  const start = page * pageSize;
  const end = Math.min(start + pageSize, claims.length);
  const changePage = (next: number) => {
    onPage(claims[next * pageSize].id);
    requestAnimationFrame(() => list.current?.querySelector<HTMLButtonElement>("button")?.focus());
  };
  return <div className="compact-claims" ref={list}>
    {claims.slice(start, end).map((claim) => {
      const open = expanded === claim.id && active?.id === claim.id;
      const checked = compared.includes(claim.id);
      return <div className="compact-claim" key={claim.id} data-open={open}>
        <div className="compact-claim-controls">
          <button className="compact-claim-title" aria-expanded={open} aria-controls={`detail-${claim.id}`} onClick={() => onExpand(claim.id)}>
            <span className="research-star-dot" aria-hidden="true" /><span>{claimMapLabels[claim.slug] ?? claim.shortTitle}</span><ChevronDown size={16} aria-hidden="true" />
          </button>
          <label><input type="checkbox" checked={checked} disabled={!checked && compared.length >= 3} onChange={() => onCompare(claim.id)} aria-label={`Compare ${claim.title}`} />Compare</label>
        </div>
        <div id={`detail-${claim.id}`} hidden={!open}>{open && children}</div>
      </div>;
    })}
    {claims.length > pageSize && <nav className="research-page-controls" aria-label="Claim pages">
      <button disabled={page === 0} onClick={() => changePage(page - 1)}>Previous</button>
      <span>{start + 1}–{end} of {claims.length}</span>
      <button disabled={end === claims.length} onClick={() => changePage(page + 1)}>Next</button>
    </nav>}
  </div>;
}
