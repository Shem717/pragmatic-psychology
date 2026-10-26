import test from 'node:test';
import assert from 'node:assert/strict';
import { libraryVolumes } from '../lib/spatial-library';
import { romanNumeral } from '../lib/presentation';
import { detailedLibraryBays, distantLibraryBays, upperLibraryGallery, libraryArmillaryPlacement, libraryHallCamera, libraryReadingCamera, libraryHallDimensions, featuredLibraryBooks, transformLibraryBayPoint, getLibraryBayCamera, projectLibraryPoint, estimateLibraryHallTriangles } from '../lib/library-hall-layout';
const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ~= ${b}`);
test('hall modules form the requested inward-facing semicircle and two levels', () => {
 assert.deepEqual(detailedLibraryBays.map(b => b.angleDegrees), [-30, 0, 30]);
 assert.deepEqual(detailedLibraryBays.map(b => b.category), ['perspectives', 'practice', 'connection']);
 assert.deepEqual(distantLibraryBays.map(b => b.angleDegrees), [-90, -60, 60, 90]);
 assert.deepEqual(upperLibraryGallery.map(b => b.angleDegrees), [-90, -60, -30, 0, 30, 60, 90]);
 for (const bay of [...detailedLibraryBays, ...distantLibraryBays, ...upperLibraryGallery]) {
  close(Math.hypot(bay.position[0], bay.position[2]), 12.5);
  const inward = transformLibraryBayPoint(bay, [0, 0, 12.5]); close(inward[0], 0); close(inward[2], 0);
 }
 assert.ok(upperLibraryGallery.every(b => b.position[1] === 8.8));
 assert.deepEqual(libraryArmillaryPlacement.position, [0, 10.6, -.5]); assert.equal(libraryArmillaryPlacement.scale, 1.1);
 assert.equal(libraryHallDimensions.domeBase, 14); assert.equal(libraryHallDimensions.oculusTop, 18);
});
test('seven featured bindings derive exact canonical titles, IDs and Roman markers', () => {
 assert.equal(featuredLibraryBooks.length, 7); assert.equal(new Set(featuredLibraryBooks.map(b => b.id)).size, 7);
 assert.deepEqual(featuredLibraryBooks.map(b => b.id).sort(), libraryVolumes.map(b => b.id).sort());
 for (const book of featuredLibraryBooks) {
  const canonical = libraryVolumes.find(v => v.id === book.id)!;
  assert.equal(book.title, canonical.title); assert.equal(book.roman, romanNumeral(canonical.number));
  assert.equal(book.localPosition[1], 2.35); assert.equal(book.localPosition[2], .82);
  assert.deepEqual(book.worldPosition, transformLibraryBayPoint(detailedLibraryBays.find(b => b.category === book.category)!, book.localPosition));
 }
 assert.deepEqual(featuredLibraryBooks.filter(b => b.category === 'perspectives').map(b => b.slotIndex), [1, 3, 5]);
 assert.deepEqual(featuredLibraryBooks.filter(b => b.category === 'practice').map(b => b.slotIndex), [1, 3, 5]);
 assert.deepEqual(featuredLibraryBooks.filter(b => b.category === 'connection').map(b => b.slotIndex), [3]);
});
test('guided wing cameras frame full bay, labels and featured covers at laptop and tablet aspect ratios', () => {
 for (const bay of detailedLibraryBays) {
  const camera = getLibraryBayCamera(bay.category);
  for (const aspect of [1293 / 500, 4 / 3]) {
   for (const x of [-3.4, 0, 3.4]) for (const y of [0, 8.55]) assert.ok(projectLibraryPoint(camera, transformLibraryBayPoint(bay, [x, y, 0]), aspect).visible);
   for (const book of featuredLibraryBooks.filter(b => b.category === bay.category)) for (const yOffset of [-.5, .5]) assert.ok(projectLibraryPoint(camera, transformLibraryBayPoint(bay, [book.localPosition[0], 2.35 + yOffset, 1]), aspect).visible);
  }
 }
 for (const camera of [libraryHallCamera, libraryReadingCamera]) assert.ok([...camera.position, ...camera.target, camera.fov].every(Number.isFinite));
 assert.ok(!projectLibraryPoint(libraryHallCamera, [0, 5.5, 22], 2).visible);
 assert.throws(() => projectLibraryPoint(libraryHallCamera, [0, 0, 0], 0));
});
test('triangle accounting includes every module instance and optional distant fallback', () => {
 const counts = { BAY_DETAIL: 100_000, BAY_DISTANT: 30_000, GALLERY_ARCADE: 40_000, ARMILLARY: 50_000 };
 const budget = estimateLibraryHallTriangles(counts, 20_000);
 assert.equal(budget.total, 770_000); assert.ok(budget.withinTarget);
 assert.equal(estimateLibraryHallTriangles({ BAY_DETAIL: 100_000, GALLERY_ARCADE: 40_000, ARMILLARY: 50_000 }).total, 1_030_000);
 assert.equal(estimateLibraryHallTriangles({ ...counts, BAY_DETAIL: 400_000 }).withinTarget, false);
 assert.throws(() => estimateLibraryHallTriangles({ ...counts, ARMILLARY: -1 }));
 assert.throws(() => estimateLibraryHallTriangles(counts, Infinity));
});
