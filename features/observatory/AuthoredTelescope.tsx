"use client";
import { useEffect, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { disposeBenchmarkAsset } from '@/features/library-benchmark/asset-lifetime';

/** One owned, same-origin authored instrument. Materials keep their exported UVs. */
export function AuthoredTelescope({onReady,onFailure}:{onReady:()=>void;onFailure:(reason:string)=>void}) {
 const {invalidate}=useThree();
 const [model,setModel]=useState<THREE.Group|null>(null);
 const callbacks=useRef({onReady,onFailure});
 useEffect(()=>{callbacks.current={onReady,onFailure};},[onReady,onFailure]);
 useEffect(()=>{
  let active=true;let owned:THREE.Group|null=null;
  new GLTFLoader().loadAsync('/art/observatory-telescope/telescope.glb').then(result=>{
   if(!active){disposeBenchmarkAsset(result.scene);return;}
   owned=result.scene;
   owned.traverse(object=>{if(object instanceof THREE.Mesh){const materials=Array.isArray(object.material)?object.material:[object.material];object.castShadow=!materials.some(material=>material instanceof THREE.MeshPhysicalMaterial&&material.transmission>0);object.receiveShadow=true;}});
   setModel(owned);callbacks.current.onReady();invalidate();
  }).catch(()=>{if(active)callbacks.current.onFailure('The detailed telescope could not load. All three working instruments remain available without the room.');});
  return()=>{active=false;if(owned)disposeBenchmarkAsset(owned);};
 },[invalidate]);
 // The authored mechanics stay physically coherent. Selecting a perspective
 // changes the working text, not a fabricated optical/confidence measurement.
 return model?<primitive object={model} dispose={null}/>:null;
}
