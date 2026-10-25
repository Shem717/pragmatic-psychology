import Link from "next/link";
import { PageIntro } from "@/components/UI";
export const metadata = {
  title: "About the Observatory",
  alternates: { canonical: "/about" },
};
export default function Page() {
  return (
    <>
      <PageIntro
        eyebrow="PURPOSE / AUTHORSHIP / GOVERNANCE"
        title="An observatory for agency."
        description="A place to investigate how interpretations, practical capacities and evidence shape action."
      />
      <article className="panel section-pad prose">
        <h2>Original framework and contributions</h2>
        <p>
          Samuel Raymond Clow developed the Sovereignty Method and this
          project’s synthesis of eight disciplines, the Perspective Rolodex
          framing, and the Identity-to-Competence integration. This credits
          contributions within the project; it does not establish historical
          priority over all scholarship.
        </p>
        <h2>AI-assisted work, explicitly labeled</h2>
        <p>
          The interface, illustrations, educational scenarios and public
          editorial synthesis were produced with AI assistance. Scientific
          sources retain their authorship. The integration remains a working
          hypothesis; independent human clinical review is pending.
        </p>
        <h2>How claims are handled</h2>
        <p>
          Empirical findings, theoretical models, mechanistic inferences,
          research hypotheses, personal observations and philosophy have
          distinct labels. Each published claim has a scope, limitations,
          sources and a review date. Private working documents are not public
          evidence assets.
        </p>
        <h2>Editorial continuity</h2>
        <p>
          Later corrective addenda govern the public derivative when older
          framework wording conflicts. Historical text remains preserved
          privately. Original videos are retained with current written notes. A
          source revision does not silently become a new scientific finding.
        </p>
        <div className="actions">
          <Link href="/evidence/sources">Evidence and source scope</Link>
          <Link href="/evidence/sources">Public source index</Link>
          <Link href="/about/philosophical-foundations">
            Philosophical foundations
          </Link>
        </div>
      </article>
    </>
  );
}
