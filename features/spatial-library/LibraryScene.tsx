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
  { id: 'perspectives', title: ['PERSPECTIVES', '& EVIDENCE'], position: [-6.1, 0, -5.7], rotation: .34, books: [
    { id: 'TOTW_bsKkbE', roman: 'I', title: ['THE PREDICTION', 'BEHIND THE FEELING'], color: '#263d49' },
    { id: 'AipBMvDBw70', roman: 'III', title: ['SCIENCE WITHOUT', 'OVERPROMISING'], color: '#30394b' },
    { id: 'EB5E24TSBuk', roman: 'VI', title: ['A RESPONSE THAT', 'FITS THE SITUATION'], color: '#304343' },
  ] },
  { id: 'practice', title: ['PRACTICE', '& CHANGE'], position: [0, 0, -7], rotation: 0, books: [
    { id: 'eX1_yI7scug', roman: 'II', title: ['ONE USEFUL', 'RESPONSE'], color: '#53392a' },
    { id: 'ieR3n0laLAg', roman: 'IV', title: ['ADAPT THE PRACTICE', 'NOT YOUR WORTH'], color: '#49333e' },
    { id: 'CorAKleaql4', roman: 'VII', title: ['START NOW', 'BUILD THE HABIT'], color: '#3d4331' },
  ] },
  { id: 'connection', title: ['AGENCY', '& CONNECTION'], position: [6.1, 0, -5.7], rotation: -.34, books: [
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
    const base = kind === 'wood' ? [90, 57, 34] : [87, 94, 101];
    const offset = (y * 512 + x) * 4;
    for (let channel = 0; channel < 3; channel++) image.data[offset + channel] = base[channel] + grain + noise * 6;
    image.data[offset + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);
  if (kind === 'marble') for (let vein = 0; vein < 11; vein++) {
    ctx.strokeStyle = vein % 3 === 0 ? 'rgba(207,187,147,.34)' : 'rgba(210,219,224,.28)';
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
function VaultAndCoffers({marble,wood}:{marble:THREE.Texture;wood:THREE.Texture}) {
  const geometry=useMemo(()=>{
    const vertices:number[]=[],uv:number[]=[],indices:number[]=[];const columns=40,rows=12;
    for(let j=0;j<=rows;j++)for(let i=0;i<=columns;i++){const x=-10.7+i/columns*21.4;vertices.push(x,8.1+Math.sqrt(Math.max(0,1-(x/10.7)**2))*4.3,-10+j/rows*18);uv.push(i/columns*5,j/rows*5);}
    for(let j=0;j<rows;j++)for(let i=0;i<columns;i++){const a=j*(columns+1)+i;indices.push(a,a+1,a+columns+1,a+1,a+columns+2,a+columns+1);}
    const result=new THREE.BufferGeometry();result.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));result.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));result.setIndex(indices);result.computeVertexNormals();return result;
  },[]);
  useEffect(()=>()=>geometry.dispose(),[geometry]);
  const structure=useMemo(()=>{
    const backs:BlockInstance[]=[],panels:BlockInstance[]=[],gold:BlockInstance[]=[],flutes:BlockInstance[]=[];
    for(const side of [-1,1])for(const z of [-7,-2,3,8]){
      backs.push({position:[side*11.05,4.3,z],scale:[.4,5.6,4.2]});panels.push({position:[side*10.81,4.3,z],scale:[.1,4.95,3.55]});
      for(const offset of [-1.9,1.9])gold.push({position:[side*10.74,4.3,z+offset],scale:[.08,5.3,.065]});
      for(const y of [1.65,6.95])gold.push({position:[side*10.74,y,z],scale:[.08,.065,3.85]});
      for(const offset of [-1.64,1.64])gold.push({position:[side*10.73,4.3,z+offset],scale:[.045,4.8,.025]});
      gold.push({position:[side*10.72,4.3,z],scale:[.035,.7,.7],rotation:[Math.PI/4,0,0]});
    }
    for(const x of [-10.7,10.7])for(const z of [-8.9,-.4,7])for(let i=0;i<10;i++){
      const angle=i*Math.PI/5;flutes.push({position:[(z===7?x*.74:x)+Math.cos(angle)*.285,4.3,z+Math.sin(angle)*.285],scale:[.024,7.1,.024]});
    }
    return {backs,panels,gold,flutes};
  },[]);
  const ceilingStars=useMemo(()=>{const values:number[]=[];for(let i=0;i<150;i++){const x=Math.sin(i*127.1)*9.8,z=-8+((i*57)%100)/100*15;values.push(x,8.04+Math.sqrt(Math.max(0,1-(x/10.7)**2))*4.3,z);}return new Float32Array(values);},[]);
  return <>
    <mesh geometry={geometry}><meshStandardMaterial color="#253248" bumpMap={marble} bumpScale={.08} roughness={.87} side={THREE.DoubleSide} /></mesh>
    <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[ceilingStars,3]} /></bufferGeometry><pointsMaterial color="#c1ad7b" size={.035} sizeAttenuation /></points>
    <InstancedBlocks blocks={structure.backs} color="#8f8b7b" map={marble} /><InstancedBlocks blocks={structure.panels} color="#7e6546" map={wood} /><InstancedBlocks blocks={structure.gold} color="#a88b50" metal={.45} /><InstancedBlocks blocks={structure.flutes} color="#b5a77c" metal={.2} />
    {[-1,1].map(side=><group key={side}><Box position={[side*11.3,4.3,-.3]} scale={[.6,8.6,22]} map={marble} color="#625f57" /><Box position={[side*10.92,.65,-.3]} scale={[.75,1.3,22]} map={wood} color="#a68755" /><Box position={[side*10.48,1.34,-.3]} scale={[.08,.07,22]} color={GOLD} metal={.5} /></group>)}
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
function RoseWindow() {
  return <group position={[0, 7.5, -10.3]}>
    <mesh><circleGeometry args={[3.1, 64]} /><meshBasicMaterial color="#14263d" /></mesh>
    {[3.1, 2.85, 2.2, 1.1].map((r) => <mesh key={r} position={[0, 0, .05]}><torusGeometry args={[r, r > 2 ? .055 : .025, 6, 64]} /><meshStandardMaterial color={GOLD} emissive="#d3b56e" emissiveIntensity={.25} metalness={.5} /></mesh>)}
    <InstancedBlocks color={GOLD} metal={.5} blocks={Array.from({length:16},(_,i)=>{const angle=i*Math.PI/8;return {position:[-Math.sin(angle)*1.55,Math.cos(angle)*1.55,.07] as [number,number,number],scale:[.035,3.1,.035] as [number,number,number],rotation:[0,0,angle] as [number,number,number]};})} />
    <mesh position={[0, 0, .08]}><octahedronGeometry args={[.48]} /><meshStandardMaterial color="#eed49d" emissive="#c4a266" emissiveIntensity={.6} metalness={.5} roughness={.25} /></mesh>
  </group>;
}
function Armillary() {
  return <group position={[0, 7.3, -1.8]}>
    <mesh><icosahedronGeometry args={[.68, 1]} /><meshStandardMaterial color="#203247" metalness={.55} roughness={.35} /></mesh>
    <mesh><icosahedronGeometry args={[.705, 1]} /><meshBasicMaterial color="#a99059" wireframe transparent opacity={.6} /></mesh>
    {[[-.3, .2, .4], [.6, .3, -.6], [1.4, .1, .2]].map((rotation, i) => <mesh key={i} rotation={rotation as [number, number, number]}><torusGeometry args={[1 + i * .16, .028, 6, 64]} /><meshStandardMaterial color={PALE_GOLD} metalness={.6} roughness={.25} emissive="#9d7b33" emissiveIntensity={.15} /></mesh>)}
    <Box position={[0, 2.2, 0]} scale={[.025, 2.8, .025]} color={GOLD} metal={.6} />
  </group>;
}
function ReadingDesk({ bookId, wood, marble }: { bookId: string | null; wood: THREE.Texture; marble: THREE.Texture }) {
  const book = WINGS.flatMap((wing) => wing.books).find((volume) => volume.id === bookId);
  const texture = useMemo(() => inscription(book?.title || ['THE READING', 'DESK'], book ? `VOLUME ${book.roman}` : 'CHOOSE A VOLUME', '#e8dcc2'), [book]);
  useEffect(() => () => texture.dispose(), [texture]);
  return <group position={[0, 0, 1.4]}>
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
    if (bookId) return { position: new THREE.Vector3(.3, 3.8, 5.8), look: new THREE.Vector3(0, 1.6, 1.2) };
    const wing = WINGS.find((item) => item.id === category);
    if (wing) return { position: new THREE.Vector3(wing.position[0] + Math.sin(wing.rotation) * 7.2, 3.8, wing.position[2] + Math.cos(wing.rotation) * 7.2), look: new THREE.Vector3(wing.position[0], 3.7, wing.position[2]) };
    return { position: new THREE.Vector3(0, 4.8, 16.8), look: new THREE.Vector3(0, 4.5, -4.7) };
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
    <color attach="background" args={['#08111f']} /><fog attach="fog" args={['#0b1523', 21, 53]} />
    <ambientLight intensity={.65} color="#9baac5" /><hemisphereLight args={['#a5bddb', '#34251c', .85]} />
    <directionalLight position={[3, 11, 7]} intensity={3.3} color="#ffe1ae" /><directionalLight position={[-8, 9, -7]} intensity={1.7} color="#8fafd7" />
    <Navigation category={props.category} bookId={props.bookId} reducedMotion={props.reducedMotion} />
    <Stars /><VaultAndCoffers marble={marble} wood={wood} />
    <mesh position={[0, -.12, 1]}><boxGeometry args={[25, .22, 30]} /><meshStandardMaterial color="#707b88" map={marble} bumpMap={marble} bumpScale={.055} metalness={.22} roughness={.44} /></mesh>
    <InstancedBlocks color="#a28d5b" metal={.4} blocks={Array.from({length:13},(_,i)=>i-6).flatMap(i=>[{position:[i*2,.006,1] as [number,number,number],scale:[.017,.012,29] as [number,number,number]},{position:[0,.007,i*2+1] as [number,number,number],scale:[24,.012,.017] as [number,number,number]}])} />
    {[[-6.1,-5.4,6,2.8],[0,-6.7,6,2.8],[6.1,-5.4,6,2.8],[0,1.4,7,5]].map(([x,z,w,h])=><mesh key={`${x}-${z}`} position={[x,.035,z]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[w,h]} /><meshBasicMaterial map={contact} transparent depthWrite={false} opacity={.85} /></mesh>)}
    {[3.1, 3.3, 5.4, 5.46].map((radius) => <mesh key={radius} position={[0, .015, .1]} rotation={[-Math.PI / 2, 0, 0]}><torusGeometry args={[radius, .022, 6, 100]} /><meshStandardMaterial color={GOLD} metalness={.5} roughness={.35} /></mesh>)}
    {/* Aisle inlay and raised steps establish physical scale and depth. */}
    {[-2.95, 2.95].map((x) => <Box key={x} position={[x, .025, 7]} scale={[.045, .02, 13]} color={GOLD} metal={.55} />)}
    <Box position={[0, .08, -8.6]} scale={[21, .16, 3.8]} map={marble} color="#8b939b" />
    <Box position={[0, 5.3, -11.2]} scale={[25, 10.6, .5]} map={marble} color="#485363" />
    <RoseWindow />
    <Box position={[0,7.78,-8.6]} scale={[21.6,.38,1.1]} map={wood} color="#a28a63" />
    <Box position={[0,7.58,-8]} scale={[21.9,.07,.1]} color={GOLD} metal={.5} />
    {[-10.7, 10.7].map((x) => [-8.9, -.4, 7].map((z) => <Column key={`${x}-${z}`} x={z===7?x*.74:x} z={z} height={8.4} map={marble} />))}
    {[-9, -.4, 7].map((z) => <group key={z}><Arch radius={z===7?7.92:10.7} position={[0, 8.1, z]} tube={.16} color="#59606b" flatten={.4} /><Arch radius={z===7?7.7:10.45} position={[0, 8.1, z + .04]} tube={.045} flatten={.4} /></group>)}
    {[-10.7, 10.7].map((x) => <group key={x}><Box position={[x, 8.3, -.8]} scale={[.5, .4, 19]} color="#474c56" map={marble} /><Box position={[x, 8.05, -.8]} scale={[.54, .05, 19]} color={GOLD} metal={.6} /></group>)}
    {WINGS.map((wing) => <ShelfBay key={wing.id} wing={wing} selected={props.category === wing.id} bookId={props.bookId} wood={wood} marble={marble} onCategory={props.onCategory} onBook={props.onBook} />)}
    <Armillary /><ReadingDesk bookId={props.bookId} wood={wood} marble={marble} />
    {[-9, 9].map((x) => [2.2, 6.3].map((z) => <group key={`${x}-${z}`} position={[x, 0, z]}>
      <Box position={[0, .12, 0]} scale={[.6, .24, .6]} color="#574831" />
      <mesh position={[0, 1.5, 0]}><cylinderGeometry args={[.07, .13, 2.8, 8]} /><meshStandardMaterial color={GOLD} metalness={.5} /></mesh>
      <mesh position={[0, 3.1, 0]}><octahedronGeometry args={[.22]} /><meshBasicMaterial color="#ffe2a0" /></mesh>
      <mesh position={[0, 3.1, 0]}><sphereGeometry args={[.34, 12, 8]} /><meshBasicMaterial color="#edbe69" transparent opacity={.1} depthWrite={false} /></mesh>
    </group>))}
  </>;
}
export default function LibraryScene(props: Props) {
  return <Canvas scene={{environmentIntensity:.55}} dpr={[1, 1.5]} frameloop="demand" camera={{ position: [0, 4.8, 16.8], fov: 49, near: .1, far: 80 }} gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }} style={{ width: '100%', height: '100%', touchAction: 'pan-y' }} role="img" aria-label="Three-dimensional celestial library. Choose a wing or book using the matching controls, or select a volume in the room.">
    <Hall {...props} />
  </Canvas>;
}
