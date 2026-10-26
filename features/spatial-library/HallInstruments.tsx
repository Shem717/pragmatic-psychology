"use client";
import { useEffect,useMemo,useState } from 'react';
import { useThree,type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { detailedLibraryBays,featuredLibraryBooks,type LibraryBayPlacement } from '@/lib/library-hall-layout';
import { createLibraryBookPresentation,libraryBookLettering } from '@/lib/library-book-materials';
import { libraryCategories,type LibraryCategoryId } from '@/lib/spatial-library';
type Book=typeof featuredLibraryBooks[number];
type SelectProps={onCategory:(category:LibraryCategoryId)=>void;onBook:(id:string)=>void;onHover:(label:string|null)=>void};
function lines(text:string,width=17){const result:string[]=[];for(const word of text.toUpperCase().split(/\s+/)){if(!result.length||result[result.length-1].length+word.length+1>width)result.push(word);else result[result.length-1]+=' '+word;}return result;}
function coverTexture(book:Book){
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=768;const ctx=canvas.getContext('2d')!;
  // Only typography is rasterized; all leather, ornament, boards and pages remain authored geometry/PBR.
  ctx.clearRect(0,0,512,768);ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#fff5dc';
  const py=(y:number)=>(.7-y)/1.4*768;
  ctx.font='23px Georgia,serif';ctx.fillText('SOVEREIGN PSYCHOLOGY',256,py(.52),382);
  const title=lines(book.shortTitle,14);const height=Math.min(67,170/title.length);
  ctx.font=`${height}px Georgia,serif`;title.forEach((line,index)=>ctx.fillText(line,256,py(-.1)+(index-(title.length-1)/2)*height*1.14,365));
  ctx.font='46px Georgia,serif';ctx.fillText(book.roman,256,py(-.48));
  ctx.font='18px Georgia,serif';ctx.fillText('OPEN VOLUME',256,py(-.575));
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;return texture;
}
function useTargetHover(label:string,onHover:SelectProps['onHover']){
  const [hovered,setHovered]=useState(false);const {gl,invalidate}=useThree();
  useEffect(()=>{if(!hovered)return;const previous=gl.domElement.style.cursor;gl.domElement.style.setProperty('cursor','pointer');onHover(label);invalidate();return()=>{gl.domElement.style.setProperty('cursor',previous);onHover(null);};},[hovered,gl,label,onHover,invalidate]);
  return {hovered,enter:(event:ThreeEvent<PointerEvent>)=>{event.stopPropagation();setHovered(true);},leave:()=>setHovered(false)};
}
function FeaturedVolume({book,model,selected,onBook,onHover}:{book:Book;model:THREE.Group;selected:boolean;onBook:SelectProps['onBook'];onHover:SelectProps['onHover']}){
  const texture=useMemo(()=>coverTexture(book),[book]);
  const presentation=useMemo(()=>createLibraryBookPresentation(model,book.number),[model,book.number]);
  useEffect(()=>()=>presentation.dispose(),[presentation]);
  const {hovered,enter,leave}=useTargetHover(`Open volume ${book.roman} · ${book.shortTitle}`,onHover);
  useEffect(()=>()=>texture.dispose(),[texture]);
  const pick=(event:ThreeEvent<MouseEvent>)=>{event.stopPropagation();leave();onHover(null);onBook(book.id);};
  return <group position={[book.localPosition[0],book.localPosition[1]+(hovered?.045:0),book.localPosition[2]+.06]} rotation={[0,book.localPosition[0]*-.035,0]} scale={hovered?1.23:1.2} onClick={pick} onPointerOver={enter} onPointerMove={enter} onPointerOut={leave}>
    <primitive object={presentation.object} dispose={null}/>
    <mesh position={[0,0,.174]}><planeGeometry args={[.96,1.4]}/><meshStandardMaterial map={texture} color={libraryBookLettering.color} transparent alphaTest={.12} metalness={libraryBookLettering.metalness} roughness={libraryBookLettering.roughness} emissive={libraryBookLettering.emissive} emissiveIntensity={hovered||selected?libraryBookLettering.active:libraryBookLettering.idle} depthWrite={false}/></mesh>
    {(hovered||selected)&&<mesh position={[0,0,-.18]}><planeGeometry args={[1.08,1.5]}/><meshBasicMaterial color="#f6d18b"/></mesh>}
  </group>;
}
function WingTitle({bay,selected,onCategory,onHover}:{bay:LibraryBayPlacement;selected:boolean;onCategory:SelectProps['onCategory'];onHover:SelectProps['onHover']}){
  const category=libraryCategories.find(item=>item.id===bay.category)!;
  const texture=useMemo(()=>{const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=320;const ctx=canvas.getContext('2d')!;ctx.clearRect(0,0,1024,320);ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#f2d7a5';ctx.font='62px Georgia,serif';const words=category.title.toUpperCase().split(' & ');ctx.fillText(words[0],512,103,980);ctx.fillText('& '+words[1],512,190,980);ctx.font='24px Georgia,serif';ctx.fillText(`SELECT WING ${category.roman}`,512,274);const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=4;return map;},[category]);
  useEffect(()=>()=>texture.dispose(),[texture]);const {hovered,enter,leave}=useTargetHover(`Explore ${category.title}`,onHover);
  return <mesh position={[0,5.96,.252]} onPointerOver={enter} onPointerMove={enter} onPointerOut={leave} onClick={event=>{event.stopPropagation();leave();onHover(null);onCategory(category.id);}}><planeGeometry args={[2.7,.85]}/><meshStandardMaterial map={texture} transparent roughness={.55} emissive="#ebc885" emissiveIntensity={hovered||selected?.35:.12} depthWrite={false}/></mesh>;
}
export function HallVolumes({model,category,bookId,onCategory,onBook,onHover}:SelectProps&{model:THREE.Group;category:LibraryCategoryId|null;bookId:string|null}){
  return <>{detailedLibraryBays.map(bay=><group key={bay.category} position={bay.position} rotation={[0,bay.rotationY,0]}><WingTitle bay={bay} selected={category===bay.category} onCategory={onCategory} onHover={onHover}/>{featuredLibraryBooks.filter(book=>book.category===bay.category).map(book=><FeaturedVolume key={book.id} book={book} model={model} selected={book.id===bookId} onBook={onBook} onHover={onHover}/>)}</group>)}</>;
}
