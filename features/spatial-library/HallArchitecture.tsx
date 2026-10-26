"use client";
import { useEffect,useMemo,useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { upperLibraryGallery } from '@/lib/library-hall-layout';
import { findHallMaterial,type HallKit } from './HallModels';
export type HallMaterials={marble:THREE.MeshStandardMaterial;gold:THREE.MeshStandardMaterial;wood:THREE.MeshStandardMaterial;leather:THREE.MeshStandardMaterial};
export function getHallMaterials(kit:HallKit):HallMaterials{return {marble:findHallMaterial(kit,'Midnight marble'),gold:findHallMaterial(kit,'Brushed antique brass'),wood:findHallMaterial(kit,'Walnut recessed'),leather:findHallMaterial(kit,'Morocco leather')};}
function useTiledMaterial(base:THREE.MeshStandardMaterial,repeat:number){
  const value=useMemo(()=>{const material=base.clone();material.aoMap=null;const clones=new Map<THREE.Texture,THREE.Texture>();for(const key of ['map','normalMap','roughnessMap','metalnessMap'] as const){const original=material[key];if(original){let copy=clones.get(original);if(!copy){copy=original.clone();copy.wrapS=copy.wrapT=THREE.RepeatWrapping;copy.repeat.set(repeat,repeat);copy.channel=0;copy.needsUpdate=true;clones.set(original,copy);}material[key]=copy;}}return {material,textures:Array.from(clones.values())};},[base,repeat]);
  useEffect(()=>()=>{value.material.dispose();value.textures.forEach(texture=>texture.dispose());},[value]);return value.material;
}
function Instances({geometry,material,matrices,castShadow=false}:{geometry:THREE.BufferGeometry;material:THREE.Material;matrices:THREE.Matrix4[];castShadow?:boolean}){
  const mesh=useRef<THREE.InstancedMesh>(null);const {invalidate}=useThree();useEffect(()=>{matrices.forEach((matrix,index)=>mesh.current?.setMatrixAt(index,matrix));if(mesh.current){mesh.current.instanceMatrix.needsUpdate=true;mesh.current.computeBoundingSphere();}invalidate();},[matrices,invalidate]);
  return <instancedMesh ref={mesh} args={[geometry,material,matrices.length]} castShadow={castShadow} receiveShadow/>;
}
function GrandStairs({marble,gold}:{marble:THREE.Material;gold:THREE.Material}){
  const data=useMemo(()=>{
    const steps:THREE.Matrix4[]=[],posts:THREE.Matrix4[]=[],rails:THREE.TubeGeometry[]=[];const object=new THREE.Object3D();
    for(const side of [-1,1]){
      for(let i=0;i<30;i++){const angle=side*(.95+i*.032),y=.145+i*.293;object.position.set(Math.sin(angle)*13.1,y,Math.cos(angle)*13.1);object.rotation.set(0,angle,0);object.scale.set(1,1,1);object.updateMatrix();steps.push(object.matrix.clone());
        if(i%2===0)for(const radius of [12.25,13.95]){object.position.set(Math.sin(angle)*radius,y+.62,Math.cos(angle)*radius);object.rotation.set(0,0,0);object.updateMatrix();posts.push(object.matrix.clone());}
      }
      for(const radius of [12.25,13.95]){const points=Array.from({length:30},(_,i)=>{const angle=side*(.95+i*.032);return new THREE.Vector3(Math.sin(angle)*radius,1.24+i*.293,Math.cos(angle)*radius);});rails.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),100,.045,8,false));}
    }
    const step=new RoundedBoxGeometry(.46,.293,1.8,2,.025);
    const post=new THREE.LatheGeometry([new THREE.Vector2(.065,-.52),new THREE.Vector2(.07,-.44),new THREE.Vector2(.04,-.35),new THREE.Vector2(.06,-.23),new THREE.Vector2(.035,0),new THREE.Vector2(.08,.16),new THREE.Vector2(.035,.32),new THREE.Vector2(.05,.49),new THREE.Vector2(.07,.54)],10);
    return {steps,posts,rails,step,post};
  },[]);
  useEffect(()=>()=>{data.step.dispose();data.post.dispose();data.rails.forEach(geometry=>geometry.dispose());},[data]);
  return <><Instances geometry={data.step} material={marble} matrices={data.steps} castShadow/><Instances geometry={data.post} material={gold} matrices={data.posts}/>{data.rails.map((geometry,index)=><mesh key={index} geometry={geometry} material={gold}/>)}</>;
}
function Vault({marble,gold}:{marble:THREE.Material;gold:THREE.Material}){
  const data=useMemo(()=>{
    const positions:number[]=[],uv:number[]=[],indices:number[]=[];
    for(let row=0;row<=16;row++)for(let column=0;column<=96;column++){const t=row/16,angle=column/96*Math.PI*2,radius=13.65-t*9.3;positions.push(Math.sin(angle)*radius,13.65+Math.sin(t*Math.PI/2)*4.65,Math.cos(angle)*radius);uv.push(column/96*3,t*1.5);}
    for(let row=0;row<16;row++)for(let column=0;column<96;column++){const index=row*97+column;indices.push(index,index+1,index+97,index+1,index+98,index+97);}
    const shell=new THREE.BufferGeometry();shell.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));shell.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));shell.setIndex(indices);shell.computeVertexNormals();
    const ribs=Array.from({length:16},(_,i)=>{const angle=i*Math.PI/8;return new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(Math.sin(angle)*13.65,13.65,Math.cos(angle)*13.65),new THREE.Vector3(Math.sin(angle)*10,16.5,Math.cos(angle)*10),new THREE.Vector3(Math.sin(angle)*4.35,18.3,Math.cos(angle)*4.35)]),40,.055,8,false);});
    const stars:number[]=[];for(let i=0;i<420;i++){const t=(i*37%100)/100,angle=i*2.39996,radius=13.6-t*9.3;stars.push(Math.sin(angle)*radius,13.58+Math.sin(t*Math.PI/2)*4.65,Math.cos(angle)*radius);}
    return {shell,ribs,stars:new Float32Array(stars)};
  },[]);
  const ceiling=useMemo(()=>{const material=marble.clone();material.side=THREE.DoubleSide;return material;},[marble]);
  useEffect(()=>()=>{data.shell.dispose();data.ribs.forEach(geometry=>geometry.dispose());ceiling.dispose();},[data,ceiling]);
  return <><mesh geometry={data.shell} material={ceiling}/>{data.ribs.map((geometry,index)=><mesh key={index} geometry={geometry} material={gold}/>)}<points><bufferGeometry><bufferAttribute attach="attributes-position" args={[data.stars,3]}/></bufferGeometry><pointsMaterial color="#d6bc86" size={.035} sizeAttenuation/></points>{[[4.35,18.3],[4.48,18.4],[13.6,13.55],[13.65,13.7]].map(([radius,y])=><mesh key={y} position={[0,y,0]} rotation={[Math.PI/2,0,0]} material={gold}><torusGeometry args={[radius,.055,8,96]}/></mesh>)}</>;
}
function DistantSky({vista}:{vista:THREE.Texture}){
  const geometry=useMemo(()=>{
    const shape=new THREE.Shape();shape.moveTo(-2.5,1.05);shape.lineTo(2.5,1.05);shape.lineTo(2.5,2.05);for(let step=1;step<=48;step++){const angle=step/48*Math.PI;shape.lineTo(Math.cos(angle)*2.5,2.05+Math.sin(angle)*2.37);}shape.lineTo(-2.5,1.05);
    const geometry=new THREE.ShapeGeometry(shape,48),uv=geometry.getAttribute('uv'),position=geometry.getAttribute('position');for(let i=0;i<uv.count;i++)uv.setXY(i,(position.getX(i)+2.5)/5,position.getY(i)/4.42);return geometry;
  },[]);useEffect(()=>()=>geometry.dispose(),[geometry]);
  return <>{upperLibraryGallery.map(placement=><group key={placement.angleDegrees} position={placement.position} rotation={[0,placement.rotationY,0]}><mesh geometry={geometry} position={[0,0,-.1]}><meshBasicMaterial map={vista} color="#b1bad0" side={THREE.DoubleSide} toneMapped={false}/></mesh></group>)}</>;
}
export function HallArchitecture({materials,vista}:{materials:HallMaterials;vista:THREE.Texture|null}){
  const floor=useTiledMaterial(materials.marble,4),stair=useTiledMaterial(materials.marble,1),wood=useTiledMaterial(materials.wood,2);
  return <>
    <mesh position={[0,-.19,0]} receiveShadow material={floor}><cylinderGeometry args={[15.25,15.45,.38,128]}/></mesh>
    {[1.75,1.85,3.35,3.5,5.5,5.58,8.2,8.3,11.2,11.3,14.5,14.65].map(radius=><mesh key={radius} position={[0,.012,0]} rotation={[Math.PI/2,0,0]} material={materials.gold}><torusGeometry args={[radius,.018,6,128]}/></mesh>)}
    <GrandStairs marble={stair} gold={materials.gold}/><Vault marble={floor} gold={materials.gold}/>
    {vista&&<DistantSky vista={vista}/>}
    <mesh position={[0,.12,2]} material={stair} receiveShadow><cylinderGeometry args={[3.3,3.5,.24,96]}/></mesh>
    <mesh position={[0,.26,2]} rotation={[Math.PI/2,0,0]} material={materials.gold}><torusGeometry args={[3.24,.025,8,96]}/></mesh>
    <mesh position={[0,.32,2]} material={wood} receiveShadow><cylinderGeometry args={[2.65,2.8,.18,96]}/></mesh>
  </>;
}
