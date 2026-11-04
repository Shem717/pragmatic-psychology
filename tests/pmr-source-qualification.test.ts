import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { pmrQualification as note } from '../lib/pmr-source-qualification';
import { PmrQualification } from '../components/evidence/PmrQualification';
import { sourceNoteSections } from '../lib/source-note-navigation';
import { findSourceNoteRoute, sourceNoteHref } from '../lib/source-note-routes';
import { content } from '../lib/content';
import { evidenceAssertions } from '../lib/evidence-assertions';

test('PMR qualification preserves the reviewed copy and pending human review status', () => {
  assert.equal(createHash('sha256').update(JSON.stringify(note, null, 2) + '\n').digest('hex'), '3e5d2cce3c63b4f39709cfa16e16204d7d187aeb0cd3f2f89f3e50c6b1c0617d');
  assert.equal(note.status, 'Source qualification · bounded review · independent human scientific review pending.');
  assert.equal(note.title, 'What one PMR session measured');
});

test('PMR detail route renders each paragraph once and turns its named DOI citation into a link', () => {
  assert.equal(findSourceNoteRoute(note.id)?.label, 'PMR: one-session relaxation');
  assert.equal(sourceNoteHref(note.id), '/evidence/source-qualifications/pmr-immediate-relaxation/');
  assert.deepEqual(sourceNoteSections[note.id].flatMap(section => section.indices), [0, 1, 2, 3]);
  const html = renderToStaticMarkup(createElement(PmrQualification));
  const escape = (text: string) => renderToStaticMarkup(createElement('span', null, text)).replace(/^<span>|<\/span>$/g, '');
  const paragraphs = Array.from(html.matchAll(/<p data-source-paragraph="(\d+)">([\s\S]*?)<\/p>/g));
  assert.equal(paragraphs.length, 4);
  paragraphs.forEach((match, index) => {
    assert.equal(Number(match[1]), index);
    const restored = match[2].replace(/<a href="([^"]+)" target="_blank" rel="noreferrer">([^<]+)<\/a>/g, (_, url, label) => '[' + label + '](' + url + ')');
    assert.equal(restored, escape(note.paragraphs[index]));
  });
  assert.equal((html.match(/href="https:\/\/doi.org\/10.1155\/2021\/5924040"/g) || []).length, 1);
  assert.match(html, /target="_blank" rel="noreferrer">Toussaint and colleagues, 2021<\/a>/);
  assert.equal(html.split(`href="/evidence/source-qualifications/#${note.id}"`).length - 1, 2);
  assert.doesNotMatch(html, /<details|<summary| hidden|aria-hidden|<script|<iframe|COVBACKLOG|COVADJ|workspace\//);
});

test('PMR note leaves the canonical corpus and prior relaxation-anxiety qualification unchanged', () => {
  assert.equal(content.claims.length, 44);
  assert.equal(content.sources.length, 131);
  assert.equal(evidenceAssertions.edges.length, 196);
  const pins = {
    'content/public.json': 'f6a5be37e6714f23815c620dd3c3fc64eaf4beb288311acf0e738858802bafd3',
    'content/evidence-assertions.json': '939adf08ef7a4d2d8a12670797b50b78631f3ff44641435c04ef77b1cb900b32',
    'lib/relaxation-source-qualification.ts': '4217ac16950f723860ef4a8a51f2363655dc94babb030a90ac879c996e7bcebf',
  };
  for (const [path, pin] of Object.entries(pins)) assert.equal(createHash('sha256').update(readFileSync(path)).digest('hex'), pin);
});

test('PMR detail and directory retain neutral authorship and visible pending human review', () => {
  const page = readFileSync('app/evidence/source-qualifications/[slug]/page.tsx', 'utf8');
  const directory = readFileSync('app/evidence/source-qualifications/page.tsx', 'utf8');
  assert.match(page, /note\.id === "pmr-immediate-relaxation" \? "Source qualification" : "Researcher-authored qualification"/);
  assert.doesNotMatch(directory, /Researcher-authored/);
  for (const source of [page, directory]) assert.match(source, /Independent human scientific review remains pending/);
});
