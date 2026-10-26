import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync,statSync } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { estimateLibraryHallTriangles,libraryBookMountSlots } from '../lib/library-hall-layout';
const filename='public/art/library-hall/hall-kit.glb';
function kit(){const bytes=readFileSync(filename);assert.equal(bytes.subarray(0,4).toString(),'glTF');assert.equal(bytes.readUInt32LE(4),2);assert.equal(bytes.readUInt32LE(8),bytes.length);assert.equal(bytes.subarray(16,20).toString(),'JSON');const raw=bytes.subarray(20,20+bytes.readUInt32LE(12)).toString();assert.doesNotMatch(raw,/\/workspace\/|file:\/\/|https?:\/\/|data:/);return {data:JSON.parse(raw),bytes};}
test('one authored hall kit shares unchanged same-origin image resources and stays within its loading budget',()=>{
  const {data,bytes}=kit();const uris=new Set<string>();let total=bytes.length,reused=0;
  assert.equal(data.images.length,12);assert.equal(data.textures.length,12);assert.ok(data.materials.length<=16);
  for(const image of data.images){assert.match(image.uri,/^(?:\.\.\/library-benchmark\/)?textures\/[a-f0-9]{64}\.png$/);assert.equal(image.bufferView,undefined);assert.ok(!uris.has(image.uri));uris.add(image.uri);const file=path.resolve(path.dirname(filename),image.uri);assert.ok(file.startsWith(path.resolve('public/art')+path.sep));const imageBytes=readFileSync(file);assert.equal(createHash('sha256').update(imageBytes).digest('hex'),path.basename(file,'.png'));total+=statSync(file).size;if(image.uri.startsWith('../library-benchmark/'))reused++;}
  total+=statSync('public/art/library-celestial-vista.webp').size;
  assert.equal(reused,11);assert.ok(total<18*1024*1024,`main hall payload ${total} exceeds18MiB budget`);
});
test('instanced hero/distant/gallery roots preserve AO coordinates and count every visible triangle copy',()=>{
  const {data}=kit();const expected={BAY_DETAIL:144256,BAY_DISTANT:29568,GALLERY_ARCADE:39620,ARMILLARY:62636};const counts={} as typeof expected;let primitives=0;
  for(const root of Object.keys(expected) as (keyof typeof expected)[]){const index=data.nodes.findIndex((node:{name?:string})=>node.name===root);assert.ok(index>=0);let triangles=0;const walk=(nodeIndex:number)=>{const node=data.nodes[nodeIndex];if(node.mesh!==undefined)for(const primitive of data.meshes[node.mesh].primitives){primitives++;assert.equal(primitive.mode??4,4);triangles+=(primitive.indices!==undefined?data.accessors[primitive.indices].count:data.accessors[primitive.attributes.POSITION].count)/3;const ao=data.materials[primitive.material]?.occlusionTexture;if(ao)assert.ok(primitive.attributes[`TEXCOORD_${ao.texCoord||0}`]!==undefined,'authored baked-AO channel retained');}for(const child of node.children||[])walk(child);};walk(index);counts[root]=triangles;assert.equal(triangles,expected[root]);}
  assert.ok(primitives<=32,`shared module primitives ${primitives} exceed intended primary batching`);
  const estimate=estimateLibraryHallTriangles(counts,100000);assert.equal(estimate.detail+estimate.distant+estimate.gallery+estimate.armillary,891016);assert.ok(estimate.withinTarget);
});
test('only the detailed bay retains seven genuine mounting locators; decorative background has no content bindings',()=>{
  const {data}=kit();const locators=data.nodes.filter((node:{name?:string})=>/^BOOK_MOUNT_0[1-7]$/.test(node.name||''));assert.equal(locators.length,7);
  for(const [index,node] of locators.sort((a:{name:string},b:{name:string})=>a.name.localeCompare(b.name)).entries()){const value=node.translation;assert.ok(Math.abs(value[0]-libraryBookMountSlots[index])<.0001);assert.ok(Math.abs(value[1]-2.35)<.0001);assert.ok(Math.abs(value[2]-.82)<.0001);}
});
