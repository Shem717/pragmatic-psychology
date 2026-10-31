import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { sourceNoteRoutes, sourceNoteHref, findSourceNoteRoute } from '../lib/source-note-routes';
import { sourceNoteComponents } from '../components/evidence/SourceNoteContent';

test('exactly 24 unique source notes have stable detail routes and no arbitrary lookup', () => {
  assert.equal(sourceNoteRoutes.length, 24);
  assert.equal(new Set(sourceNoteRoutes.map(n => n.id)).size, 24);
  assert.deepEqual(Object.keys(sourceNoteComponents), sourceNoteRoutes.map(n => n.id));
  for (const note of sourceNoteRoutes) {
    assert.equal(findSourceNoteRoute(note.id), note);
    assert.equal(sourceNoteHref(note.id), `/evidence/source-qualifications/${note.id}/`);
    const html = renderToStaticMarkup(createElement(sourceNoteComponents[note.id]));
    assert.equal((html.match(/<article\b/g) || []).length, 1);
    assert.ok(html.includes(`id="${note.id}"`));
    assert.equal(html.split(`href="/evidence/source-qualifications/#${note.id}"`).length - 1, 2);
  }
  for (const slug of ['unknown', '__proto__', 'constructor', '../', '']) assert.equal(findSourceNoteRoute(slug), undefined);
});
test('directory is index-only and provides explicit no-JavaScript legacy bookmark bridges', () => {
  const index = readFileSync('app/evidence/source-qualifications/page.tsx', 'utf8');
  assert.match(index, /sourceNoteRoutes\.map/);
  assert.match(index, /<a id=\{note.id\} href=\{sourceNoteHref\(note.id\)\}/);
  assert.match(index, /Older topic bookmarks lead to the matching link below/);
  assert.doesNotMatch(index, /SourceNoteContent|<article|Qualification \/>|useEffect|location\./);
});
test('detail pages are statically generated with explicit 404s, metadata and document navigation', () => {
  const page = readFileSync('app/evidence/source-qualifications/[slug]/page.tsx', 'utf8');
  assert.match(page, /dynamicParams = false/);
  assert.match(page, /generateStaticParams/);
  assert.match(page, /if \(!note\) notFound\(\)/);
  assert.match(page, /canonical: sourceNoteHref\(note.id\)/);
  assert.match(page, /aria-label="Breadcrumb"/);
  assert.match(page, /aria-current="page"/);
  assert.match(page, /<h1>\{note.label\}<\/h1>/);
  assert.equal((page.match(/<NoteContent \/>/g) || []).length, 1);
  assert.doesNotMatch(page, /router\.|history\.|window\.|useEffect/);
});
