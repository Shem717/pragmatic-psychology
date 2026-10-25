import Link from "next/link";
import { Telescope, BookOpen, Orbit, ArrowUpRight } from "lucide-react";
import { content } from "@/lib/content";
import { PageIntro } from "@/components/UI";
import { Evidence } from "@/features/Evidence";
export const metadata = {
  title: "Evidence Observatory",
  alternates: { canonical: "/evidence" },
};
export default function Page() {
  return (
    <div className="archive-route archive-observatory">
      <PageIntro scene="observatory"
        eyebrow="III / THE EVIDENCE OBSERVATORY"
        title="Follow the evidence."
        accent="Keep the questions open."
        description="Investigate the claim, its scope, its limits and the questions it leaves behind."
        meta={`${content.claims.length} claims · ${content.sources.length} sources · ${content.research.length} research records`}
      />
      <nav className="archive-nav" aria-label="Ways to investigate the evidence">
        <a href="#claim-observatory"><Telescope className="archive-nav-icon" size={27} aria-hidden="true" /><span><small>I / INSPECT</small><strong>Explore the claims</strong><span>Read the scope before the certainty.</span></span><ArrowUpRight size={19} aria-hidden="true" /></a>
        <Link href="/evidence/sources"><BookOpen className="archive-nav-icon" size={27} aria-hidden="true" /><span><small>II / TRACE</small><strong>Follow the sources</strong><span>Study design, access depth and limits.</span></span><ArrowUpRight size={19} aria-hidden="true" /></Link>
        <Link href="/evidence/models"><Orbit className="archive-nav-icon" size={27} aria-hidden="true" /><span><small>III / COMPARE</small><strong>Consider rival models</strong><span>Different explanations. Testable predictions.</span></span><ArrowUpRight size={19} aria-hidden="true" /></Link>
      </nav>
      <div id="claim-observatory"><Evidence claims={content.claims} /></div>
    </div>
  );
}
