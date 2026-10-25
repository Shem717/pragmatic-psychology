import Link from "next/link";
import { isRetiredClaim } from "@/lib/claim-status";
import { ClaimStatusNotice } from "@/components/ClaimStatus";
import { notFound } from "next/navigation";
import { content, getClaim, kindLabel } from "@/lib/content";
import { PageIntro, SourceCard, Bullets } from "@/components/UI";
export function generateStaticParams() {
  return content.claims.map((c) => ({ slug: c.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const c = getClaim((await params).slug);
  return {
    title: c
      ? isRetiredClaim(c)
        ? c.reviewStatus + " · " + c.title
        : c.title
      : "Claim unavailable",
    alternates: { canonical: "/evidence/claims/" + c?.slug },
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const c = getClaim((await params).slug);
  if (!c) notFound();
  if (isRetiredClaim(c)) return <ClaimStatusNotice claim={c} />;
  return (
    <>
      <PageIntro
        eyebrow={c.id + " / " + kindLabel(c.kind)}
        title={c.shortTitle}
        description={c.statement}
      />
      <article className="reading-layout">
        <div>
          <section className="panel section-pad">
            <span className="badge">
              {kindLabel(c.kind)} · {c.population}
            </span>
            <h2>Scope before certainty.</h2>
            <p className="lead">{c.takeaway}</p>
            <h3>What is being claimed</h3>
            <p>{c.scope}</p>
            <h3>Editorial confidence: {c.confidence}</h3>
            <p className="fine">Confidence in this scoped statement, not an efficacy score or a systematic-review grade.</p>
            <p>{c.confidenceRationale}</p>
            <h3>Limitations & counterevidence</h3>
            <Bullets items={c.limitations} />
            <h3>Practical implication</h3>
            <Bullets items={c.implications} />
            <h3>What this does not imply</h3>
            <Bullets items={c.notImplied} />
            <h3>The open question</h3>
            <Bullets items={c.questions} />
          </section>
          <section className="panel section-pad">
            <h2>Evidence & source scope</h2>
            {c.sourceIds.length ? (
              c.sourceIds.map((id) => <SourceCard key={id} id={id} />)
            ) : (
              <p>
                An original integration proposal by Samuel Raymond Clow. No
                direct study establishes its additional efficacy.
              </p>
            )}
          </section>
          {c.challengeSourceIds.length > 0 && (
            <section className="panel section-pad">
              <h2>Challenging or qualifying sources</h2>
              <p className="fine">These sources constrain the scope or offer a contrasting result; they do not necessarily refute every part of the claim.</p>
              {c.challengeSourceIds.map((id) => (
                <SourceCard key={id} id={id} />
              ))}
            </section>
          )}
          <section className="panel section-pad">
            <h2>Revision history</h2>
            {c.history.map((h) => (
              <p key={h.date}>
                <time>{h.date}</time> · {h.change}
              </p>
            ))}
            <p className="fine">
              {c.reviewer}. Review date {c.reviewedAt}; content version{" "}
              {c.contentVersion}. This is not independent clinical validation.
            </p>
          </section>
        </div>
        <aside className="reading-aside">
          <span className="small-label">CONTINUE THE INQUIRY</span>
          <h3>Related research</h3>
          {c.researchQuestionIds.map((id) => (
            <Link key={id} href={"/research/" + id}>
              {id}
            </Link>
          ))}
          <Link href="/evidence/models">Compare rival explanations</Link>
          <Link href="/evidence/sources">Sources and limitations</Link>
          <Link href="/evidence">Return to claim index</Link>
        </aside>
      </article>
    </>
  );
}
