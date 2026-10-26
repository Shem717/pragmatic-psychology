"use client";
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

export type LibraryWing = 'perspectives' | 'practice' | 'connection';
type Props = {
  category: LibraryWing | null;
  bookId: string | null;
  reducedMotion: boolean;
  onCategory: (id: LibraryWing) => void;
  onBook: (id: string) => void;
  onReady: () => void;
  onFailure: (reason: string) => void;
};
type Volume = { id: string; roman: string; title: string[]; color: string };
const WINGS: { id: LibraryWing; title: string[]; position: [number, number, number]; rotation: number; books: Volume[] }[] = [
  { id: 'perspectives', title: ['PERSPECTIVES', '& EVIDENCE'], position: [-7.1, 0, -5.2], rotation: .58, books: [
    { id: 'TOTW_bsKkbE', roman: 'I', title: ['THE PREDICTION', 'BEHIND THE FEELING'], color: '#263d49' },
    { id: 'AipBMvDBw70', roman: 'III', title: ['SCIENCE WITHOUT', 'OVERPROMISING'], color: '#30394b' },
    { id: 'EB5E24TSBuk', roman: 'VI', title: ['A RESPONSE THAT', 'FITS THE SITUATION'], color: '#304343' },
  ] },
  { id: 'practice', title: ['PRACTICE', '& CHANGE'], position: [0, 0, -9.1], rotation: 0, books: [
    { id: 'eX1_yI7scug', roman: 'II', title: ['ONE USEFUL', 'RESPONSE'], color: '#53392a' },
    { id: 'ieR3n0laLAg', roman: 'IV', title: ['ADAPT THE PRACTICE', 'NOT YOUR WORTH'], color: '#49333e' },
    { id: 'CorAKleaql4', roman: 'VII', title: ['START NOW', 'BUILD THE HABIT'], color: '#3d4331' },
  ] },
  { id: 'connection', title: ['AGENCY', '& CONNECTION'], position: [7.1, 0, -5.2], rotation: -.58, books: [
    { id: 'nqWsMb06W0I', roman: 'V', title: ['SELF-DIRECTION', '& CONNECTION'], color: '#453c57' },
  ] },
];
const GOLD = '#b49351';
const PALE_GOLD = '#e5ca8c';

/** Local, deterministic surface textures: the architecture itself is geometry. */
function surfaceTexture(kind: 'marble' | 'wood') {
  const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  const image = ctx.createImageData(512, 512);
  for (let y = 0; y < 512; y++) for (let x = 0; x < 512; x++) {
    const noise = (Math.sin(x * 127.1 + y * 311.7) * 43758.5453) % 1;
    const turbulence = Math.sin(x * .018 + Math.sin(y * .013) * 2) + Math.sin(y * .041 + x * .009) * .5;
    const grain = kind === 'wood' ? Math.sin(x * .42 + Math.sin(y * .009) * 5 + turbulence * 3) * 8 : turbulence * 9;
    const base = kind === 'wood' ? [90, 57, 34] : [46, 55, 71];
    const offset = (y * 512 + x) * 4;
    for (let channel = 0; channel < 3; channel++) image.data[offset + channel] = base[channel] + grain + noise * 6;
    image.data[offset + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);
  if (kind === 'marble') for (let vein = 0; vein < 11; vein++) {
    ctx.strokeStyle = vein % 3 === 0 ? 'rgba(215,183,120,.44)' : 'rgba(178,194,211,.26)';
    ctx.lineWidth = vein % 3 === 0 ? 1.5 : .65; ctx.beginPath();
    for (let y = -20; y < 540; y += 3) {
      const x = vein * 57 + Math.sin(y * .012 + vein * 2) * 44 + Math.sin(y * .057 + vein) * 8 - y * .16;
      if (y === -20) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(kind === 'marble' ? 2 : 1, kind === 'marble' ? 2 : 2); texture.anisotropy = 4;
  return texture;
}
function contactTexture() {
  const canvas = document.createElement('canvas'); canvas.width = 128; canvas.height = 128;
  const ctx = canvas.getContext('2d')!; const shade = ctx.createRadialGradient(64,64,4,64,64,64);
  shade.addColorStop(0,'rgba(0,0,0,.78)'); shade.addColorStop(.42,'rgba(0,0,0,.5)'); shade.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=shade;ctx.fillRect(0,0,128,128);return new THREE.CanvasTexture(canvas);
}
function inscription(lines: string[], subtitle?: string, background = '#111b25', size = 768) {
  const canvas = document.createElement('canvas'); canvas.width = size; canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = background; ctx.fillRect(0, 0, size, 512);
  for (let i=0;i<5000;i++) { const x=(i*73.37)%size,y=(i*119.71)%512;ctx.fillStyle=i%2?'rgba(255,232,185,.045)':'rgba(0,0,0,.06)';ctx.fillRect(x,y,1.2,1.2); }
  const edge=ctx.createLinearGradient(0,0,size,0);edge.addColorStop(0,'rgba(0,0,0,.28)');edge.addColorStop(.06,'rgba(255,231,176,.06)');edge.addColorStop(.92,'rgba(0,0,0,0)');edge.addColorStop(1,'rgba(0,0,0,.2)');ctx.fillStyle=edge;ctx.fillRect(0,0,size,512);
  ctx.strokeStyle = '#b7985b'; ctx.lineWidth = 3; ctx.strokeRect(19, 19, size - 38, 474);
  ctx.lineWidth = 1; ctx.strokeRect(29, 29, size - 58, 454);
  ctx.fillStyle = background === '#e8dcc2' ? '#43331e' : '#e6cd96'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `${lines.length > 2 ? 37 : 45}px Georgia, serif`;
  lines.forEach((line, i) => ctx.fillText(line, size / 2, 210 + (i - (lines.length - 1) / 2) * 62, size - 85));
  ctx.fillStyle = background === '#e8dcc2' ? '#645033' : '#c1ae89'; ctx.font = '23px Georgia, serif';
  if (subtitle) ctx.fillText(subtitle, size / 2, 391, size - 80);
  // Engraved compass above the lettering, with no external font or image dependency.
  ctx.strokeStyle = '#cfb273'; ctx.beginPath(); ctx.arc(size / 2, 93, 25, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(size / 2, 58); ctx.lineTo(size / 2 + 8, 93); ctx.lineTo(size / 2, 128); ctx.lineTo(size / 2 - 8, 93); ctx.closePath(); ctx.stroke();
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 4;
  return texture;
}
function Box({ position, scale, color = '#222b34', metal = 0, map }: { position: [number, number, number]; scale: [number, number, number]; color?: string; metal?: number; map?: THREE.Texture }) {
  return <mesh position={position}><boxGeometry args={scale} /><meshStandardMaterial color={color} metalness={metal} roughness={metal ? .38 : .72} map={map} bumpMap={map} bumpScale={map ? .045 : 0} /></mesh>;
}
type BlockInstance = { position: [number,number,number]; scale: [number,number,number]; rotation?: [number,number,number] };
function InstancedBlocks({ blocks, color, map, metal=0 }: { blocks: BlockInstance[]; color:string; map?:THREE.Texture; metal?:number }) {
  const ref=useRef<THREE.InstancedMesh>(null);
  useEffect(()=>{const object=new THREE.Object3D();blocks.forEach((block,index)=>{object.position.set(...block.position);object.scale.set(...block.scale);object.rotation.set(...(block.rotation||[0,0,0]));object.updateMatrix();ref.current?.setMatrixAt(index,object.matrix);});if(ref.current)ref.current.instanceMatrix.needsUpdate=true;},[blocks]);
  return <instancedMesh ref={ref} args={[undefined,undefined,blocks.length]}><boxGeometry /><meshStandardMaterial color={color} map={map} bumpMap={map} bumpScale={.025} metalness={metal} roughness={metal?.48:.72} /></instancedMesh>;
}
function CurveMetal({points,radius=.035,color=GOLD}:{points:THREE.Vector3[];radius?:number;color?:string}) {
  const geometry=useMemo(()=>new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),Math.max(24,points.length*3),radius,6,false),[points,radius]);useEffect(()=>()=>geometry.dispose(),[geometry]);
  return <mesh geometry={geometry}><meshStandardMaterial color={color} metalness={.6} roughness={.36}/></mesh>;
}
function AnnularGallery({marble}:{marble:THREE.Texture}) {
  const geometry=useMemo(()=>{const vertices:number[]=[],uv:number[]=[],indices:number[]=[];for(let i=0;i<=100;i++){const a=1.02+i/100*4.24;for(const r of [(a<1.9||a>4.38)?11.85:10.1,12.45]){vertices.push(Math.sin(a)*r,7.15,Math.cos(a)*r);uv.push(i/100*8,r-10.1);}}for(let i=0;i<100;i++){const n=i*2;indices.push(n,n+1,n+2,n+1,n+3,n+2);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;},[]);
  useEffect(()=>()=>geometry.dispose(),[geometry]);
  const rails=useMemo(()=>[7.43,8.45].map(y=>Array.from({length:70},(_,i)=>{const a=1.9+i/69*2.48;return new THREE.Vector3(Math.sin(a)*10.12,y,Math.cos(a)*10.12);})),[]);
  const balusters=useMemo(()=>Array.from({length:94},(_,i)=>{const a=1.9+i/93*2.48;return {position:[Math.sin(a)*10.12,7.92,Math.cos(a)*10.12] as [number,number,number],scale:[i%6===0?.11:.045,1.02,i%6===0?.11:.045] as [number,number,number],rotation:[0,a,0] as [number,number,number]};}),[]);
  return <>
    <mesh geometry={geometry}><meshStandardMaterial map={marble} bumpMap={marble} bumpScale={.04} color="#c5bda8" side={THREE.DoubleSide} roughness={.44}/></mesh>
    <mesh position={[0,6.94,0]}><cylinderGeometry args={[10.12,10.12,.42,96,1,true,1.9,2.48]}/><meshStandardMaterial map={marble} color="#c4bca7" side={THREE.DoubleSide} metalness={.2} roughness={.46}/></mesh>
    {rails.map((points,i)=><CurveMetal key={i} points={points} radius={i?.055:.035}/>)}
    <InstancedBlocks blocks={balusters} color="#b99a5d" metal={.62}/>
    {Array.from({length:13},(_,i)=>{const a=1.94+i/12*2.40;return <group key={i} position={[Math.sin(a)*10.12,8.52,Math.cos(a)*10.12]}><mesh><sphereGeometry args={[.09,10,8]}/><meshStandardMaterial color={GOLD} metalness={.6} roughness={.35}/></mesh>{i%2===0&&<mesh position={[0,.2,0]}><sphereGeometry args={[.055,8,6]}/><meshBasicMaterial color="#ffe0a2"/></mesh>}</group>;})}
  </>;
}
function GrandStairs({wood}:{wood:THREE.Texture}) {
  const stairs=useMemo(()=>{const steps:BlockInstance[]=[],edges:BlockInstance[]=[],posts:BlockInstance[]=[];const rails:THREE.Vector3[][]=[];for(const side of [-1,1]){for(let i=0;i<24;i++){const a=side*(1.05+i*.036),y=.28+i*.292;steps.push({position:[Math.sin(a)*10.9,y,Math.cos(a)*10.9],scale:[.48,.31,1.75],rotation:[0,a,0]});edges.push({position:[Math.sin(a)*10.9,y+.165,Math.cos(a)*10.9],scale:[.025,.024,1.8],rotation:[0,a,0]});if(i%2===0)for(const r of [10.02,11.78])posts.push({position:[Math.sin(a)*r,y+.65,Math.cos(a)*r],scale:[.055,1.1,.055],rotation:[0,a,0]});}for(const r of [10.02,11.78])rails.push(Array.from({length:24},(_,i)=>{const a=side*(1.05+i*.036);return new THREE.Vector3(Math.sin(a)*r,1.47+i*.292,Math.cos(a)*r);}));}return {steps,edges,posts,rails};},[]);
  return <><InstancedBlocks blocks={stairs.steps} color="#a0937d" map={wood}/><InstancedBlocks blocks={stairs.edges} color={LIGHT_GOLD} metal={.6}/><InstancedBlocks blocks={stairs.posts} color={GOLD} metal={.6}/>{stairs.rails.map((points,i)=><CurveMetal key={i} points={points} radius={.05}/>)}</>;
}
const LIGHT_GOLD='#e3c58d';
function CelestialDome({marble}:{marble:THREE.Texture}) {
  const geometry=useMemo(()=>{const vertices:number[]=[],uv:number[]=[],indices:number[]=[];for(let j=0;j<=14;j++)for(let i=0;i<=96;i++){const t=j/14,r=12.4-t*8.7,a=i/96*Math.PI*2;vertices.push(Math.sin(a)*r,13.6+Math.sin(t*Math.PI/2)*4.4,Math.cos(a)*r);uv.push(i/96*6,t*2);}for(let j=0;j<14;j++)for(let i=0;i<96;i++){const n=j*97+i;indices.push(n,n+1,n+97,n+1,n+98,n+97);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;},[]);
  const stars=useMemo(()=>{const p:number[]=[];for(let i=0;i<270;i++){const t=((i*41)%100)/100,a=i*2.39996,r=12.4-t*8.7;p.push(Math.sin(a)*r,13.55+Math.sin(t*Math.PI/2)*4.4,Math.cos(a)*r);}return new Float32Array(p);},[]);
  useEffect(()=>()=>geometry.dispose(),[geometry]);
  return <><mesh geometry={geometry}><meshStandardMaterial color="#152b49" bumpMap={marble} bumpScale={.035} roughness={.8} side={THREE.DoubleSide}/></mesh><points><bufferGeometry><bufferAttribute attach="attributes-position" args={[stars,3]}/></bufferGeometry><pointsMaterial color="#d1b26e" size={.034} sizeAttenuation/></points><mesh position={[0,13.2,0]}><cylinderGeometry args={[12.4,12.4,.7,96,1,true]}/><meshStandardMaterial map={marble} color="#9a9a91" roughness={.5} side={THREE.DoubleSide}/></mesh></>;
}
function DistantWindows({map}:{map:THREE.Texture|null}) {
  const shapes=useMemo(()=>[0,.23,.47].map(offset=>{const shape=new THREE.Shape();shape.moveTo(-2.3,0);shape.lineTo(2.3,0);shape.lineTo(2.3,2.15);shape.absarc(0,2.15,2.3,0,Math.PI,false);shape.lineTo(-2.3,0);const geometry=new THREE.ShapeGeometry(shape,32);const uv=geometry.getAttribute('uv'),position=geometry.getAttribute('position');for(let i=0;i<uv.count;i++)uv.setXY(i,(position.getX(i)+2.3)/4.6*.52+offset,position.getY(i)/4.45);return geometry;}),[]);
  useEffect(()=>()=>shapes.forEach(geometry=>geometry.dispose()),[shapes]);
  if(!map)return null;
  return <>{Array.from({length:11},(_,i)=>.78+(i+.5)/11*4.72).map((a,i)=><mesh key={i} geometry={shapes[i%3]} position={[Math.sin(a)*13.1,8.1,Math.cos(a)*13.1]} rotation={[0,a+Math.PI,0]}><meshBasicMaterial map={map} color="#8d9db9" side={THREE.DoubleSide}/></mesh>)}</>;
}
function RotundaArchitecture({marble,wood,contact,vista}:{marble:THREE.Texture;wood:THREE.Texture;contact:THREE.Texture;vista:THREE.Texture|null}) {
  const details=useMemo(()=>{
    const bases:BlockInstance[]=[],capitals:BlockInstance[]=[],flutes:BlockInstance[]=[],banners:BlockInstance[]=[],trim:BlockInstance[]=[],floor:BlockInstance[]=[];
    const angles=Array.from({length:12},(_,i)=>.78+i/11*4.72);
    for(const a of angles){const x=Math.sin(a)*11.75,z=Math.cos(a)*11.75;
      for(const y of [.2,6.7,7.35,13.4])bases.push({position:[x,y,z],scale:[1.05,.32,1.05],rotation:[0,a,0]});
      for(const y of [.45,6.48,7.55,13.17])capitals.push({position:[x,y,z],scale:[.78,.14,.78],rotation:[0,a,0]});
      for(let i=0;i<10;i++){const angle=i*Math.PI/5;flutes.push({position:[x+Math.cos(angle)*.32,3.5,z+Math.sin(angle)*.32],scale:[.021,5.85,.021]});flutes.push({position:[x+Math.cos(angle)*.27,10.36,z+Math.sin(angle)*.27],scale:[.017,5.45,.017]});}
      if(a<2.2||a>4){banners.push({position:[Math.sin(a)*11.31,8.8,Math.cos(a)*11.31],scale:[.76,4.7,.055],rotation:[0,a,0]});for(const offset of [-.4,.4])trim.push({position:[Math.sin(a)*11.28+Math.cos(a)*offset,8.8,Math.cos(a)*11.28-Math.sin(a)*offset],scale:[.025,4.76,.03],rotation:[0,a,0]});}
    }
    for(let i=0;i<32;i++){const a=i*Math.PI/16;floor.push({position:[Math.sin(a)*6.7,.021,Math.cos(a)*6.7],scale:[i%4===0?.035:.012,.014,8.3],rotation:[0,a,0]});}
    return {bases,capitals,flutes,banners,trim,floor,angles};
  },[]);
  const columnRef=useRef<THREE.InstancedMesh>(null);
  useEffect(()=>{const o=new THREE.Object3D();let n=0;for(const a of details.angles){for(const [y,h,r] of [[3.5,6.1,.34],[10.36,5.7,.29]]){o.position.set(Math.sin(a)*11.75,y,Math.cos(a)*11.75);o.scale.set(r,h,r);o.updateMatrix();columnRef.current?.setMatrixAt(n++,o.matrix);}}if(columnRef.current)columnRef.current.instanceMatrix.needsUpdate=true;},[details]);
  const dome=useMemo(()=>Array.from({length:12},(_,i)=>{const a=i*Math.PI/6;return [new THREE.Vector3(Math.sin(a)*12,13.7,Math.cos(a)*12),new THREE.Vector3(Math.sin(a)*9,16.6,Math.cos(a)*9),new THREE.Vector3(Math.sin(a)*3.7,18,Math.cos(a)*3.7)];}),[]);
  const upperRails=useMemo(()=>[13.4,13.65].map(y=>Array.from({length:96},(_,i)=>{const a=i/95*Math.PI*2;return new THREE.Vector3(Math.sin(a)*12,y,Math.cos(a)*12);})),[]);
  return <>
    <mesh position={[0,-.13,0]}><cylinderGeometry args={[13.4,13.4,.26,96]}/><meshPhysicalMaterial map={marble} bumpMap={marble} bumpScale={.035} color="#b8c1ce" metalness={.38} roughness={.28} clearcoat={.7} clearcoatRoughness={.2}/></mesh>
    <InstancedBlocks blocks={details.floor} color={GOLD} metal={.65}/>
    {[2.7,2.9,3.2,5.1,5.18,8.6,8.69,11.5].map(radius=><mesh key={radius} position={[0,.025,1.3]} rotation={[-Math.PI/2,0,0]}><torusGeometry args={[radius,.018,6,128]}/><meshStandardMaterial color={GOLD} metalness={.7} roughness={.3}/></mesh>)}
    <instancedMesh ref={columnRef} args={[undefined,undefined,24]}><cylinderGeometry args={[.9,1,1,20]}/><meshStandardMaterial map={marble} bumpMap={marble} bumpScale={.065} color="#d0c8b6" roughness={.43} metalness={.12}/></instancedMesh>
    <InstancedBlocks blocks={details.bases} color="#c7bca7" map={marble}/><InstancedBlocks blocks={details.capitals} color={GOLD} metal={.6}/><InstancedBlocks blocks={details.flutes} color="#a58b59" metal={.4}/><InstancedBlocks blocks={details.banners} color="#12233a"/><InstancedBlocks blocks={details.trim} color={GOLD} metal={.6}/>
    <AnnularGallery marble={marble}/><GrandStairs wood={wood}/><DistantWindows map={vista}/><CelestialDome marble={marble}/>
    {upperRails.map((points,i)=><CurveMetal key={i} points={points} radius={i?.035:.1}/>)}
    {dome.map((points,i)=><CurveMetal key={i} points={points} radius={.085}/>)}
    {[3.7,3.9].map(radius=><mesh key={radius} position={[0,18,0]} rotation={[-Math.PI/2,0,0]}><torusGeometry args={[radius,.065,8,80]}/><meshStandardMaterial color={GOLD} metalness={.6} roughness={.35}/></mesh>)}
    {details.angles.slice(0,-1).map((columnAngle,i)=>{const a=columnAngle+4.72/22;return <group key={i} position={[Math.sin(a)*11.9,0,Math.cos(a)*11.9]} rotation={[0,a,0]}><Arch radius={2.53} position={[0,10.25,0]} tube={.13} color="#a78a50" flatten={1.15}/><Arch radius={2.35} position={[0,10.25,.05]} tube={.028} flatten={1.15}/></group>;})}
    {details.angles.map((a,i)=><group key={i} position={[Math.sin(a)*11.4,0,Math.cos(a)*11.4]} rotation={[0,a,0]}>{(a<2.2||a>4)&&<group position={[0,8.8,-.18]}><mesh><torusGeometry args={[.24,.009,5,40]}/><meshStandardMaterial color={LIGHT_GOLD} metalness={.55} roughness={.38}/></mesh><Box position={[0,0,0]} scale={[.012,1.8,.012]} color={GOLD} metal={.5}/><Box position={[0,0,0]} scale={[.6,.012,.012]} color={GOLD} metal={.5}/></group>}{[2.1,6.15,8.65].map(y=><group key={y} position={[0,y,-.43]}><Box position={[0,0,0]} scale={[.18,.45,.2]} color={GOLD} metal={.6}/><mesh position={[0,.33,0]}><sphereGeometry args={[.075,10,8]}/><meshBasicMaterial color="#ffe0a0"/></mesh></group>)}</group>)}
    {[[-7.1,-5.2,6,3],[0,-9.1,6,3],[7.1,-5.2,6,3],[0,1.4,8,6]].map(([x,z,w,h])=><mesh key={`${x}-${z}`} position={[x,.035,z]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[w,h]}/><meshBasicMaterial map={contact} transparent opacity={.85} depthWrite={false}/></mesh>)}
  </>;
}
function Column({ x, z, height = 7.2, map }: { x: number; z: number; height?: number; map: THREE.Texture }) {
  return <group position={[x, 0, z]}>
    <Box position={[0, .18, 0]} scale={[.95, .36, .95]} map={map} color="#adb4b4" />
    <mesh position={[0, height / 2, 0]}><cylinderGeometry args={[.27, .35, height - .45, 24]} /><meshStandardMaterial map={map} bumpMap={map} bumpScale={.08} color="#c6c1b4" roughness={.52} /></mesh>
    {[.42, height - .3, height - .1].map((y) => <mesh key={y} position={[0, y, 0]}><cylinderGeometry args={[.43, .43, .13, 12]} /><meshStandardMaterial color={GOLD} metalness={.65} roughness={.35} /></mesh>)}
    <Box position={[0, height + .04, 0]} scale={[.9, .24, .9]} color="#62615b" map={map} />
    <Box position={[0, .08, 0]} scale={[1.16, .16, 1.16]} color="#76766e" map={map} />
    <mesh position={[0,height-.48,0]}><cylinderGeometry args={[.47,.28,.35,8]} /><meshStandardMaterial color={GOLD} metalness={.48} roughness={.45} /></mesh>
  </group>;
}
function Arch({ radius, position, color = GOLD, tube = .07, flatten = 1 }: { radius: number; position: [number, number, number]; color?: string; tube?: number; flatten?: number }) {
  return <mesh position={position} scale={[1, flatten, 1]}><torusGeometry args={[radius, tube, 7, 40, Math.PI]} /><meshStandardMaterial color={color} metalness={.5} roughness={.4} /></mesh>;
}
function ShelfVolume({ book, x, selected, onBook }: { book: Volume; x: number; selected: boolean; onBook: Props['onBook'] }) {
  const [hovered, setHovered] = useState(false);
  const texture = useMemo(() => inscription(book.title, `VOLUME ${book.roman} · OPEN TO READ`, book.color, 512), [book]);
  useEffect(() => () => texture.dispose(), [texture]);
  const pick = (event: ThreeEvent<MouseEvent>) => { event.stopPropagation(); onBook(book.id); };
  return <group position={[x, 2.65 + (hovered ? .06 : 0), .45]} rotation={[0, x * -.05, 0]} onClick={pick} onPointerOver={(event) => { event.stopPropagation(); setHovered(true); }} onPointerOut={() => setHovered(false)}>
    <Box position={[0, 0, 0]} scale={[1.08, 1.55, .32]} color={book.color} />
    <Box position={[0, 0, .18]} scale={[1.13, 1.61, .06]} color={GOLD} metal={.55} />
    <mesh position={[0, 0, .217]}><planeGeometry args={[1.05, 1.53]} /><meshStandardMaterial map={texture} roughness={.6} emissive={PALE_GOLD} emissiveIntensity={hovered || selected ? .17 : .035} /></mesh>
    <Box position={[0, -.81, 0]} scale={[1.25, .08, .52]} color={hovered ? PALE_GOLD : GOLD} metal={.5} />
    <Box position={[0, .78, -.01]} scale={[1, .03, .26]} color="#dbd0b3" />
  </group>;
}
function BoundSpines({ map }: { map: THREE.Texture }) {
  const mesh = useRef<THREE.InstancedMesh>(null), bands = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    const object = new THREE.Object3D();
    const colors = ['#536570', '#96724a', '#576d59', '#735260', '#465871', '#8e7c57'];
    let n=0, band=0;
    for (const y of [.64, 1.85, 4.12]) for (let i=0;i<20;i++) {
      const h=.62+(i%4)*.07,x=-2.1+i*.22;
      object.position.set(x,y+h/2,-.23);object.rotation.set(0,0,0);object.scale.set(.17,h,.4);object.updateMatrix();
      mesh.current?.setMatrixAt(n,object.matrix);mesh.current?.setColorAt(n,new THREE.Color(colors[i%colors.length]));n++;
      for (const fraction of [.13,.25,.79,.89]) {
        object.position.set(x,y+h*fraction,-.012);object.scale.set(.17,.014,.018);object.updateMatrix();bands.current?.setMatrixAt(band++,object.matrix);
      }
    }
    for (const target of [mesh.current,bands.current]) if(target) {target.instanceMatrix.needsUpdate=true;if(target.instanceColor)target.instanceColor.needsUpdate=true;}
  }, []);
  return <><instancedMesh ref={mesh} args={[undefined,undefined,60]}><boxGeometry /><meshStandardMaterial map={map} bumpMap={map} bumpScale={.018} roughness={.7} /></instancedMesh><instancedMesh ref={bands} args={[undefined,undefined,240]}><boxGeometry /><meshStandardMaterial color="#bc9e63" metalness={.48} roughness={.5} /></instancedMesh></>;
}
function ShelfBay({ wing, selected, bookId, wood, marble, onCategory, onBook }: { wing: typeof WINGS[number]; selected: boolean; bookId: string | null; wood: THREE.Texture; marble: THREE.Texture; onCategory: Props['onCategory']; onBook: Props['onBook'] }) {
  const texture = useMemo(() => inscription(wing.title, `${wing.books.length === 1 ? 'ONE VOLUME' : 'THREE VOLUMES'} · SELECT THIS WING`), [wing]);
  useEffect(() => () => texture.dispose(), [texture]);
  return <group position={wing.position} rotation={[0, wing.rotation, 0]}>
    <Box position={[0, 2.65, -.55]} scale={[4.95, 5.3, .32]} map={wood} color="#977858" />
    <Box position={[0, 2.7, -.34]} scale={[4.45, 4.9, .11]} color="#080e15" />
    {[-2.45, 2.45].map((x) => <group key={x}><Column x={x} z={0} height={5.1} map={marble} /><Box position={[x, 2.6, -.28]} scale={[.16, 5.1, .55]} color={GOLD} metal={.5} /></group>)}
    {[.5, 1.6, 3.58, 4.96].map((y) => <group key={y}><Box position={[0, y, -.02]} scale={[4.7, .18, 1.02]} color="#69482c" map={wood} /><Box position={[0, y + .04, .51]} scale={[4.78, .065, .07]} color={GOLD} metal={.6} /></group>)}
    <BoundSpines map={wood} />
    {[1.48,3.46,4.85].map(y=><Box key={y} position={[0,y,.48]} scale={[4.7,.1,.13]} map={wood} color="#b4996c" />)}
    <Box position={[0,5.12,-.12]} scale={[5.18,.17,1.15]} color="#a78654" map={wood} />
    <Box position={[0,5.22,-.12]} scale={[5.3,.07,1.24]} color={GOLD} metal={.55} />
    <Arch radius={2.45} position={[0, 4.96, -.06]} tube={.16} color="#584633" />
    <Arch radius={2.28} position={[0, 4.96, .1]} tube={.035} />
    <Box position={[0, 5.63, .14]} scale={[3.5, 1.55, .12]} color={selected ? PALE_GOLD : GOLD} metal={.55} />
    <mesh position={[0, 5.63, .21]} onClick={(event) => { event.stopPropagation(); onCategory(wing.id); }}><planeGeometry args={[3.4, 1.45]} /><meshStandardMaterial map={texture} roughness={.6} emissive="#f3d392" emissiveIntensity={selected ? .2 : .07} /></mesh>
    {wing.books.map((book, index) => <ShelfVolume key={book.id} book={book} x={(index - (wing.books.length - 1) / 2) * 1.38} selected={bookId === book.id} onBook={onBook} />)}
    {/* Empty brass display stands make the actual collection size honest. */}
    {wing.books.length === 1 && [-1.35, 1.35].map((x) => <mesh key={x} position={[x, 2.25, .2]}><cylinderGeometry args={[.18, .24, .52, 8]} /><meshStandardMaterial color={GOLD} metalness={.55} roughness={.4} /></mesh>)}
    <pointLight position={[0, 4.7, 1.5]} color="#ffd99b" intensity={selected ? 35 : 26} distance={8} decay={2} />
  </group>;
}
function Stars() {
  const points = useMemo(() => {
    const positions = new Float32Array(390 * 3);
    for (let i = 0; i < 390; i++) {
      const angle = i * 2.399963; const elevation = .08 + ((i * 37) % 100) / 100 * 1.4; const radius = 24;
      positions[i * 3] = Math.cos(angle) * Math.cos(elevation) * radius;
      positions[i * 3 + 1] = Math.sin(elevation) * radius + 1;
      positions[i * 3 + 2] = Math.sin(angle) * Math.cos(elevation) * radius - 4;
    }
    return positions;
  }, []);
  return <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[points, 3]} /></bufferGeometry><pointsMaterial color="#d9d9e8" size={.045} sizeAttenuation transparent opacity={.85} /></points>;
}
function Armillary({vista}:{vista:THREE.Texture|null}) {
  const globe=useMemo(()=>{const g=new THREE.SphereGeometry(1.8,40,28),uv=g.getAttribute('uv');for(let i=0;i<uv.count;i++)uv.setY(i,.62+uv.getY(i)*.38);return g;},[]);useEffect(()=>()=>globe.dispose(),[globe]);
  const stars=useMemo(()=>{const p:number[]=[];for(let i=0;i<130;i++){const a=i*2.39996,y=1-2*(i+.5)/130,r=Math.sqrt(1-y*y);p.push(Math.cos(a)*r*1.81,y*1.81,Math.sin(a)*r*1.81);}return new Float32Array(p);},[]);
  return <group position={[0,9.5,-.25]}>
    <mesh geometry={globe}><meshPhysicalMaterial map={vista} color={vista?"#9ba9c5":"#122039"} metalness={.38} roughness={.18} clearcoat={1} clearcoatRoughness={.12}/></mesh>
    <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[stars,3]}/></bufferGeometry><pointsMaterial color="#f1d99e" size={.025} sizeAttenuation/></points>
    {[[-.3,.2,.4],[.6,.3,-.6],[1.4,.1,.2],[.2,1.4,.5]].map((rotation,i)=><mesh key={i} rotation={rotation as [number,number,number]}><torusGeometry args={[2.12+i*.22,.035,8,112]}/><meshStandardMaterial color={LIGHT_GOLD} metalness={.7} roughness={.28}/></mesh>)}
    {[-.85,-.4,0,.4,.85].map(y=><mesh key={y} position={[0,y*1.8,0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[Math.sqrt(1-y*y)*1.81,.012,6,80]}/><meshStandardMaterial color="#a98c53" metalness={.65} roughness={.35}/></mesh>)}
    {[0,1,2,3].map(i=><mesh key={i} position={[Math.cos(i*1.8)*2.55,Math.sin(i*2.3)*.9,Math.sin(i*1.8)*2.55]}><sphereGeometry args={[.16+i*.025,16,12]}/><meshStandardMaterial color={i%2?'#98815b':LIGHT_GOLD} metalness={.75} roughness={.25}/></mesh>)}
    <Box position={[0,5.1,0]} scale={[.035,7.5,.035]} color={GOLD} metal={.65}/>
    <mesh position={[0,-2.55,0]}><sphereGeometry args={[.23,18,12]}/><meshStandardMaterial color={GOLD} metalness={.65} roughness={.3}/></mesh>
    <Box position={[0,-3.5,0]} scale={[.025,1.5,.025]} color={GOLD} metal={.6}/>
    <pointLight position={[0,-.5,2.1]} color="#e5bd77" intensity={18} distance={9} decay={2}/>
  </group>;
}
function ReadingDesk({ bookId, wood, marble }: { bookId: string | null; wood: THREE.Texture; marble: THREE.Texture }) {
  const book = WINGS.flatMap((wing) => wing.books).find((volume) => volume.id === bookId);
  const texture = useMemo(() => inscription(book?.title || ['THE READING', 'DESK'], book ? `VOLUME ${book.roman}` : 'CHOOSE A VOLUME', '#e8dcc2'), [book]);
  useEffect(() => () => texture.dispose(), [texture]);
  return <group position={[0, .12, 1.4]} scale={1.25}>
    <mesh position={[0,-.005,0]}><cylinderGeometry args={[3.1,3.25,.12,64]}/><meshStandardMaterial map={marble} color="#c3bba6" metalness={.22} roughness={.4}/></mesh>
    <mesh position={[0,.05,0]} rotation={[-Math.PI/2,0,0]}><torusGeometry args={[3.08,.025,6,112]}/><meshStandardMaterial color={GOLD} metalness={.65} roughness={.3}/></mesh>
    <mesh position={[0, .12, 0]}><cylinderGeometry args={[2.45, 2.6, .24, 48]} /><meshStandardMaterial map={marble} color="#8f9497" roughness={.5} /></mesh>
    <mesh position={[0, .27, 0]} rotation={[-Math.PI / 2, 0, 0]}><torusGeometry args={[2.36, .023, 6, 80]} /><meshStandardMaterial color={GOLD} metalness={.6} /></mesh>
    <Box position={[0, .85, 0]} scale={[1.45, 1.25, .85]} color="#86775e" map={wood} />
    <Box position={[0, 1.51, 0]} scale={[2.7, .17, 1.7]} color="#896540" map={wood} />
    <Box position={[0, 1.59, 0]} scale={[2.75, .035, 1.75]} color={GOLD} metal={.5} />
    <group position={[0, 1.66, .12]} rotation={[-Math.PI / 2 + .16, 0, 0]}>
      <Box position={[0, 0, -.045]} scale={[book ? 2.1 : 1.1, 1.4, .09]} color={book?.color || '#303d4c'} />
      {book ? [-1, 1].map((side) => <group key={side} position={[side * .52, 0, 0]} rotation={[0, side * -.12, 0]}>
        <Box position={[0, 0, .025]} scale={[1.02, 1.33, .09]} color="#e0d3b6" />
        <mesh position={[0, 0, .077]}><planeGeometry args={[.98, 1.3]} /><meshStandardMaterial map={texture} roughness={.85} color="#ffffff" /></mesh>
      </group>) : <mesh position={[0, 0, .01]}><planeGeometry args={[1.05, 1.35]} /><meshStandardMaterial map={texture} roughness={.8} /></mesh>}
    </group>
    {[-1.45, 1.45].map((x) => <group key={x} position={[x, .27, -.55]}>
      <mesh position={[0, .6, 0]}><cylinderGeometry args={[.035, .06, 1.2, 8]} /><meshStandardMaterial color={GOLD} metalness={.6} /></mesh>
      <mesh position={[0, 1.3, 0]}><sphereGeometry args={[.11, 12, 8]} /><meshBasicMaterial color="#ffe1a8" /></mesh>
    </group>)}
    <pointLight position={[0, 3.3, 1]} color="#ffe1aa" intensity={16} distance={7} decay={2} />
  </group>;
}
function Navigation({ category, bookId, reducedMotion }: Pick<Props, 'category' | 'bookId' | 'reducedMotion'>) {
  const { camera, invalidate } = useThree();
  const looking = useRef(new THREE.Vector3(0, 3.1, -4.7));
  const destination = useMemo(() => {
    if (bookId) return { position: new THREE.Vector3(.3,4.4,6.8), look: new THREE.Vector3(0,2.1,1.4) };
    const wing = WINGS.find((item) => item.id === category);
    if (wing) return { position: new THREE.Vector3(wing.position[0] + Math.sin(wing.rotation) * 7.2, 3.8, wing.position[2] + Math.cos(wing.rotation) * 7.2), look: new THREE.Vector3(wing.position[0], 3.7, wing.position[2]) };
    return { position: new THREE.Vector3(0,4.1,17.6), look: new THREE.Vector3(0,5.7,-2) };
  }, [category, bookId]);
  useEffect(() => { invalidate(); }, [destination, invalidate]);
  useFrame((_, delta) => {
    const distance = camera.position.distanceTo(destination.position) + looking.current.distanceTo(destination.look);
    if (distance < .003) return;
    const blend = reducedMotion ? 1 : 1 - Math.exp(-Math.min(delta, .06) * 3.4);
    camera.position.lerp(destination.position, blend); looking.current.lerp(destination.look, blend); camera.lookAt(looking.current);
    if (!reducedMotion) invalidate();
  });
  return null;
}
function Hall(props: Props) {
  const { gl, invalidate } = useThree();
  const [environmentMap,setEnvironmentMap] = useState<THREE.Texture | null>(null);
  const [vista,setVista]=useState<THREE.Texture|null>(null);
  useEffect(()=>{let active=true;const loader=new THREE.TextureLoader();const map=loader.load('/art/library-celestial-vista.webp',loaded=>{loaded.colorSpace=THREE.SRGBColorSpace;loaded.anisotropy=4;if(active){setVista(loaded);invalidate();}},undefined,()=>{/* The modeled room and procedural stars remain usable without this distant vista. */});return()=>{active=false;map.dispose();};},[invalidate]);
  const callbacks = useRef({ onReady: props.onReady, onFailure: props.onFailure });
  useEffect(() => { callbacks.current = { onReady: props.onReady, onFailure: props.onFailure }; }, [props.onReady, props.onFailure]);
  const marble = useMemo(() => surfaceTexture('marble'), []);
  const wood = useMemo(() => surfaceTexture('wood'), []);
  const contact = useMemo(() => contactTexture(), []);
  useEffect(() => {
    // A tiny local studio environment gives metal actual reflected light, not a flat gold tint.
    const faces = Array.from({length:6},(_,index)=>{
      const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;const ctx=canvas.getContext('2d')!;
      const gradient=ctx.createLinearGradient(0,0,0,256);gradient.addColorStop(0,index===2?'#a9b8cc':'#526077');gradient.addColorStop(.5,'#26313e');gradient.addColorStop(1,'#16191c');ctx.fillStyle=gradient;ctx.fillRect(0,0,256,256);
      if(index!==3){const light=ctx.createLinearGradient(0,0,256,0);light.addColorStop(0,'#a4773f');light.addColorStop(.5,'#f6dda7');light.addColorStop(1,'#b5894f');ctx.fillStyle=light;ctx.fillRect(25,35,30,150);ctx.fillRect(195,35,30,150);}
      return canvas;
    });
    const cube=new THREE.CubeTexture(faces);cube.colorSpace=THREE.SRGBColorSpace;cube.needsUpdate=true;
    const generator=new THREE.PMREMGenerator(gl);const environment=generator.fromCubemap(cube);
    const commit=requestAnimationFrame(()=>{setEnvironmentMap(environment.texture);invalidate();});
    return ()=>{cancelAnimationFrame(commit);environment.dispose();generator.dispose();cube.dispose();};
  },[gl,invalidate]);
  useEffect(() => {
    const lost = (event: Event) => { event.preventDefault(); callbacks.current.onFailure('The 3D graphics context was interrupted. The readable catalog remains available.'); };
    gl.domElement.addEventListener('webglcontextlost', lost);
    const ready = requestAnimationFrame(() => { callbacks.current.onReady(); invalidate(); });
    return () => { cancelAnimationFrame(ready); gl.domElement.removeEventListener('webglcontextlost', lost); marble.dispose(); wood.dispose(); contact.dispose(); };
  }, [gl, invalidate, marble, wood, contact]);
  return <>
    {environmentMap && <primitive object={environmentMap} attach="environment" />}
    <color attach="background" args={['#08111f']} /><fog attach="fog" args={['#0b1523', 27, 66]} />
    <ambientLight intensity={.5} color="#9baac5" /><hemisphereLight args={['#a5bddb', '#34251c', .75]} />
    <directionalLight position={[3, 11, 7]} intensity={3.3} color="#ffe1ae" /><directionalLight position={[-8, 9, -7]} intensity={1.7} color="#8fafd7" />
    <Navigation category={props.category} bookId={props.bookId} reducedMotion={props.reducedMotion} />
    <Stars/><RotundaArchitecture marble={marble} wood={wood} contact={contact} vista={vista}/>
    {WINGS.map((wing) => <ShelfBay key={wing.id} wing={wing} selected={props.category === wing.id} bookId={props.bookId} wood={wood} marble={marble} onCategory={props.onCategory} onBook={props.onBook} />)}
    <Armillary vista={vista}/><ReadingDesk bookId={props.bookId} wood={wood} marble={marble} />
  </>;
}
export default function LibraryScene(props: Props) {
  return <Canvas scene={{environmentIntensity:.55}} dpr={[1, 1.5]} frameloop="demand" camera={{ position: [0,4.1,17.6], fov: 54, near: .1, far: 100 }} gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }} style={{ width: '100%', height: '100%', touchAction: 'pan-y' }} role="img" aria-label="Three-dimensional celestial library. Choose a wing or book using the matching controls, or select a volume in the room.">
    <Hall {...props} />
  </Canvas>;
}
