import test from 'node:test';
import assert from 'node:assert/strict';
import { createVideoPlayback } from '../lib/video-playback';

test('no player is active until explicit activation; a new moment replaces the previous player', () => {
  const store = createVideoPlayback();
  assert.equal(store.getSnapshot(),null);
  store.activate('companion-moment-1');
  assert.equal(store.getSnapshot(),'companion-moment-1');
  store.activate('companion-moment-2');
  assert.equal(store.getSnapshot(),'companion-moment-2');
  // A stale player or chapter unmount cannot stop its replacement.
  store.release('companion-moment-1');
  assert.equal(store.getSnapshot(),'companion-moment-2');
  store.release('companion-moment-2');
  assert.equal(store.getSnapshot(),null);
});
test('close, chapter unmount and disclosure collapse release ownership and notify subscribers', () => {
  const store=createVideoPlayback();
  const states:(string|null)[]=[];
  const unsubscribe=store.subscribe(()=>states.push(store.getSnapshot()));
  store.activate('book-takeaway'); store.release('book-takeaway');
  store.activate('book-watch'); store.release('book-watch');
  store.activate('worksheet-source'); store.release('worksheet-source');
  assert.deepEqual(states,['book-takeaway',null,'book-watch',null,'worksheet-source',null]);
  unsubscribe();store.activate('other');
  assert.equal(states.length,6);
});

test('source controls render without contacting YouTube or creating an iframe before activation', async () => {
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { SourceMoment } = await import('../components/SourceMoment');
  const html = renderToStaticMarkup(createElement(SourceMoment, {url:'https://www.youtube.com/watch?v=CorAKleaql4&t=691s',label:'Source moment 11:31'}));
  assert.match(html,/Watch here/);
  assert.match(html,/aria-expanded="false"/);
  assert.match(html,/connects to YouTube/);
  assert.doesNotMatch(html,/<iframe|<img|<script|rel="preconnect"|src="https:/);
  const invalid = renderToStaticMarkup(createElement(SourceMoment, {url:'https://www.youtube.com/watch?v=CorAKleaql4&t=not-a-time',label:'Malformed source'}));
  assert.match(invalid,/External source/);
  assert.doesNotMatch(invalid,/<button|<iframe/);
});

test('source controls visibly add missing URL times, including the learning path 6:26 and 7:18 moments', async () => {
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { SourceMoment } = await import('../components/SourceMoment');
  const { getLearningPath } = await import('../lib/learning-paths');
  const anchors = getLearningPath('perspective-fit')!.sourceContext.anchors;
  const times = ['6:26', '7:18'];
  for (let index = 0; index < anchors.length; index++) {
    const anchor = anchors[index];
    const label = `Caption landmark · ${anchor.role}`;
    const html = renderToStaticMarkup(createElement(SourceMoment, { url: anchor.url, label }));
    assert.ok(html.includes(`Watch here · ${times[index]} · ${label}`));
    assert.equal(html.split(times[index]).length - 1, 1);
    assert.ok(html.includes(anchor.url.replaceAll('&', '&amp;')), 'The source URL remains unchanged');
    assert.doesNotMatch(html, /<iframe|autoplay/);
  }
  for (const [suffix, expected] of [['?start=3723', '1:02:03'], ['#t=1m', '1:00'], ['?t=0', '0:00']]) {
    const html = renderToStaticMarkup(createElement(SourceMoment, { url: `https://youtu.be/AipBMvDBw70${suffix}`, label: 'A cited passage' }));
    assert.ok(html.includes(`Watch here · ${expected} · A cited passage`));
  }
});

test('existing passage ranges and equivalent clock labels are preserved without a duplicate prefix', async () => {
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { SourceMoment } = await import('../components/SourceMoment');
  for (const [seconds, label] of [
    [534, '08:54–09:10 · theory explanation'],
    [5771, '01:36:11 official chapter start; exact spoken line time unavailable'],
    [691, 'Source moment 11:31'],
    [3740, 'Amishi Jha · choose, notice, redirect · 1:02:20'],
    [785, '13:05–14:04'],
  ] as const) {
    const html = renderToStaticMarkup(createElement(SourceMoment, { url: `https://www.youtube.com/watch?v=AipBMvDBw70&t=${seconds}s`, label }));
    assert.ok(html.includes(`Watch here · ${label}</button>`));
    assert.equal(html.split(label).length - 1, 1);
  }
  const untimed = renderToStaticMarkup(createElement(SourceMoment, { url: 'https://www.youtube.com/watch?v=AipBMvDBw70', label: 'Full video · passage untimed' }));
  assert.ok(untimed.includes('Watch here · Full video · passage untimed</button>'));
  assert.doesNotMatch(untimed, /0:00/);
});
