import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { content } from '../lib/content';

test('source details allow narrow grid children to shrink and wrap unbroken provenance URLs',()=>{
  const css=readFileSync('app/evidence/evidence.css','utf8');
  const grid=css.match(/\.source-detail-grid\s*\{([^}]+)\}/)![1];
  assert.match(grid,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(grid,/min-width:0/);assert.match(grid,/overflow-wrap:anywhere/);
  assert.match(css,/\.source-detail-grid > \*\s*\{\s*min-width:0/);
  assert.match(css,/\.source-detail-grid\s*\{\s*grid-template-columns:1fr/);
  assert.doesNotMatch(grid,/overflow:(?:hidden|clip)|max-height/);
});

test('long access URLs remain complete text in both scope and editorial checks',()=>{
  const r04=content.sources.find(item=>item.id==='R04')!;
  assert.match(r04.accessDepth,/https:\/\/www\.psychiatry\.wisc\.edu\//);
  const component=readFileSync('components/evidence/SourceRecord.tsx','utf8');
  assert.match(component,/<p>\{source.accessDepth\}<\/p>/);
  assert.match(component,/<p>\{check.detail\}<\/p>/);
});
