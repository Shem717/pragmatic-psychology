"use client";
import { useEffect,useMemo,useState } from 'react';
import { useThree,type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { detailedLibraryBays,featuredLibraryBooks,type LibraryBayPlacement } from '@/lib/library-hall-layout';
import { libraryCategories,getLibraryVolume,type LibraryCategoryId } from '@/lib/spatial-library';
import type { HallMaterials } from './HallArchitecture';
type Book=typeof featuredLibraryBooks[number];
type SelectProps={onCategory:(category:LibraryCategoryId)=>void;onBook:(id:string)=>void;onHover:(label:string|null)=>void};
function lines(text:string,width=17){const result:string[]=[];for(const word of text.toUpperCase().split(/\s+/)){if(!result.length||result[result.length-1].length+word.length+1>width)result.push(word);else result[result.length-1]+=' '+word;}return result;}
function coverTexture(book:Book){
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=768;const ctx=canvas.getContext('2d')!;
  ctx.fillStyle=book.color;ctx.fillRect(0,0,512,768);for(let i=0;i<6500;i++){ctx.fillStyle=i%3?'rgba(255,226,181,.06)':'rgba(0,0,0,.12)';ctx.fillRect(i*73.31%512,i*139.17%768,1.5,2.5);}
  ctx.strokeStyle='#c4a56b';ctx.lineWidth=3;ctx.strokeRect(26,26,460,716);ctx.lineWidth=1;ctx.strokeRect(37,37,438,694);
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#f0d9aa';ctx.font='92px Georgia,serif';ctx.fillText(book.roman,256,127);
  ctx.beginPath();ctx.arc(256,250,43,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(256,188);ctx.lineTo(269,250);ctx.lineTo(256,312);ctx.lineTo(243,250);ctx.closePath();ctx.stroke();
  const title=lines(book.shortTitle,12);ctx.font='77px Georgia,serif';title.forEach((line,index)=>ctx.fillText(line,256,370+index*86,418));ctx.font='20px Georgia,serif';ctx.fillText('SOVEREIGN PSYCHOLOGY',256,638);ctx.font='22px Georgia,serif';ctx.fillText('OPEN VOLUME',256,689);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;return texture;
}
function useTargetHover(label:string,onHover:SelectProps['onHover']){
  const [hovered,setHovered]=useState(false);const {gl,invalidate}=useThree();
  useEffect(()=>{if(!hovered)return;const previous=gl.domElement.style.cursor;gl.domElement.style.setProperty('cursor','pointer');onHover(label);invalidate();return()=>{gl.domElement.style.setProperty('cursor',previous);onHover(null);};},[hovered,gl,label,onHover,invalidate]);
  return {hovered,enter:(event:ThreeEvent<PointerEvent>)=>{event.stopPropagation();setHovered(true);},leave:()=>setHovered(false)};
}
function FeaturedVolume({book,materials,selected,onBook,onHover}:{book:Book;materials:HallMaterials;selected:boolean;onBook:SelectProps['onBook'];onHover:SelectProps['onHover']}){
  const texture=useMemo(()=>coverTexture(book),[book]);const binding=useMemo(()=>{const material=materials.leather.clone();material.aoMap=null;material.color.set(book.color);return material;},[materials.leather,book.color]);
  const body=useMemo(()=>new RoundedBoxGeometry(.96,1.4,.045,3,.015),[]);const spine=useMemo(()=>new RoundedBoxGeometry(.11,1.4,.285,3,.025),[]);const {hovered,enter,leave}=useTargetHover(`Open volume ${book.roman} · ${book.shortTitle}`,onHover);
  useEffect(()=>()=>{texture.dispose();binding.dispose();body.dispose();spine.dispose();},[texture,binding,body,spine]);
  const pick=(event:ThreeEvent<MouseEvent>)=>{event.stopPropagation();leave();onHover(null);onBook(book.id);};
  return <group position={[book.localPosition[0],book.localPosition[1]+(hovered?.045:0),book.localPosition[2]+.06]} rotation={[0,book.localPosition[0]*-.035,0]} scale={hovered?1.025:1} onClick={pick} onPointerOver={enter} onPointerMove={enter} onPointerOut={leave}>
    <mesh geometry={body} position={[0,0,-.12]} material={binding} castShadow receiveShadow/><mesh geometry={spine} position={[-.45,0,0]} material={binding} castShadow/>
    <mesh position={[.018,0,.01]}><boxGeometry args={[.88,1.32,.19]}/><meshStandardMaterial color="#cdbf9f" roughness={.8}/></mesh>
    <mesh position={[0,0,.12]} geometry={body} scale={[1.02,1.02,1]} material={binding} castShadow/>
    <mesh position={[0,0,.145]}><planeGeometry args={[.94,1.38]}/><meshStandardMaterial map={texture} roughness={.55} emissive="#e7c887" emissiveIntensity={hovered||selected?.14:.025}/></mesh>
    {[-.62,.62].map(y=><mesh key={y} position={[0,y,.146]} material={materials.gold}><boxGeometry args={[.94,.016,.012]}/></mesh>)}
    <mesh position={[0,-.76,-.015]} material={materials.gold}><boxGeometry args={[1.1,.06,.45]}/></mesh>
    {(hovered||selected)&&<mesh position={[0,0,.144]}><planeGeometry args={[1.04,1.48]}/><meshBasicMaterial color="#f6d18b"/></mesh>}
  </group>;
}
function WingTitle({bay,selected,onCategory,onHover}:{bay:LibraryBayPlacement;selected:boolean;onCategory:SelectProps['onCategory'];onHover:SelectProps['onHover']}){
  const category=libraryCategories.find(item=>item.id===bay.category)!;
  const texture=useMemo(()=>{const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=320;const ctx=canvas.getContext('2d')!;ctx.clearRect(0,0,1024,320);ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#f2d7a5';ctx.font='62px Georgia,serif';const words=category.title.toUpperCase().split(' & ');ctx.fillText(words[0],512,103,980);ctx.fillText('& '+words[1],512,190,980);ctx.font='24px Georgia,serif';ctx.fillText(`SELECT WING ${category.roman}`,512,274);const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=4;return map;},[category]);
  useEffect(()=>()=>texture.dispose(),[texture]);const {hovered,enter,leave}=useTargetHover(`Explore ${category.title}`,onHover);
  return <mesh position={[0,5.96,.252]} onPointerOver={enter} onPointerMove={enter} onPointerOut={leave} onClick={event=>{event.stopPropagation();leave();onHover(null);onCategory(category.id);}}><planeGeometry args={[2.7,.85]}/><meshStandardMaterial map={texture} transparent roughness={.55} emissive="#ebc885" emissiveIntensity={hovered||selected?.35:.12} depthWrite={false}/></mesh>;
}
export function HallVolumes({materials,category,bookId,onCategory,onBook,onHover}:SelectProps&{materials:HallMaterials;category:LibraryCategoryId|null;bookId:string|null}){
  return <>{detailedLibraryBays.map(bay=><group key={bay.category} position={bay.position} rotation={[0,bay.rotationY,0]}><WingTitle bay={bay} selected={category===bay.category} onCategory={onCategory} onHover={onHover}/>{featuredLibraryBooks.filter(book=>book.category===bay.category).map(book=><FeaturedVolume key={book.id} book={book} materials={materials} selected={book.id===bookId} onBook={onBook} onHover={onHover}/>)}</group>)}</>;
}
export function HallReadingDesk({materials,bookId}:{materials:HallMaterials;bookId:string|null}){
  const book=bookId?getLibraryVolume(bookId):null;
  const wood=useMemo(()=>{const material=materials.wood.clone();material.aoMap=null;return material;},[materials.wood]);
  const shapes=useMemo(()=>({top:new RoundedBoxGeometry(2.95,.19,1.85,3,.055),leg:new RoundedBoxGeometry(.23,1.25,.23,2,.035)}),[]);
  const page=useMemo(()=>{const canvas=document.createElement('canvas');canvas.width=768;canvas.height=512;const ctx=canvas.getContext('2d')!;ctx.fillStyle='#dccfb2';ctx.fillRect(0,0,768,512);ctx.strokeStyle='#aa9266';ctx.strokeRect(28,28,712,456);ctx.fillStyle='#473721';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='34px Georgia,serif';lines(book?.shortTitle||'The reading desk',23).forEach((line,index)=>ctx.fillText(line,384,190+index*52,670));ctx.font='22px Georgia,serif';ctx.fillText(book?'YOUR VOLUME IS OPEN':'CHOOSE A HIGHLIGHTED VOLUME',384,370,680);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture;},[book]);
  useEffect(()=>()=>{wood.dispose();shapes.top.dispose();shapes.leg.dispose();},[wood,shapes]);useEffect(()=>()=>page.dispose(),[page]);
  return <group position={[0,.43,2]}>
    <mesh geometry={shapes.top} position={[0,1.38,0]} material={wood} castShadow receiveShadow/>
    {[-1.2,1.2].flatMap(x=>[-.63,.63].map(z=><group key={`${x}-${z}`} position={[x,.67,z]}><mesh geometry={shapes.leg} material={wood} castShadow/><mesh position={[0,.53,0]} material={materials.gold}><boxGeometry args={[.28,.09,.28]}/></mesh><mesh position={[0,-.53,0]} material={materials.gold}><boxGeometry args={[.28,.09,.28]}/></mesh></group>))}
    <group position={[0,1.52,.13]} rotation={[-Math.PI/2+.13,0,0]}>{[-1,1].map(side=><group key={side} position={[side*.55,0,0]} rotation={[0,side*-.11,0]}><mesh><boxGeometry args={[1.08,1.4,.1]}/><meshStandardMaterial color="#bcb18f" roughness={.8}/></mesh><mesh position={[0,0,.054]}><planeGeometry args={[1.04,1.36]}/><meshStandardMaterial map={page} roughness={.8}/></mesh></group>)}</group>
    {[-1.3,1.3].map(x=><group key={x} position={[x,1.53,-.55]}><mesh material={materials.gold}><cylinderGeometry args={[.045,.09,.5,12]}/></mesh><mesh position={[0,.32,0]}><sphereGeometry args={[.075,12,8]}/><meshBasicMaterial color="#ffe0a0"/></mesh></group>)}
  </group>;
}
