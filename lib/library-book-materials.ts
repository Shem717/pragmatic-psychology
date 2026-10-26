import * as THREE from 'three';
/** Presentation only: canonical content IDs, titles and catalogue colours are unchanged. */
export const libraryLeatherTones = ['#33727a','#76394a','#435f9d','#ad7c39','#805184','#477959','#9a532f'] as const;
// Functional lettering has constant luminance; only the separate modeled foil responds to scene light.
export const libraryBookLettering = { color:'#fff0c5', edge:'#281507', edgeWidth:2.2, toneMapped:false, weight:700 } as const;
/** Dye the existing grain rather than replacing it with a flat-colour cover or seven textures. */
export function createLibraryBookPresentation(model:THREE.Group, number:number){
  const object=model.clone(true),owned=new Map<THREE.Material,THREE.MeshStandardMaterial>();
  const tone=new THREE.Color(libraryLeatherTones[number-1]??libraryLeatherTones[0]);
  const luminance=.2126*tone.r+.7152*tone.g+.0722*tone.b;tone.multiplyScalar(.75/Math.max(luminance,.001));
  object.traverse(part=>{
    if(!(part instanceof THREE.Mesh))return;part.castShadow=true;part.receiveShadow=true;
    const mapMaterial=(source:THREE.Material)=>{
      if(!(source instanceof THREE.MeshStandardMaterial)||!/leather/i.test(source.name))return source;
      let material=owned.get(source);
      if(!material){
        material=source.clone();
        material.onBeforeCompile=shader=>{
          shader.uniforms.libraryLeatherTone={value:tone};
          shader.fragmentShader='uniform vec3 libraryLeatherTone;\n'+shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
            float leatherGrainLuminance = dot(diffuseColor.rgb, vec3(.2126,.7152,.0722));
            diffuseColor.rgb = mix(diffuseColor.rgb, leatherGrainLuminance * libraryLeatherTone, .88);
          `);
        };
        material.customProgramCacheKey=()=> 'library-leather-dye-v1';owned.set(source,material);
      }
      return material;
    };
    part.material=Array.isArray(part.material)?part.material.map(mapMaterial):mapMaterial(part.material);
  });
  return {object,dispose:()=>owned.forEach(material=>material.dispose())};
}
