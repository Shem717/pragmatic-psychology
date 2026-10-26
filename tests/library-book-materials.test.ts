import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createLibraryBookPresentation,libraryLeatherTones,libraryBookLettering} from '../lib/library-book-materials';
test('seven dyed bindings retain authored grain maps and own only cloned leather materials',()=>{
 const model=new THREE.Group(),map=new THREE.Texture(),normal=new THREE.Texture(),roughness=new THREE.Texture();
 const leather=new THREE.MeshStandardMaterial({map,normalMap:normal,roughnessMap:roughness});leather.name='Authored leather';
 const gold=new THREE.MeshStandardMaterial({metalness:.88});gold.name='Gold relief';
 const mesh=new THREE.Mesh(new THREE.BoxGeometry(),[leather,gold]);model.add(mesh);
 let sourceDisposals=0;map.addEventListener('dispose',()=>sourceDisposals++);leather.addEventListener('dispose',()=>sourceDisposals++);
 assert.equal(new Set(libraryLeatherTones).size,7);
 for(let number=1;number<=7;number++){
  const result=createLibraryBookPresentation(model,number);const copy=result.object.children[0] as THREE.Mesh;
  const materials=copy.material as THREE.MeshStandardMaterial[];assert.notEqual(materials[0],leather);assert.equal(materials[1],gold);
  assert.equal(materials[0].map,map);assert.equal(materials[0].normalMap,normal);assert.equal(materials[0].roughnessMap,roughness);assert.equal(copy.geometry,mesh.geometry);
  result.dispose();
 }
 assert.equal(sourceDisposals,0);assert.equal((mesh.material as THREE.Material[])[0],leather);
});
test('lettering has a readable warm baseline independent of a perfect metallic reflection angle',()=>{
 assert.ok(libraryBookLettering.metalness<=.3);assert.ok(libraryBookLettering.idle>=.4);assert.ok(libraryBookLettering.active>libraryBookLettering.idle);
 const color=new THREE.Color(libraryBookLettering.color);assert.ok(.2126*color.r+.7152*color.g+.0722*color.b>.8);
});
