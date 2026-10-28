import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const data = JSON.parse(fs.readFileSync('content/public.json', 'utf8'));
const edges = JSON.parse(fs.readFileSync('content/evidence-assertions.json', 'utf8')).edges;
const claim = data.claims.find((x: {id: string}) => x.id === 'CL-sleep-opportunity-attention');
test('sleep attention stays a selected two-report educational claim', () => {
  assert.deepEqual(claim.sourceIds, ['R103', 'R104']);
  assert.equal(claim.confidence, 'limited');
  assert.equal(claim.reviewStatus, 'educational-review');
  assert.match(claim.reviewer, /human scientific review pending/);
  assert.match(claim.statement, /two selected controlled laboratory studies/);
  assert.doesNotMatch(claim.statement, /subjective|sleepiness|percentage|unaware/);
  assert.match(claim.limitations[4], /excludes Van Dongen/);
  assert.match(claim.notImplied.join(' '), /fitness-to-drive/);
});
test('study counts, transformed outcome and shared lineage stay explicit', () => {
  const sources = data.sources.filter((x: {id: string}) => claim.sourceIds.includes(x.id));
  assert.equal(sources.length, 2);
  assert.ok(sources.every((x: {sampleSize: unknown}) => x.sampleSize === null));
  assert.match(claim.limitations[0], /66.*56/);
  assert.match(claim.limitations[1], /36 entrants and three withdrawals/);
  assert.match(claim.limitations[1], /not percentage attention lost/);
  assert.match(claim.limitations[2], /Balkin 2000/);
  const scoped = edges.filter((x: {claimId: string}) => x.claimId === claim.id);
  assert.equal(scoped.length, 4);
  assert.equal(scoped.filter((x: {relation: string}) => x.relation === 'supports').length, 2);
  assert.ok(scoped.every((x: {studyLineage: string}) => x.studyLineage));
});

test('removing only byte-pinned sleep additions restores exact deployed content and rejects drift', async () => {
  const { createHash } = await import('node:crypto');
  const { restoreSleepBaseline } = await import('./sleep-attention-baseline');
  const expected: Record<string, string> = {
    'public.json': 'dc901fdaa0b274124fb9c55b38928da5bcbfc205c5a4278e994f9331cf27f108',
    'evidence-assertions.json': 'e535db7ee180def72b39a66b0a47c5f854fa3a726d59c98d86925cbfb9741d29',
    'evidence-taxonomy.json': '50b87a2611e053e5fc3758d28df6baa0b5848d7bcbfb5b9b5e0e695a29abb036'
  };
  for (const [file, hash] of Object.entries(expected)) {
    const current = JSON.parse(fs.readFileSync('content/' + file, 'utf8'));
    assert.equal(createHash('sha256').update(JSON.stringify(restoreSleepBaseline(current))).digest('hex'), hash);
  }
  const bad = structuredClone(data);
  bad.claims.find((x: {id: string}) => x.id === claim.id).statement = 'invented certainty';
  assert.throws(() => restoreSleepBaseline(bad), /Unexpected sleep addition drift/);
});
