import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { libraryFloor, floorReflectionFragment, floorReflectionVertexHeader } from '../lib/library-floor';
test('celestial floor has independent same-origin PBR channels within the texture budget', () => {
 let bytes = 0;
 for (const url of Object.values(libraryFloor.textures)) {
  assert.match(url, /^\/art\/library-floor\/[a-z-]+\.webp$/);
  const path = `public${url}`; const image = readFileSync(path);
  assert.equal(image.subarray(0, 4).toString(), 'RIFF'); assert.equal(image.subarray(8, 12).toString(), 'WEBP');
  bytes += statSync(path).size;
 }
 assert.ok(bytes < libraryFloor.maxTextureBytes, `${bytes} texture bytes`);
 assert.equal(libraryFloor.reflectionSize, 512);
 assert.equal(libraryFloor.radius, 15.25);
});
test('floor reflection supplements physical lighting and is gated, blurred and bounded', () => {
 assert.match(floorReflectionVertexHeader, /uniform mat4 floorReflectionMatrix/);
 assert.match(floorReflectionFragment, /floorReflectionEnabled > 0\.5/);
 assert.match(floorReflectionFragment, /roughnessFactor/);
 assert.match(floorReflectionFragment, /outgoingLight = outgoingLight/);
 assert.match(floorReflectionFragment, /floorUv\.x > 0\.002/);
 const component = readFileSync('features/spatial-library/CelestialFloor.tsx', 'utf8');
 assert.match(component, /renderer\.getRenderTarget\(\) !== null/);
 assert.match(component, /mesh\.visible = false/);
 assert.match(component, /finally/);
 assert.match(component, /resources\.capture\.dispose\(\)/);
 assert.match(component, /pbr-fallback/);
});
