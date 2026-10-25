import { ArrowRight, Archive } from "lucide-react";
import type { Claim } from "@/lib/content";
export function ClaimStatusNotice({ claim }: { claim: Claim }) {
  return (
    <section className="panel section-pad prose archive-status">
      <Archive className="archive-nav-icon" size={32} aria-hidden="true" /><span className="eyebrow">{claim.id} / REVISION NOTICE</span>
      <h1>
        {claim.reviewStatus === "withdrawn"
          ? "Claim withdrawn."
          : "Claim superseded."}
      </h1>
      <p>
        This address is preserved for continuity. The earlier statement is no
        longer presented as a current claim.
      </p>
      {claim.replacementSlug ? (
        <p>
          <a href={"/evidence/claims/" + claim.replacementSlug + "/"}>
            Read the replacement explanation <ArrowRight size={17} aria-hidden="true" />
          </a>
        </p>
      ) : (
        <p>No replacement explanation has been designated.</p>
      )}
      <h2>Revision history</h2>
      {claim.history.map((h, i) => (
        <p key={i}>
          <time>{h.date}</time> · {h.change}
        </p>
      ))}
      <a href="/evidence/">Return to current evidence <ArrowRight size={17} aria-hidden="true" /></a>
    </section>
  );
}
