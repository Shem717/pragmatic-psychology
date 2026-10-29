import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { content } from '../lib/content';
import { claimRelationships } from '../lib/evidence';
import { evidenceAssertions } from '../lib/evidence-assertions';
import { SourceAssertions } from '../components/evidence/SourceAssertions';

test('assertion footer separates actual dossier dates from the preserved ledger baseline',()=>{
 const dates=new Set<string>();
 for(const claim of content.claims)for(const relationship of claimRelationships(claim).filter(r=>r.assertions?.length)){
  const html=renderToStaticMarkup(createElement(SourceAssertions,{relationship,claim}));
  assert.ok(html.includes(`Dossier review date: ${claim.reviewedAt}.`));
  assert.ok(html.includes(`Assertion-ledger baseline review date: ${evidenceAssertions.review.date}.`));
  assert.doesNotMatch(html,/Scoped review:/);
  dates.add(claim.reviewedAt);
 }
 assert.ok(dates.has('2026-10-27'));assert.ok(dates.has('2026-10-28'));assert.ok(dates.has('2026-10-29'));
 assert.equal(evidenceAssertions.review.date,'2026-10-27');
});
