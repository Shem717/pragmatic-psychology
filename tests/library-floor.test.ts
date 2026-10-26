import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { Mesh } from 'three';
import { installFloorCapture } from '../features/spatial-library/CelestialFloor';
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

test('capture installation requests its own demand frame after attaching, including cached remounts', () => {
 const mesh = new Mesh();
 let frames = 0, rendered = 0;
 const first: Mesh['onBeforeRender'] = () => { rendered++; };
 const cleanup = installFloorCapture(mesh, first, () => {
  frames++; assert.equal(mesh.onBeforeRender, first);
 });
 assert.equal(frames, 1);
 const second: Mesh['onBeforeRender'] = () => { rendered += 2; };
 const cleanupSecond = installFloorCapture(mesh, second, () => {
  frames++; assert.equal(mesh.onBeforeRender, second);
 });
 cleanup(); assert.equal(mesh.onBeforeRender, second, 'old cleanup must not erase new capture');
 assert.equal(frames, 2, 'every remount/replacement must schedule a frame even with cached maps');
 cleanupSecond(); assert.notEqual(mesh.onBeforeRender, second);
 assert.equal(rendered, 0, 'installation schedules but does not recursively render');
 const source = readFileSync('features/spatial-library/CelestialFloor.tsx', 'utf8');
 assert.match(source, /useLayoutEffect\(\(\) => \{/);
 assert.match(source, /renderer\.info\.render\.frame !== frameBeforeCapture/);
 assert.match(source, /planar-pending/);
});
