"use client";
import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { disposeBenchmarkAsset } from './asset-lifetime';

type Point=[number,number,number];
export type BenchmarkConfiguration={
  models:{id:string;url:string;position:Point;rotation?:Point}[];
  views:{id:string;label:string;position:Point;target:Point;fov?:number}[];
  lights:{position:Point;target:Point;color:string;intensity:number;width:number;height:number}[];
  background:string;exposure:number;environmentIntensity:number;fov:number;
  shadowKey?:{position:Point;target:Point;color:string;intensity:number;extent:number};
  shelfLights?:{position:Point;color:string;intensity:number;distance:number}[];
};
type Props={configuration:BenchmarkConfiguration;view:string;reset:number;onLoading:()=>void;onReady:()=>void;onFailure:(message:string)=>void};
function AreaLight({light}:{light:BenchmarkConfiguration['lights'][number]}){
  const ref=useRef<THREE.RectAreaLight>(null);
  useEffect(()=>{ref.current?.lookAt(...light.target);},[light]);
  return <rectAreaLight ref={ref} position={light.position} color={light.color} intensity={light.intensity} width={light.width} height={light.height}/>;
}
function ShadowKey({light}:{light:NonNullable<BenchmarkConfiguration['shadowKey']>}){
  const target=useRef<THREE.Object3D>(null),source=useRef<THREE.DirectionalLight>(null);
  useEffect(()=>{if(source.current&&target.current)source.current.target=target.current;},[]);
  return <><object3D ref={target} position={light.target}/><directionalLight ref={source} position={light.position} color={light.color} intensity={light.intensity} castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-light.extent} shadow-camera-right={light.extent} shadow-camera-top={light.extent} shadow-camera-bottom={-light.extent} shadow-camera-near={.1} shadow-camera-far={50} shadow-bias={-.00015} shadow-normalBias={.015}/></>;
}
function PresentationSurface({models}:{models:THREE.Group[]}){
  const material=useMemo(()=>{
    let source:THREE.MeshStandardMaterial|null=null;
    models[0]?.traverse(object=>{if(object instanceof THREE.Mesh){const list=Array.isArray(object.material)?object.material:[object.material];for(const candidate of list)if(candidate instanceof THREE.MeshStandardMaterial&&candidate.name.includes('Midnight marble'))source=candidate;}});
    const result=source ? (source as THREE.MeshStandardMaterial).clone() : new THREE.MeshStandardMaterial({color:'#0a1425',metalness:.3,roughness:.25});
    result.aoMap=null; // The authored shelf AO uses unique shelf UVs, not the presentation floor.
    return result;
  },[models]);
  useEffect(()=>()=>material.dispose(),[material]);
  return <><mesh position={[2,-.17,0]} receiveShadow><boxGeometry args={[15,.25,12]}/><primitive object={material} attach="material" dispose={null}/></mesh>{[2.1,2.2,2.65,2.7].map(radius=><mesh key={radius} position={[4,-.035,.1]} rotation={[-Math.PI/2,0,0]}><torusGeometry args={[radius,.012,6,96]}/><meshStandardMaterial color="#b79a63" metalness={.85} roughness={.28}/></mesh>)}{[[1.5,.15,.05],[1.36,.12,.17],[1.2,.1,.28]].map(([radius,height,y])=><mesh key={radius} position={[5,y,0]} receiveShadow castShadow><cylinderGeometry args={[radius,radius,height,80]}/><primitive object={material} attach="material" dispose={null}/></mesh>)}</>;
}
function Study({configuration,view,reset,onLoading,onReady,onFailure}:Props){
  const {camera,gl,invalidate}=useThree();
  const [environment,setEnvironment]=useState<THREE.Texture|null>(null);
  const [models,setModels]=useState<THREE.Group[]>([]);
  const controls=useRef<OrbitControls|null>(null);
  useEffect(()=>{
    RectAreaLightUniformsLib.init();
    const control=new OrbitControls(camera,gl.domElement);controls.current=control;
    control.enableDamping=false;control.enablePan=false;control.minDistance=4;control.maxDistance=30;
    control.minPolarAngle=Math.PI*.18;control.maxPolarAngle=Math.PI*.57;
    control.minAzimuthAngle=-Math.PI*.4;control.maxAzimuthAngle=Math.PI*.4;
    const changed=()=>invalidate();control.addEventListener('change',changed);
    return()=>{control.removeEventListener('change',changed);control.dispose();controls.current=null;};
  },[camera,gl,invalidate]);
  useEffect(()=>{
    const selected=configuration.views.find(candidate=>candidate.id===view)||configuration.views[0];
    camera.position.set(...selected.position);camera.lookAt(...selected.target);
    if(camera instanceof THREE.PerspectiveCamera){camera.setFocalLength(.5*camera.getFilmHeight()/Math.tan(THREE.MathUtils.degToRad(selected.fov||configuration.fov)/2));}
    controls.current?.target.set(...selected.target);controls.current?.update();invalidate();
  },[configuration,view,reset,camera,invalidate]);
  useEffect(()=>{
    const pmrem=new THREE.PMREMGenerator(gl),room=new RoomEnvironment();
    const result=pmrem.fromScene(room,.04);room.dispose();pmrem.dispose();
    const commit=requestAnimationFrame(()=>{setEnvironment(result.texture);invalidate();});
    return()=>{cancelAnimationFrame(commit);result.dispose();};
  },[gl,invalidate]);
  useEffect(()=>{
    let active=true;const owned:THREE.Group[]=[];const loader=new GLTFLoader();onLoading();
    Promise.all(configuration.models.map(async model=>{
      const loaded=await loader.loadAsync(model.url);
      if(!active){disposeBenchmarkAsset(loaded.scene);return null;}
      owned.push(loaded.scene);
      loaded.scene.traverse(object=>{if(object instanceof THREE.Mesh){object.receiveShadow=true;const materials=Array.isArray(object.material)?object.material:[object.material];object.castShadow=!materials.some(material=>material instanceof THREE.MeshPhysicalMaterial && material.transmission>0);}});
      loaded.scene.position.set(...model.position);
      if(model.rotation)loaded.scene.rotation.set(...model.rotation);
      return loaded.scene;
    })).then(results=>{
      if(!active)return;
      setModels(results.filter((model):model is THREE.Group=>model!==null));invalidate();onReady();
    }).catch(()=>{if(active)onFailure('The benchmark assets could not load. The existing Library remains available.');});
    return()=>{active=false;owned.forEach(disposeBenchmarkAsset);};
  },[configuration,onLoading,onReady,onFailure,invalidate]);
  useEffect(()=>{
    const lost=(event:Event)=>{event.preventDefault();onFailure('The graphics context was interrupted. The existing Library and its catalogue remain available.');};
    gl.domElement.addEventListener('webglcontextlost',lost);
    return()=>gl.domElement.removeEventListener('webglcontextlost',lost);
  },[gl,onFailure]);
  return <>{environment&&<primitive object={environment} attach="environment"/>}<color attach="background" args={[configuration.background]}/><PresentationSurface models={models}/>{models.map(model=><primitive key={model.uuid} object={model} dispose={null}/>)}{configuration.lights.map((light,index)=><AreaLight key={index} light={light}/>)}{configuration.shadowKey&&<ShadowKey light={configuration.shadowKey}/>} {configuration.shelfLights?.map((light,index)=><pointLight key={index} {...light} decay={2}/>)}</>;
}
export default function BenchmarkScene(props:Props){
  const first=props.configuration.views[0];
  return <Canvas shadows={{type:THREE.PCFShadowMap}} dpr={[1,1.5]} frameloop="demand" camera={{position:first.position,fov:props.configuration.fov,near:.1,far:100}} scene={{environmentIntensity:props.configuration.environmentIntensity}} gl={{antialias:true,alpha:false,powerPreference:'high-performance',toneMapping:THREE.AgXToneMapping,toneMappingExposure:props.configuration.exposure}} role="img" aria-label="Experimental Blender-authored library bay and celestial centerpiece. Use the labeled view controls to inspect the exported models." style={{width:'100%',height:'100%',touchAction:'pan-y'}}><Study {...props}/></Canvas>;
}
