/** Bounded planar reflection and independently authored material channels. */
export const libraryFloor = {
 radius: 15.25,
 reflectionSize: 512,
 maxTextureBytes: 2 * 1024 * 1024,
 textures: {
  color: '/art/library-floor/celestial-marble-color.webp',
  normal: '/art/library-floor/celestial-marble-normal.webp',
  orm: '/art/library-floor/celestial-marble-orm.webp',
 },
} as const;
export const floorReflectionVertexHeader = `
uniform mat4 floorReflectionMatrix;
varying vec4 vFloorReflection;
`;
export const floorReflectionFragmentHeader = `
uniform sampler2D floorReflectionMap;
uniform float floorReflectionEnabled;
varying vec4 vFloorReflection;
`;
/** Added to standard PBR lighting, not a replacement unlit mirror material. */
export const floorReflectionFragment = `
if ( floorReflectionEnabled > 0.5 && vFloorReflection.w > 0.0 ) {
 vec2 floorUv = vFloorReflection.xy / vFloorReflection.w;
 if ( floorUv.x > 0.002 && floorUv.x < 0.998 && floorUv.y > 0.002 && floorUv.y < 0.998 ) {
  float spread = ( 0.45 + roughnessFactor * 2.5 ) / 512.0;
  vec3 floorReflection = texture2D( floorReflectionMap, floorUv ).rgb * 0.40;
  floorReflection += texture2D( floorReflectionMap, floorUv + vec2( spread, 0.0 ) ).rgb * 0.15;
  floorReflection += texture2D( floorReflectionMap, floorUv - vec2( spread, 0.0 ) ).rgb * 0.15;
  floorReflection += texture2D( floorReflectionMap, floorUv + vec2( 0.0, spread ) ).rgb * 0.15;
  floorReflection += texture2D( floorReflectionMap, floorUv - vec2( 0.0, spread ) ).rgb * 0.15;
  float floorGrazing = pow( 1.0 - saturate( dot( normal, geometryViewDir ) ), 3.0 );
  float floorWeight = ( 0.20 + floorGrazing * 0.42 ) * ( 1.0 - roughnessFactor * 0.7 );
  vec3 floorTint = mix( vec3( 0.70, 0.76, 0.86 ), diffuseColor.rgb, metalnessFactor * 0.65 );
  outgoingLight = outgoingLight * ( 1.0 - floorWeight * 0.25 ) + floorReflection * floorTint * floorWeight;
 }
}
`;
