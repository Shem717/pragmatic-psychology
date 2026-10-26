import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { sourceCompanions, getSourceCompanion } from '../lib/source-companions';
import { content, getSource } from '../lib/content';
import { parseYouTubeSource } from '../lib/video-source';

const approvedUrls = {
  R03: 'https://dnalc.cshl.edu/view/1235-Memory-Re-consolidation.html',
  R07: 'https://www.youtube.com/watch?v=Sz9bg3GMNGU',
  R12: 'https://www.youtube.com/watch?v=Tv1kRqzg0AQ&t=534',
  R17: 'https://www.youtube.com/watch?v=RcGyVTAoXEU&t=304',
  R31: 'https://www.nimh.nih.gov/news/media/2020/depression-mental-health-minute',
};

test('exactly five approved companions use exact public URLs and existing source IDs', () => {
  assert.deepEqual(Object.keys(sourceCompanions).sort(), Object.keys(approvedUrls).sort());
  for (const [id, url] of Object.entries(approvedUrls)) {
    const companion = getSourceCompanion(id);
    assert.ok(companion);
    assert.ok(getSource(id));
    assert.equal(companion.publicUrl, url);
    assert.equal(new URL(url).protocol, 'https:');
    assert.ok(['Research explained', 'Related context', 'Practical application'].includes(companion.relationship));
    for (const field of ['adds', 'limitation', 'verification', 'passage'] as const) assert.ok(companion[field].length > 10);
  }
  for (const id of ['R02', 'R04', 'R11', 'R18', 'R21', '__proto__', 'constructor']) assert.equal(getSourceCompanion(id), undefined);
  assert.doesNotMatch(JSON.stringify(sourceCompanions), /drive\.google|docs\.google|drive[_ -]?(id|url)|confidence/i);
});

test('only verified YouTube identities play inline and only verified passage times seek', () => {
  assert.deepEqual(parseYouTubeSource(sourceCompanions.R12.playbackUrl!), { videoId: 'Tv1kRqzg0AQ', start: 534 });
  assert.deepEqual(parseYouTubeSource(sourceCompanions.R17.playbackUrl!), { videoId: 'RcGyVTAoXEU', start: 304 });
  assert.deepEqual(parseYouTubeSource(sourceCompanions.R07.playbackUrl!), { videoId: 'Sz9bg3GMNGU', start: 0 });
  assert.deepEqual(parseYouTubeSource(sourceCompanions.R31.playbackUrl!), { videoId: 'lQhpetkwWnM', start: 0 });
  assert.equal(sourceCompanions.R03.playbackUrl, undefined);
  assert.equal(parseYouTubeSource(sourceCompanions.R03.publicUrl), null);
});

test('companion wording retains the reviewed evidence boundaries', () => {
  assert.match(sourceCompanions.R12.limitation, /not validation.*does not name the 2017 paper/);
  assert.match(sourceCompanions.R17.limitation, /inferred.*not named aloud.*short-term.*mortality and oxytocin/);
  assert.match(sourceCompanions.R03.limitation, /not narration of the rat experiment.*self-treatment/);
  assert.match(sourceCompanions.R07.limitation, /not.*ERP tutorial.*Medication claims.*not adopted/);
  assert.match(sourceCompanions.R31.limitation, /2020.*not coverage of every medication class.*current NIMH/);
  assert.match(getSource('R03')!.summary, /animal pharmacology.*not evidence for self-guided imagery treatment/);
  assert.match(getSource('R17')!.summary, /49|short-term/);
  const reconsolidation = content.claims.find(claim => claim.slug === 'reconsolidation');
  assert.ok(reconsolidation?.challengeSourceIds.includes('R11'));
  assert.ok(getSource('R04')?.correctionNote);
});

test('cards retain source-first hierarchy and reuse the existing opt-in player', () => {
  const ui = readFileSync(new URL('../components/UI.tsx', import.meta.url), 'utf8');
  assert.ok(ui.indexOf('<SourceCompanion sourceId={s.id}') > ui.indexOf('s.correctionNote &&'));
  const component = readFileSync(new URL('../components/SourceCompanion.tsx', import.meta.url), 'utf8');
  assert.match(component, /<SourceMoment url={companion.playbackUrl}/);
  assert.doesNotMatch(component, /<iframe|<img|fetch\(|preconnect|dns-prefetch/);
  const player = readFileSync(new URL('../components/SourceMoment.tsx', import.meta.url), 'utf8');
  assert.match(player, /active && <section/);
  assert.match(player, /useVideoPlayback/);
  assert.match(player, /source.start > 0/);
});
