import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SourceAmendment } from '../components/evidence/SourceAmendment';
import { readFileSync } from 'node:fs';
import { getSource } from '../lib/content';
test('a published correction URL renders even when no correction note is stored',()=>{
 const source=getSource('R127')!;assert.ok(source.correctionUrl);assert.equal(source.correctionNote,undefined);
 const html=renderToStaticMarkup(createElement(SourceAmendment,{note:source.correctionNote,url:source.correctionUrl}));
 assert.ok(html.includes('href="https://onlinelibrary.wiley.com/doi/10.1111/psyp.14298"'));assert.match(html,/Published update/);
});
test('existing correction notes remain visible and ordinary sources get no invented update',()=>{
 const corrected=renderToStaticMarkup(createElement(SourceAmendment,{note:getSource('R04')!.correctionNote,url:getSource('R04')!.correctionUrl}));assert.match(corrected,/Published update/);
 const plain=renderToStaticMarkup(createElement(SourceAmendment,{note:getSource('R128')!.correctionNote,url:getSource('R128')!.correctionUrl}));assert.doesNotMatch(plain,/Published update/);
});

test('source renderer passes both optional correction fields to rendered amendment',()=>{assert.match(readFileSync('components/evidence/SourceRecord.tsx','utf8'),/<SourceAmendment note=\{source.correctionNote\} url=\{source.correctionUrl\}/);});
