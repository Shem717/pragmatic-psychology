export function isRetiredClaim(claim: { reviewStatus: string }) {
  return (
    claim.reviewStatus === "withdrawn" || claim.reviewStatus === "superseded"
  );
}
