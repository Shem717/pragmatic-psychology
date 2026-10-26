"use client";
import { addAfterEffect, Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { CelestialHeart, Lantern } from '@/features/scene/SceneCraft';
import { CelestialFloor } from '@/features/spatial-library/CelestialFloor';
import { ObservatoryCraft, DeskFolio } from './ObservatoryCraft';
import { AuthoredTelescope } from './AuthoredTelescope';
import { applyObservatoryProjection, getObservatoryLayout, observatoryOrreryHitRadius, observatoryTelescopeYaw, observatoryStationLocations as stationLocations } from '@/lib/observatory-layout';

export type ObservatoryStation = 'telescope' | 'practice' | 'evidence';
type Props = { workbench: boolean; station: ObservatoryStation | null; lens: number; reducedMotion: boolean; onStation: (id: ObservatoryStation) => void; onReady: () => void; onFailure: (reason: string) => void; onHover?: (station: ObservatoryStation | null) => void; highlighted?: ObservatoryStation | null };
const GOLD='#b99b61', LIGHT_GOLD='#e0c28a', STONE='#8b9195';
function texture(kind:'stone'|'wood') {
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;const ctx=canvas.getContext('2d')!;
  const pixels=ctx.createImageData(512,512);
  for(let y=0;y<512;y++)for(let x=0;x<512;x++){
    const n=(Math.sin(x*127.1+y*311.7)*43758.5453)%1;
    const wave=Math.sin(x*.019+Math.sin(y*.013)*2)+Math.sin(y*.04+x*.008)*.5;
    const grain=kind==='stone'?wave*10:Math.sin(x*.37+wave*3+Math.sin(y*.01)*4)*9;
    const base=kind==='stone'?[40,51,70]:[96,62,35],o=(y*512+x)*4;
    for(let k=0;k<3;k++)pixels.data[o+k]=base[k]+grain+n*6;pixels.data[o+3]=255;
  }
  ctx.putImageData(pixels,0,0);
  if(kind==='stone')for(let i=0;i<12;i++){
    ctx.beginPath();ctx.strokeStyle=i%3?'rgba(213,221,228,.22)':'rgba(210,177,112,.28)';ctx.lineWidth=i%3?.65:1.3;
    for(let y=0;y<512;y+=3){const x=i*48+Math.sin(y*.015+i)*33+Math.sin(y*.055+i)*6-y*.11;if(y===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();
  }
  const result=new THREE.CanvasTexture(canvas);result.colorSpace=THREE.SRGBColorSpace;result.wrapS=result.wrapT=THREE.RepeatWrapping;result.repeat.set(2,2);result.anisotropy=4;return result;
}
function plaqueTexture(title:string,roman:string) {
  const canvas=document.createElement('canvas');canvas.width=768;canvas.height=256;const ctx=canvas.getContext('2d')!;
  ctx.fillStyle='#101b28';ctx.fillRect(0,0,768,256);ctx.strokeStyle='#ad8d50';ctx.lineWidth=3;ctx.strokeRect(13,13,742,230);ctx.lineWidth=1;ctx.strokeRect(23,23,722,210);
  ctx.fillStyle='#ecd4a2';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='72px Georgia,serif';ctx.fillText(roman+' · '+title.replace('THE ',''),384,128,680);
  const result=new THREE.CanvasTexture(canvas);result.colorSpace=THREE.SRGBColorSpace;result.anisotropy=4;return result;
}
function contactTexture(){const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d')!;const g=ctx.createRadialGradient(64,64,4,64,64,64);g.addColorStop(0,'rgba(0,0,0,.8)');g.addColorStop(.45,'rgba(0,0,0,.5)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,128,128);return new THREE.CanvasTexture(c);}
function Block({at,size,color=STONE,map,metal=0,rotation}:{at:[number,number,number];size:[number,number,number];color?:string;map?:THREE.Texture;metal?:number;rotation?:[number,number,number]}){return <mesh position={at} rotation={rotation}><boxGeometry args={size}/><meshStandardMaterial color={color} map={map} bumpMap={map} bumpScale={.04} roughness={metal?.38:.7} metalness={metal}/></mesh>;}
function Ring({at,radius,tube=.035,rotation=[Math.PI/2,0,0],color=GOLD}:{at:[number,number,number];radius:number;tube?:number;rotation?:[number,number,number];color?:string}){return <mesh position={at} rotation={rotation}><torusGeometry args={[radius,tube,8,64]}/><meshStandardMaterial color={color} metalness={.65} roughness={.33}/></mesh>;}
function Cylinder({at,radius,height,color=GOLD,map,rotation}:{at:[number,number,number];radius:number;height:number;color?:string;map?:THREE.Texture;rotation?:[number,number,number]}){return <mesh position={at} rotation={rotation}><cylinderGeometry args={[radius,radius,height,24]}/><meshStandardMaterial color={color} map={map} bumpMap={map} bumpScale={.045} metalness={map?.15:.62} roughness={map?.55:.32}/></mesh>;}
function Plaque({id,title,roman,at,selected,onStation}:{id:ObservatoryStation;title:string;subtitle:string;roman:string;at:[number,number,number];selected:boolean;onStation:Props['onStation']}){
  const map=useMemo(()=>plaqueTexture(title,roman),[title,roman]);useEffect(()=>()=>map.dispose(),[map]);
  return <group position={at} scale={[.67,.44,.7]} onClick={e=>{e.stopPropagation();onStation(id);}}>
    <Block at={[0,-.6,-.12]} size={[.1,1.2,.1]} color={GOLD} metal={.55}/><Block at={[0,0,-.03]} size={[2.7,1.35,.12]} color={selected?LIGHT_GOLD:GOLD} metal={.55}/>
    <mesh position={[0,0,.04]}><planeGeometry args={[2.61,1.26]}/><meshBasicMaterial map={map} toneMapped={false}/></mesh>
  </group>;
}
function PracticeOrrery({selected,onStation,stone}:{selected:boolean;onStation:Props['onStation'];stone:THREE.Texture}){
  return <group position={stationLocations.practice}>
    <Cylinder at={[0,.15,0]} radius={1.35} height={.3} color="#aaa69a" map={stone}/><Cylinder at={[0,1.03,0]} radius={.53} height={1.55} color="#293746" map={stone}/><Ring at={[0,1.8,0]} radius={1.1} tube={.08}/><Cylinder at={[0,1.75,0]} radius={1.15} height={.12} color="#343b44"/>
    <group position={[0,2.75,0]} onClick={e=>{e.stopPropagation();onStation('practice');}}>
      {/* Thin orbit wires are difficult to hit precisely. This non-visible target
          follows their real envelope and shares the same hover/click handler. */}
      <mesh name="orrery-interaction-envelope"><sphereGeometry args={[observatoryOrreryHitRadius,20,12]}/><meshBasicMaterial transparent opacity={0} colorWrite={false} depthWrite={false} side={THREE.DoubleSide}/></mesh>
      <CelestialHeart radius={.61}/>
      {[.69,1.05,1.4].map((radius,i)=><group key={radius} rotation={[.25+i*.32,.3*i,.15*i]}><Ring at={[0,0,0]} radius={radius} tube={.038}/><mesh position={[radius*Math.cos(i*2),0,radius*Math.sin(i*2)]}><sphereGeometry args={[.1+i*.035,16,12]}/><meshStandardMaterial color={['#88b5c7','#a68a67','#a1a1bd'][i]} metalness={.3} roughness={.4}/></mesh></group>)}
      <Cylinder at={[0,-.58,0]} radius={.055} height={1.1}/>
      <Ring at={[0,0,0]} radius={1.4} tube={.045} rotation={[0,0,.2]}/>
      {Array.from({length:24},(_,i)=>i*Math.PI/12).map(a=><Block key={a} at={[Math.sin(a)*1.4,Math.cos(a)*1.4,0]} size={[.035,.12,.045]} color={GOLD} metal={.8} rotation={[0,0,-a]}/>)}
    </group>
    <Plaque id="practice" title="THE ORRERY" subtitle="Practice, action & revision" roman="II" at={[0,.55,1.55]} selected={selected} onStation={onStation}/>
    <pointLight position={[0,4,1]} intensity={20} color="#f1c989" distance={6} decay={2}/>
  </group>;
}
function EvidenceDesk({selected,onStation,stone,wood}:{selected:boolean;onStation:Props['onStation'];stone:THREE.Texture;wood:THREE.Texture}){
  return <group position={stationLocations.evidence} rotation={[0,-.25,0]}>
    <Cylinder at={[0,.11,0]} radius={1.75} height={.22} color="#93948d" map={stone}/>
    {[-.98,.98].map(x=><group key={x} position={[x,.92,0]}><mesh castShadow><cylinderGeometry args={[.13,.22,1.55,12]}/><meshStandardMaterial color="#6b4b32" map={wood} roughness={.6}/></mesh>{[-.68,-.55,.55,.68].map(y=><Ring key={y} at={[0,y,0]} radius={.21} tube={.035}/>)}</group>)}
    <Block at={[0,.5,0]} size={[2.1,.13,.25]} color="#5c422d" map={wood}/>
    <Block at={[0,1.49,.63]} size={[2.6,.28,.1]} color="#614b34" map={wood}/>
    {[-1,0,1].map(x=><Ring key={x} at={[x,1.49,.7]} radius={.08} tube={.014} rotation={[0,0,0]}/>)}
    <Block at={[0,1.72,0]} size={[2.85,.2,1.55]} color="#ae8e5f" map={wood}/><Block at={[0,1.84,0]} size={[2.9,.04,1.58]} color={GOLD} metal={.5}/>
    <group position={[0,1.96,.05]} onClick={e=>{e.stopPropagation();onStation('evidence');}}><DeskFolio/></group>
    <group position={[-1.15,2.45,-.45]}><Lantern scale={.65}/></group>
    {[0,1,2].map(i=><group key={i} position={[1.02,1.95+i*.12,-.3]} rotation={[0,.12-i*.1,0]}><Block at={[0,0,0]} size={[.5,.11,.65]} color={['#3b514d','#5a3740','#294259'][i]}/><Block at={[0,.04,0]} size={[.47,.015,.62]} color="#d4c199"/></group>)}
    <Plaque id="evidence" title="THE EVIDENCE DESK" subtitle="Inspect the claim & its limits" roman="III" at={[0,.68,1.55]} selected={selected} onStation={onStation}/>
    <pointLight position={[-1,3,0]} intensity={14} color="#ffdda8" distance={6} decay={2}/>
  </group>;
}
function GildedArch({at,angle}:{at:[number,number,number];angle:number}){
 const geometry=useMemo(()=>new THREE.TorusGeometry(2.05,.105,8,40,Math.PI),[]);useEffect(()=>()=>geometry.dispose(),[geometry]);
 return <group position={at} rotation={[0,angle,0]}>
  <mesh geometry={geometry} position={[0,6.7,0]}><meshStandardMaterial color={GOLD} metalness={.7} roughness={.29}/></mesh>
  <mesh geometry={geometry} position={[0,6.7,.12]} scale={[1.1,1.1,1]}><meshStandardMaterial color="#a99771" metalness={.5} roughness={.4}/></mesh>
  {[-2.05,2.05].map(x=><Block key={x} at={[x,3.85,0]} size={[.13,5.7,.16]} color={GOLD} metal={.65}/>)}
 </group>;
}
// A null-to-texture map changes shader defines; remount the material when the image arrives.
function WindowMasonry({stone}:{stone:THREE.Texture}) {
 const geometry=useMemo(()=>{
  const shape=new THREE.Shape();shape.moveTo(-2.56,0);shape.lineTo(2.56,0);shape.lineTo(2.56,9.45);shape.lineTo(-2.56,9.45);shape.closePath();
  const opening=new THREE.Path();opening.moveTo(-2.04,1.08);opening.lineTo(2.04,1.08);opening.lineTo(2.04,6.7);opening.absarc(0,6.7,2.04,0,Math.PI,false);opening.lineTo(-2.04,1.08);shape.holes.push(opening);
  const result=new THREE.ExtrudeGeometry(shape,{depth:.34,bevelEnabled:false,curveSegments:28});
  const uv=result.getAttribute('uv'),p=result.getAttribute('position');for(let i=0;i<uv.count;i++)uv.setXY(i,p.getX(i)/4,p.getY(i)/7);
  return result;
 },[]);
 useEffect(()=>()=>geometry.dispose(),[geometry]);
 return <mesh geometry={geometry} position={[0,0,-.22]} receiveShadow><meshStandardMaterial color="#5c6b80" map={stone} bumpMap={stone} bumpScale={.025} roughness={.43} metalness={.14} side={THREE.DoubleSide}/></mesh>;
}
function ImperialWindows({vista,stone}:{vista:THREE.Texture|null;stone:THREE.Texture}){
 const geometries=useMemo(()=>Array.from({length:7},(_,index)=>{const s=new THREE.Shape();s.moveTo(-2.02,0);s.lineTo(2.02,0);s.lineTo(2.02,5.6);s.absarc(0,5.6,2.02,0,Math.PI,false);s.lineTo(-2.02,0);const g=new THREE.ShapeGeometry(s,28),uv=g.getAttribute('uv'),p=g.getAttribute('position');for(let i=0;i<uv.count;i++)uv.setXY(i,(index+(p.getX(i)+2.02)/4.04)/7,p.getY(i)/7.62);return g;}),[]);
 useEffect(()=>()=>geometries.forEach(g=>g.dispose()),[geometries]);
 return <>{Array.from({length:7},(_,i)=>Math.PI+.12+i*(Math.PI-.24)/6).map((a,i)=><group key={i} position={[Math.cos(a)*10.3,0,Math.sin(a)*10.3]} rotation={[0,Math.PI/2-a,0]}>
  <mesh geometry={geometries[i]} position={[0,1.1,.18]}><meshBasicMaterial key={vista ? "loaded-celestial-vista" : "night-fallback"} map={vista} color={vista?'#b0b9cb':'#13263d'} toneMapped={false} side={THREE.DoubleSide}/></mesh>
  <WindowMasonry stone={stone}/><GildedArch at={[0,0,-.08]} angle={0}/>
 </group>)}</>;
}
function ImperialDome({stone}:{stone:THREE.Texture}){
 const geometry=useMemo(()=>{const v:number[]=[],uv:number[]=[],idx:number[]=[];for(let j=0;j<=12;j++)for(let i=0;i<=80;i++){const t=j/12,a=i/80*Math.PI*2,r=10.45-t*7.1;v.push(Math.cos(a)*r,9.8+Math.sin(t*Math.PI/2)*3.55,Math.sin(a)*r);uv.push(i/80*5,t*2);}for(let j=0;j<12;j++)for(let i=0;i<80;i++){const n=j*81+i;idx.push(n,n+1,n+81,n+1,n+82,n+81);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;},[]);
 const ribs=useMemo(()=>Array.from({length:12},(_,i)=>{const a=i*Math.PI/6;return new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(Math.cos(a)*10.4,9.75,Math.sin(a)*10.4),new THREE.Vector3(Math.cos(a)*8,12,Math.sin(a)*8),new THREE.Vector3(Math.cos(a)*3.35,13.35,Math.sin(a)*3.35)]),28,.075,6,false);}),[]);
 const stars=useMemo(()=>{const p:number[]=[];for(let i=0;i<240;i++){const t=((i*37)%100)/100,a=i*2.39996,r=10.4-t*7.05;p.push(Math.cos(a)*r,9.72+Math.sin(t*Math.PI/2)*3.55,Math.sin(a)*r);}return new Float32Array(p);},[]);
 useEffect(()=>()=>{geometry.dispose();ribs.forEach(g=>g.dispose());},[geometry,ribs]);
 return <><mesh geometry={geometry}><meshStandardMaterial color="#142b4d" bumpMap={stone} bumpScale={.025} side={THREE.DoubleSide} roughness={.65}/></mesh>{ribs.map((g,i)=><mesh key={i} geometry={g}><meshStandardMaterial color={GOLD} metalness={.7} roughness={.3}/></mesh>)}<points><bufferGeometry><bufferAttribute attach="attributes-position" args={[stars,3]}/></bufferGeometry><pointsMaterial color="#e3c98c" size={.045} sizeAttenuation/></points><Ring at={[0,13.35,0]} radius={3.35} tube={.13}/><Ring at={[0,13.52,0]} radius={3.38} tube={.045}/></>;
}
function Architecture({stone,contact,vista}:{stone:THREE.Texture;contact:THREE.Texture;vista:THREE.Texture|null}){
 const ornament=useRef<THREE.InstancedMesh>(null);
 const angles=useMemo(()=>Array.from({length:8},(_,i)=>Math.PI-.12+i*(Math.PI+.24)/7),[]);
 useEffect(()=>{const o=new THREE.Object3D();let n=0;for(const a of angles)for(let j=0;j<12;j++){const b=j*Math.PI/6;o.position.set(Math.cos(a)*10+Math.cos(b)*.44,8.66,Math.sin(a)*10+Math.sin(b)*.44);o.rotation.set(.4*Math.sin(b),b,.4*Math.cos(b));o.scale.set(.15,.5,.2);o.updateMatrix();ornament.current?.setMatrixAt(n++,o.matrix);}if(ornament.current)ornament.current.instanceMatrix.needsUpdate=true;},[angles]);
 return <>
  <group scale={[.75,1,.75]}><CelestialFloor reflections={false}/></group><ObservatoryCraft/>
  {/* A continuous enclosing shell sits behind the true arched apertures, never
      a detached platform against an empty background. The camera stays inside. */}
  <mesh position={[0,4.65,0]} receiveShadow><cylinderGeometry args={[11.15,11.15,9.3,96,1,true]}/><meshStandardMaterial color="#53647a" map={stone} bumpMap={stone} bumpScale={.035} roughness={.48} side={THREE.BackSide}/></mesh>
  <mesh position={[0,9.36,0]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[10.35,11.2,96]}/><meshStandardMaterial color="#53647a" map={stone} roughness={.5} side={THREE.DoubleSide}/></mesh>
  {[.22,1.1,9.15].map(y=><Ring key={`enclosure-${y}`} at={[0,y,0]} radius={11.05} tube={y===1.1?.045:.08}/>)}
  <ImperialWindows vista={vista} stone={stone}/><ImperialDome stone={stone}/>
  {[-1,1].map(side=><group key={side} position={[side*8.9,0,5.7]}>
   <Block at={[0,.22,0]} size={[1.3,.44,1.3]} map={stone} color="#8c96a1"/>
   <Cylinder at={[0,4.6,0]} radius={.42} height={8.3} map={stone} color="#6e7a90"/>
   {[.5,.7,8.55,8.7].map(y=><Cylinder key={y} at={[0,y,0]} radius={.53} height={.12}/>)}
   <Block at={[0,8.9,0]} size={[1.25,.3,1.25]} map={stone} color="#939dad"/>
  </group>)}
  {angles.map((a,i)=><group key={i} position={[Math.cos(a)*10,0,Math.sin(a)*10]} rotation={[0,Math.PI/2-a,0]}>
   <Block at={[0,.3,0]} size={[1.25,.6,1.25]} map={stone} color="#9b9a88"/>
   <Cylinder at={[0,.72,0]} radius={.66} height={.25}/><Cylinder at={[0,4.65,0]} radius={.46} height={7.65} map={stone} color="#68788b"/>
   {[.94,1.08,8.26,8.42,8.9].map(y=><Cylinder key={y} at={[0,y,0]} radius={y>8?.59:.5} height={.1}/>)}
   <Block at={[0,9.04,0]} size={[1.25,.22,1.25]} color={GOLD} metal={.6}/>
   <Block at={[0,9.28,0]} size={[1.42,.26,1.42]} map={stone} color="#a29a83"/>
   {i%2===0&&<group position={[0,5.7,-.52]}><Block at={[0,0,0]} size={[.68,4.45,.05]} color="#102542"/>{[-.36,.36].map(x=><Block key={x} at={[x,0,-.035]} size={[.025,4.5,.03]} color={GOLD} metal={.5}/>)}{[-1.6,-.8,0,.8,1.6].map((y,j)=><mesh key={y} position={[0,y,-.045]}><circleGeometry args={[j===2?.19:.12,24]}/><meshStandardMaterial color={GOLD} metalness={.7} roughness={.35} side={THREE.DoubleSide}/></mesh>)}</group>}
   <group position={[0,2.8,.55]}><Lantern scale={.85}/></group>
   {i%2===0&&<pointLight position={[0,3.2,1]} intensity={16} color="#f3be78" distance={6} decay={2}/>}

  </group>)}
  <instancedMesh ref={ornament} args={[undefined,undefined,96]}><sphereGeometry args={[1,8,6]}/><meshStandardMaterial color={GOLD} roughness={.3} metalness={.65}/></instancedMesh>
  <mesh position={[0,9.6,0]}><cylinderGeometry args={[10.4,10.4,.7,96,1,true]}/><meshStandardMaterial color="#6c737d" map={stone} bumpMap={stone} bumpScale={.04} side={THREE.DoubleSide} roughness={.45}/></mesh>
  {[9.2,9.35,9.85,10].map(y=><Ring key={y} at={[0,y,0]} radius={10.4} tube={y===9.35?.12:.055}/>)}
  <group position={[0,10.8,-1]} rotation={[.18,0,.12]}><Ring at={[0,0,0]} radius={2.4} tube={.035}/><Ring at={[0,0,0]} radius={1.9} rotation={[.7,.3,0]} tube={.025}/><Ring at={[0,0,0]} radius={1.5} rotation={[1.3,-.4,0]} tube={.025}/><CelestialHeart radius={.65}/></group>
  {Object.values(stationLocations).map(([x,,z])=><mesh key={`${x}-${z}`} position={[x,.035,z]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[5.5,4.5]}/><meshBasicMaterial map={contact} transparent depthWrite={false} opacity={.8}/></mesh>)}
  <pointLight position={[-7,5,-4]} color="#f4bc71" intensity={46} distance={14} decay={2}/><pointLight position={[7,5,-4]} color="#f4bc71" intensity={46} distance={14} decay={2}/><pointLight position={[0,9,-7]} color="#86aee3" intensity={48} distance={15} decay={2}/>
 </>;
}
function GuidedCamera({station,reducedMotion,workbench}:{station:Props['station'];reducedMotion:boolean;workbench:boolean}){
  const {camera,invalidate,size}=useThree();
  const layout=useMemo(()=>getObservatoryLayout({width:size.width,height:size.height,viewportWidth:window.innerWidth,viewportHeight:window.innerHeight,station,workbenchOpen:workbench,sideWorkbench:workbench}),[size.width,size.height,station,workbench]);
  const target=useRef(new THREE.Vector3(0,3,-1.8));
  const goal=useMemo(()=>({at:new THREE.Vector3(...layout.position),look:new THREE.Vector3(...layout.target)}),[layout]);
  useLayoutEffect(()=>{
    if(camera instanceof THREE.PerspectiveCamera)applyObservatoryProjection(camera,{...layout,fov:reducedMotion?layout.fov:camera.fov},size.width,size.height);
    camera.lookAt(target.current);invalidate();
  },[camera,layout,size.width,size.height,invalidate,reducedMotion]);
  useFrame((_,delta)=>{
    const fovDistance=camera instanceof THREE.PerspectiveCamera?Math.abs(camera.fov-layout.fov):0;
    const distance=camera.position.distanceTo(goal.at)+target.current.distanceTo(goal.look)+fovDistance;
    if(distance<.004){camera.position.copy(goal.at);target.current.copy(goal.look);camera.lookAt(target.current);if(camera instanceof THREE.PerspectiveCamera)applyObservatoryProjection(camera,layout,size.width,size.height);return;}
    const a=reducedMotion?1:1-Math.exp(-Math.min(delta,.06)*3);
    camera.position.lerp(goal.at,a);target.current.lerp(goal.look,a);camera.lookAt(target.current);
    if(camera instanceof THREE.PerspectiveCamera)applyObservatoryProjection(camera,{...layout,fov:THREE.MathUtils.lerp(camera.fov,layout.fov,a)},size.width,size.height);
    if(!reducedMotion)invalidate();
  });return null;
}
function InstrumentTarget({id,selected,highlighted,onStation,onHover,children}:{id:ObservatoryStation;selected:boolean;highlighted:boolean;onStation:Props['onStation'];onHover:Props['onHover'];children:ReactNode}){
 const [hovered,setHovered]=useState(false);const {gl,invalidate}=useThree();
 const callbacks=useRef(onHover);useEffect(()=>{callbacks.current=onHover;},[onHover]);
 useEffect(()=>{if(!hovered)return;const previous=gl.domElement.style.cursor;gl.domElement.style.setProperty('cursor','pointer');callbacks.current?.(id);return()=>{gl.domElement.style.setProperty('cursor',previous);callbacks.current?.(null);};},[hovered,id,gl]);
 const [x,,z]=stationLocations[id];
 return <group onClick={e=>{e.stopPropagation();onStation(id);}} onPointerOver={e=>{e.stopPropagation();setHovered(true);invalidate();}} onPointerOut={()=>{setHovered(false);invalidate();}}>{children}{(hovered||highlighted||selected)&&<group position={[x,.07,z]}><mesh rotation={[-Math.PI/2,0,0]}><ringGeometry args={[id==='telescope'?2.48:1.85,id==='telescope'?2.54:1.91,64]}/><meshBasicMaterial color={hovered||highlighted?'#ffe0a0':'#b99b61'} transparent opacity={hovered||highlighted?.95:.55} side={THREE.DoubleSide} depthWrite={false}/></mesh><Ring at={[0,.03,0]} radius={id==='telescope'?2.65:2.02} tube={.012} color={LIGHT_GOLD}/></group>}</group>;
}
function ObservatoryRenderMetrics(){
 const {gl}=useThree();const rendered=useRef(false);
 useFrame(()=>{rendered.current=true;});
 useEffect(()=>addAfterEffect(()=>{
  if(!rendered.current)return;rendered.current=false;
  gl.domElement.dataset.renderCalls=String(gl.info.render.calls);
  gl.domElement.dataset.renderTriangles=String(gl.info.render.triangles);
  gl.domElement.dataset.gpuGeometries=String(gl.info.memory.geometries);
  gl.domElement.dataset.gpuTextures=String(gl.info.memory.textures);
  gl.domElement.dataset.renderCounterScope='last-render-including-shadow-passes';
 }),[gl]);return null;
}
function Observatory(props:Props){
  const {gl,invalidate}=useThree();const callbacks=useRef({ready:props.onReady,failed:props.onFailure});useEffect(()=>{callbacks.current={ready:props.onReady,failed:props.onFailure};},[props.onReady,props.onFailure]);
  const stone=useMemo(()=>texture('stone'),[]),wood=useMemo(()=>texture('wood'),[]),contact=useMemo(()=>contactTexture(),[]);const [environment,setEnvironment]=useState<THREE.Texture|null>(null); const [vista,setVista]=useState<THREE.Texture|null>(null);
  useEffect(()=>{let active=true;let loaded:THREE.Texture|null=null;new THREE.TextureLoader().load('/art/library-celestial-vista.webp',t=>{loaded=t;t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;if(active){setVista(t);invalidate();}else t.dispose();},undefined,()=>{});return()=>{active=false;loaded?.dispose();};},[invalidate]);
  useEffect(()=>{
    RectAreaLightUniformsLib.init();
    const faces=Array.from({length:6},(_,i)=>{const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d')!;const gradient=ctx.createLinearGradient(0,0,0,256);gradient.addColorStop(0,i===2?'#92a6c7':'#4d5c75');gradient.addColorStop(.6,'#1b2635');gradient.addColorStop(1,'#171817');ctx.fillStyle=gradient;ctx.fillRect(0,0,256,256);if(i!==3){ctx.fillStyle='#e0be83';ctx.fillRect(24,38,23,145);ctx.fillStyle='#a5b8d3';ctx.fillRect(203,30,20,160);}return c;});
    const cube=new THREE.CubeTexture(faces);cube.colorSpace=THREE.SRGBColorSpace;cube.needsUpdate=true;const pmrem=new THREE.PMREMGenerator(gl);const result=pmrem.fromCubemap(cube);const commit=requestAnimationFrame(()=>{setEnvironment(result.texture);invalidate();});
    const lost=(event:Event)=>{event.preventDefault();callbacks.current.failed("The 3D graphics context was interrupted. The instrument controls remain available.");};gl.domElement.addEventListener('webglcontextlost',lost);
    return()=>{cancelAnimationFrame(commit);gl.domElement.removeEventListener('webglcontextlost',lost);result.dispose();cube.dispose();pmrem.dispose();stone.dispose();wood.dispose();contact.dispose();};
  },[gl,invalidate,stone,wood,contact]);
  return <>
    {environment&&<primitive object={environment} attach="environment"/>}<color attach="background" args={['#081321']}/><fog attach="fog" args={['#0b1626',23,55]}/>
    <ambientLight intensity={.23} color="#9baecb"/><hemisphereLight args={['#8eadd5','#211b17',.5]}/><directionalLight position={[-5,10,6]} intensity={2.1} color="#ffe0ad" castShadow shadow-mapSize={[1024,1024]} shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={12} shadow-camera-bottom={-12} shadow-bias={-.0008}/><directionalLight position={[7,10,-8]} intensity={1.1} color="#8daed4"/><rectAreaLight position={[-6,6,5]} rotation={[-.4,-.55,0]} width={5} height={7} intensity={3} color="#f5c78b"/><rectAreaLight position={[5,7,-6]} rotation={[0,Math.PI-.5,0]} width={5} height={6} intensity={2} color="#89addb"/>
    <ObservatoryRenderMetrics/><Architecture stone={stone} contact={contact} vista={vista}/><GuidedCamera station={props.station} reducedMotion={props.reducedMotion} workbench={props.workbench}/>
    <InstrumentTarget id="telescope" highlighted={props.highlighted==='telescope'} selected={props.station==='telescope'} onStation={props.onStation} onHover={props.onHover}><group position={stationLocations.telescope}><group rotation={[0,observatoryTelescopeYaw,0]}><AuthoredTelescope onReady={props.onReady} onFailure={props.onFailure}/></group><group position={[-.9,.58,1.8]}><Plaque id="telescope" title="THE TELESCOPE" subtitle="The perspective laboratory" roman="I" at={[0,0,0]} selected={props.station==='telescope'} onStation={props.onStation}/></group></group></InstrumentTarget>
    <InstrumentTarget id="practice" highlighted={props.highlighted==='practice'} selected={props.station==='practice'} onStation={props.onStation} onHover={props.onHover}><PracticeOrrery selected={props.station==='practice'} onStation={props.onStation} stone={stone}/></InstrumentTarget>
    <InstrumentTarget id="evidence" highlighted={props.highlighted==='evidence'} selected={props.station==='evidence'} onStation={props.onStation} onHover={props.onHover}><EvidenceDesk selected={props.station==='evidence'} onStation={props.onStation} stone={stone} wood={wood}/></InstrumentTarget>
  </>;
}
export default function ObservatoryScene(props:Props){return <Canvas frameloop="demand" shadows={{type:THREE.PCFShadowMap}} dpr={[1,1.5]} scene={{environmentIntensity:.6}} camera={{position:[.6,2.6,9.8],fov:60,near:.1,far:80}} gl={{antialias:true,alpha:false,powerPreference:'high-performance',toneMapping:THREE.AgXToneMapping,toneMappingExposure:1.12}} style={{width:'100%',height:'100%',touchAction:'pan-y'}} role="img" aria-label="Three-dimensional observatory with a telescope, practice orrery and evidence desk. Matching labeled controls are available outside the scene."><Observatory {...props}/></Canvas>;}
