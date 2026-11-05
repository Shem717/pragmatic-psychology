import Link from "next/link";
import { EvidenceHeading } from "@/components/evidence/EvidenceHeading";
import { ResearchReview } from "@/features/ResearchReview";
import { researchReview } from "@/lib/research-review";
import "./research-review.css";
export const metadata = { title: "Transcript evidence reviews", alternates: { canonical: "/evidence/research/" } };
export default function Page() {
  const assessed = researchReview.claims.filter((claim) => claim.category === "assessed").length;
  return <>
    <EvidenceHeading eyebrow="TRANSCRIPT EVIDENCE REVIEWS" title="From a claim to its evidence."
      description="Follow the assertions in six videos to the research behind them. Compare evidence assessments, unresolved questions and personal accounts without treating them as interchangeable."
      aside={<div className="research-counts"><span><strong>{researchReview.videos.length}</strong>videos</span><span><strong>{assessed}</strong>assessments</span></div>} />
    <section className="review-reading-guide" aria-labelledby="review-guide-title">
      <h2 id="review-guide-title">Read each finding at its stated scope.</h2>
      <div><p><strong>Evidence assessed</strong> means a specific assertion has received a bounded evidence review; research is linked where identified. An insufficient-evidence finding describes that search, not proof that no evidence exists.</p>
        <p><strong>Pending</strong> means the evidence needed has not yet been resolved. <strong>Anecdotes and proposals</strong> preserve experience and ideas without counting them as efficacy evidence.</p></div>
      <p className="review-scope">{researchReview.reviewNote} Updated {researchReview.updatedAt}. Timestamps follow stored captions; original audio/video fidelity has not been independently verified. This bounded inventory is separate from the <Link href="/evidence">canonical claim catalogue</Link>. It does not cover every possible assertion, replace a systematic review or validate the integrated method.</p>
    </section>
    <ResearchReview videos={researchReview.videos} claims={researchReview.claims} />
  </>;
}
