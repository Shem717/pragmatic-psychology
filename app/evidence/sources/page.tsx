import { content } from "@/lib/content";
import { isRetiredClaim } from "@/lib/claim-status";
import { getSourceCompanion } from "@/lib/source-companions";
import { SourceCard } from "@/components/UI";
import { EvidenceHeading } from "@/components/evidence/EvidenceHeading";
import { ReviewKey } from "@/components/evidence/ReviewKey";
import { SharedSourceBackground } from "@/components/SharedSourceBackground";
import { SourceLibrary } from "@/features/evidence/SourceLibrary";
export const metadata = { title: "Source library", alternates: { canonical: "/evidence/sources" } };
export default function Page() {
  return <>
    <EvidenceHeading room="library" eyebrow="THE PUBLIC BIBLIOGRAPHY" title="Return to the source." description="Find the study behind a statement. Keep its design, access depth and limitations attached."
      aside={<a className="research-review-link" href="#review-key">How to read review states <span aria-hidden="true">↗</span></a>} />
    <SourceLibrary sources={content.sources} claims={content.claims.filter((c) => !isRetiredClaim(c))} videoIds={content.sources.filter((s) => getSourceCompanion(s.id)).map((s) => s.id)} entries={content.sources.map((s) => <SourceCard key={s.id} id={s.id} compact />)} />
    <ReviewKey />
    <details className="shared-source-disclosure"><summary><span>Shared historical video context</span><span>One recording · six source connections</span></summary><SharedSourceBackground /></details>
  </>;
}
