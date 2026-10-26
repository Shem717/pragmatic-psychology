import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync,statSync } from 'node:fs';
import path from 'node:path';
import * as THREE from 'three';
import { libraryBenchmark } from '../lib/library-benchmark';
import { disposeBenchmarkAsset,measureBenchmarkAsset } from '../features/library-benchmark/asset-lifetime';

test('benchmark views are bounded and models remain confined to their experimental route assets',()=>{
  assert.equal(libraryBenchmark.models.length,2);assert.equal(libraryBenchmark.views.length,3);
  for(const model of libraryBenchmark.models)assert.match(model.url,/^\/art\/library-benchmark\/[a-z-]+\.glb$/);
  for(const view of libraryBenchmark.views){assert.ok([...view.position,...view.target].every(Number.isFinite));assert.ok((view.fov||libraryBenchmark.fov)>=20&&(view.fov||libraryBenchmark.fov)<=60);assert.notDeepEqual(view.position,view.target);}
  const page=readFileSync('app/library/benchmark/page.tsx','utf8');assert.match(page,/index:false/);
  const sitemap=readFileSync('app/sitemap.ts','utf8');assert.doesNotMatch(sitemap,/library\/benchmark/);
});
test('benchmark GLBs use same-origin textures, preserve baked AO coordinates and stay within the isolated asset budget',()=>{
  let total=0,triangles=0,occlusion=0;const external=new Set<string>();
  for(const model of libraryBenchmark.models){
    const filename=path.join('public',model.url),buffer=readFileSync(filename);total+=buffer.length;
    assert.equal(buffer.subarray(0,4).toString(),'glTF');assert.equal(buffer.readUInt32LE(4),2);assert.equal(buffer.readUInt32LE(8),buffer.length);assert.equal(buffer.subarray(16,20).toString(),'JSON');
    const text=buffer.subarray(20,20+buffer.readUInt32LE(12)).toString();assert.doesNotMatch(text,/\/workspace\/|file:\/\/|https?:\/\/|data:/);
    const data=JSON.parse(text);
    for(const image of data.images||[]){assert.match(image.uri,/^textures\/[a-zA-Z0-9._-]+\.(png|jpg|jpeg|webp)$/);assert.equal(image.bufferView,undefined);external.add(path.join(path.dirname(filename),image.uri));}
    for(const material of data.materials||[])if(material.occlusionTexture)occlusion++;
    for(const mesh of data.meshes||[])for(const primitive of mesh.primitives){assert.equal(primitive.mode??4,4);triangles+=(primitive.indices!==undefined?data.accessors[primitive.indices].count:data.accessors[primitive.attributes.POSITION].count)/3;const ao=data.materials[primitive.material]?.occlusionTexture;if(ao)assert.ok(primitive.attributes[`TEXCOORD_${ao.texCoord||0}`]!==undefined,'baked AO UV channel retained');}
  }
  for(const file of Array.from(external))total+=statSync(file).size;
  assert.ok(occlusion>=8);assert.ok(triangles>100000&&triangles<250000);assert.ok(total<16*1024*1024,`benchmark assets ${total} bytes exceed isolated budget`);
});
test('owned benchmark GLB resources shared between meshes are disposed exactly once',()=>{
  const root=new THREE.Group(),geometry=new THREE.BoxGeometry(),texture=new THREE.Texture(),material=new THREE.MeshStandardMaterial({map:texture});root.add(new THREE.Mesh(geometry,material),new THREE.Mesh(geometry,material));
  const calls={geometry:0,material:0,texture:0};geometry.addEventListener('dispose',()=>calls.geometry++);material.addEventListener('dispose',()=>calls.material++);texture.addEventListener('dispose',()=>calls.texture++);
  assert.deepEqual(measureBenchmarkAsset(root),{meshes:2,triangles:24,materials:1});disposeBenchmarkAsset(root);assert.deepEqual(calls,{geometry:1,material:1,texture:1});
});
