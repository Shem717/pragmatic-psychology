"use client";
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { CraftInstances, Lantern, type CraftInstance } from '@/features/scene/SceneCraft';
import type { HallMaterials } from './HallArchitecture';

/** Recessed archive architecture. Only the seven foreground volumes are interactive. */
export function HallEnclosure({ materials }: { materials: HallMaterials }) {
  const resources = useMemo(() => {
    const stone = materials.marble.clone(); stone.aoMap = null; stone.color.set('#c0c6d0'); stone.roughness = .68; stone.metalness = .06;
    const walnut = materials.wood.clone(); walnut.aoMap = null; walnut.color.set('#493323'); walnut.roughness = .66;
    const brass = materials.gold.clone(); brass.color.set('#a88b58'); brass.roughness = .48;
    const leather = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: .82, metalness: .03 });
    const book = new RoundedBoxGeometry(1, 1, 1, 1, .035), box = new THREE.BoxGeometry(1, 1, 1);
    const books: CraftInstance[] = [], bands: CraftInstance[] = [], carving: CraftInstance[] = [];
    const colors = ['#3e514d', '#684c39', '#294458', '#5e3440', '#807252', '#433d55', '#363e43'];
    for (let row = 0; row < 5; row++) {
      let x = -2.23;
      for (let i = 0; i < 20 && x < 2.14; i++) {
        const seed = (i * 37 + row * 19) % 29, width = .15 + seed / 190, height = .51 + (seed % 7) * .038;
        const center = x + width / 2, base = 1.34 + row * .93;
        books.push({ position: [center, base + height / 2, -.14], scale: [width - .015, height, .39], color: colors[(i + row * 3) % colors.length] });
        for (const fraction of [.14, .23, .8, .87]) bands.push({ position: [center, base + height * fraction, .061], scale: [width - .035, .012, .014] });
        x += width + .025;
      }
    }
    for (let i = 0; i < 25; i++) carving.push({ position: [-2.85 + i * .2375, 8.15, .46], scale: [.10, .17, .17] });
    return { stone, walnut, brass, leather, book, box, books, bands, carving };
  }, [materials]);
  useEffect(() => () => { for (const value of [resources.stone, resources.walnut, resources.brass, resources.leather, resources.book, resources.box]) value.dispose(); }, [resources]);
  return <>
    {[-90, -60, 60, 90].map(angle => {
      const radians = angle * Math.PI / 180;
      return <group key={angle} position={[12.75 * Math.sin(radians), 0, -12.75 * Math.cos(radians)]} rotation={[0, -radians, 0]}>
        <mesh position={[0, 4.25, -.5]} material={resources.stone} receiveShadow><boxGeometry args={[6.35, 8.5, .3]}/></mesh>
        <mesh position={[0, 3.75, -.28]} receiveShadow><boxGeometry args={[4.9, 5.1, .12]}/><meshStandardMaterial color="#17201f" roughness={.9}/></mesh>
        <CraftInstances geometry={resources.book} material={resources.leather} items={resources.books}/>
        <CraftInstances geometry={resources.box} material={resources.brass} items={resources.bands}/>
        {[1.25, 2.18, 3.11, 4.04, 4.97, 5.9].map(y => <group key={y}>
          <mesh position={[0, y, -.05]} material={resources.walnut} castShadow receiveShadow><boxGeometry args={[5.08, .12, .82]}/></mesh>
          <mesh position={[0, y + .017, .37]} material={resources.brass}><boxGeometry args={[5.1, .035, .045]}/></mesh>
        </group>)}
        {[-2.68, 2.68].map(x => <group key={x} position={[x, 0, .28]}>
          <mesh position={[0, 4, 0]} material={resources.stone} castShadow receiveShadow><cylinderGeometry args={[.22, .3, 6.4, 16]}/></mesh>
          {[-.14, 0, .14].map(dx => <mesh key={dx} position={[dx, 4, .23]} material={resources.brass}><cylinderGeometry args={[.018, .018, 5.9, 6]}/></mesh>)}
          {[.55, .77, 7.13, 7.35].map(y => <mesh key={y} position={[0, y, 0]} material={resources.stone}><boxGeometry args={[.8, .18, .9]}/></mesh>)}
          {[.9, 7].map(y => <mesh key={y} position={[0, y, 0]} material={resources.brass}><cylinderGeometry args={[.34, .34, .075, 16]}/></mesh>)}
          <group position={[0, 3.5, .64]}><Lantern scale={.8}/></group>
        </group>)}
        {[2.45, 2.62, 2.8].map((radius, i) => <mesh key={radius} position={[0, 5.5, .26 + i * .05]} material={i === 1 ? resources.brass : resources.stone} castShadow><torusGeometry args={[radius, i === 1 ? .035 : .12, 8, 48, Math.PI]}/></mesh>)}
        {[.34, .55, 8.02, 8.35, 8.52].map((y, i) => <mesh key={y} position={[0, y, .26]} material={i % 2 ? resources.brass : resources.stone} receiveShadow><boxGeometry args={[6.35, i % 2 ? .065 : .2, .65 + (i % 2) * .08]}/></mesh>)}
        <CraftInstances geometry={resources.box} material={resources.stone} items={resources.carving}/>
        <mesh position={[0, 6.85, .06]} rotation={[0, 0, Math.PI / 4]} material={resources.brass}><torusGeometry args={[.52, .035, 8, 48]}/></mesh>
        <mesh position={[0, 6.85, .05]} material={resources.brass}><torusGeometry args={[.37, .012, 6, 32]}/></mesh>
        <pointLight position={[0, 4.8, 1.3]} color="#ffce91" intensity={22} distance={7} decay={2}/>
      </group>;
    })}
    <mesh position={[0, 7.1, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
      <cylinderGeometry args={[14.3, 14.3, 14.2, 96, 1, true, 0, Math.PI]}/><meshStandardMaterial color="#17202b" roughness={.9} side={THREE.DoubleSide}/>
    </mesh>
  </>;
}
