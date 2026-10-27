import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { content } from "../lib/content";
import publicRaw from "../content/public.json";
import { getLearningPath, learningPathCatalog, learningPathCatalogSchema, publishedLearningPaths, validateLearningPaths } from "../lib/learning-paths";
import { deriveLearningProfile, hasLearningPathReflection, isLearningPathField, pathFieldKey, pathRecordFields, proposedMilestones } from "../lib/learning-path-records";
import { makeDraft, parseImport, serialize } from "../features/notebook-data";
import { hasMeaningfulDraftWork } from "../features/notebook-model";
import { learningRecordSummary, notebookFieldLabel, supportingPracticeFieldKey } from "../lib/supporting-practice-records";
import { supportingPractices } from "../lib/supporting-practices";
import { getSourceCompanion } from "../lib/source-companions";
import { sampleDescription, sourceChecks, sourceType } from "../lib/evidence";

test("one published path has six scoped propositions, valid existing references and a distinct adjacent hypothesis", () => {
  assert.equal(publishedLearningPaths.length, 1);
  assert.deepEqual(validateLearningPaths(), []);
  const path = getLearningPath("perspective-fit")!;
  assert.equal(path.primaryDiscipline, "discernment");
  assert.deepEqual(path.sourceIds, ["R15", "R16"]);
  assert.deepEqual(path.claimIds, ["CL-flexibility"]);
  assert.ok(path.researchIds.includes("H-005"));
  assert.equal(path.researchIds.includes("H-007"), false);
  assert.deepEqual(path.adjacentResearchIds, ["H-007"]);
  assert.equal(path.passports.length, 6);
  assert.equal(getLearningPath("missing"), undefined);
  assert.match(path.review.scope, /separate AI-assisted.*not a systematic review.*human scientific review remains pending/i);
  assert.match(path.sourceEvolution, /different approaches[\s\S]*not a single unchanging protocol[\s\S]*not audio verification/);
  assert.doesNotMatch(JSON.stringify(learningPathCatalog), /workspace\/|drive\.google|docs\.google|READABLE-THREAD|V4 B16|Curriculum Part IX/);
});

test("publication is rejected when reviewed copy, self-check explanations or prompt coverage are missing", () => {
  const copy = structuredClone(learningPathCatalog);
  copy.paths[0].lesson = [];
  assert.equal(learningPathCatalogSchema.safeParse(copy).success, false);
  copy.paths[0].publicationStatus = "editorial-review-required";
  assert.equal(learningPathCatalogSchema.safeParse(copy).success, true);
  const invalid = structuredClone(learningPathCatalog);
  invalid.paths[0].sourceIds.push("UNVERIFIED");
  assert.ok(validateLearningPaths(invalid).includes("Missing learning path source UNVERIFIED"));
  invalid.paths[0].passports[0].sourceIds.push("UNVERIFIED");
  assert.ok(validateLearningPaths(invalid).includes("Missing proposition source UNVERIFIED"));
  const missingPrompt = structuredClone(learningPathCatalog);
  delete missingPrompt.paths[0].prompts.facts;
  assert.equal(learningPathCatalogSchema.safeParse(missingPrompt).success, false);
});

test("the 24 original source records outside reviewed habit, emotion and perception upgrades remain byte-equivalent", () => {
  const digest = createHash("sha256").update(JSON.stringify(publicRaw.sources.slice(0, 31).filter((source) => !["R04", "R11", "R19", "R20", "R15", "R16", "R21"].includes(source.id)))).digest("hex");
  assert.equal(digest, "2c01ba924b1d99a79a118a85c35da6a295f631ec66d11b703ee115773cc3d2a2");
  assert.deepEqual(content.sources.slice(31).map((source) => source.id), ["R32", "R33", "R34", "R35", "R36", "R37", "R38", "R39", "R40", "R41", "R42", "R43", "R44", "R45", "R46", "R47", "R48", "R49", "R50", "R51", "R52", "R53", "R54", "R55", "R56", "R57", "R58", "R59", "R60", "R61", "R62", "R63", "R64", "R65", "R66", "R67", "R68", "R69", "R70", "R71", "R72", "R73", "R74", "R75", "R76", "R77", "R78", "R79", "R80", "R81", "R82", "R83", "R84", "R85"]);
  for (const source of content.sources.slice(31)) {
    assert.equal(source.retractionStatus, "unknown");
    assert.equal(getSourceCompanion(source.id), undefined);
    assert.equal(sourceChecks(source).find((check) => check.label === "Retraction check")?.state, "unknown");
  }
  assert.equal(sourceType(content.sources.find((source) => source.id === "R38")!), "Methods & reporting");
  assert.equal(sampleDescription(content.sources.find((source) => source.id === "R38")!).state, "not-applicable");
  assert.equal(content.videos.length, 7);
  assert.equal(supportingPractices.length, 8);
});

test("all old draft types, eight discipline notes and every supporting/path field round-trip without schema or ID changes", () => {
  const records = [makeDraft("identity", "Synthetic identity"), makeDraft("perspective", "Synthetic perspective"), ...content.disciplines.map((discipline) => {
    const draft = makeDraft("learning", discipline.title);
    draft.fields = { discipline: discipline.slug, note: `Existing ${discipline.slug} note`, rubric: "2", legacy_custom_field: "Preserve unknown string fields" };
    for (const practice of supportingPractices.filter((item) => item.discipline === discipline.slug)) for (const field of practice.fields) draft.fields[supportingPracticeFieldKey(practice.id, field.key)] = `Synthetic ${field.key}`;
    return draft;
  })];
  const prior = structuredClone(records);
  const learning = records.find((record) => record.fields.discipline === "discernment")!;
  for (const { key } of pathRecordFields) {
    const field = pathFieldKey(key);
    assert.ok(field.length <= 80);
    assert.ok(isLearningPathField(field));
    assert.match(notebookFieldLabel(field), /Perspective-fit path —/);
    learning.fields[field] = `Synthetic ${key}`;
  }
  learning.fields[pathFieldKey("outcome")] = "failed";
  learning.fields[pathFieldKey("observationType")] = "real-world";
  const restored = parseImport(serialize(records));
  assert.deepEqual(restored, records);
  for (let index = 0; index < prior.length; index++) {
    assert.equal(restored[index].id, prior[index].id);
    assert.equal(restored[index].schemaVersion, 1);
    for (const [key, value] of Object.entries(prior[index].fields)) assert.equal(restored[index].fields[key], value);
  }
  assert.equal(learningRecordSummary(learning.fields), "Existing discernment note");
  assert.equal(notebookFieldLabel("unknown_old_key"), "unknown_old_key");
});

test("blank and wrong-discipline fields are not work; explicit menu choices are guarded but not reflection evidence", () => {
  const draft = makeDraft("learning", "Discernment");
  draft.fields = { discipline: "discernment", rubric: "0", path_version: "1", [pathFieldKey("facts")]: "  ", path_unknown_field: "Not an allowed evidence key" };
  assert.equal(hasMeaningfulDraftWork(draft), false);
  draft.fields[pathFieldKey("observationType")] = "imagined";
  assert.equal(hasMeaningfulDraftWork(draft), true, "An explicitly selected value must not be silently lost");
  assert.equal(hasLearningPathReflection(draft.fields), false);
  assert.equal(deriveLearningProfile([draft]).find((row) => row.discipline === "discernment")!.pathRecordCount, 0);
  draft.fields[pathFieldKey("facts")] = "The draft contains a factual error";
  assert.equal(hasLearningPathReflection(draft.fields), true);
  draft.fields.discipline = "awareness";
  assert.equal(hasMeaningfulDraftWork(draft), false);
  assert.equal(hasLearningPathReflection(draft.fields), false);
});

test("the derived profile retains failed/inconclusive outcomes without awarding mastery or ranks", () => {
  const draft = makeDraft("learning", "Discernment");
  draft.fields = { discipline: "discernment", rubric: "4", [pathFieldKey("facts")]: "Synthetic observation", [pathFieldKey("outcome")]: "failed", [pathFieldKey("transferObserved")]: "Still uncertain" };
  const another = structuredClone(draft);
  another.id = "other";
  another.fields[pathFieldKey("outcome")] = "inconclusive";
  const before = JSON.stringify([draft, another]);
  const profile = deriveLearningProfile([draft, another]);
  assert.equal(profile.length, 8);
  const row = profile.find((item) => item.discipline === "discernment")!;
  assert.equal(row.rating, 4);
  assert.deepEqual(row.outcomes, ["failed", "inconclusive"]);
  assert.equal("rank" in row, false);
  assert.equal("mastery" in row, false);
  assert.equal(JSON.stringify([draft, another]), before, "Projection must not mutate imported records");
  draft.fields.rubric = "99";
  assert.equal(deriveLearningProfile([draft]).find((item) => item.discipline === "discernment")!.rating, 0);
  assert.equal(proposedMilestones.length, 5);
});

test("self-check is explanatory and ephemeral; source context comes before private fields and saving uses existing controls", () => {
  const check = getLearningPath("perspective-fit")!.selfCheck!;
  assert.equal(check.options.length, 3);
  for (const option of check.options) assert.ok(option.feedback.length > 20);
  const selfCheck = readFileSync(new URL("../features/learning-paths/PathSelfCheck.tsx", import.meta.url), "utf8");
  assert.match(selfCheck, /type="radio"/);
  assert.match(selfCheck, /not saved, scored or used to assign a rank/);
  const route = readFileSync(new URL("../app/learn/paths/[slug]/page.tsx", import.meta.url), "utf8");
  assert.ok(route.indexOf("<SourceCard") < route.indexOf("<PathReflection"));
  assert.ok(route.indexOf("<SourceMoment") < route.indexOf("<PathReflection"));
  assert.ok(route.indexOf('id="worked-example"') < route.indexOf("<SourceMoment"));
  assert.ok(route.indexOf("<SourceMoment") < route.indexOf("<PathSelfCheck"));
  assert.match(route, /Optional: open the Perspective Rolodex/);
  const reflection = readFileSync(new URL("../features/learning-paths/PathReflection.tsx", import.meta.url), "utf8");
  assert.match(reflection, /<DraftActions draftKey=/);
  assert.match(reflection, /hidden=\{activeStage !== index\}/);
  assert.match(reflection, /<legend tabIndex=\{-1\}/);
  assert.match(reflection, /stageHeadings\.current\[activeStage\]\?\.focus\(\)/);
  assert.match(reflection, /onClick=\{\(\) => goToStage/);
  assert.doesNotMatch(reflection, /fetch\(|writeDrafts|localStorage|indexedDB/);
  const profile = readFileSync(new URL("../features/learning-paths/LearningProfile.tsx", import.meta.url), "utf8");
  assert.match(profile, /readExistingDrafts/);
  assert.match(profile, /data-storage-state=/);
  assert.doesNotMatch(profile, /writeDrafts|setDraft|getDraft|\.save\(/);
});
