import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { content } from '../lib/content';
test('seven selected videos have distinct source-grounded, actionable companions', () => {
  const expected=['TOTW_bsKkbE','eX1_yI7scug','AipBMvDBw70','ieR3n0laLAg','nqWsMb06W0I','EB5E24TSBuk','CorAKleaql4'];
  assert.deepEqual(content.videos.map(v=>v.youtubeId).sort(),expected.sort());
  for(const video of content.videos){assert.equal(video.takeaways?.length,3);assert.ok(video.example);assert.ok(video.action);assert.ok(video.reflection);assert.ok(video.evidenceNote);for(const takeaway of video.takeaways??[]){assert.ok(typeof takeaway.seconds === "number" && takeaway.seconds>=0);}}
});
test('published source amendments are integrated and theory is not its own counterevidence',()=>{
  for(const id of ['R04','R16']) assert.match(content.sources.find(s=>s.id===id)!.correctionUrl!,/^https:\/\//);
  for(const claim of content.claims.filter(c=>c.slug === "threat" || c.slug === "confidence")) assert.equal(claim.sourceIds.some(id=>claim.challengeSourceIds.includes(id)),false,claim.slug);
});
test('public corrections route is removed and accessible motion preferences are retained',()=>{
  assert.equal(existsSync('app/corrections/page.tsx'),false);
  const ui=readFileSync('components/Workspace.tsx','utf8');assert.doesNotMatch(ui,/Pause motion|Resume motion/);
  const css=readFileSync('app/sovereign.css','utf8');assert.match(css,/prefers-reduced-motion/);assert.match(css,/data-mode="Focused"/);
  assert.match(readFileSync('scripts/security-headers.mjs','utf8'),/corrections/);
});
