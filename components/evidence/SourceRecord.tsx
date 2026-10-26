import Link from "next/link";
import { ArrowUpRight, ChevronDown, Play, Link2 } from "lucide-react";
import { content, getSource } from "@/lib/content";
import { checkLabels, formatEvidenceDate, sampleDescription, sourceChecks, sourceClaims, sourceType, relationshipLabels } from "@/lib/evidence";
import { getSourceCompanion } from "@/lib/source-companions";
import { SourceCompanion } from "@/components/SourceCompanion";

export function SourceRecord({ id, compact = false }: { id: string; compact?: boolean }) {
  const source = getSource(id);
  if (!source) return <p>Source unavailable: {id}.</p>;
  const links = sourceClaims(id, content.claims);
  const models = content.models.filter((model) => model.sourceIds.includes(id));
  const sample = sampleDescription(source);
  const type = sourceType(source);
  return <article className="source-card source-record" id={`source-${id}`} aria-labelledby={`source-${id}-title`}>
    <div className="source-record-top"><span className="research-eyebrow"><span className="source-catalogue-number">{id}</span>{type}</span>{source.year && <span className="source-year">{source.year}</span>}</div>
    <h3 id={`source-${id}-title`}><a href={source.url}>{source.title}<ArrowUpRight size={17} aria-hidden="true" /></a></h3>
    {source.authors.length > 0 && <p className="source-authors">{source.authors.join(" · ")}</p>}
    <p className="source-summary">{source.summary}</p>
    {source.correctionNote && <div className="source-amendment"><strong>Published update</strong><p>{source.correctionNote}</p>{source.correctionUrl && <a href={source.correctionUrl}>Read the update<ArrowUpRight size={14} aria-hidden="true" /></a>}</div>}
    <div className="source-backlinks"><span><Link2 size={14} aria-hidden="true" />Used in</span>
      {links.map(({ claim, role }) => <Link key={claim.id} href={`/evidence/claims/${claim.slug}`} title={relationshipLabels[role]}>{claim.title}</Link>)}
      {models.map((model) => <Link key={model.id} href={`/evidence/models#model-${model.id}`}>{model.title} model</Link>)}
      {!links.length && !models.length && <span className="source-unlinked">Background bibliography · no direct claim or model link recorded</span>}
    </div>
    <details className="source-study-details" open={!compact}>
      <summary>Scope & review record <span className="sr-only">for {id}</span><ChevronDown size={16} aria-hidden="true" /></summary>
      <div className="source-detail-grid">
        <div><h4>What was accessed</h4><p>{source.accessDepth}</p><dl>
          <dt>Design</dt><dd>{source.design === "See source scope" ? `${type} · see the source summary for the recorded scope.` : source.design}</dd>
          <dt>{type === "Guidance" ? "Scope" : "Population"}</dt><dd>{type === "Guidance" && source.population.startsWith("Not extracted") ? "Guidance scope is described in the summary; no recruited trial population." : source.population}</dd>
          <dt>{type === "Research synthesis" ? "Aggregate sample" : "Study sample"}</dt><dd data-check-state={sample.state}>{sample.text}</dd>
          {!source.authors.length && type !== "Guidance" && <><dt>Author metadata</dt><dd>Not independently extracted.</dd></>}
        </dl></div>
        <div className="source-checks"><h4>Review & verification</h4>{sourceChecks(source).map((check) => <div className="source-check" key={check.label}>
          <div><strong>{check.label}</strong><span className="check-state" data-state={check.state}>{checkLabels[check.state]}</span></div>
          <p>{check.detail}</p><small>{check.date ? <time dateTime={check.date}>{formatEvidenceDate(check.date)}</time> : check.state === "not-applicable" ? "No check date applies" : "Check date not recorded"}</small>
        </div>)}</div>
      </div>
    </details>
    {getSourceCompanion(id) && <details className="source-video-details"><summary><Play size={15} aria-hidden="true" />Video context & its verification limits <span className="sr-only">for {id}</span><ChevronDown size={16} aria-hidden="true" /></summary><SourceCompanion sourceId={id} /><p className="research-fine">Video review date is not recorded. Transcript review, timestamp verification, audiovisual review and verification of scientific claims are separate checks; the review note above states the scope actually recorded.</p></details>}
  </article>;
}
