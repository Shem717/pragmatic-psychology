"use client";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { libraryFloor, floorReflectionVertexHeader, floorReflectionFragmentHeader, floorReflectionFragment } from '@/lib/library-floor';

type Maps = { color: THREE.Texture; normal: THREE.Texture; orm: THREE.Texture };
function useFloorMaps() {
 const [maps, setMaps] = useState<Maps | null>(null);
 const { invalidate } = useThree();
 useEffect(() => {
  let active = true;
  const owned: THREE.Texture[] = [];
  const loader = new THREE.TextureLoader();
  const load = (url: string) => new Promise<THREE.Texture>((resolve, reject) => {
   const texture = loader.load(url, value => { if (!active) value.dispose(); resolve(value); }, undefined, reject);
   owned.push(texture);
  });
  Promise.all([load(libraryFloor.textures.color), load(libraryFloor.textures.normal), load(libraryFloor.textures.orm)]).then(([color, normal, orm]) => {
   if (!active) return;
   color.colorSpace = THREE.SRGBColorSpace;
   for (const texture of [color, normal, orm]) { texture.anisotropy = 4; texture.needsUpdate = true; }
   setMaps({ color, normal, orm }); invalidate();
  }).catch(() => { /* The modeled floor and brass inlay remain if a map cannot load. */ });
  return () => { active = false; owned.forEach(texture => texture.dispose()); };
 }, [invalidate]);
 return maps;
}

/** Install before requesting a demand frame; stale cleanup cannot erase a newer owner. */
export function installFloorCapture(
 mesh: Pick<THREE.Mesh, 'onBeforeRender'>,
 callback: THREE.Mesh['onBeforeRender'],
 invalidate: () => void,
) {
 mesh.onBeforeRender = callback;
 invalidate();
 return () => { if (mesh.onBeforeRender === callback) mesh.onBeforeRender = () => {}; };
}

/** One opaque PBR surface. Planar capture is a bounded extra pass, never a second visible mirror. */
export function CelestialFloor({ reflections = true }: { reflections?: boolean }) {
 const { gl, camera: mainCamera, invalidate } = useThree();
 const floor = useRef<THREE.Mesh>(null);
 const maps = useFloorMaps();
 const geometry = useMemo(() => new THREE.CircleGeometry(libraryFloor.radius, 192), []);
 const resources = useMemo(() => {
  const capture = new Reflector(geometry, { textureWidth: libraryFloor.reflectionSize, textureHeight: libraryFloor.reflectionSize, multisample: 0, clipBias: 0.003 });
  const captureMaterial = capture.material as THREE.ShaderMaterial;
  const enabled = { value: 0 };
  const matrix = captureMaterial.uniforms.textureMatrix;
  const texture = { value: capture.getRenderTarget().texture };
  const material = new THREE.MeshPhysicalMaterial({
   color: maps ? '#ffffff' : '#101b2c', map: maps?.color ?? null,
   normalMap: maps?.normal ?? null, normalScale: new THREE.Vector2(0.35, 0.35),
   roughnessMap: maps?.orm ?? null, metalnessMap: maps?.orm ?? null,
   roughness: maps ? 1 : 0.24, metalness: maps ? 1 : 0.08,
   clearcoat: 0.25, clearcoatRoughness: 0.20, envMapIntensity: 0.7,
  });
  material.onBeforeCompile = shader => {
   shader.uniforms.floorReflectionMatrix = matrix;
   shader.uniforms.floorReflectionMap = texture;
   shader.uniforms.floorReflectionEnabled = enabled;
   shader.vertexShader = floorReflectionVertexHeader + shader.vertexShader.replace('#include <project_vertex>', 'vFloorReflection = floorReflectionMatrix * vec4( transformed, 1.0 );\n#include <project_vertex>');
   shader.fragmentShader = floorReflectionFragmentHeader + shader.fragmentShader.replace('#include <opaque_fragment>', floorReflectionFragment + '\n#include <opaque_fragment>');
  };
  material.customProgramCacheKey = () => 'celestial-floor-planar-v1';
  return { capture, material, enabled };
 }, [geometry, maps]);
 useEffect(() => () => { resources.capture.dispose(); resources.material.dispose(); }, [resources]);
 useEffect(() => () => geometry.dispose(), [geometry]);
 useLayoutEffect(() => {
  const mesh = floor.current;
  if (!mesh) return;
  let failed = false, captures = 0;
  const supported = reflections && gl.extensions.has('EXT_color_buffer_float');
  gl.domElement.setAttribute('data-floor-reflection', supported ? 'planar-pending' : 'pbr-fallback');
  gl.domElement.setAttribute('data-floor-reflection-captures', '0');
  gl.domElement.setAttribute('data-floor-reflection-enabled', '0');
  const render: THREE.Mesh['onBeforeRender'] = (renderer, scene, camera, _geometry, _material, group) => {
   // Transmission/offscreen/shadow captures must not recursively trigger another floor pass.
   if (!supported || failed || camera !== mainCamera || renderer.getRenderTarget() !== null) return;
   const visible = mesh.visible, target = renderer.getRenderTarget();
   const xr = renderer.xr.enabled, shadows = renderer.shadowMap.autoUpdate;
   const viewport = renderer.getViewport(new THREE.Vector4());
   try {
    resources.capture.matrixWorld.copy(mesh.matrixWorld);
    mesh.visible = false;
    const frameBeforeCapture = renderer.info.render.frame;
    resources.capture.onBeforeRender(renderer, scene, camera, geometry, resources.capture.material as THREE.Material, group);
    // Reflector may decline a back-facing surface; report active only after a real scene pass.
    if (renderer.info.render.frame !== frameBeforeCapture) {
     resources.enabled.value = 1; captures += 1;
     gl.domElement.setAttribute('data-floor-reflection', 'planar-512');
     gl.domElement.setAttribute('data-floor-reflection-captures', String(captures));
     gl.domElement.setAttribute('data-floor-reflection-enabled', '1');
    }
   } catch {
    failed = true; resources.enabled.value = 0;
    gl.domElement.setAttribute('data-floor-reflection', 'pbr-fallback');
    gl.domElement.setAttribute('data-floor-reflection-enabled', '0');
   } finally {
    mesh.visible = visible;
    renderer.xr.enabled = xr; renderer.shadowMap.autoUpdate = shadows;
    renderer.setRenderTarget(target); renderer.setViewport(viewport);
   }
  };
  const uninstall = installFloorCapture(mesh, render, invalidate);
  return () => {
   uninstall(); resources.enabled.value = 0;
   for (const attribute of ['data-floor-reflection', 'data-floor-reflection-captures', 'data-floor-reflection-enabled']) gl.domElement.removeAttribute(attribute);
  };
 }, [gl, mainCamera, geometry, reflections, resources, invalidate]);
 return <group>
  <mesh position={[0, -0.20, 0]} receiveShadow><cylinderGeometry args={[15.25, 15.45, 0.40, 128]}/><meshStandardMaterial color="#070d17" roughness={0.3} metalness={0.12}/></mesh>
  <mesh ref={floor} geometry={geometry} material={resources.material} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]} receiveShadow/>
  {[2.82, 5.57, 8.00, 10.60, 13.12, 14.79].map(radius => <mesh key={radius} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
   <ringGeometry args={[radius - 0.009, radius + 0.009, 192]}/><meshStandardMaterial color="#b18a46" metalness={0.88} roughness={0.24}/>
  </mesh>)}
 </group>;
}
