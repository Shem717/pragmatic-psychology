"use client";
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { CraftInstances, type CraftInstance } from '@/features/scene/SceneCraft';

export function ObservatoryCraft() {
  const details = useMemo(() => {
    const gold = new THREE.MeshStandardMaterial({ color: '#b29560', metalness: .78, roughness: .4 });
    const stone = new THREE.MeshStandardMaterial({ color: '#555e6a', metalness: .06, roughness: .72 });
    const box = new THREE.BoxGeometry(1, 1, 1), flute = new THREE.CylinderGeometry(.024, .03, 1, 6);
    const cornice: CraftInstance[] = [], flutes: CraftInstance[] = [], ticks: CraftInstance[] = [];
    const columns = Array.from({ length: 8 }, (_, i) => { const a = Math.PI - .12 + i * (Math.PI + .24) / 7; return [Math.cos(a) * 10, Math.sin(a) * 10]; });
    columns.push([-8.9, 5.7], [8.9, 5.7]);
    for (const [x, z] of columns) for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; flutes.push({ position: [x + Math.cos(a) * .445, 4.7, z + Math.sin(a) * .445], scale: [1, 6.95, 1] }); }
    for (let i = 0; i < 144; i++) { const a = i * Math.PI / 72; cornice.push({ position: [Math.cos(a) * 10.24, 9.5, Math.sin(a) * 10.24], rotation: [0, -a, 0], scale: [.16, .2, .24] }); }
    for (let i = 0; i < 96; i++) { const a = i * Math.PI / 48; ticks.push({ position: [Math.sin(a) * 3.45, 10.87, Math.cos(a) * 3.45 - 1], rotation: [0, a, 0], scale: [.024, .022, i % 4 === 0 ? .28 : .12] }); }
    return { gold, stone, box, flute, cornice, flutes, ticks };
  }, []);
  useEffect(() => () => { [details.gold, details.stone, details.box, details.flute].forEach(value => value.dispose()); }, [details]);
  return <>
    <CraftInstances geometry={details.flute} material={details.stone} items={details.flutes}/>
    <CraftInstances geometry={details.box} material={details.gold} items={details.cornice}/>
    <CraftInstances geometry={details.box} material={details.gold} items={details.ticks}/>
    {[3.25, 3.35, 3.65, 5.1, 5.2].map(radius => <mesh key={radius} position={[0, 10.9, -1]} rotation={[Math.PI / 2, 0, 0]} material={details.gold}><torusGeometry args={[radius, radius < 4 ? .035 : .045, 8, 128]}/></mesh>)}
    {Array.from({ length: 12 }, (_, i) => i * Math.PI / 6).map(a => <group key={a} position={[Math.sin(a) * 4.4, 10.9, Math.cos(a) * 4.4 - 1]} rotation={[Math.PI / 2, 0, -a]}>
      <mesh material={details.gold}><torusGeometry args={[.27, .018, 6, 32]}/></mesh><mesh rotation={[0, 0, Math.PI / 4]} material={details.gold}><planeGeometry args={[.13, .13]}/></mesh>
    </group>)}
  </>;
}

/** Curved vellum pages and a visible sewn gutter rather than a white slab. */
export function DeskFolio() {
  const resources = useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width = 768; canvas.height = 512;
    const c = canvas.getContext('2d')!; c.fillStyle = '#d9c69b'; c.fillRect(0, 0, 768, 512);
    const wash = c.createLinearGradient(0, 0, 768, 0); wash.addColorStop(0, '#92724155'); wash.addColorStop(.1, '#fff0ce33'); wash.addColorStop(.47, '#ead6b222'); wash.addColorStop(.5, '#49301755'); wash.addColorStop(.54, '#f8e8c244'); wash.addColorStop(1, '#987c4133'); c.fillStyle = wash; c.fillRect(0, 0, 768, 512);
    c.strokeStyle = '#7f633a'; c.lineWidth = 1; c.strokeRect(22, 24, 334, 458); c.strokeRect(411, 24, 334, 458);
    c.fillStyle = '#5c4325'; c.textAlign = 'center'; c.font = 'small-caps 25px Georgia'; c.fillText('The Art of Inquiry', 189, 73); c.font = '17px Georgia'; c.fillText('Observe · Question · Examine', 575, 75);
    for (let side = 0; side < 2; side++) for (let row = 0; row < 18; row++) { c.fillStyle = `rgba(71,52,29,${.32 + row % 3 * .06})`; c.fillRect(48 + side * 387, 122 + row * 17, 240 + (row * 23 % 55), 2); }
    c.strokeStyle = '#916b30'; for (const r of [28, 39, 47]) { c.beginPath(); c.ellipse(575, 245, r, r, .5, 0, Math.PI * 2); c.stroke(); }
    const map = new THREE.CanvasTexture(canvas); map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 4;
    const geometry = new THREE.PlaneGeometry(1.82, 1.14, 40, 2); const p = geometry.getAttribute('position');
    for (let i = 0; i < p.count; i++) { const x = p.getX(i); p.setZ(i, .04 + Math.sin(Math.abs(x) / .91 * Math.PI) * .1 + Math.abs(x) * .035); } geometry.computeVertexNormals();
    return { map, geometry };
  }, []);
  useEffect(() => () => { resources.map.dispose(); resources.geometry.dispose(); }, [resources]);
  return <group rotation={[-Math.PI / 2 + .14, 0, 0]}>
    <mesh position={[0, 0, -.04]}><boxGeometry args={[1.95, 1.23, .08]}/><meshStandardMaterial color="#3b2522" roughness={.72}/></mesh>
    {[-.025, 0, .025].map(z => <mesh key={z} geometry={resources.geometry} position={[0, 0, z]}><meshStandardMaterial map={resources.map} roughness={.85} side={THREE.DoubleSide}/></mesh>)}
    <mesh position={[0, 0, .075]}><boxGeometry args={[.014, 1.12, .014]}/><meshStandardMaterial color="#8a5636" roughness={.8}/></mesh>
  </group>;
}
