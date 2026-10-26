import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { estimateLibraryHallTriangles } from '../lib/library-hall-layout';
function glb(filename:string){const bytes=readFileSync(filename);assert.equal(bytes.subarray(0,4).toString(),'glTF');assert.equal(bytes.readUInt32LE(4),2);assert.equal(bytes.readUInt32LE(8),bytes.length);assert.equal(bytes.subarray(16,20).toString(),'JSON');const raw=bytes.subarray(20,20+bytes.readUInt32LE(12)).toString();assert.doesNotMatch(raw,/\/workspace\/|file:\/\/|https?:\/\/|data:/);return {data:JSON.parse(raw),bytes};}
const architecture='public/art/library-revision/architecture-kit.glb',book='public/art/library-book/tactile-volume.glb';
function triangles(data:ReturnType<typeof glb>['data'],root:number){let total=0;const walk=(index:number)=>{const node=data.nodes[index];if(node.mesh!==undefined)for(const p of data.meshes[node.mesh].primitives){assert.equal(p.mode??4,4);total+=data.accessors[p.indices??p.attributes.POSITION].count/3;const ao=data.materials[p.material]?.occlusionTexture;if(ao)assert.ok(p.attributes[`TEXCOORD_${ao.texCoord||0}`]!==undefined,'preserve authored AO UV channel');}for(const child of node.children||[])walk(child);};walk(root);return total;}
test('replacement architecture and shared tactile volume use only same-origin decoded assets within loading budget',()=>{
 let total=0;const images=new Set<string>();
 for(const filename of [architecture,book]){const {data,bytes}=glb(filename);total+=bytes.length;
  for(const image of data.images||[]){assert.equal(image.bufferView,undefined);assert.ok(typeof image.uri==='string');const file=path.resolve(path.dirname(filename),image.uri);assert.ok(file.startsWith(path.resolve('public/art')+path.sep));if(!images.has(file)){images.add(file);const bytes=readFileSync(file);assert.ok(bytes.length>30);total+=statSync(file).size;}}
 }
 for(const file of ['celestial-marble-color.webp','celestial-marble-normal.webp','celestial-marble-orm.webp'])total+=statSync('public/art/library-floor/'+file).size;
 total+=statSync('public/art/library-celestial-vista.webp').size;
 assert.ok(total<18*1024*1024,`complete main-room download ${total} exceeds18MiB budget`);
});
test('architecture contains only functional cabinet, lectern, gallery and centerpiece; every displayed copy is budgeted',()=>{
 const {data}=glb(architecture);assert.ok(!data.nodes.some((n:{name?:string})=>/^BAY_(DISTANT|DETAIL)$|DECORATIVE_BOOK|FILLER_BOOK/.test(n.name||'')));
 const counts={CABINET:0,LECTERN:0,GALLERY_ARCADE:0,ARMILLARY:0,BOOK:0};
 for(const root of ['CABINET','LECTERN','GALLERY_ARCADE','ARMILLARY'] as const){const index=data.nodes.findIndex((n:{name?:string})=>n.name===root);assert.ok(index>=0,root);const node=data.nodes[index];assert.deepEqual(node.translation??[0,0,0],[0,0,0]);assert.deepEqual(node.scale??[1,1,1],[1,1,1]);assert.deepEqual(node.rotation??[0,0,0,1],[0,0,0,1]);counts[root]=triangles(data,index);assert.ok(counts[root]>0);}
 const volume=glb(book).data;for(const node of volume.scenes[volume.scene||0].nodes)counts.BOOK+=triangles(volume,node);
 assert.ok(counts.BOOK<15000);const estimate=estimateLibraryHallTriangles(counts,100000);assert.ok(estimate.withinTarget,JSON.stringify(estimate));
});
test('interactive books have independent leather color, normal and roughness plus actual metallic ornament geometry',()=>{
 const {data}=glb(book);const leather=data.materials.find((m:{name?:string})=>/leather/i.test(m.name||''));assert.ok(leather);assert.ok(leather.normalTexture);assert.ok(leather.pbrMetallicRoughness.baseColorTexture);assert.ok(leather.pbrMetallicRoughness.metallicRoughnessTexture);
 const gold=data.materials.find((m:{name?:string})=>/gold/i.test(m.name||''));assert.ok(gold);assert.ok(gold.pbrMetallicRoughness.metallicFactor>.7);
 const primitives=data.meshes.flatMap((mesh:{primitives:unknown[]})=>mesh.primitives);assert.ok(primitives.length<=5);
});
