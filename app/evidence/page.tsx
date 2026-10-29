import Link from "next/link";
import { content } from "@/lib/content";
import { isRetiredClaim } from "@/lib/claim-status";
import { EvidenceHeading } from "@/components/evidence/EvidenceHeading";
import { Evidence } from "@/features/Evidence";
export const metadata = { title: "Evidence Observatory", alternates: { canonical: "/evidence" } };
export default function Page() {
  const claims = content.claims.filter((c) => !isRetiredClaim(c));
  return <>
    <EvidenceHeading eyebrow="THE EVIDENCE OBSERVATORY" title="Follow the evidence."
      description="A claim is the beginning of an inquiry. Explore its sources, compare its scope, and keep its limits in view."
      aside={<div className="research-counts"><span><strong>{claims.length}</strong>claims</span><span><strong>{content.sources.length}</strong>sources</span><span><strong>{content.models.length}</strong>models</span></div>} />
    <p className="research-fine"><Link href="/evidence/source-qualifications/">Source qualifications</Link> — bounded researcher-authored notes, separate from canonical claims.</p>
    <Evidence claims={claims} sources={content.sources} disciplines={content.disciplines} models={content.models} />
  </>;
}
