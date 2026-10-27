import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { content } from '../lib/content';
import { Constellation } from '../features/evidence/Constellation';
const noop=()=>{};
const claimsFor=(count:number)=>Array.from({length:count},(_,index)=>({...content.claims[index%content.claims.length],id:`CL-density-${index}`,slug:`density-${index}`,title:`Density test claim ${index}`}));

test('13, 16 and larger claim catalogues use normal-flow density without omitting or truncating records',()=>{
  for(const count of [13,16,24,50]){
    const claims=claimsFor(count);
    const html=renderToStaticMarkup(createElement(Constellation,{claims,visible:claims,active:claims[0],sources:content.sources,view:'claims',onView:noop,onSelect:noop}));
    assert.match(html,/is-dense-claims/);
    assert.equal((html.match(/aria-controls="claim-inspector"/g)||[]).length,count);
    assert.doesNotMatch(html,/style="left:/);
    assert.equal((html.match(/aria-pressed="true"/g)||[]).length,2,'one selected claim and the claims-view control');
    for(const c of claims)assert.ok(html.includes(`aria-label="Inspect ${c.title}"`));
  }
});

test('filtering retains visible records and source-role view keeps its original connection geometry',()=>{
  const claims=claimsFor(16),visible=claims.slice(3,5);
  const html=renderToStaticMarkup(createElement(Constellation,{claims,visible,active:visible[0],sources:content.sources,view:'claims',onView:noop,onSelect:noop}));
  assert.equal((html.match(/aria-controls="claim-inspector"/g)||[]).length,2);
  const small=claimsFor(11);
  assert.doesNotMatch(renderToStaticMarkup(createElement(Constellation,{claims:small,visible:small,active:small[0],sources:content.sources,view:'claims',onView:noop,onSelect:noop})),/is-dense-claims/);
  const sourceHtml=renderToStaticMarkup(createElement(Constellation,{claims:content.claims,visible:content.claims,active:content.claims.find(c=>c.id==='CL-reconsolidation'),sources:content.sources,view:'sources',onView:noop,onSelect:noop}));
  assert.doesNotMatch(sourceHtml,/is-dense-claims/);assert.match(sourceHtml,/is-source-view/);assert.match(sourceHtml,/data-role="conflicts"/);assert.match(sourceHtml,/Position, distance and size do not measure evidence strength/);
});

test('dense-card CSS has auto-fitting columns and non-absolute cards without fixed canvas height or clipping',()=>{
  const css=readFileSync('app/evidence/evidence.css','utf8');
  const grid=css.match(/\.research-starfield\.is-dense-claims\s*\{([^}]+)\}/)![1];
  assert.match(grid,/repeat\(auto-fit,minmax\(min\(140px,100%\),1fr\)\)/);assert.match(grid,/height:auto/);
  const card=css.match(/\.is-dense-claims \.research-claim-star\s*\{([^}]+)\}/)![1];
  assert.match(card,/position:static/);assert.match(card,/transform:none/);assert.match(card,/min-width:0/);assert.match(card,/overflow-wrap:anywhere/);
  assert.doesNotMatch(card,/overflow:(?:hidden|clip)|max-height|line-clamp/);
});
