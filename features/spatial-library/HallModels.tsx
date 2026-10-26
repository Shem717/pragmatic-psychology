"use client";
import { useEffect,useMemo,useRef,useState } from 'react';
import { addAfterEffect,useFrame,useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { disposeBenchmarkAsset as disposeOwnedAsset } from '@/features/library-benchmark/asset-lifetime';
import type { HallModuleRoot,HallPlacement } from '@/lib/library-hall-layout';
export type HallKit={scene:THREE.Group;modules:Record<HallModuleRoot,THREE.Object3D>;book:THREE.Group};
export function useHallKit(onFailure:(message:string)=>void){
  const [kit,setKit]=useState<HallKit|null>(null);const {invalidate}=useThree();
  useEffect(()=>{
    let active=true,owned:THREE.Group|null=null,book:THREE.Group|null=null;
    const loader=new GLTFLoader();
    // Independent owned loads: a late success is disposed even if its companion fails.
    const load=async(url:string)=>{const result=await loader.loadAsync(url);if(!active){disposeOwnedAsset(result.scene);throw new Error('Hall load cancelled');}return result.scene;};
    Promise.all([load('/art/library-revision/architecture-kit.glb').then(scene=>{owned=scene;return scene;}),load('/art/library-book/tactile-volume.glb').then(scene=>{book=scene;return scene;})]).then(([loaded,volume])=>{
      if(!active)return;
      owned=loaded;owned.updateMatrixWorld(true);
      const names:HallModuleRoot[]=['CABINET','LECTERN','GALLERY_ARCADE','ARMILLARY'];
      const modules={} as Record<HallModuleRoot,THREE.Object3D>;
      for(const name of names){const root=owned.getObjectByName(name);if(!root)throw new Error(`Missing hall module ${name}`);modules[name]=root;}
      setKit({scene:owned,modules,book:volume});invalidate();
    }).catch(()=>{if(active)onFailure('The detailed hall could not load. The complete catalogue and all seven books remain available.');});
    return()=>{active=false;if(owned)disposeOwnedAsset(owned);if(book)disposeOwnedAsset(book);};
  },[onFailure,invalidate]);
  return kit;
}
function InstancePart({geometry,material,local,placements,castShadow}:{geometry:THREE.BufferGeometry;material:THREE.Material|THREE.Material[];local:THREE.Matrix4;placements:HallPlacement[];castShadow:boolean}){
  const instance=useRef<THREE.InstancedMesh>(null);const {invalidate}=useThree();
  useEffect(()=>{
    const object=new THREE.Object3D(),matrix=new THREE.Matrix4();
    placements.forEach((placement,index)=>{object.position.set(...placement.position);object.rotation.set(0,placement.rotationY,0);object.scale.setScalar(placement.scale);object.updateMatrix();matrix.multiplyMatrices(object.matrix,local);instance.current?.setMatrixAt(index,matrix);});
    if(instance.current){instance.current.instanceMatrix.needsUpdate=true;instance.current.computeBoundingSphere();instance.current.computeBoundingBox();}invalidate();
  },[placements,local,invalidate]);
  // Geometry/material are owned once by the loaded kit; only instance buffers are local.
  return <instancedMesh ref={instance} args={[geometry,material,placements.length]} castShadow={castShadow} receiveShadow/>;
}
export function InstancedHallModule({root,placements,castShadow=false}:{root:THREE.Object3D;placements:HallPlacement[];castShadow?:boolean}){
  const parts=useMemo(()=>{
    root.updateWorldMatrix(true,true);const inverse=new THREE.Matrix4().copy(root.matrixWorld).invert();
    const result:{id:string;geometry:THREE.BufferGeometry;material:THREE.Material|THREE.Material[];local:THREE.Matrix4}[]=[];
    root.traverse(object=>{if(object instanceof THREE.Mesh)result.push({id:object.uuid,geometry:object.geometry,material:object.material,local:new THREE.Matrix4().multiplyMatrices(inverse,object.matrixWorld)});});return result;
  },[root]);
  return <>{parts.map(part=><InstancePart key={part.id} {...part} placements={placements} castShadow={castShadow}/>)}</>;
}
export function SingleHallModule({root,placement}:{root:THREE.Object3D;placement:HallPlacement}){
  const object=useMemo(()=>{const copy=root.clone(true);copy.position.set(0,0,0);copy.rotation.set(0,0,0);copy.scale.setScalar(1);copy.traverse(part=>{if(part instanceof THREE.Mesh){const materials=Array.isArray(part.material)?part.material:[part.material];if(materials.some(material=>/Celestial glass/.test(material.name)))part.visible=false;part.castShadow=!materials.some(material=>material instanceof THREE.MeshPhysicalMaterial&&material.transmission>0);part.receiveShadow=true;}});return copy;},[root]);
  return <group position={placement.position} rotation={[0,placement.rotationY,0]} scale={placement.scale}><primitive object={object} dispose={null}/></group>;
}
/** Frame-wide counters include the planar capture; resource counts are not FPS claims. */
export function HallRenderMetrics(){
  const {gl}=useThree();const rendered=useRef(false);
  useFrame(()=>{gl.info.reset();rendered.current=true;},-100);
  useEffect(()=>{
    const previous=gl.info.autoReset;
    // This is Three's external renderer bookkeeping, not React state.
    Object.assign(gl.info,{autoReset:false});
    const unsubscribe=addAfterEffect(()=>{
      if(!rendered.current)return;rendered.current=false;
      gl.domElement.dataset.renderCalls=String(gl.info.render.calls);
      gl.domElement.dataset.renderTriangles=String(gl.info.render.triangles);
      gl.domElement.dataset.gpuGeometries=String(gl.info.memory.geometries);
      gl.domElement.dataset.gpuTextures=String(gl.info.memory.textures);
      gl.domElement.dataset.renderCounterScope='frame-with-reflection';
    });
    return()=>{unsubscribe();Object.assign(gl.info,{autoReset:previous});};
  },[gl]);return null;
}
export function findHallMaterial(kit:HallKit,name:string){
  let match:THREE.MeshStandardMaterial|null=null;
  kit.scene.traverse(object=>{if(object instanceof THREE.Mesh){const list=Array.isArray(object.material)?object.material:[object.material];for(const material of list)if(material instanceof THREE.MeshStandardMaterial&&material.name.includes(name)&&!match)match=material;}});
  if(!match)throw new Error(`Missing authored hall material ${name}`);return match as THREE.MeshStandardMaterial;
}
