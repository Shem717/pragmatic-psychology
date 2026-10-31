import { sourceNoteRoutes } from "../lib/source-note-routes";
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PrtQualification } from '../components/evidence/PrtQualification';
import { SpaceQualification } from '../components/evidence/SpaceQualification';
import { prtQualification as prt } from '../lib/prt-source-qualification';
import { spaceQualification as space } from '../lib/space-source-qualification';
import { content } from '../lib/content';
import { evidenceAssertions } from '../lib/evidence-assertions';
import { sourceNoteSections } from '../lib/source-note-navigation';
const canonicalPins = {
  "content/evidence-taxonomy.json": "9db9da1816e278706a8b5f430629dc34c255e8b64bd3161cd57dde281423c279",
  "content/learning-paths.json": "2627bae588c023d87131bf18603fe2fc08adaebacb207fc1b4024a2414d18d5f",
  "content/evidence-assertions.json": "939adf08ef7a4d2d8a12670797b50b78631f3ff44641435c04ef77b1cb900b32",
  "content/pilot-provenance.json": "7ba6ac0ad70d1c56e9e63091bd200a88d4e464335076fd927e04184d3dfb7e27",
  "content/public.json": "f6a5be37e6714f23815c620dd3c3fc64eaf4beb288311acf0e738858802bafd3"
};
// Exact independently reviewed note fields, excluding Markdown section headings.
const reviewedNoteHashes = ["ecef5662e5abc001eb50f1dddd2627ecf969153469c2e58ae91c141c84306269", "82c526bfd9de88373a2895bdbc5057deeb286657cf0aeb4d39230f8e6a3a1034"];
test('PRT and SPACE keep the five canonical files byte-identical and counts unchanged', () => {
  for (const [path, hash] of Object.entries(canonicalPins)) assert.equal(createHash('sha256').update(readFileSync(path)).digest('hex'), hash);
  assert.equal(content.claims.length, 44); assert.equal(content.sources.length, 131); assert.equal(evidenceAssertions.edges.length, 196);
});
test('PRT and SPACE preserve every independently reviewed character and link', () => {
  [prt, space].forEach((note, index) => assert.equal(createHash('sha256').update(JSON.stringify(note)).digest('hex'), reviewedNoteHashes[index]));
});
test('PRT retains full-package, selection, mechanism and medical-care boundaries', () => {
  const text = prt.paragraphs.join(' ');
  for (const phrase of ['151 selected adults', 'physician assessment and eight individual therapy sessions', 'did not test this video or somatic tracking alone', 'medical evaluation and appropriate care remain essential', 'aged 21–70', 'outcomes relied on self-report', 'equally intensive active psychotherapy', 'not proof of “brain retraining,”']) assert.ok(text.includes(phrase), phrase);
});
test('SPACE retains noninferiority, comparator, attribution and child-care safeguards', () => {
  const text = space.paragraphs.join(' ');
  for (const phrase of ['124 children aged 7–14', '97 children who completed treatment', 'not establish that SPACE was better, exactly equal', 'six-point margin', 'CBT parent involvement was restricted', 'separate outcome, not proof of superior anxiety relief', 'source does not identify SPACE', 'not a confirmed intended citation', 'disability accommodations', 'parent blame, forced exposure', 'assent and consent']) assert.ok(text.includes(phrase), phrase);
});
test('new notes render all text visibly, named links, semantic sections and reachable unique anchors', () => {
  const escape = (s: string) => renderToStaticMarkup(createElement('span', null, s)).replace(/^<span>|<\/span>$/g, '');
  [prt, space].forEach((note, index) => {
    const html = renderToStaticMarkup(createElement(index === 0 ? PrtQualification : SpaceQualification));
    assert.match(note.status, /independent human scientific and editorial review pending/);
    assert.ok(sourceNoteRoutes.some(route => route.id === note.id));
    assert.equal((html.match(new RegExp('id="' + note.id + '"', 'g')) || []).length, 1);
    assert.deepEqual(sourceNoteSections[note.id].flatMap(s => s.indices), [0, 1, 2]);
    const paragraphs = Array.from(html.matchAll(/<p data-source-paragraph="(\d+)">([\s\S]*?)<\/p>/g));
    assert.equal(paragraphs.length, 3);
    paragraphs.forEach((match, i) => {
      assert.equal(Number(match[1]), i);
      const restored = match[2].replace(/<a href="([^"]+)" target="_blank" rel="noreferrer">([^<]+)<\/a>/g, (_, url, label) => '[' + label + '](' + url + ')');
      assert.equal(restored, escape(note.paragraphs[i]));
    });
    const links = Array.from(html.matchAll(/<a href="(https:[^"]+)"/g)).map(m => m[1]);
    assert.deepEqual(links, Array.from(note.paragraphs.join(' ').matchAll(/\]\((https:[^)]+)\)/g)).map(m => m[1]));
    assert.equal(links.length, 2);
    assert.match(html, />Read the primary trial<\/a>/); assert.match(html, />source video<\/a>/);
    assert.equal(html.split(`href="/evidence/source-qualifications/#${note.id}"`).length - 1, 2);
    assert.doesNotMatch(html, /<details|<summary| hidden|aria-hidden|<script|<iframe|<input|COVBACKLOG|COVADJ|workspace\//);
  });
});
