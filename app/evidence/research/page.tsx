import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { ResearchReview } from "@/features/ResearchReview";
import { researchReview } from "@/lib/research-review";
import "./research-review.css";
export const metadata = { title: "Transcript evidence reviews", alternates: { canonical: "/evidence/research/" } };
export default function Page() {
  return <>
    <header className="review-masthead">
      <div className="review-masthead-copy">
        <p className="research-eyebrow">TRANSCRIPT EVIDENCE / THE FIELD REGISTER</p>
        <h1>From a claim<br /><span>to its evidence.</span></h1>
        <p className="review-masthead-lede">Follow six videos through evidence assessments, unresolved questions and personal accounts.</p>
        <p className="review-edition"><span>{researchReview.videos.length} video sources</span><span>Updated {researchReview.updatedAt}</span></p>
      </div>
      <div className="review-masthead-plate" aria-hidden="true">
        <div className="review-masthead-art" />
        <svg viewBox="0 0 400 280" fill="none"><circle cx="236" cy="140" r="115" /><circle cx="236" cy="140" r="98" strokeDasharray="1 8" /><ellipse cx="236" cy="140" rx="151" ry="57" transform="rotate(-31 236 140)" /><path d="M25 140H394M236 8V272M225 140h22M236 129v22" /><circle cx="236" cy="140" r="3" /></svg>
        <span>OBSERVATION / EVIDENCE / LIMITS</span>
      </div>
    </header>
    <details className="review-reading-guide">
      <summary><span><strong>Human scientific review remains pending.</strong><span className="review-notice-context">Pending queue: self-sovereignty topics. Anecdotes are not efficacy evidence.</span></span><span className="review-guide-action">Read scope &amp; limitations <ChevronDown size={16} aria-hidden="true" /></span></summary>
      <div className="review-guide-content">
      <h2>Read each finding at its stated scope.</h2>
      <div className="review-guide-definitions"><p><strong>Evidence assessed</strong> means a specific assertion has received a bounded evidence review; research is linked where identified. An insufficient-evidence finding describes that search, not proof that no evidence exists.</p>
        <p><strong>Pending</strong> means the evidence needed has not yet been resolved. The pending queue includes claims directly relevant to self-direction, decision habits, attention, learning, emotional or identity regulation, chosen relationships, adaptive action, personal resource control or independent functioning. <strong>Anecdotes and proposals</strong> preserve experience and ideas without counting them as efficacy evidence.</p></div>
      <p className="review-scope">{researchReview.reviewNote} Updated {researchReview.updatedAt}. Timestamps follow stored captions; original audio/video fidelity has not been independently verified. This bounded inventory is separate from the <Link href="/evidence">canonical claim catalogue</Link>. It does not cover every possible assertion, replace a systematic review or validate the integrated method.</p>
      </div>
    </details>
    <ResearchReview videos={researchReview.videos} claims={researchReview.claims} />
  </>;
}
