import test from "node:test";
import assert from "node:assert/strict";
import { content, validateRelationships } from "../lib/content";
import { claimRelationships, sourceChecks, sourceClaims, sourceType, sampleDescription } from "../lib/evidence";

test("overlapping FMT source references become one connection with a bounded evidence role", () => {
  const claim = content.claims.find((c) => c.slug === "fmt")!;
  const relationships = claimRelationships(claim);
  assert.equal(relationships.length, 5);
  assert.equal(relationships.filter((r) => r.sourceId === "R27").length, 1);
  assert.equal(relationships.find((r) => r.sourceId === "R27")?.role, "conflicts");
  assert.match(relationships.find((r) => r.sourceId === "R27")!.note, /does not contradict/);
  assert.equal(relationships.find((r) => r.sourceId === "R30")?.role, "context");
});
test("source backlinks include challenges, preserve claim identity and omit retired records", () => {
  const links = sourceClaims("R11", content.claims);
  assert.equal(links.length, 1);
  assert.equal(links[0].claim.slug, "reconsolidation");
  assert.equal(links[0].role, "conflicts");
  assert.equal(sourceClaims("R11", [{ ...links[0].claim, reviewStatus: "withdrawn" }]).length, 0);
  const invalid = structuredClone(content);
  invalid.claims[0].challengeSourceIds.push("MISSING");
  assert.ok(validateRelationships(invalid).includes("Missing challenge source MISSING"));
});
test("record dates never imply a completed retraction check or date a different verification", () => {
  for (const source of content.sources) {
    const checks = sourceChecks(source);
    assert.equal(checks.find((c) => c.label === "Editorial record")?.date, source.checkedAt);
    for (const check of checks.filter((c) => c.state === "verified")) assert.equal(check.date, undefined);
    if (sourceType(source) !== "Guidance") {
      const retraction = checks.find((c) => c.label === "Retraction check")!;
      assert.equal(retraction.state, "unknown");
      assert.equal(retraction.date, undefined);
    }
  }
  assert.equal(sourceChecks(content.sources.find((s) => s.id === "R05")!).find((c) => c.label === "Main recommendation")?.state, "verified");
});
test("guidance and theory do not inherit missing trial sample fields; synthesis totals remain unknown", () => {
  const source = (id: string) => content.sources.find((s) => s.id === id)!;
  assert.equal(sampleDescription(source("R05")).state, "not-applicable");
  assert.equal(sampleDescription(source("R14")).state, "not-applicable");
  assert.equal(sampleDescription(source("R10")).state, "unknown");
  assert.equal(sampleDescription(source("R03")).state, "unknown");
  assert.match(sampleDescription(source("R09")).text, /155/);
  const checks = sourceChecks(source("R05"));
  assert.equal(checks.find((c) => c.label === "Journal retraction check")?.state, "not-applicable");
  assert.equal(checks.find((c) => c.label === "Guidance currency")?.state, "unknown");
});
test("all current sources are classified, while a new record remains explicitly unclassified", () => {
  for (const source of content.sources) assert.notEqual(sourceType(source), "Unclassified");
  assert.equal(sourceType({ ...content.sources[0], id: "NEW" }), "Unclassified");
});
