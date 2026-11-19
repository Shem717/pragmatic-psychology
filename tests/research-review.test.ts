import test from "node:test";
import assert from "node:assert/strict";
import { defaultReviewFilters, readReviewLocation, researchReview, reviewPageSize, reviewResultsHref, validateResearchReview, selectResearchClaims, researchVideoHref } from "../lib/research-review";

test("research links preserve combined filters and paging, and older record bookmarks reveal the correct page", () => {
  const { claims, videos } = researchReview;
  const filters = { ...defaultReviewFilters, category: "assessed", page: 2 };
  const href = new URL(reviewResultsHref(filters), "https://example.org");
  assert.deepEqual(readReviewLocation(href.search, "", claims, videos).filters, filters);
  const anchor = "#HEALTH-SO14";
  const direct = readReviewLocation("?category=pending", anchor, claims, videos);
  assert.equal(direct.target, anchor.slice(1));
  assert.equal(direct.filters.category, "all");
  assert.ok(claims.slice((direct.filters.page - 1) * reviewPageSize, direct.filters.page * reviewPageSize).some((item) => item.id === direct.target));
  const narrowed = readReviewLocation("?category=assessed&q=loneliness&video=zXJcAu654aE", anchor, claims, videos);
  assert.equal(narrowed.filters.q, "loneliness");
  assert.equal(narrowed.filters.category, "assessed");
  assert.equal(readReviewLocation("?q=absent-text&page=88", "", claims, videos).filters.page, 1);
});

test("research queue preserves six exact video identities and separates review stages", () => {
  assert.deepEqual([...researchReview.videos.map((video) => video.id)].sort(), ["nOlFdbMaIk8", "spTE65zX6Oo", "Y9RzF8TxOqY", "zXJcAu654aE", "ZFLGxjha-WU", "x01P-jHc9j8"].sort());
  assert.deepEqual(validateResearchReview(), []);
  for (const category of ["assessed", "pending", "anecdote"]) assert.ok(researchReview.claims.some((claim) => claim.category === category), `Missing ${category} records`);
});

test("public research data contains no private provenance or recovery internals", () => {
  const text = JSON.stringify(researchReview);
  assert.doesNotMatch(text, /drive\.google\.com|docs\.google\.com|samuelrclow@|\/workspace\/|\/Users\/|compact.chain|finalizer|source39|durable299/i);
});

test("review filters combine video, category and case-insensitive evidence search", () => {
  const example = researchReview.claims.find((claim) => claim.category === "assessed")!;
  const selected = selectResearchClaims(researchReview.claims, example.claim.toUpperCase(), "assessed", example.videoId);
  assert.ok(selected.some((claim) => claim.id === example.id));
  assert.ok(selected.every((claim) => claim.category === "assessed" && claim.videoId === example.videoId));
  assert.equal(selectResearchClaims(researchReview.claims, "zzzz-no-matching-claim-zzzz", "all", "all").length, 0);
  assert.equal(selectResearchClaims(researchReview.claims, "", "all", "all").length, researchReview.claims.length);
});

test("source passage links preserve exact timestamps without inventing description times", () => {
  assert.equal(researchVideoHref("spTE65zX6Oo", "16:12–17:10"), "https://www.youtube.com/watch?v=spTE65zX6Oo&t=972s");
  assert.equal(researchVideoHref("ZFLGxjha-WU", "01:00:00–01:00:26"), "https://www.youtube.com/watch?v=ZFLGxjha-WU&t=3600s");
  assert.equal(researchVideoHref("ZFLGxjha-WU", "Description / untimed"), "https://www.youtube.com/watch?v=ZFLGxjha-WU");
});

test("a negative search finding requires its scope, while positive findings require evidence", () => {
  const item = researchReview.claims.find((claim) => claim.category === "assessed" && !claim.sources.length)!;
  assert.equal(item.verdict, "insufficient_evidence");
  assert.ok(item.reviewScope);
  assert.deepEqual(validateResearchReview({ ...researchReview, claims: [item] }), []);
  assert.ok(validateResearchReview({ ...researchReview, claims: [{ ...item, reviewScope: undefined }] }).length);
  assert.ok(validateResearchReview({ ...researchReview, claims: [{ ...item, verdict: "supported_with_limits" }] }).length);
});
