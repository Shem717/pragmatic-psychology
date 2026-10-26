"use client";
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import * as THREE from 'three';

export type ObservatoryStation = 'telescope' | 'practice' | 'evidence';
type Props = { station: ObservatoryStation | null; lens: number; reducedMotion: boolean; onStation: (id: ObservatoryStation) => void; onReady: () => void; onFailure: (reason: string) => void; onHover?: (station: ObservatoryStation | null) => void; highlighted?: ObservatoryStation | null };
const GOLD='#b99b61', LIGHT_GOLD='#e0c28a', STONE='#8b9195';
const stationLocations: Record<ObservatoryStation,[number,number,number]> = {telescope:[-2.5,0,-1],practice:[4.05,0,-3.7],evidence:[4.5,0,2.8]};
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
function plaqueTexture(title:string,subtitle:string,roman:string) {
  const canvas=document.createElement('canvas');canvas.width=768;canvas.height=384;const ctx=canvas.getContext('2d')!;
  const gradient=ctx.createLinearGradient(0,0,768,384);gradient.addColorStop(0,'#192638');gradient.addColorStop(1,'#0c121c');ctx.fillStyle=gradient;ctx.fillRect(0,0,768,384);
  ctx.strokeStyle='#b69a60';ctx.lineWidth=2;ctx.strokeRect(14,14,740,356);ctx.lineWidth=1;ctx.strokeRect(23,23,722,338);
  ctx.fillStyle='#ddc28a';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='32px Georgia,serif';ctx.fillText(roman,384,77);ctx.font='46px Georgia,serif';ctx.fillText(title,384,164,690);ctx.fillStyle='#cabca1';ctx.font='24px Georgia,serif';ctx.fillText(subtitle,384,238,690);ctx.font='17px Georgia,serif';ctx.fillText('SELECT THIS INSTRUMENT',384,310);
  const result=new THREE.CanvasTexture(canvas);result.colorSpace=THREE.SRGBColorSpace;result.anisotropy=4;return result;
}
function contactTexture(){const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d')!;const g=ctx.createRadialGradient(64,64,4,64,64,64);g.addColorStop(0,'rgba(0,0,0,.8)');g.addColorStop(.45,'rgba(0,0,0,.5)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,128,128);return new THREE.CanvasTexture(c);}
function Block({at,size,color=STONE,map,metal=0,rotation}:{at:[number,number,number];size:[number,number,number];color?:string;map?:THREE.Texture;metal?:number;rotation?:[number,number,number]}){return <mesh position={at} rotation={rotation}><boxGeometry args={size}/><meshStandardMaterial color={color} map={map} bumpMap={map} bumpScale={.04} roughness={metal?.38:.7} metalness={metal}/></mesh>;}
function Ring({at,radius,tube=.035,rotation=[Math.PI/2,0,0],color=GOLD}:{at:[number,number,number];radius:number;tube?:number;rotation?:[number,number,number];color?:string}){return <mesh position={at} rotation={rotation}><torusGeometry args={[radius,tube,8,64]}/><meshStandardMaterial color={color} metalness={.65} roughness={.33}/></mesh>;}
function Cylinder({at,radius,height,color=GOLD,map,rotation}:{at:[number,number,number];radius:number;height:number;color?:string;map?:THREE.Texture;rotation?:[number,number,number]}){return <mesh position={at} rotation={rotation}><cylinderGeometry args={[radius,radius,height,24]}/><meshStandardMaterial color={color} map={map} bumpMap={map} bumpScale={.045} metalness={map?.15:.62} roughness={map?.55:.32}/></mesh>;}
function Plaque({id,title,subtitle,roman,at,selected,onStation}:{id:ObservatoryStation;title:string;subtitle:string;roman:string;at:[number,number,number];selected:boolean;onStation:Props['onStation']}){
  const map=useMemo(()=>plaqueTexture(title,subtitle,roman),[title,subtitle,roman]);useEffect(()=>()=>map.dispose(),[map]);
  return <group position={at} onClick={e=>{e.stopPropagation();onStation(id);}}>
    <Block at={[0,-.6,-.12]} size={[.1,1.2,.1]} color={GOLD} metal={.55}/><Block at={[0,0,-.03]} size={[2.7,1.35,.12]} color={GOLD} metal={.55}/>
    <mesh position={[0,0,.04]}><planeGeometry args={[2.61,1.26]}/><meshStandardMaterial map={map} roughness={.68} emissive={LIGHT_GOLD} emissiveIntensity={selected?.16:.035}/></mesh>
  </group>;
}
function Telescope({lens,selected,onStation,stone}:{lens:number;selected:boolean;onStation:Props['onStation'];stone:THREE.Texture}){
  const group=useRef<THREE.Group>(null);const {invalidate}=useThree();
  // Ring angle is illustrative, not a measurement of truth, confidence or mental state.
  useEffect(()=>{if(group.current)group.current.rotation.y=-2.38+(Math.max(0,Math.min(3,lens))-.5)*.13;invalidate();},[lens,invalidate]);
  return <group position={stationLocations.telescope} scale={1.2}>
    <Cylinder at={[0,.07,0]} radius={2.05} height={.14} color="#7c8290" map={stone}/><Ring at={[0,.15,0]} radius={1.98} tube={.035}/><Cylinder at={[0,.16,0]} radius={1.75} height={.32} color="#a4a398" map={stone}/><Ring at={[0,.34,0]} radius={1.62} tube={.025}/>
    {[0,1,2].map(i=><group key={i} rotation={[0,i*Math.PI*2/3,0]}><Block at={[0,.72,.57]} size={[.22,1.22,.23]} color="#373f49" metal={.45} rotation={[.55,0,0]}/><Block at={[0,.36,.95]} size={[.52,.13,.45]} map={stone} color="#c1bba8"/></group>)}
    <Cylinder at={[0,.67,0]} radius={.7} height={.95} map={stone} color="#647589"/><Ring at={[0,1.15,0]} radius={.73} tube={.055}/><Cylinder at={[0,1.1,0]} radius={.31} height={1.8} color="#2b3644"/><Cylinder at={[0,1.9,0]} radius={.42} height={.18}/>
    <group rotation={[0,0,-.35]} position={[0,2.22,0]}><Cylinder at={[0,0,0]} radius={.18} height={1.5}/><Cylinder at={[0,-.83,0]} radius={.44} height={.28} color="#34404c"/><Ring at={[0,-.99,0]} radius={.43} tube={.06}/></group>
    <Block at={[-.63,2.55,0]} size={[.18,1,.38]} color={GOLD} metal={.6}/><Block at={[.63,2.55,0]} size={[.18,1,.38]} color={GOLD} metal={.6}/>
    <Cylinder at={[0,2.8,0]} radius={.17} height={1.65} rotation={[0,0,Math.PI/2]}/>
    <Ring at={[.86,2.8,0]} radius={.42} rotation={[0,Math.PI/2,0]} tube={.045}/>
    <group ref={group} position={[0,3.15,0]} rotation={[.42,-2.38,0]} onClick={e=>{e.stopPropagation();onStation('telescope');}}>
      <Cylinder at={[0,0,0]} radius={.4} height={3.5} color="#253f50" rotation={[Math.PI/2,0,0]}/>
      {[-1.65,-1.35,-.5,.5,1.35,1.65].map(z=><Cylinder key={z} at={[0,0,z]} radius={.435} height={.075} rotation={[Math.PI/2,0,0]}/>)}
      <Cylinder at={[0,0,1.93]} radius={.49} height={.55} rotation={[Math.PI/2,0,0]}/>
      <mesh position={[0,0,2.22]}><circleGeometry args={[.44,48]}/><meshPhysicalMaterial color="#183b52" metalness={.5} roughness={.12} clearcoat={1} emissive="#4088a7" emissiveIntensity={selected?.24:.1}/></mesh>
      <Ring at={[0,0,2.23]} radius={.46} rotation={[0,0,0]} tube={.035}/>
      <Cylinder at={[0,0,-1.93]} radius={.22} height={.5} rotation={[Math.PI/2,0,0]}/><Cylinder at={[0,0,-2.27]} radius={.115} height={.23} color="#131d26" rotation={[Math.PI/2,0,0]}/>
      <Cylinder at={[.46,.1,-.8]} radius={.075} height={.45} rotation={[0,0,Math.PI/2]}/><Cylinder at={[.72,.1,-.8]} radius={.14} height={.08} rotation={[0,0,Math.PI/2]}/>
      <Cylinder at={[0,.54,-.3]} radius={.09} height={.9} color="#243a46" rotation={[Math.PI/2,0,0]}/><Ring at={[0,.54,.16]} radius={.1} rotation={[0,0,0]} tube={.018}/>
      {[-.55,.1].map(z=><Block key={z} at={[0,.42,z]} size={[.06,.2,.06]} color={GOLD} metal={.5}/>)}
    </group>
    <Plaque id="telescope" title="THE TELESCOPE" subtitle="The perspective laboratory" roman="I" at={[0,1.12,2.1]} selected={selected} onStation={onStation}/>
    <pointLight position={[-.6,4,2.5]} intensity={24} color="#ffe0ad" distance={8} decay={2}/>
  </group>;
}
function PracticeOrrery({selected,onStation,stone}:{selected:boolean;onStation:Props['onStation'];stone:THREE.Texture}){
  return <group position={stationLocations.practice}>
    <Cylinder at={[0,.15,0]} radius={1.35} height={.3} color="#aaa69a" map={stone}/><Cylinder at={[0,1.03,0]} radius={.53} height={1.55} color="#293746" map={stone}/><Ring at={[0,1.8,0]} radius={1.1} tube={.08}/><Cylinder at={[0,1.75,0]} radius={1.15} height={.12} color="#343b44"/>
    <group position={[0,2.75,0]} onClick={e=>{e.stopPropagation();onStation('practice');}}>
      <mesh><sphereGeometry args={[.39,24,16]}/><meshStandardMaterial color="#bd9d5f" emissive="#b68539" emissiveIntensity={.18} metalness={.65} roughness={.32}/></mesh>
      {[.69,1.05,1.4].map((radius,i)=><group key={radius} rotation={[.25+i*.32,.3*i,.15*i]}><Ring at={[0,0,0]} radius={radius} tube={.022}/><mesh position={[radius*Math.cos(i*2),0,radius*Math.sin(i*2)]}><sphereGeometry args={[.1+i*.035,16,12]}/><meshStandardMaterial color={['#88b5c7','#a68a67','#a1a1bd'][i]} metalness={.3} roughness={.4}/></mesh></group>)}
      <Cylinder at={[0,-.58,0]} radius={.05} height={1.1}/>
    </group>
    <Plaque id="practice" title="THE ORRERY" subtitle="Practice, action & revision" roman="II" at={[0,1.08,1.8]} selected={selected} onStation={onStation}/>
    <pointLight position={[0,4,1]} intensity={20} color="#f1c989" distance={6} decay={2}/>
  </group>;
}
function EvidenceDesk({selected,onStation,stone,wood}:{selected:boolean;onStation:Props['onStation'];stone:THREE.Texture;wood:THREE.Texture}){
  const page=useMemo(()=>plaqueTexture('FOLLOW THE EVIDENCE','Sources · scope · uncertainty','III'),[]);useEffect(()=>()=>page.dispose(),[page]);
  return <group position={stationLocations.evidence} rotation={[0,-.25,0]}>
    <Cylinder at={[0,.11,0]} radius={1.75} height={.22} color="#93948d" map={stone}/>
    {[-.95,.95].map(x=><Block key={x} at={[x,.9,0]} size={[.25,1.6,.95]} color="#a18860" map={wood}/>)}
    <Block at={[0,1.72,0]} size={[2.85,.2,1.55]} color="#ae8e5f" map={wood}/><Block at={[0,1.84,0]} size={[2.9,.04,1.58]} color={GOLD} metal={.5}/>
    <group position={[0,1.96,.05]} rotation={[-Math.PI/2+.15,0,0]} onClick={e=>{e.stopPropagation();onStation('evidence');}}>
      <Block at={[0,0,0]} size={[1.9,1.18,.1]} color="#3e4b52"/>
      {[-1,1].map(side=><group key={side} position={[side*.47,0,.08]} rotation={[0,side*-.1,0]}><Block at={[0,0,0]} size={[.91,1.12,.07]} color="#d4c7a8"/><mesh position={[0,0,.04]}><planeGeometry args={[.87,1.08]}/><meshStandardMaterial color="#e9ddc1" roughness={.85}/></mesh></group>)}
      <mesh position={[0,0,.13]}><planeGeometry args={[1.74,1.04]}/><meshStandardMaterial map={page} roughness={.7}/></mesh>
    </group>
    <group position={[-1.14,1.9,-.45]}><Cylinder at={[0,.3,0]} radius={.035} height={.6}/><mesh position={[0,.68,0]}><sphereGeometry args={[.1,12,8]}/><meshBasicMaterial color="#ffe2a8"/></mesh><Ring at={[0,.68,0]} radius={.18} tube={.018}/></group>
    <Plaque id="evidence" title="THE EVIDENCE DESK" subtitle="Inspect the claim & its limits" roman="III" at={[0,.98,1.55]} selected={selected} onStation={onStation}/>
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
function ImperialWindows({vista}:{vista:THREE.Texture|null}){
 const geometries=useMemo(()=>[0,.21,.43].map(offset=>{const s=new THREE.Shape();s.moveTo(-2.02,0);s.lineTo(2.02,0);s.lineTo(2.02,5.6);s.absarc(0,5.6,2.02,0,Math.PI,false);s.lineTo(-2.02,0);const g=new THREE.ShapeGeometry(s,28),uv=g.getAttribute('uv'),p=g.getAttribute('position');for(let i=0;i<uv.count;i++)uv.setXY(i,(p.getX(i)+2.02)/4.04*.56+offset,p.getY(i)/7.62);return g;}),[]);
 useEffect(()=>()=>geometries.forEach(g=>g.dispose()),[geometries]);
 return <>{Array.from({length:7},(_,i)=>Math.PI+.12+i*(Math.PI-.24)/6).map((a,i)=><group key={i} position={[Math.cos(a)*10.3,0,Math.sin(a)*10.3]} rotation={[0,Math.PI/2-a,0]}>
  <mesh geometry={geometries[i%3]} position={[0,1.1,.18]}><meshBasicMaterial key={vista ? "loaded-celestial-vista" : "night-fallback"} map={vista} color={vista?'#b0b9cb':'#13263d'} toneMapped={false} side={THREE.DoubleSide}/></mesh>
  <GildedArch at={[0,0,-.08]} angle={0}/>
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
 const spokes=useRef<THREE.InstancedMesh>(null),ornament=useRef<THREE.InstancedMesh>(null);
 const angles=useMemo(()=>Array.from({length:8},(_,i)=>Math.PI-.12+i*(Math.PI+.24)/7),[]);
 useEffect(()=>{const o=new THREE.Object3D();for(let i=0;i<64;i++){const a=i*Math.PI/32;o.position.set(Math.sin(a)*6,.025,Math.cos(a)*6);o.rotation.set(0,a,0);o.scale.set(i%4===0?.03:.012,.012,9.3);o.updateMatrix();spokes.current?.setMatrixAt(i,o.matrix);}if(spokes.current)spokes.current.instanceMatrix.needsUpdate=true;let n=0;for(const a of angles)for(let j=0;j<12;j++){const b=j*Math.PI/6;o.position.set(Math.cos(a)*10+Math.cos(b)*.44,8.66,Math.sin(a)*10+Math.sin(b)*.44);o.rotation.set(.4*Math.sin(b),b,.4*Math.cos(b));o.scale.set(.15,.5,.2);o.updateMatrix();ornament.current?.setMatrixAt(n++,o.matrix);}if(ornament.current)ornament.current.instanceMatrix.needsUpdate=true;},[angles]);
 return <>
  <mesh position={[0,-.16,0]}><cylinderGeometry args={[11.4,11.4,.3,96]}/><meshPhysicalMaterial color="#647486" map={stone} bumpMap={stone} bumpScale={.025} roughness={.21} metalness={.45} clearcoat={.8} clearcoatRoughness={.16}/></mesh>
  {[1.5,1.56,3.9,4.02,6.4,6.5,8.7,8.8,10.7].map(r=><Ring key={r} at={[0,.018,0]} radius={r} tube={.022}/>)}
  <instancedMesh ref={spokes} args={[undefined,undefined,64]}><boxGeometry/><meshStandardMaterial color={GOLD} metalness={.7} roughness={.3}/></instancedMesh>
  <ImperialWindows vista={vista}/><ImperialDome stone={stone}/>
  {angles.map((a,i)=><group key={i} position={[Math.cos(a)*10,0,Math.sin(a)*10]} rotation={[0,Math.PI/2-a,0]}>
   <Block at={[0,.3,0]} size={[1.25,.6,1.25]} map={stone} color="#9b9a88"/>
   <Cylinder at={[0,.72,0]} radius={.66} height={.25}/><Cylinder at={[0,4.65,0]} radius={.46} height={7.65} map={stone} color="#68788b"/>
   {[.94,1.08,8.26,8.42,8.9].map(y=><Cylinder key={y} at={[0,y,0]} radius={y>8?.59:.5} height={.1}/>)}
   <Block at={[0,9.04,0]} size={[1.25,.22,1.25]} color={GOLD} metal={.6}/>
   <Block at={[0,9.28,0]} size={[1.42,.26,1.42]} map={stone} color="#a29a83"/>
   {i%2===0&&<group position={[0,5.7,-.52]}><Block at={[0,0,0]} size={[.68,4.45,.05]} color="#102542"/>{[-.36,.36].map(x=><Block key={x} at={[x,0,-.035]} size={[.025,4.5,.03]} color={GOLD} metal={.5}/>)}{[-1.6,-.8,0,.8,1.6].map((y,j)=><mesh key={y} position={[0,y,-.045]}><circleGeometry args={[j===2?.19:.12,24]}/><meshStandardMaterial color={GOLD} metalness={.7} roughness={.35} side={THREE.DoubleSide}/></mesh>)}</group>}
   <group position={[0,2.1,-.75]}><Block at={[0,-.4,0]} size={[.46,.12,.45]} color={GOLD} metal={.6}/><Cylinder at={[0,0,0]} radius={.13} height={.65}/><mesh position={[0,.48,0]}><sphereGeometry args={[.13,12,8]}/><meshBasicMaterial color="#ffe3a0"/></mesh><Ring at={[0,.4,0]} radius={.26} rotation={[0,0,0]} tube={.025}/></group>
  </group>)}
  <instancedMesh ref={ornament} args={[undefined,undefined,96]}><sphereGeometry args={[1,8,6]}/><meshStandardMaterial color={GOLD} roughness={.3} metalness={.65}/></instancedMesh>
  <mesh position={[0,9.6,0]}><cylinderGeometry args={[10.4,10.4,.7,96,1,true]}/><meshStandardMaterial color="#6c737d" map={stone} bumpMap={stone} bumpScale={.04} side={THREE.DoubleSide} roughness={.45}/></mesh>
  {[9.2,9.35,9.85,10].map(y=><Ring key={y} at={[0,y,0]} radius={10.4} tube={y===9.35?.12:.055}/>)}
  <group position={[0,10.8,-1]} rotation={[.18,0,.12]}><Ring at={[0,0,0]} radius={2.4} tube={.035}/><Ring at={[0,0,0]} radius={1.9} rotation={[.7,.3,0]} tube={.025}/><Ring at={[0,0,0]} radius={1.5} rotation={[1.3,-.4,0]} tube={.025}/><mesh><sphereGeometry args={[.16,16,12]}/><meshBasicMaterial color="#f6d794"/></mesh></group>
  {Object.values(stationLocations).map(([x,,z])=><mesh key={`${x}-${z}`} position={[x,.035,z]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[5.5,4.5]}/><meshBasicMaterial map={contact} transparent depthWrite={false} opacity={.8}/></mesh>)}
  <pointLight position={[-7,5,-4]} color="#f4bc71" intensity={46} distance={14} decay={2}/><pointLight position={[7,5,-4]} color="#f4bc71" intensity={46} distance={14} decay={2}/><pointLight position={[0,9,-7]} color="#86aee3" intensity={48} distance={15} decay={2}/>
 </>;
}
function GuidedCamera({station,reducedMotion}:{station:Props['station'];reducedMotion:boolean}){
  const {camera,invalidate}=useThree();const target=useRef(new THREE.Vector3(0,3.5,0));
  const goal=useMemo(()=>{
    if(station==='telescope')return {at:new THREE.Vector3(-.8,4.25,6.5),look:new THREE.Vector3(-2.5,2.6,-.6)};
    if(station==='practice')return {at:new THREE.Vector3(4.7,3.9,3.8),look:new THREE.Vector3(4.05,2.4,-3.7)};
    if(station==='evidence')return {at:new THREE.Vector3(4.6,3.9,9.3),look:new THREE.Vector3(4.4,1.7,2.8)};
    return {at:new THREE.Vector3(0,5.8,17.8),look:new THREE.Vector3(0,5.15,-.4)};
  },[station]);
  useEffect(()=>{invalidate();},[goal,invalidate]);
  useFrame((_,delta)=>{if(camera.position.distanceTo(goal.at)+target.current.distanceTo(goal.look)<.004)return;const a=reducedMotion?1:1-Math.exp(-Math.min(delta,.06)*3);camera.position.lerp(goal.at,a);target.current.lerp(goal.look,a);camera.lookAt(target.current);if(!reducedMotion)invalidate();});return null;
}
function InstrumentTarget({id,selected,highlighted,onStation,onHover,children}:{id:ObservatoryStation;selected:boolean;highlighted:boolean;onStation:Props['onStation'];onHover:Props['onHover'];children:ReactNode}){
 const [hovered,setHovered]=useState(false);const {gl,invalidate}=useThree();
 const callbacks=useRef(onHover);useEffect(()=>{callbacks.current=onHover;},[onHover]);
 useEffect(()=>{if(!hovered)return;const previous=gl.domElement.style.cursor;gl.domElement.style.setProperty('cursor','pointer');callbacks.current?.(id);return()=>{gl.domElement.style.setProperty('cursor',previous);callbacks.current?.(null);};},[hovered,id,gl]);
 const [x,,z]=stationLocations[id];
 return <group onClick={e=>{e.stopPropagation();onStation(id);}} onPointerOver={e=>{e.stopPropagation();setHovered(true);invalidate();}} onPointerOut={()=>{setHovered(false);invalidate();}}>{children}{(hovered||highlighted||selected)&&<group position={[x,.07,z]}><mesh rotation={[-Math.PI/2,0,0]}><ringGeometry args={[id==='telescope'?2.48:1.85,id==='telescope'?2.54:1.91,64]}/><meshBasicMaterial color={hovered||highlighted?'#ffe0a0':'#b99b61'} transparent opacity={hovered||highlighted?.95:.55} side={THREE.DoubleSide} depthWrite={false}/></mesh><Ring at={[0,.03,0]} radius={id==='telescope'?2.65:2.02} tube={.012} color={LIGHT_GOLD}/></group>}</group>;
}
function Observatory(props:Props){
  const {gl,invalidate}=useThree();const callbacks=useRef({ready:props.onReady,failed:props.onFailure});useEffect(()=>{callbacks.current={ready:props.onReady,failed:props.onFailure};},[props.onReady,props.onFailure]);
  const stone=useMemo(()=>texture('stone'),[]),wood=useMemo(()=>texture('wood'),[]),contact=useMemo(()=>contactTexture(),[]);const [environment,setEnvironment]=useState<THREE.Texture|null>(null); const [vista,setVista]=useState<THREE.Texture|null>(null);
  useEffect(()=>{let active=true;let loaded:THREE.Texture|null=null;new THREE.TextureLoader().load('/art/library-celestial-vista.webp',t=>{loaded=t;t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;if(active){setVista(t);invalidate();}else t.dispose();},undefined,()=>{});return()=>{active=false;loaded?.dispose();};},[invalidate]);
  useEffect(()=>{
    const faces=Array.from({length:6},(_,i)=>{const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d')!;const gradient=ctx.createLinearGradient(0,0,0,256);gradient.addColorStop(0,i===2?'#92a6c7':'#4d5c75');gradient.addColorStop(.6,'#1b2635');gradient.addColorStop(1,'#171817');ctx.fillStyle=gradient;ctx.fillRect(0,0,256,256);if(i!==3){ctx.fillStyle='#e0be83';ctx.fillRect(24,38,23,145);ctx.fillStyle='#a5b8d3';ctx.fillRect(203,30,20,160);}return c;});
    const cube=new THREE.CubeTexture(faces);cube.colorSpace=THREE.SRGBColorSpace;cube.needsUpdate=true;const pmrem=new THREE.PMREMGenerator(gl);const result=pmrem.fromCubemap(cube);const commit=requestAnimationFrame(()=>{setEnvironment(result.texture);invalidate();});
    const lost=(event:Event)=>{event.preventDefault();callbacks.current.failed("The 3D graphics context was interrupted. The instrument controls remain available.");};gl.domElement.addEventListener('webglcontextlost',lost);const ready=requestAnimationFrame(()=>{callbacks.current.ready();invalidate();});
    return()=>{cancelAnimationFrame(commit);cancelAnimationFrame(ready);gl.domElement.removeEventListener('webglcontextlost',lost);result.dispose();cube.dispose();pmrem.dispose();stone.dispose();wood.dispose();contact.dispose();};
  },[gl,invalidate,stone,wood,contact]);
  return <>
    {environment&&<primitive object={environment} attach="environment"/>}<color attach="background" args={['#081321']}/><fog attach="fog" args={['#0b1626',23,55]}/>
    <ambientLight intensity={.6} color="#a4b7d4"/><hemisphereLight args={['#8eadd5','#30291e',.8]}/><directionalLight position={[-5,12,8]} intensity={3.2} color="#ffe2ac"/><directionalLight position={[7,10,-8]} intensity={1.6} color="#8daed4"/>
    <Architecture stone={stone} contact={contact} vista={vista}/><GuidedCamera station={props.station} reducedMotion={props.reducedMotion}/>
    <InstrumentTarget id="telescope" highlighted={props.highlighted==='telescope'} selected={props.station==='telescope'} onStation={props.onStation} onHover={props.onHover}><Telescope lens={props.lens} selected={props.station==='telescope'} onStation={props.onStation} stone={stone}/></InstrumentTarget>
    <InstrumentTarget id="practice" highlighted={props.highlighted==='practice'} selected={props.station==='practice'} onStation={props.onStation} onHover={props.onHover}><PracticeOrrery selected={props.station==='practice'} onStation={props.onStation} stone={stone}/></InstrumentTarget>
    <InstrumentTarget id="evidence" highlighted={props.highlighted==='evidence'} selected={props.station==='evidence'} onStation={props.onStation} onHover={props.onHover}><EvidenceDesk selected={props.station==='evidence'} onStation={props.onStation} stone={stone} wood={wood}/></InstrumentTarget>
  </>;
}
export default function ObservatoryScene(props:Props){return <Canvas frameloop="demand" dpr={[1,1.5]} scene={{environmentIntensity:.6}} camera={{position:[0,5.8,17.8],fov:49,near:.1,far:80}} gl={{antialias:true,alpha:false,powerPreference:'high-performance'}} style={{width:'100%',height:'100%',touchAction:'pan-y'}} role="img" aria-label="Three-dimensional observatory with a telescope, practice orrery and evidence desk. Matching labeled controls are available outside the scene."><Observatory {...props}/></Canvas>;}
