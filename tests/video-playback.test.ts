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
