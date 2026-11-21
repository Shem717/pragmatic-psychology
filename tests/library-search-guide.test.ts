import assert from 'node:assert/strict';
import test from 'node:test';
import { content } from '../lib/content';
import { editionPassages } from '../lib/companion-edition';
import { concerns, findConcerns } from '../lib/concern-guide';
import { getCompanionEdition, searchLibraryVolumes } from '../lib/spatial-library';

test('passage search covers the seven books, resolves word forms and ranks relevant sections', () => {
  for (const q of ['Actions', 'action', '  ACTIONS! ']) {
    assert.deepEqual(searchLibraryVolumes(q).map(hit => hit.volume.number).sort(), [1,2,3,4,5,6,7]);
  }
  const deadline = searchLibraryVolumes('Deadline.');
  assert.deepEqual(deadline.map(hit => hit.volume.number), [2]);
  assert.equal(deadline[0].matches[0].id, 'example');
  assert.equal(searchLibraryVolumes('payoff')[0].matches[0].id, 'habit-payoff');
  assert.equal(searchLibraryVolumes('12:08')[0].matches[0].id, 'takeaway-3');
  assert.equal(searchLibraryVolumes('Why Anxiety Won’t Go Away')[0].matches[0].id, 'original-title');
  assert.equal(searchLibraryVolumes('prediction annoyance').length, 0);
  assert.equal(searchLibraryVolumes('ction').length, 0);
  assert.equal(searchLibraryVolumes('!!!').length, 0);
  assert.equal(searchLibraryVolumes('Actions', 'practice').length, 3);
  assert.deepEqual(searchLibraryVolumes('', 'practice').map(hit => hit.volume.number), [2,4,7]);
});

test('every indexed passage and every public content field can find its own volume', () => {
  let takeawayCount = 0;
  for (const video of content.videos) {
    const edition = getCompanionEdition(video.youtubeId)!;
    const passages = editionPassages(edition);
    for (const item of passages) {
      const matchingVolume = searchLibraryVolumes(item.title).find(hit => hit.volume.id === video.youtubeId);
      assert.ok(matchingVolume?.matches.some(hit => hit.id === item.id), item.title);
    }
    const expected = [video.title, video.platformTitle, video.summary, video.example, video.action, video.reflection,
      video.evidenceNote, video.sourceNote || video.transcriptStatus, video.rights, ...video.takeaways!.flatMap(t => [t.title,t.text,t.timestamp])];
    for (const text of expected.filter((t): t is string => Boolean(t))) {
      assert.ok(searchLibraryVolumes(text).some(hit => hit.volume.id === video.youtubeId), text);
    }
    takeawayCount += video.takeaways!.length;
  }
  assert.equal(takeawayCount, 21);
});

test('the directory finds everyday phrases, condition names and abbreviations and keeps the resources distinct', () => {
  assert.equal(findConcerns('').length, concerns.length);
  assert.equal(new Set(concerns.map(entry => entry.id)).size, concerns.length);
  for (const [q, id] of [
    ['I can’t focus','focus'], ['putting things off','procrastination'], ['lonely','loneliness'],
    ['attention-deficit hyperactivity disorder','adhd'], ['ptsd','ptsd'], ['obsessive compulsive disorder','ocd'],
    ['MDD','depression'], ['my child has anxiety','childhood-anxiety'], ['cannot sleep','insomnia'],
  ]) assert.ok(findConcerns(q).some(entry => entry.id === id), q);
  assert.equal(findConcerns('cannot sleep')[0].id, 'insomnia');
  assert.deepEqual(findConcerns('XYZ123'), []);
  assert.equal(findConcerns('ADHD')[0].resources[0].kind, 'Evidence note');
  assert.equal(findConcerns("I can't focus")[0].resources[0].kind, 'Worksheet');
  assert.deepEqual(concerns.filter(item => item.group === 'conditions').map(item => item.id).sort(), ['adhd','childhood-anxiety','depression','insomnia','ocd','panic','ptsd']);
});
