import Link from "next/link";
import { notFound } from "next/navigation";
import { content, getClaim } from "@/lib/content";
import { getLearningPath, publishedLearningPaths } from "@/lib/learning-paths";
import { PageIntro, SourceCard } from "@/components/UI";
import { PathReflection } from "@/features/learning-paths/PathReflection";
import { PathSelfCheck } from "@/features/learning-paths/PathSelfCheck";
import { SourceMoment } from "@/components/SourceMoment";
import styles from "@/features/learning-paths/LearningPath.module.css";
import "@/app/evidence/evidence.css";
export const dynamicParams = false;
export function generateStaticParams() { return publishedLearningPaths.map((path) => ({ slug: path.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: getLearningPath(slug)?.title ?? "Learning path unavailable", alternates: { canonical: `/learn/paths/${slug}` } };
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const path = getLearningPath((await params).slug);
  if (!path) notFound();
  return <>
    <PageIntro scene="curriculum" eyebrow="GUIDED LEARNING / PERSPECTIVE FIT" title={path.title} description={path.summary} />
    <nav aria-label="Sections in this learning path" className={styles.navigation}>
      <a href="#path-evidence">Sources & limits</a><a href="#path-lesson">The lesson</a><a href="#worked-example">Fictional example</a><a href="#path-check">Try a self-check</a><a href="#reflection">Optional reflection</a><Link href="/learn/profile">Formative profile</Link>
    </nav>
    <section className={`panel section-pad ${styles.section}`} aria-labelledby="path-purpose-title">
      <h2 id="path-purpose-title">What this lesson is for.</h2>
      <ul>{path.outcomes.map((outcome) => <li key={outcome}>{outcome}</li>)}</ul>
      <div className="callout"><ul>{path.boundaries.map((boundary) => <li key={boundary}>{boundary}</li>)}</ul></div>
      <p className="fine">{path.review.reviewer}. {path.review.scope} Version {path.version} · <time dateTime={path.review.date}>{path.review.date}</time>.</p>
    </section>
    <section id="path-evidence" className={styles.section} aria-labelledby="path-evidence-title">
      <h2 id="path-evidence-title">Begin with the sources, not a promise.</h2>
      <p>The existing claim and source records retain their scope, correction notes and verification limits. Video companions are secondary context, not independent confirmation of this lesson.</p>
      <div className="actions">{path.claimIds.map((id) => { const claim = getClaim(id)!; return <Link key={id} href={`/evidence/claims/${claim.slug}`}>{id} · {claim.title}</Link>; })}</div>
      <div className={styles.sources}>{path.sourceIds.map((id) => <SourceCard key={id} id={id} compact />)}</div>
      <details className="panel section-pad"><summary>Proposed research questions—not established outcomes</summary>
        <ul>{path.researchIds.map((id) => <li key={id}><Link href={`/research/${id}`}>{id}</Link> · {content.research.find((item) => item.id === id)?.summary}</li>)}</ul>
        <h3>Adjacent, distinct hypothesis</h3><p>Allowing an emotion and choosing conduct is not the same proposition as context-sensitive perspective selection. Its evidence must not be inherited from the flexibility claim.</p>
        <ul>{path.adjacentResearchIds.map((id) => <li key={id}><Link href={`/research/${id}`}>{id}</Link> · {content.research.find((item) => item.id === id)?.summary}</li>)}</ul>
      </details>
    </section>
    <section id="path-lesson" className={`panel section-pad ${styles.section}`} aria-labelledby="path-lesson-title">
      <h2 id="path-lesson-title">Keep these distinctions separate.</h2>
      <ol className={styles.steps}>{path.lesson.map((block) => <li key={block.id}><h3>{block.title}</h3>{block.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</li>)}</ol>
      <details><summary>Inspect the six propositions and their evidence limits</summary>
        {path.passports.map((passport) => <article key={passport.id} className={styles.passport}>
          <p className="eyebrow">{passport.id} · {passport.claimType}</p><h3>{passport.statement}</h3><p><strong>{passport.disposition}</strong></p>
          <div className="actions">{passport.sourceIds.map((id) => <Link key={id} href={`/evidence/sources#source-${id}`}>{id} · evidence/context</Link>)}{passport.qualificationSourceIds.map((id) => <Link key={id} href={`/evidence/sources#source-${id}`}>{id} · qualification</Link>)}</div>
          {!passport.sourceIds.length && <p className="fine">An educational design rule, not a directly validated intervention.</p>}
          <dl><dt>Assumptions and scope</dt><dd>{passport.assumptions}</dd><dt>What would change the conclusion?</dt><dd>{passport.revisionCondition}</dd><dt>Possible future evaluation—not a study running here</dt><dd>{passport.evaluation}</dd></dl>
          <p><strong>Not implied:</strong> {passport.notImplied.join("; ")}.</p>
        </article>)}
      </details>
      <details className={styles.sourceContext}><summary>{path.sourceContext.title}</summary>
        <p>{path.sourceEvolution}</p><p className="fine">{path.sourceContext.notice}</p>
        {path.sourceContext.anchors.map((anchor) => <article className={styles.passport} key={anchor.videoId}>
          <h3>{anchor.title}</h3><p className="fine">{anchor.role} · Published <time dateTime={anchor.publishedDate}>{anchor.publishedDate}</time></p>
          <p>{anchor.attribution}</p><SourceMoment url={anchor.url} label={`Caption landmark · ${anchor.role}`} />
        </article>)}
      </details>
    </section>
    <section id="worked-example" className={`panel section-pad ${styles.section}`} aria-labelledby="path-example-title">
      <span className="eyebrow">FICTIONAL / NO PERSONAL DISCLOSURE NEEDED</span><h2 id="path-example-title">Walk through an ordinary example.</h2>
      <div className={styles.example}>{path.example.map((block) => <div key={block.id}><h3>{block.title}</h3>{block.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>)}</div>
    </section>
    <section id="path-check" className={`panel section-pad ${styles.section}`} aria-labelledby="path-check-title">
      <h2 id="path-check-title">What if new facts arrive?</h2>{path.selfCheck && <PathSelfCheck check={path.selfCheck} />}
      <div className="actions"><Link href="/explore/perspectives">Optional: open the Perspective Telescope</Link><a href="#reflection">Use the text reflection below</a></div>
    </section>
    <PathReflection prompts={path.prompts} labels={path.fieldLabels} />
    <nav aria-label="Continue learning" className={styles.navigation}><Link href="/learn">All eight disciplines</Link><Link href="/learn/profile">Formative profile</Link><Link href="/evidence/claims/flexibility">Return to the flexibility dossier</Link></nav>
  </>;
}
