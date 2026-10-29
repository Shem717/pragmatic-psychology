import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const css=readFileSync('app/sovereign-depth.css','utf8');
test('sculpted material remains a scoped style-only layer without new artwork or autonomous motion',()=>{
 assert.match(readFileSync('app/layout.tsx','utf8'),/import "\.\/sovereign-depth.css"/);
 assert.match(css,/--depth-brass/);assert.match(css,/--depth-well/);
 assert.ok(!/@keyframes|url\(|backdrop-filter|filter:blur/.test(css));
 assert.ok(!/\.source-record\s*\{[^}]*text-shadow:(?!none)/.test(css));
});
test('material preferences preserve independent focus and suppress decorative states',()=>{
 assert.match(css,/outline:3px solid #91dce8/);assert.match(css,/@media \(forced-colors:active\)/);
 assert.match(css,/outline:3px solid Highlight !important/);assert.match(css,/@media \(prefers-reduced-motion:reduce\)/);
 assert.match(css,/transform:none !important/);assert.match(css,/data-mode="Focused"/);assert.match(css,/@media print/);
 assert.match(css,/@media \(hover:hover\) and \(pointer:fine\)/);assert.match(css,/min-height:44px/);
});
test('depth design preserves every content artifact byte for byte',()=>{
 const pins:Record<string,string>={"content/evidence-assertions.json": "6ca14506d3e568bd59c8131fbef01b5ebec591e53b3d1a7980cb033c16ba6c6c", "content/evidence-taxonomy.json": "77ef2c25e42361cd020088064e1d70ba3d253dbfd15ffa5a05de0dfb539e6af5", "content/learning-paths.json": "2627bae588c023d87131bf18603fe2fc08adaebacb207fc1b4024a2414d18d5f", "content/pilot-provenance.json": "7ba6ac0ad70d1c56e9e63091bd200a88d4e464335076fd927e04184d3dfb7e27", "content/public.json": "4d6a50e6476c41f2711276beb1d210f09a528f302db70531a76d206a711ed484"};
 for(const [file,hash] of Object.entries(pins))assert.equal(createHash('sha256').update(readFileSync(file)).digest('hex'),hash,file);
});

test('reduced motion preserves map centering and Focused keeps opaque working surfaces',()=>{
 const reduced=css.split('@media (prefers-reduced-motion:reduce) {')[1].split('@media (forced-colors:active)')[0];
 assert.match(reduced,/body :is\(\.world-portal,\.hero-copy \.button.primary\) \{ transform:none !important;/);
 assert.ok(!/research-map-core[^}]*transform:none/.test(reduced));
 assert.match(css,/:root\[data-mode="Focused"\] body \.instrument-dialog \{ background:#0c131e !important;/);
 assert.match(css,/box-shadow:none; background:#131d29; border-color:var\(--line\)/);
});

test('accessibility media resets explicitly override the more specific Focused material layer',()=>{
 const forced=css.split('@media (forced-colors:active) {')[1].split('@media print')[0];
 assert.match(forced,/background:Canvas !important; color:CanvasText !important/);
 assert.match(forced,/box-shadow:none !important/);
 const print=css.split('@media print {')[1];
 assert.match(print,/background:none !important; color:#000 !important/);
 assert.match(print,/\* \{ color:#000 !important; background-color:transparent !important; text-shadow:none !important/);
});
