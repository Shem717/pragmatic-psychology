import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { concerns } from '../lib/concern-guide';
import { editionPassages } from '../lib/companion-edition';
import { libraryVolumes, getCompanionEdition } from '../lib/spatial-library';

// Audit the HTML a reader receives, excluding framework payloads that can contain invisible copies of the text.
const pages = new Map<string, string>();
function page(route: string) {
  if (!pages.has(route)) {
    const html = readFileSync(path.join('out', route, 'index.html'), 'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
    const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1];
    assert.ok(main, 'Missing main content on ' + route);
    pages.set(route, main);
  }
  return pages.get(route)!;
}
function checkAnchor(html: string, id: string, route: string) {
  assert.equal(html.split(' id="' + id + '"').length - 1, 1, 'Expected one destination at ' + route + '#' + id);
}
function visibleText(text: string) {
  return renderToStaticMarkup(createElement('span', null, text)).slice('<span>'.length, -'</span>'.length);
}

let passageCount = 0;
for (const volume of libraryVolumes) {
  const route = '/library/videos/' + volume.id + '/';
  const html = page(route);
  for (const item of editionPassages(getCompanionEdition(volume.id)!)) {
    checkAnchor(html, item.id, route);
    for (const text of [item.title, item.text].filter(Boolean)) {
      assert.ok(html.includes(visibleText(text)), 'Missing published passage text at ' + route + '#' + item.id);
    }
    passageCount++;
  }
}

let linkCount = 0;
for (const concern of concerns) {
  checkAnchor(page('/learn/concerns/'), concern.id, '/learn/concerns/');
  for (const resource of concern.resources) {
    const [route, fragment] = resource.href.split('#');
    const html = page(route);
    if (fragment) checkAnchor(html, fragment, route);
    linkCount++;
  }
}
console.log('Verified ' + passageCount + ' published passages and ' + linkCount + ' concern-guide links.');
