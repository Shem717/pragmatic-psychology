import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { getSource, kindLabel, type Claim } from "@/lib/content";
export function PageIntro({
  eyebrow,
  title,
  accent,
  description,
  meta,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  description: string;
  meta?: string;
}) {
  return (
    <div className="page-intro">
      <div className="eyebrow">{eyebrow}</div>
      <div className="intro-line">
        <h1>
          {title}
          {accent && (
            <>
              <br />
              <em>{accent}</em>
            </>
          )}
        </h1>
        {meta && <span className="intro-meta">✦ {meta}</span>}
      </div>
      <p>{description}</p>
    </div>
  );
}
export function EducationalNote() {
  return (
    <p className="educational-note">
      Research-informed education. These instruments do not diagnose, measure a
      brain mechanism, or establish treatment efficacy.
    </p>
  );
}
export function Panel({
  label,
  children,
  className = "",
  id,
}: {
  label?: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`panel ${className}`}>
      {label && <div className="panel-top">{label}</div>}
      {children}
    </section>
  );
}
export function SourceCard({ id }: { id: string }) {
  const s = getSource(id);
  if (!s) return <p>Source unavailable: {id}.</p>;
  return (
    <article className="source-card">
      <span className="small-label">{s.id} · SOURCE</span>
      <h3>
        <a href={s.url}>{s.title} <ArrowUpRight size={16} aria-hidden="true" /></a>
      </h3>
      <p>{s.summary}</p>
      <dl>
        <dt>Access depth</dt>
        <dd>{s.accessDepth}</dd>
        <dt>Design</dt><dd>{s.design}</dd>
        <dt>Population</dt><dd>{s.population}</dd>
        <dt>Sample size</dt><dd>{s.sampleSize === null ? (/theor|guidance|review|framework/i.test(s.design) ? "Not applicable to this source type; see design and scope." : "Not independently extracted in this review.") : s.sampleSize + " (see study scope)"}</dd>
        <dt>Status checked</dt>
        <dd>{s.checkedAt} · Retraction status unknown</dd>
      </dl>
      {s.correctionNote && <p className="source-update"><strong>Current source note:</strong> {s.correctionNote} {s.correctionUrl && <a href={s.correctionUrl}>Read the published update <ArrowUpRight size={14} aria-hidden="true" /></a>}</p>}
    </article>
  );
}
export function ClaimSummary({ claim }: { claim: Claim }) {
  return (
    <article className="editorial-row">
      <div>
        <span className="badge">{kindLabel(claim.kind)}</span>
        <h2>
          <Link href={"/evidence/claims/" + claim.slug}>
            {claim.shortTitle} ↗
          </Link>
        </h2>
        <p>{claim.statement}</p>
      </div>
      <span className="row-aside">
        {claim.population}
        <br />
        {claim.confidence} confidence
      </span>
    </article>
  );
}
export function Bullets({ items }: { items: string[] }) {
  return (
    <ul>
      {items.map((x, i) => (
        <li key={i}>{x}</li>
      ))}
    </ul>
  );
}
