import type { Claim } from "@/lib/content";
export function ClaimStatusNotice({ claim }: { claim: Claim }) {
  return (
    <section className="panel section-pad prose">
      <span className="eyebrow">{claim.id} / REVISION NOTICE</span>
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
            Read the replacement explanation →
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
      <a href="/evidence/">Return to current evidence →</a>
    </section>
  );
}
