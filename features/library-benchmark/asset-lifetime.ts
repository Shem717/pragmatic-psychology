import * as THREE from 'three';

/** Only for independently loaded benchmark GLBs, never a shared useLoader cache. */
export function disposeBenchmarkAsset(root:THREE.Object3D) {
  const geometries=new Set<THREE.BufferGeometry>();
  const materials=new Set<THREE.Material>();
  const textures=new Set<THREE.Texture>();
  const bitmaps=new Set<ImageBitmap>();
  root.traverse((object)=>{
    if(!(object instanceof THREE.Mesh))return;
    geometries.add(object.geometry);
    for(const material of Array.isArray(object.material)?object.material:[object.material]){
      materials.add(material);
      for(const value of Object.values(material))if(value instanceof THREE.Texture)textures.add(value);
    }
  });
  for(const texture of Array.from(textures)){
    const image=texture.source.data;
    if(typeof ImageBitmap!=='undefined' && image instanceof ImageBitmap)bitmaps.add(image);
    texture.dispose();
  }
  for(const bitmap of Array.from(bitmaps))bitmap.close();
  for(const material of Array.from(materials))material.dispose();
  for(const geometry of Array.from(geometries))geometry.dispose();
}

export function measureBenchmarkAsset(root:THREE.Object3D) {
  let meshes=0,triangles=0;const materials=new Set<THREE.Material>();
  root.traverse((object)=>{
    if(!(object instanceof THREE.Mesh))return;
    meshes++;
    triangles+=(object.geometry.index?.count || object.geometry.getAttribute('position')?.count || 0)/3;
    for(const material of Array.isArray(object.material)?object.material:[object.material])materials.add(material);
  });
  return {meshes,triangles:Math.round(triangles),materials:materials.size};
}
