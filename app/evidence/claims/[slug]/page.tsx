import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, ArrowLeft } from "lucide-react";
import { isRetiredClaim } from "@/lib/claim-status";
import { ClaimStatusNotice } from "@/components/ClaimStatus";
import { content, getClaim, kindLabel } from "@/lib/content";
import { claimRelationships, relationshipLabels, formatEvidenceDate, type Relationship } from "@/lib/evidence";
import { SourceCard, Bullets } from "@/components/UI";
import { EvidenceHeading } from "@/components/evidence/EvidenceHeading";
import { evidenceAssertions, evidenceTargetDescription } from "@/lib/evidence-assertions";
import { ClaimTaxonomy } from "@/components/evidence/ClaimTaxonomy";
import { publishedLearningPaths } from "@/lib/learning-paths";
export function generateStaticParams() { return content.claims.map((c) => ({ slug: c.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const c = getClaim((await params).slug);
  return { title: c ? isRetiredClaim(c) ? c.reviewStatus + " · " + c.title : c.title : "Claim unavailable", alternates: { canonical: "/evidence/claims/" + c?.slug } };
}
const roleIntroductions: Record<Relationship, string> = {
  supports: "Evidence relevant to the scoped proposition. Support remains limited to the source’s design, population and outcome.",
  qualifies: "These records constrain interpretation, identify boundaries or leave an extraction question unresolved.",
  conflicts: "Contrasting results within the evidence base. The note identifies what each finding challenges; a conflict does not automatically refute the whole scoped claim.",
  context: "Context, including theory, guidance or a different experimental setting. These connections mark interpretation or transfer limits, not direct evidence for the integrated product.",
};
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const c = getClaim((await params).slug);
  if (!c) notFound();
  if (isRetiredClaim(c)) return <ClaimStatusNotice claim={c} />;
  const relationships = claimRelationships(c);
  const roles = (Object.keys(relationshipLabels) as Relationship[]).filter((role) => relationships.some((r) => r.role === role));
  return <>
    <Link href="/evidence" className="research-back"><ArrowLeft size={15} aria-hidden="true" />All claims</Link>
    <EvidenceHeading room="dossier" eyebrow={`${c.id} / CLAIM DOSSIER`} title={c.shortTitle} description={c.statement} aside={<div className="dossier-stamp"><span className="check-state" data-state="reviewed">Editorially reviewed</span><time dateTime={c.reviewedAt}>{formatEvidenceDate(c.reviewedAt)}</time><span>Version {c.contentVersion}</span></div>} />
    <div className="dossier-layout">
      <aside className="dossier-navigation"><nav aria-label="Sections in this claim"><p className="research-eyebrow">IN THIS DOSSIER</p>{[["scope", "The scoped statement"], ["boundaries", "Limits & boundaries"], ["evidence", "Evidence connections"], ["implications", "Practical implications"], ["questions", "Open questions"], ["history", "Review & history"]].map(([id, label], i) => <a key={id} href={`#${id}`}><span>{String(i + 1).padStart(2, "0")}</span>{label}</a>)}</nav><Link className="button" href={`/evidence?compare=${c.slug}`}>Compare this claim<ArrowUpRight size={15} aria-hidden="true" /></Link><Link href="/evidence/models">Consider rival explanations</Link></aside>
      <article className="dossier-content">
        <section id="scope" className="dossier-section"><p className="research-eyebrow">01 / THE SCOPED STATEMENT</p><h2>Scope before certainty.</h2><p className="dossier-takeaway">{c.takeaway}</p><dl className="dossier-facts"><div><dt>Evidence type</dt><dd>{kindLabel(c.kind)}</dd></div><div><dt>Population / context</dt><dd>{c.population}</dd></div><div><dt>Editorial confidence</dt><dd>{c.confidence}</dd></div></dl><p>{c.scope}</p><h3>Why this confidence level?</h3><p>{c.confidenceRationale}</p><p className="research-fine">Confidence in this scoped statement, not an efficacy score or a systematic-review grade.</p><ClaimTaxonomy claim={c} disciplines={content.disciplines} /></section>
        <section id="boundaries" className="dossier-section"><p className="research-eyebrow">02 / LIMITS & BOUNDARIES</p><h2>Keep the limits in the frame.</h2><div className="dossier-boundaries"><div><h3>Limitations & counterevidence</h3><Bullets items={c.limitations} /></div><div><h3>What this does not imply</h3><Bullets items={c.notImplied} /></div></div></section>
        <section id="evidence" className="dossier-section"><p className="research-eyebrow">03 / EVIDENCE CONNECTIONS</p><h2>{relationships.length ? `${relationships.length} sources. Distinct roles.` : "An integration to test."}</h2><p className="research-fine">Relationship labels are editorial reading aids derived from the saved source scopes. They are not systematic-review grades or independent scientific verification.</p>
          <nav className="dossier-source-jumps" aria-label="Sources connected to this claim">{relationships.map((r) => <a key={r.sourceId} href={`#source-${r.sourceId}`} data-role={r.role}>{r.sourceId}<span>{relationshipLabels[r.role]}</span></a>)}</nav>
          {roles.map((role) => <section className="dossier-relationship-group" data-role={role} key={role}><h3>{relationshipLabels[role]}</h3><p>{roleIntroductions[role]}</p>{relationships.filter((r) => r.role === role).map((r) => <div className="dossier-connected-source" key={r.sourceId}><p className="dossier-relationship-note"><strong>{r.sourceId} · Why it is here</strong>{r.note}</p>{r.target && <details className="dossier-assertion"><summary>Exact proposition &amp; study lineage</summary><dl><div><dt>Proposition addressed</dt><dd>{evidenceTargetDescription(r.target, c)}</dd></div><div><dt>Study / report lineage</dt><dd>{r.studyLineage}</dd></div></dl><p className="research-fine">A lineage label tracks a report or protocol; it does not certify independent replication. Source records are not counts of independent studies.</p><p className="research-fine">{evidenceAssertions.review.reviewer}. Scoped review: {evidenceAssertions.review.date}. {evidenceAssertions.review.scope}</p></details>}<SourceCard id={r.sourceId} compact /></div>)}</section>)}
          {!relationships.length && <p>An original integration proposal by Samuel Raymond Clow. No direct study establishes its additional efficacy.</p>}
        </section>
        <section id="implications" className="dossier-section"><p className="research-eyebrow">04 / PRACTICAL IMPLICATIONS</p><h2>What can follow from this?</h2><Bullets items={c.implications} />{publishedLearningPaths.filter((path) => path.claimIds.includes(c.id)).map((path) => <aside className="callout" key={path.id}><h3>{path.title}</h3><p>{path.summary}</p><Link className="button" href={`/learn/paths/${path.slug}`}>Open the guided educational lesson</Link><p className="research-fine">A declared educational adaptation, not a validated intervention or proof of the custom Rolodex.</p></aside>)}</section>
        <section id="questions" className="dossier-section"><p className="research-eyebrow">05 / OPEN QUESTIONS</p><h2>Where the inquiry continues.</h2><Bullets items={c.questions} /><div className="dossier-research-links">{c.researchQuestionIds.map((id) => <Link key={id} href={`/research/${id}`}><span>{id}</span>{content.research.find((r) => r.id === id)?.summary}<ArrowUpRight size={16} aria-hidden="true" /></Link>)}</div></section>
        <section id="history" className="dossier-section"><p className="research-eyebrow">06 / REVIEW & HISTORY</p><h2>A record that can be revised.</h2><ol className="dossier-history">{c.history.map((entry, i) => <li key={entry.date + i}><time dateTime={entry.date}>{formatEvidenceDate(entry.date)}</time><p>{entry.change}</p></li>)}</ol><p>{c.reviewer}. Editorial review <time dateTime={c.reviewedAt}>{formatEvidenceDate(c.reviewedAt)}</time>; content version {c.contentVersion}.</p><p className="research-fine">This is not independent clinical validation. <Link href="/evidence/sources#review-key">Review and verification states explained.</Link></p></section>
      </article>
    </div>
  </>;
}
