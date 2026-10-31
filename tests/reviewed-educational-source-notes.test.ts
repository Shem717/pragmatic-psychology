import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { plantDiversityQualification } from '../lib/plantDiversity-source-qualification';
import { aceOddsQualification } from '../lib/aceOdds-source-qualification';
import { intrusiveThoughtQualification } from '../lib/intrusiveThought-source-qualification';
import { SourceQualificationNote } from '../components/evidence/SourceQualificationNote';
import { sourceNoteSections } from '../lib/source-note-navigation';
const notes = [plantDiversityQualification, aceOddsQualification, intrusiveThoughtQualification];
const pins = ['5871c0b1e780b1ee5fdee1a6af3f4691643ffe2db2381ef66f02d049e201ec8a', '180d4109c9e7da37927fe760a1401883b7a9178e504a268bc678c4af34ea5b39', '97c0e009f73a7547fc3b653f61620a00b465e3e670ee4636d11e290930b2b6a0'];
test('three educational notes preserve independently reviewed display text byte for byte', () => {
  notes.forEach((note, index) => {
    const sorted = Object.fromEntries(Object.entries(note).sort(([a], [b]) => a.localeCompare(b)));
    assert.equal(createHash('sha256').update(JSON.stringify(sorted)).digest('hex'), pins[index]);
    assert.equal(note.status, 'Private editorial proposal · independent editorial and human scientific review pending');
  });
});
test('educational notes render every paragraph and exact named link without hidden evidence', () => {
  const escape = (s: string) => renderToStaticMarkup(createElement('span', null, s)).replace(/^<span>|<\/span>$/g, '');
  for (const note of notes) {
    const html = renderToStaticMarkup(createElement(SourceQualificationNote, { note, titleId: note.id + '-test-title' }));
    assert.deepEqual(sourceNoteSections[note.id].flatMap(s => s.indices), [0, 1, 2]);
    const paragraphs = Array.from(html.matchAll(/<p data-source-paragraph="(\d+)">([\s\S]*?)<\/p>/g));
    assert.equal(paragraphs.length, 3);
    paragraphs.forEach((match, i) => {
      assert.equal(Number(match[1]), i);
      const restored = match[2].replace(/<a href="([^"]+)" target="_blank" rel="noreferrer">([^<]+)<\/a>/g, (_, url, label) => '[' + label + '](' + url + ')');
      assert.equal(restored, escape(note.paragraphs[i]));
    });
    assert.equal(html.split(`href="/evidence/source-qualifications/#${note.id}"`).length - 1, 2);
    assert.doesNotMatch(html, /<details|<summary| hidden|aria-hidden|<script|<iframe|COVBACKLOG|COVADJ|workspace\//);
  }
});
