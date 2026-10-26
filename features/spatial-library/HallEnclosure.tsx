"use client";
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import type { HallMaterials } from './HallArchitecture';

/** Architecture, not another collection: these side panels contain no shelves or decorative books. */
export function HallEnclosure({ materials }: { materials: HallMaterials }) {
  const resources = useMemo(() => {
    const stone = materials.marble.clone();
    stone.aoMap = null;
    stone.color.set('#8794b6');
    stone.roughness = .34;
    const panel = new RoundedBoxGeometry(6.35, 8.6, .42, 3, .09);
    const inset = new RoundedBoxGeometry(5.48, 6.85, .08, 3, .035);
    const pilaster = new RoundedBoxGeometry(.34, 8.65, .6, 3, .055);
    const plinth = new RoundedBoxGeometry(.8, .36, .85, 3, .045);
    const lamp = new RoundedBoxGeometry(.17, 1.22, .12, 2, .03);
    const points: THREE.Vector2[] = [];
    for (let i = 0; i < 32; i++) {
      const angle = i * Math.PI / 16, radius = i % 4 === 0 ? 1.03 : i % 2 === 0 ? .65 : .22;
      points.push(new THREE.Vector2(Math.sin(angle) * radius, Math.cos(angle) * radius));
    }
    const emblem = new THREE.ShapeGeometry(new THREE.Shape(points));
    return { stone, panel, inset, pilaster, plinth, lamp, emblem };
  }, [materials.marble]);
  useEffect(() => () => {
    resources.stone.dispose();
    for (const key of ['panel', 'inset', 'pilaster', 'plinth', 'lamp', 'emblem'] as const) resources[key].dispose();
  }, [resources]);
  return <>
    {[-90, -60, 60, 90].map(angle => {
      const radians = angle * Math.PI / 180;
      return <group key={angle} position={[12.75 * Math.sin(radians), 0, -12.75 * Math.cos(radians)]} rotation={[0, -radians, 0]}>
        <mesh geometry={resources.panel} position={[0, 4.3, -.1]} material={resources.stone} receiveShadow/>
        <mesh geometry={resources.inset} position={[0, 4.35, .15]} material={resources.stone} receiveShadow/>
        {[-2.95, 2.95].map(x => <group key={x} position={[x, 0, .2]}>
          <mesh geometry={resources.pilaster} position={[0, 4.33, 0]} material={resources.stone} castShadow receiveShadow/>
          {[.18, 8.42].map(y => <mesh key={y} geometry={resources.plinth} position={[0, y, .05]} material={materials.gold}/>) }
          {[-.14, .14].map(dx => <mesh key={dx} position={[dx, 4.3, .32]} material={materials.gold}><boxGeometry args={[.035, 7.9, .025]}/></mesh>)}
        </group>)}
        {[1, 7.75].map(y => <mesh key={y} position={[0, y, .22]} material={materials.gold}><boxGeometry args={[5.55, .045, .035]}/></mesh>)}
        <mesh geometry={resources.emblem} position={[0, 5.15, .21]} material={materials.gold}/>
        {[.7, 1.17].map(radius => <mesh key={radius} position={[0, 5.15, .23]} material={materials.gold}><torusGeometry args={[radius, .018, 8, 64]}/></mesh>)}
        {[-1.9, 1.9].map(x => <group key={x} position={[x, 2.8, .42]}>
          <mesh material={materials.gold}><boxGeometry args={[.38, 1.6, .22]}/></mesh>
          <mesh geometry={resources.lamp} position={[0, 0, .13]}><meshStandardMaterial color="#ead4a8" emissive="#ffd08a" emissiveIntensity={2.2} roughness={.35}/></mesh>
          {[-.85, .85].map(y => <mesh key={y} position={[0, y, .08]} material={materials.gold}><sphereGeometry args={[.17, 12, 8]}/></mesh>)}
        </group>)}
        <pointLight position={[0, 3.3, 1.1]} color="#ffbd78" intensity={8} distance={7} decay={2}/>
      </group>;
    })}
    {/* A solid, dark outer shell closes the gaps behind the gallery without replacing its real architecture. */}
    <mesh position={[0, 7.1, 0]} rotation={[0, Math.PI / 2, 0]} material={resources.stone} receiveShadow>
      <cylinderGeometry args={[14.3, 14.3, 14.2, 96, 1, true, 0, Math.PI]}/>
    </mesh>
  </>;
}
