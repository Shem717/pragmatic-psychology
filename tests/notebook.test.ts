import test from "node:test";
import assert from "node:assert/strict";
import {
  makeDraft,
  parseImport,
  serialize,
  transferSummary,
  MAX_IMPORT_BYTES,
} from "../features/notebook-data";
test("a complete notebook round-trip retains observations and rejects future or malformed imports before storage", () => {
  const d = makeDraft("identity", "Test");
  d.fields = {
    identity: "A synthetic capability",
    note: "<script>never execute me</script>",
  };
  d.observations = [
    {
      id: "o",
      date: new Date().toISOString(),
      type: "imagined",
      outcome: "failed",
      prediction: "Ask a question",
      actual: "Did not ask",
      context: "A rehearsal",
      unintended: "None recorded",
    },
  ];
  assert.deepEqual(parseImport(serialize([d])), [d]);
  assert.throws(() => parseImport("<html><script>alert(1)</script>"));
  assert.throws(() =>
    parseImport(
      JSON.stringify({
        schemaVersion: 99,
        exportedAt: new Date().toISOString(),
        records: [d],
      }),
    ),
  );
  assert.throws(() => parseImport(" ".repeat(MAX_IMPORT_BYTES + 1)));
  assert.throws(() => parseImport(serialize([d, d])));
});
test("rehearsals never count as real-world transfer, and failure remains visible", () => {
  const d = makeDraft("identity", "Test");
  d.observations = [
    {
      id: "o",
      date: new Date().toISOString(),
      type: "imagined",
      outcome: "observed",
      prediction: "p",
      actual: "a",
      context: "c",
      unintended: "",
    },
  ];
  assert.match(transferSummary(d), /not yet tested/);
  d.observations.push({
    ...d.observations[0],
    id: "real",
    type: "real-world",
    outcome: "failed",
  });
  assert.match(transferSummary(d), /1 real-world observation · 1 failed/);
});
test("unknown fields are stripped, text is bounded, unsupported observation types are rejected", () => {
  const d = makeDraft("perspective", "Test");
  const data = JSON.parse(serialize([d]));
  data.records[0].extra = "not allowed";
  assert.equal("extra" in parseImport(JSON.stringify(data))[0], false);
  data.records[0].fields.note = "a".repeat(10001);
  assert.throws(() => parseImport(JSON.stringify(data)));
  data.records[0].fields = {};
  data.records[0].observations = [
    {
      id: "o",
      date: new Date().toISOString(),
      type: "certified",
      outcome: "observed",
      prediction: "",
      actual: "",
      context: "",
      unintended: "",
    },
  ];
  assert.throws(() => parseImport(JSON.stringify(data)));
});
