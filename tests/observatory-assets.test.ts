import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Matrix4, Quaternion, Vector3 } from 'three';
import { observatoryInstrumentBounds, observatoryStationLocations } from '../lib/observatory-layout';

const filename='public/art/observatory-telescope/telescope.glb';
function asset(){const bytes=readFileSync(filename);assert.equal(bytes.subarray(0,4).toString(),'glTF');assert.equal(bytes.readUInt32LE(8),bytes.length);const raw=bytes.subarray(20,20+bytes.readUInt32LE(12)).toString();assert.doesNotMatch(raw,/data:|blob:|https?:\/\/|\/workspace\//);return {bytes,data:JSON.parse(raw)};}
test('authored telescope uses bounded same-origin maps and differentiated physical materials',()=>{
 const {data,bytes}=asset();let total=bytes.length;
 for(const image of data.images){assert.equal(image.bufferView,undefined);const file=path.resolve(path.dirname(filename),image.uri);assert.ok(file.startsWith(path.resolve('public/art/observatory-telescope')+path.sep));const imageBytes=readFileSync(file);assert.equal(imageBytes.subarray(1,4).toString(),'PNG');total+=imageBytes.length;}
 assert.ok(total<6*1024*1024);assert.equal(data.materials.length,6);
 for(const name of ['stone','brass']){const material=data.materials.find((m:{name:string})=>m.name.toLowerCase().includes(name));assert.ok(material.normalTexture);assert.ok(material.pbrMetallicRoughness.baseColorTexture);assert.ok(material.pbrMetallicRoughness.metallicRoughnessTexture);}
 assert.ok(data.materials.some((m:{extensions?:Record<string,unknown>})=>m.extensions?.KHR_materials_transmission));
 assert.ok(data.nodes.some((n:{name:string})=>n.name==='TELESCOPE_BASE'));
 assert.ok(data.nodes.some((n:{name:string})=>n.name==='TELESCOPE_OPTICS'));
 let triangles=0,primitives=0;for(const mesh of data.meshes)for(const primitive of mesh.primitives){primitives++;assert.equal(primitive.mode??4,4);triangles+=data.accessors[primitive.indices??primitive.attributes.POSITION].count/3;}
 assert.ok(triangles<=120000);assert.ok(primitives<=12);
});
test('actual exported telescope geometry stays inside every tested camera envelope',()=>{
 const {data}=asset();const envelope=observatoryInstrumentBounds.telescope;
 const location=new Vector3(...observatoryStationLocations.telescope);
 const walk=(index:number,parent:Matrix4)=>{
  const node=data.nodes[index];const local=node.matrix?new Matrix4().fromArray(node.matrix):new Matrix4().compose(new Vector3(...(node.translation??[0,0,0]) as [number,number,number]),new Quaternion(...(node.rotation??[0,0,0,1]) as [number,number,number,number]),new Vector3(...(node.scale??[1,1,1]) as [number,number,number]));
  const world=new Matrix4().multiplyMatrices(parent,local);
  if(node.mesh!==undefined)for(const primitive of data.meshes[node.mesh].primitives){const accessor=data.accessors[primitive.attributes.POSITION];for(const x of [accessor.min[0],accessor.max[0]])for(const y of [accessor.min[1],accessor.max[1]])for(const z of [accessor.min[2],accessor.max[2]]){const point=new Vector3(x,y,z).applyMatrix4(world).add(location);point.toArray().forEach((value,axis)=>{assert.ok(value>=envelope.min[axis]-.001&&value<=envelope.max[axis]+.001,`asset outside camera envelope ${axis}: ${value}`);});}}
  for(const child of node.children??[])walk(child,world);
 };
 for(const index of data.scenes[data.scene??0].nodes)walk(index,new Matrix4());
});
