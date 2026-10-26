"use client";
import { useEffect, useMemo, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

export type CraftInstance = { position: [number, number, number]; scale: [number, number, number]; rotation?: [number, number, number]; color?: string };
/** Repeated carving and bindings share geometry and one draw call per material. */
export function CraftInstances({ geometry, material, items, shadows = false }: { geometry: THREE.BufferGeometry; material: THREE.Material; items: CraftInstance[]; shadows?: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const { invalidate } = useThree();
  useEffect(() => {
    const object = new THREE.Object3D();
    items.forEach((item, index) => {
      object.position.set(...item.position); object.scale.set(...item.scale); object.rotation.set(...(item.rotation || [0, 0, 0])); object.updateMatrix();
      ref.current?.setMatrixAt(index, object.matrix);
      if (item.color) ref.current?.setColorAt(index, new THREE.Color(item.color));
    });
    if (ref.current) { ref.current.instanceMatrix.needsUpdate = true; if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true; ref.current.computeBoundingSphere(); }
    invalidate();
  }, [items, invalidate]);
  return <instancedMesh ref={ref} args={[geometry, material, items.length]} castShadow={shadows} receiveShadow />;
}

/** A caged, faceted lantern: visible metal construction surrounds the light source. */
export function Lantern({ scale = 1 }: { scale?: number }) {
  return <group scale={scale}>
    <mesh position={[0, -.1, -.26]}><boxGeometry args={[.18, .68, .16]}/><meshStandardMaterial color="#806131" metalness={.78} roughness={.42}/></mesh>
    <mesh position={[0, -.38, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.035, .035, .55, 8]}/><meshStandardMaterial color="#ad874b" metalness={.82} roughness={.3}/></mesh>
    {[-.43, .43].map(y => <mesh key={y} position={[0, y, 0]}><cylinderGeometry args={[y > 0 ? .07 : .29, y > 0 ? .32 : .1, .22, 6]}/><meshStandardMaterial color="#c29a56" metalness={.82} roughness={.32}/></mesh>)}
    <mesh><cylinderGeometry args={[.21, .21, .65, 6]}/><meshStandardMaterial color="#d9aa58" emissive="#ffb64e" emissiveIntensity={1.6} roughness={.5} transparent opacity={.42} depthWrite={false}/></mesh>
    <mesh><cylinderGeometry args={[.045, .065, .49, 8]}/><meshBasicMaterial color={[2.5, 1.5, .55]}/></mesh>
    {Array.from({ length: 6 }, (_, i) => i * Math.PI / 3).map(a => <mesh key={a} position={[Math.sin(a) * .23, 0, Math.cos(a) * .23]}><cylinderGeometry args={[.018, .023, .78, 6]}/><meshStandardMaterial color="#b48a46" metalness={.8} roughness={.3}/></mesh>)}
    {[-.32, .32].map(y => <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[.24, .022, 6, 6]}/><meshStandardMaterial color="#d0ab67" metalness={.82} roughness={.3}/></mesh>)}
    <mesh position={[0, .62, 0]}><torusGeometry args={[.075, .018, 6, 16]}/><meshStandardMaterial color="#b58a45" metalness={.8} roughness={.3}/></mesh>
  </group>;
}

/** Static star glass; no idle animation or full-screen bloom pass. */
export function CelestialHeart({ radius = 1 }: { radius?: number }) {
  const material = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: `varying vec3 vPoint; varying vec3 vNormalView; varying vec3 vView;
      void main(){ vPoint=position; vec4 mv=modelViewMatrix*vec4(position,1.); vNormalView=normalize(normalMatrix*normal); vView=normalize(-mv.xyz); gl_Position=projectionMatrix*mv; }`,
    fragmentShader: `varying vec3 vPoint; varying vec3 vNormalView; varying vec3 vView;
      float hash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
      float noise(vec3 p){vec3 i=floor(p),f=fract(p); f=f*f*(3.-2.*f); return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
      void main(){vec3 p=normalize(vPoint);float n=noise(p*3.2)*.57+noise(p*8.)*.28+noise(p*21.)*.15;
        float vein=pow(1.-abs(sin(n*19.+p.y*3.)),22.);float star=pow(hash(floor(p*130.)),160.);
        float rim=pow(1.-abs(dot(normalize(vNormalView),normalize(vView))),3.);
        vec3 c=mix(vec3(.012,.025,.06),vec3(.035,.085,.15),smoothstep(.28,.72,n));
        c+=vec3(1.2,.68,.22)*vein*1.65+vec3(.8,.95,1.1)*star*.8+vec3(.15,.32,.52)*rim*.55;
        float heart=pow(max(0.,dot(p,normalize(vec3(-.2,.1,1.)))),22.);c+=vec3(1.7,.92,.25)*heart*1.7;
        gl_FragColor=vec4(c,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  }), []);
  const halo=useMemo(()=>{const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const c=canvas.getContext('2d')!;const g=c.createRadialGradient(64,64,12,64,64,64);g.addColorStop(0,'rgba(255,208,124,.28)');g.addColorStop(.42,'rgba(244,173,70,.12)');g.addColorStop(.68,'rgba(215,157,77,.045)');g.addColorStop(1,'rgba(180,137,77,0)');c.fillStyle=g;c.fillRect(0,0,128,128);return new THREE.CanvasTexture(canvas);},[]);
  useEffect(() => () => {material.dispose();halo.dispose();}, [material,halo]);
  return <group scale={radius}>
    <sprite scale={[3.8,3.8,1]}><spriteMaterial map={halo} blending={THREE.AdditiveBlending} transparent depthWrite={false} toneMapped={false}/></sprite>
    <mesh material={material}><sphereGeometry args={[1, 64, 40]}/></mesh>
    {[0, 1, 2].map(i => <mesh key={i} rotation={[Math.PI / 2, i * Math.PI / 3, .35]}><torusGeometry args={[1.012, .006, 5, 96]}/><meshStandardMaterial color="#c8a66a" metalness={.85} roughness={.24}/></mesh>)}
    {[-.62, 0, .62].map(y => <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[Math.sqrt(1 - y * y) + .012, .006, 5, 96]}/><meshStandardMaterial color="#9f8352" metalness={.8} roughness={.28}/></mesh>)}
  </group>;
}
