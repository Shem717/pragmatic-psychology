import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { sourceCompanions, getSourceCompanion } from '../lib/source-companions';
import { sharedSourceBackground } from '../lib/shared-source-background';
import { content, getSource } from '../lib/content';
import { parseYouTubeSource } from '../lib/video-source';

const approvedUrls = {
  R03: 'https://dnalc.cshl.edu/view/1235-Memory-Re-consolidation.html',
  R07: 'https://www.youtube.com/watch?v=Sz9bg3GMNGU',
  R12: 'https://www.youtube.com/watch?v=Tv1kRqzg0AQ&t=534',
  R17: 'https://www.youtube.com/watch?v=RcGyVTAoXEU&t=304',
  R31: 'https://www.nimh.nih.gov/news/media/2020/depression-mental-health-minute',
};

test('the original five approved companions retain exact public URLs and existing source IDs', () => {
  assert.equal(Object.keys(sourceCompanions).length, 21);
  for (const [id, url] of Object.entries(approvedUrls)) {
    const companion = getSourceCompanion(id);
    assert.ok(companion);
    assert.ok(getSource(id));
    assert.equal(companion.publicUrl, url);
    assert.equal(new URL(url).protocol, 'https:');
    assert.ok(['Research explained', 'Related context', 'Practical application'].includes(companion.relationship));
    for (const field of ['adds', 'limitation', 'verification', 'passage'] as const) assert.ok(companion[field].length > 10);
  }
  for (const id of ['R01', 'R02', 'R06', 'R08', 'R09', 'R10', 'R11', 'R21', 'R22', 'R23', '__proto__', 'constructor']) assert.equal(getSourceCompanion(id), undefined);
  assert.doesNotMatch(JSON.stringify(sourceCompanions), /drive\.google|docs\.google|drive[_ -]?(id|url)/i);
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
  const ui = readFileSync(new URL('../components/evidence/SourceRecord.tsx', import.meta.url), 'utf8');
  assert.ok(ui.indexOf('<SourceCompanion sourceId={id}') > ui.indexOf('source.correctionNote &&'));
  assert.match(ui, /source-video-details/);
  const component = readFileSync(new URL('../components/SourceCompanion.tsx', import.meta.url), 'utf8');
  assert.match(component, /<SourceMoment url={companion.playbackUrl}/);
  assert.doesNotMatch(component, /<iframe|<img|fetch\(|preconnect|dns-prefetch/);
  const player = readFileSync(new URL('../components/SourceMoment.tsx', import.meta.url), 'utf8');
  assert.match(player, /active && <section/);
  assert.match(player, /useVideoPlayback/);
  assert.match(player, /source.start > 0/);
});

test('the original twenty-one associations remain unchanged after source-only research additions', () => {
  const additions = ['R04','R05','R13','R14','R15','R16','R18','R19','R20','R24','R25','R26','R27','R28','R29','R30'];
  assert.equal(content.sources.length, 114);
  for (const id of ['R39','R40','R41','R42','R43','R44','R45','R46','R47','R48','R49','R50','R51','R52','R53','R54','R55','R56','R57','R58','R59','R60','R61','R62','R63','R64','R65','R66','R67','R68','R69','R70','R71']) assert.equal(sourceCompanions[id], undefined);
  assert.deepEqual(Object.keys(sourceCompanions).filter(id => !(id in approvedUrls)).sort(), additions);
  for (const [id, companion] of Object.entries(sourceCompanions)) {
    assert.ok(getSource(id));
    assert.equal(new URL(companion.publicUrl).protocol, 'https:');
    if (companion.playbackUrl) assert.ok(parseYouTubeSource(companion.playbackUrl));
    assert.ok(['Research explained','Related context','Practical application'].includes(companion.relationship));
  }
  const recordings = new Set(Object.values(sourceCompanions).map(companion => companion.publicUrl.split('&t=')[0]));
  assert.equal(recordings.size, 12, 'five existing plus seven new recordings, not twenty-one confirmations');
  for (const id of ['R05','R15','R16','R18','R19','R20']) assert.equal(sourceCompanions[id].playbackUrl, undefined);
  assert.deepEqual(parseYouTubeSource(sourceCompanions.R24.playbackUrl!), { videoId: 'eIxVfln02Ss', start: 5771 });
  assert.deepEqual(parseYouTubeSource(sourceCompanions.R04.playbackUrl!), { videoId: 'P42DyPRdTEA', start: 0 });
  assert.deepEqual(parseYouTubeSource(sourceCompanions.R13.playbackUrl!), { videoId: 'xcLKlPTG97k', start: 0 });
});

test('counterevidence and clinical boundaries are adjacent companion requirements', () => {
  assert.deepEqual(sourceCompanions.R04.requiredLinks?.map(link => link.url), ['https://www.nature.com/articles/s41586-018-0405-7','https://pubmed.ncbi.nlm.nih.gov/32580869/']);
  assert.ok(sourceCompanions.R20.requiredLinks?.some(link => link.url === 'https://www.nature.com/articles/s41598-022-06119-5'));
  assert.match(sourceCompanions.R04.limitation, /2018.*R11.*failure.*permanent-erasure/);
  assert.match(sourceCompanions.R05.limitation, /not.*self-administered/);
  assert.match(sourceCompanions.R16.limitation, /not Troy.*2016 correction/);
  assert.match(sourceCompanions.R18.limitation, /Same clip as R03.*not another independent/);
  assert.match(sourceCompanions.R20.limitation, /not DIY.*2022 unsuccessful.*Shared laboratory protocol/);
  assert.match(sourceCompanions.R24.limitation, /Predates.*2026.*not human clinical benefit.*not recommended/);
  const component = readFileSync(new URL('../components/SourceCompanion.tsx', import.meta.url), 'utf8');
  assert.ok(component.indexOf('companion.requiredLinks?.length') < component.indexOf('<SourceMoment'));
  assert.match(component, /official publisher page/);
});

test('six gut-brain associations link to one canonical panel with two verified passage anchors', () => {
  const ids = ['R25','R26','R27','R28','R29','R30'];
  assert.deepEqual(sharedSourceBackground.connections.map(connection => connection.source_id), ids);
  for (const id of ids) {
    assert.equal(sourceCompanions[id].sharedGroup, sharedSourceBackground.id);
    assert.equal(sourceCompanions[id].playbackUrl, undefined);
  }
  for (const connection of sharedSourceBackground.connections) assert.equal(connection.source_url, getSource(connection.source_id)!.url);
  assert.deepEqual(sharedSourceBackground.passages.map(passage => parseYouTubeSource(passage.url)), [{videoId:'filqDSbSOAA', start:785},{videoId:'filqDSbSOAA', start:1343}]);
  assert.match(sourceCompanions.R27.adds, /null result.*inconsistent.*unresolved discrepancy/);
  assert.match(sourceCompanions.R29.adds, /mouse.*not.*human efficacy/);
  assert.match(sourceCompanions.R30.adds, /not current FDA approval/);
  const page = readFileSync(new URL('../app/evidence/sources/page.tsx', import.meta.url), 'utf8');
  assert.equal(page.match(/<SharedSourceBackground\s*\/>/g)?.length, 1);
  const component = readFileSync(new URL('../components/SourceCompanion.tsx', import.meta.url), 'utf8');
  assert.match(component, /if \(companion.sharedGroup\) return/);
  assert.match(component, /\/evidence\/sources#\$\{companion.sharedGroup\}/);
  const publicData = JSON.stringify([sourceCompanions, sharedSourceBackground]);
  assert.doesNotMatch(publicData, /drive|cached|private|corpus|1Tqg-|1Bdupe/i);
});
