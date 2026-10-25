import test from "node:test";
import assert from "node:assert/strict";
import { content, publicSchema, validateRelationships } from "../lib/content";
test("public records have valid relationships and exclude private provenance", () => {
  assert.deepEqual(validateRelationships(), []);
  const invalid = structuredClone(content);
  invalid.claims[0].sourceIds.push("PRIVATE");
  assert.match(validateRelationships(invalid).join(","), /Missing source/);
  const leak = structuredClone(content);
  leak.claims[0].statement = "private-reference/READABLE-THREAD";
  assert.match(validateRelationships(leak).join(","), /Private source/);
});
test("unreviewed source records cannot become public by accident", () => {
  const d = structuredClone(content) as unknown as {
    claims: { publicationStatus: string }[];
  };
  d.claims[0].publicationStatus = "editorial-review-required";
  assert.equal(publicSchema.safeParse(d).success, false);
});
test("human, animal and normative records keep their distinct evidence status", () => {
  assert.equal(
    content.claims.find((c) => c.slug === "plasticity")?.population,
    "Animal",
  );
  assert.match(
    content.claims.find((c) => c.slug === "fmt")!.limitations.join(" "),
    /adjunctive|monotherapy/,
  );
  assert.equal(
    content.research.find((r) => r.id === "H-020")?.subtype,
    "Normative safety restriction",
  );
  assert.equal(
    content.research.find((r) => r.id === "H-012")?.subtype,
    "Active correction record",
  );
  const replication = content.claims.find((c) => c.slug === "reconsolidation")!;
  assert.ok(replication.sourceIds.includes("R03"));
  assert.ok(replication.challengeSourceIds.includes("R11"));
});

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ClaimStatusNotice } from "../components/ClaimStatus";
import { isRetiredClaim } from "../lib/claim-status";
test("withdrawn and superseded claims retain a revision route without repeating an obsolete proposition", () => {
  const fixture = {
    ...content.claims[0],
    reviewStatus: "withdrawn",
    replacementSlug: "confidence",
    statement: "WITHDRAWN_UNSUPPORTED_FIXTURE",
  };
  assert.equal(isRetiredClaim(fixture), true);
  const html = renderToStaticMarkup(
    createElement(ClaimStatusNotice, { claim: fixture }),
  );
  assert.match(html, /Claim withdrawn/);
  assert.match(html, /evidence\/claims\/confidence/);
  assert.equal(html.includes(fixture.statement), false);
  assert.match(
    renderToStaticMarkup(
      createElement(ClaimStatusNotice, {
        claim: { ...fixture, reviewStatus: "superseded" },
      }),
    ),
    /Claim superseded/,
  );
  assert.equal(isRetiredClaim(content.claims[0]), false);
});
