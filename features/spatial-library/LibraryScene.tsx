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
  const canvas = document.createElement('canvas'); canvas.width = 256; canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = kind === 'marble' ? '#303841' : '#38291f'; ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 75; i++) {
    ctx.strokeStyle = kind === 'marble' ? `rgba(182,190,191,${.025 + (i % 5) * .014})` : `rgba(155,111,58,${.025 + (i % 5) * .014})`;
    ctx.lineWidth = i % 7 === 0 ? 2 : .6;
    ctx.beginPath();
    for (let y = 0; y <= 256; y += 8) {
      const x = i * 4 + Math.sin(y * (kind === 'marble' ? .018 : .009) + i) * (kind === 'marble' ? 24 : 7);
      if (y === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(kind === 'marble' ? 3 : 1, kind === 'marble' ? 3 : 2);
  return texture;
}
function inscription(lines: string[], subtitle?: string, background = '#111b25', size = 768) {
  const canvas = document.createElement('canvas'); canvas.width = size; canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = background; ctx.fillRect(0, 0, size, 512);
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
  return <mesh position={position}><boxGeometry args={scale} /><meshStandardMaterial color={color} metalness={metal} roughness={metal ? .34 : .8} map={map} /></mesh>;
}
function Column({ x, z, height = 7.2, map }: { x: number; z: number; height?: number; map: THREE.Texture }) {
  return <group position={[x, 0, z]}>
    <Box position={[0, .18, 0]} scale={[.95, .36, .95]} map={map} color="#adb4b4" />
    <mesh position={[0, height / 2, 0]}><cylinderGeometry args={[.27, .35, height - .45, 12]} /><meshStandardMaterial map={map} color="#afb5b3" roughness={.56} /></mesh>
    {[.42, height - .3, height - .1].map((y) => <mesh key={y} position={[0, y, 0]}><cylinderGeometry args={[.43, .43, .13, 12]} /><meshStandardMaterial color={GOLD} metalness={.65} roughness={.35} /></mesh>)}
    <Box position={[0, height + .04, 0]} scale={[.9, .24, .9]} color="#333b43" map={map} />
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
  const mesh = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    const object = new THREE.Object3D();
    const colors = ['#303b43', '#59452f', '#34453e', '#463547', '#273646'];
    let n = 0;
    for (const y of [.64, 4.12]) for (let i = 0; i < 20; i++) {
      const h = .62 + (i % 4) * .07;
      object.position.set(-2.1 + i * .22, y + h / 2, -.23);
      object.rotation.set(0, 0, (i % 7 === 0 ? .06 : 0)); object.scale.set(.17, h, .4); object.updateMatrix();
      mesh.current?.setMatrixAt(n, object.matrix); mesh.current?.setColorAt(n, new THREE.Color(colors[i % colors.length])); n++;
    }
    if (mesh.current) { mesh.current.instanceMatrix.needsUpdate = true; if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true; }
  }, []);
  return <instancedMesh ref={mesh} args={[undefined, undefined, 40]}><boxGeometry /><meshStandardMaterial map={map} roughness={.85} /></instancedMesh>;
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
    <Arch radius={2.45} position={[0, 4.96, -.06]} tube={.16} color="#584633" />
    <Arch radius={2.28} position={[0, 4.96, .1]} tube={.035} />
    <Box position={[0, 5.63, .14]} scale={[3.5, 1.55, .12]} color={selected ? PALE_GOLD : GOLD} metal={.55} />
    <mesh position={[0, 5.63, .21]} onClick={(event) => { event.stopPropagation(); onCategory(wing.id); }}><planeGeometry args={[3.4, 1.45]} /><meshStandardMaterial map={texture} roughness={.6} emissive="#f3d392" emissiveIntensity={selected ? .2 : .07} /></mesh>
    {wing.books.map((book, index) => <ShelfVolume key={book.id} book={book} x={(index - (wing.books.length - 1) / 2) * 1.38} selected={bookId === book.id} onBook={onBook} />)}
    {/* Empty brass display stands make the actual collection size honest. */}
    {wing.books.length === 1 && [-1.35, 1.35].map((x) => <mesh key={x} position={[x, 2.25, .2]}><cylinderGeometry args={[.18, .24, .52, 8]} /><meshStandardMaterial color={GOLD} metalness={.55} roughness={.4} /></mesh>)}
    <pointLight position={[0, 4.7, 1.5]} color="#ffd99b" intensity={selected ? 28 : 19} distance={8} decay={2} />
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
    {Array.from({ length: 16 }, (_, i) => <group key={i} rotation={[0, 0, i * Math.PI / 8]}><Box position={[0, 1.55, .07]} scale={[.035, 3.1, .035]} color={GOLD} metal={.5} /><mesh position={[0, 2.45, .08]}><circleGeometry args={[.11, 8]} /><meshBasicMaterial color="#d4bb8a" /></mesh></group>)}
    <mesh position={[0, 0, .08]}><octahedronGeometry args={[.48]} /><meshStandardMaterial color="#eed49d" emissive="#c4a266" emissiveIntensity={.6} metalness={.5} roughness={.25} /></mesh>
  </group>;
}
function Armillary() {
  return <group position={[0, 4.8, -2.3]}>
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
    if (wing) return { position: new THREE.Vector3(wing.position[0] + Math.sin(wing.rotation) * 6.3, 3.1, wing.position[2] + Math.cos(wing.rotation) * 6.3), look: new THREE.Vector3(wing.position[0], 3.2, wing.position[2]) };
    return { position: new THREE.Vector3(0, 4.4, 14.2), look: new THREE.Vector3(0, 3.6, -4.7) };
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
  const callbacks = useRef({ onReady: props.onReady, onFailure: props.onFailure });
  useEffect(() => { callbacks.current = { onReady: props.onReady, onFailure: props.onFailure }; }, [props.onReady, props.onFailure]);
  const marble = useMemo(() => surfaceTexture('marble'), []);
  const wood = useMemo(() => surfaceTexture('wood'), []);
  useEffect(() => {
    const lost = (event: Event) => { event.preventDefault(); callbacks.current.onFailure('The 3D graphics context was interrupted. The readable catalog remains available.'); };
    gl.domElement.addEventListener('webglcontextlost', lost);
    const ready = requestAnimationFrame(() => { callbacks.current.onReady(); invalidate(); });
    return () => { cancelAnimationFrame(ready); gl.domElement.removeEventListener('webglcontextlost', lost); marble.dispose(); wood.dispose(); };
  }, [gl, invalidate, marble, wood]);
  return <>
    <color attach="background" args={['#08111f']} /><fog attach="fog" args={['#0b1523', 21, 53]} />
    <ambientLight intensity={1.05} color="#9baac5" /><hemisphereLight args={['#a5bddb', '#34251c', 1.2]} />
    <directionalLight position={[3, 11, 7]} intensity={2.7} color="#ffe1ae" /><directionalLight position={[-8, 9, -7]} intensity={1.7} color="#8fafd7" />
    <Navigation category={props.category} bookId={props.bookId} reducedMotion={props.reducedMotion} />
    <Stars />
    <mesh position={[0, -.12, 1]}><boxGeometry args={[25, .22, 30]} /><meshStandardMaterial color="#707b88" map={marble} metalness={.3} roughness={.43} /></mesh>
    {Array.from({ length: 13 }, (_, i) => i - 6).map((i) => <group key={i}>
      <Box position={[i * 2, .006, 1]} scale={[.017, .012, 29]} color="#a28d5b" metal={.4} />
      <Box position={[0, .007, i * 2 + 1]} scale={[24, .012, .017]} color="#a28d5b" metal={.4} />
    </group>)}
    {[3.1, 3.3, 5.4, 5.46].map((radius) => <mesh key={radius} position={[0, .015, .1]} rotation={[-Math.PI / 2, 0, 0]}><torusGeometry args={[radius, .022, 6, 100]} /><meshStandardMaterial color={GOLD} metalness={.5} roughness={.35} /></mesh>)}
    {/* Aisle inlay and raised steps establish physical scale and depth. */}
    {[-2.95, 2.95].map((x) => <Box key={x} position={[x, .025, 7]} scale={[.045, .02, 13]} color={GOLD} metal={.55} />)}
    <Box position={[0, .08, -8.6]} scale={[21, .16, 3.8]} map={marble} color="#8b939b" />
    <Box position={[0, 5.3, -11.2]} scale={[25, 10.6, .5]} map={marble} color="#485363" />
    <RoseWindow />
    {[-10.7, 10.7].map((x) => [-8.9, -.4, 7].map((z) => <Column key={`${x}-${z}`} x={x} z={z} height={8.4} map={marble} />))}
    {[-9, -.4, 7].map((z) => <group key={z}><Arch radius={10.7} position={[0, 8.1, z]} tube={.16} color="#59606b" flatten={.4} /><Arch radius={10.45} position={[0, 8.1, z + .04]} tube={.045} flatten={.4} /></group>)}
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
  return <Canvas dpr={[1, 1.5]} frameloop="demand" camera={{ position: [0, 4.4, 14.2], fov: 49, near: .1, far: 80 }} gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }} style={{ width: '100%', height: '100%', touchAction: 'pan-y' }} role="img" aria-label="Three-dimensional celestial library. Choose a wing or book using the matching controls, or select a volume in the room.">
    <Hall {...props} />
  </Canvas>;
}
