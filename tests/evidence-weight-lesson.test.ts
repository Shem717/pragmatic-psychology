import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { EvidenceWeightLesson } from "../components/EvidenceWeightLesson";

const html = renderToStaticMarkup(createElement(EvidenceWeightLesson));

test("evidence-weight exercise labels fictional data and preserves inference limits", () => {
  assert.match(html, /Everything in this example, including its numbers, is fictional/);
  assert.match(html, /40 ÷ 80 = <strong>50%/);
  assert.match(html, /10 ÷ 20 = <strong>50%/);
  assert.match(html, /40 ÷ 50 = <strong>80%/);
  assert.match(html, /not an 80% success rate among card users/);
  assert.match(html, /do not prove the approaches are equivalent/);
  assert.match(html, /No comparison tests fifty readings/);
  assert.match(html, /no measure identifies a newly installed neural pathway/);
});

test("reasoning lesson retains uncertainty, safety, provenance and no efficacy promise", () => {
  assert.match(html, /not a validated intervention or assessment/);
  assert.match(html, /not a medical or trauma-treatment decision/);
  assert.match(html, /independent human scientific review remains pending/);
  assert.match(html, /educational effectiveness has not been tested/);
  assert.match(html, /No held empirical proposition is accepted/);
  assert.match(html, /not thereby proven false/);
  assert.doesNotMatch(html, /docs\.google|drive\.google|\/workspace\/|W05|W06|PILOT-P/);
});

test("additive discernment placement uses native disclosures and existing opt-in notebook", () => {
  const page = readFileSync("app/learn/curriculum/[slug]/page.tsx", "utf8");
  const learning = readFileSync("features/Learning.tsx", "utf8");
  assert.match(page, /d.slug === "discernment" && <EvidenceWeightLesson/);
  assert.ok(page.indexOf('<EvidenceWeightLesson />') < page.indexOf('<Learning slug='));
  assert.match(html, /href="#learning-record-discernment"/);
  assert.match(learning, /id=\{`learning-record-\$\{slug\}`\}/);
  assert.match(learning, /const key = "learning-" \+ slug/);
  assert.match(learning, /set\("note", e.target.value\)/);
  assert.match(html, /<summary>Show explanation<\/summary>/);
  assert.match(html, /Saving is optional/);
  assert.doesNotMatch(html, /<textarea|<input|<iframe|<script/);
});
