"use client";
import { Canvas,useFrame,useThree } from '@react-three/fiber';
import { useCallback,useEffect,useMemo,useRef,useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { detailedLibraryBays,upperLibraryGallery,libraryArmillaryPlacement,libraryHallCamera,libraryReadingCamera,getLibraryBayCamera,transformLibraryBayPoint } from '@/lib/library-hall-layout';
import type { LibraryCategoryId } from '@/lib/spatial-library';
import { useHallKit,InstancedHallModule,SingleHallModule,HallRenderMetrics,type HallKit } from './HallModels';
import { HallArchitecture,getHallMaterials } from './HallArchitecture';
import { HallVolumes } from './HallInstruments';
import { HallEnclosure } from './HallEnclosure';
import { CelestialFloor } from './CelestialFloor';
export type LibraryWing=LibraryCategoryId;
type Props={category:LibraryWing|null;bookId:string|null;reducedMotion:boolean;onCategory:(id:LibraryWing)=>void;onBook:(id:string)=>void;onReady:()=>void;onFailure:(reason:string)=>void};
function GuidedCamera({category,bookId,reducedMotion}:Pick<Props,'category'|'bookId'|'reducedMotion'>){
  const {camera,invalidate}=useThree();const looking=useRef(new THREE.Vector3(...libraryHallCamera.target));
  const destination=useMemo(()=>{const pose=bookId?libraryReadingCamera:category?getLibraryBayCamera(category):libraryHallCamera;return {position:new THREE.Vector3(...pose.position),target:new THREE.Vector3(...pose.target)};},[category,bookId]);
  useEffect(()=>{invalidate();},[destination,invalidate]);
  useFrame((_,delta)=>{if(camera.position.distanceTo(destination.position)+looking.current.distanceTo(destination.target)<.003){camera.lookAt(looking.current);return;}const amount=reducedMotion?1:1-Math.exp(-Math.min(delta,.06)*3.4);camera.position.lerp(destination.position,amount);looking.current.lerp(destination.target,amount);camera.lookAt(looking.current);if(!reducedMotion)invalidate();});return null;
}
function AreaLight({position,target,color,intensity,width,height}:{position:[number,number,number];target:[number,number,number];color:string;intensity:number;width:number;height:number}){
  const light=useRef<THREE.RectAreaLight>(null);useEffect(()=>{light.current?.lookAt(...target);},[target]);return <rectAreaLight ref={light} position={position} color={color} intensity={intensity} width={width} height={height}/>;
}
function HallLighting({category}:{category:LibraryWing|null}){
  const key=useRef<THREE.DirectionalLight>(null),target=useRef<THREE.Object3D>(null);
  useEffect(()=>{RectAreaLightUniformsLib.init();if(key.current&&target.current)key.current.target=target.current;},[]);
  return <>
    <hemisphereLight args={['#9eb9de','#32261d',.22]}/>
    <AreaLight position={[-9,9,6]} target={[-3,4,-6]} color="#ffce96" intensity={7} width={7} height={7}/>
    <AreaLight position={[8,14,-7]} target={[2,7,0]} color="#92b6ff" intensity={10} width={6} height={5}/>
    <AreaLight position={[0,8,11]} target={[0,5,-8]} color="#c5d7f1" intensity={2.8} width={9} height={6}/>
    <object3D ref={target} position={[0,3,-8]}/><directionalLight ref={key} position={[-6,13,8]} color="#ffd6a0" intensity={.65} castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-18} shadow-camera-right={18} shadow-camera-top={18} shadow-camera-bottom={-18} shadow-camera-near={.1} shadow-camera-far={70} shadow-bias={-.00015} shadow-normalBias={.015}/>
    {detailedLibraryBays.flatMap(bay=>[1.7,4].map(y=><pointLight key={`${bay.category}-${y}`} position={transformLibraryBayPoint(bay,[0,y,1.1])} color="#ffba75" intensity={category===bay.category?2.8:2.2} distance={6} decay={2}/>))}
    <pointLight position={[0,10.8,3]} color="#c3d7ff" intensity={6} distance={8} decay={2}/><pointLight position={[0,4.8,4]} color="#ffcf8f" intensity={4} distance={7} decay={2}/>
  </>;
}
function DisplayCabinets({root}:{root:THREE.Object3D}){
  const cabinets=useMemo(()=>detailedLibraryBays.map(bay=>{
    const model=root.clone(true);model.position.set(0,0,0);model.rotation.set(0,0,0);model.scale.setScalar(1);
    model.traverse(part=>{if(part instanceof THREE.Mesh){part.castShadow=true;part.receiveShadow=true;}if(bay.category==='connection'&&/DISPLAY_(LEFT|RIGHT)/.test(part.name))part.visible=false;});
    return {bay,model};
  }),[root]);
  return <>{cabinets.map(({bay,model})=><group key={bay.category} position={bay.position} rotation={[0,bay.rotationY,0]}><primitive object={model} dispose={null}/></group>)}</>;
}
function AuthoredRoom({kit,vista,props,onHover}:{kit:HallKit;vista:THREE.Texture|null;props:Props;onHover:(label:string|null)=>void}){
  const materials=useMemo(()=>getHallMaterials(kit),[kit]);const {invalidate}=useThree();const {onReady}=props;
  useEffect(()=>{const frame=requestAnimationFrame(()=>{onReady();invalidate();});return()=>cancelAnimationFrame(frame);},[onReady,invalidate]);
  return <>
    <DisplayCabinets root={kit.modules.CABINET}/>
    <InstancedHallModule root={kit.modules.GALLERY_ARCADE} placements={upperLibraryGallery}/>
    <SingleHallModule root={kit.modules.ARMILLARY} placement={libraryArmillaryPlacement}/>
    <HallArchitecture materials={materials} vista={vista}/><HallEnclosure materials={materials}/><CelestialFloor/>
    <HallVolumes model={kit.book} category={props.category} bookId={props.bookId} onCategory={props.onCategory} onBook={props.onBook} onHover={onHover}/>
    <SingleHallModule root={kit.modules.LECTERN} placement={{root:"LECTERN",position:[0,0,3.2],rotationY:0,scale:1.12,angleDegrees:0}}/><HallRenderMetrics/>
  </>;
}
function Hall({props,onHover}:{props:Props;onHover:(label:string|null)=>void}){
  const {gl,invalidate}=useThree();const failure=useRef(props.onFailure);useEffect(()=>{failure.current=props.onFailure;},[props.onFailure]);
  const failed=useCallback((message:string)=>failure.current(message),[]);const kit=useHallKit(failed);
  const [environment,setEnvironment]=useState<THREE.Texture|null>(null),[vista,setVista]=useState<THREE.Texture|null>(null);
  useEffect(()=>{let active=true;const texture=new THREE.TextureLoader().load('/art/library-celestial-vista.webp',loaded=>{loaded.colorSpace=THREE.SRGBColorSpace;loaded.anisotropy=4;if(active){setVista(loaded);invalidate();}},undefined,()=>{/* A missing distant view does not remove the modeled hall. */});return()=>{active=false;texture.dispose();};},[invalidate]);
  useEffect(()=>{const room=new RoomEnvironment(),generator=new THREE.PMREMGenerator(gl),result=generator.fromScene(room,.04);room.dispose();generator.dispose();const frame=requestAnimationFrame(()=>{setEnvironment(result.texture);invalidate();});return()=>{cancelAnimationFrame(frame);result.dispose();};},[gl,invalidate]);
  useEffect(()=>{const lost=(event:Event)=>{event.preventDefault();failure.current('The 3D graphics context was interrupted. The complete catalogue and every readable book remain available.');};gl.domElement.addEventListener('webglcontextlost',lost);return()=>gl.domElement.removeEventListener('webglcontextlost',lost);},[gl]);
  return <>{environment&&<primitive object={environment} attach="environment"/>}<color attach="background" args={['#030811']}/><fog attach="fog" args={['#08101d',36,85]}/><HallLighting category={props.category}/><GuidedCamera category={props.category} bookId={props.bookId} reducedMotion={props.reducedMotion}/>{kit&&<AuthoredRoom kit={kit} vista={vista} props={props} onHover={onHover}/>}</>;
}
export default function LibraryScene(props:Props){
  const {onBook,onCategory}=props;const [hover,setHover]=useState<string|null>(null);const selectBook=useCallback((id:string)=>{setHover(null);onBook(id);},[onBook]);const selectCategory=useCallback((id:LibraryWing)=>{setHover(null);onCategory(id);},[onCategory]);
  return <div style={{width:'100%',height:'100%',position:'relative'}}><Canvas scene={{environmentIntensity:.23}} shadows={{type:THREE.PCFShadowMap}} dpr={[1,1.5]} frameloop="demand" camera={{position:libraryHallCamera.position,fov:libraryHallCamera.fov,near:.1,far:110}} gl={{antialias:true,alpha:false,powerPreference:'high-performance',toneMapping:THREE.AgXToneMapping,toneMappingExposure:.9}} role="img" aria-label="Blender-authored celestial library with three labeled wings and seven highlighted readable volumes. Matching category controls and a complete catalogue are available outside the scene." style={{width:'100%',height:'100%',touchAction:'pan-y'}}><Hall props={{...props,onBook:selectBook,onCategory:selectCategory}} onHover={setHover}/></Canvas>{hover&&<div role="status" style={{position:'absolute',left:20,bottom:18,maxWidth:'calc(100% - 40px)',padding:'10px 15px',border:'1px solid #d0ad72',borderRadius:5,background:'#0a121ee8',color:'#f0d9ae',fontSize:13,pointerEvents:'none'}}>{hover}</div>}</div>;
}
