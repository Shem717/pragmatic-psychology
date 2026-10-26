import test from 'node:test';
import assert from 'node:assert/strict';
import { libraryVolumes } from '../lib/spatial-library';
import { romanNumeral } from '../lib/presentation';
import { detailedLibraryBays, distantLibraryBays, upperLibraryGallery, libraryArmillaryPlacement, libraryHallCamera, libraryReadingCamera, libraryHallDimensions, featuredLibraryBooks, transformLibraryBayPoint, getLibraryBayCamera, projectLibraryPoint, estimateLibraryHallTriangles, hallFocalLength, advanceHallFieldOfView } from '../lib/library-hall-layout';
const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ~= ${b}`);
test('hall modules form the requested inward-facing semicircle and two levels', () => {
 assert.deepEqual(detailedLibraryBays.map(b => b.angleDegrees), [-30, 0, 30]);
 assert.deepEqual(detailedLibraryBays.map(b => b.category), ['perspectives', 'practice', 'connection']);
 assert.deepEqual(distantLibraryBays, [], 'only the three real collection wings have shelving');
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
  assert.equal(book.localPosition[1], 2.9); assert.equal(book.localPosition[2], .82);
  assert.deepEqual(book.worldPosition, transformLibraryBayPoint(detailedLibraryBays.find(b => b.category === book.category)!, book.localPosition));
 }
 assert.deepEqual(featuredLibraryBooks.filter(b => b.category === 'perspectives').map(b => b.slotIndex), [0, 1, 2]);
 assert.deepEqual(featuredLibraryBooks.filter(b => b.category === 'practice').map(b => b.slotIndex), [0, 1, 2]);
 assert.deepEqual(featuredLibraryBooks.filter(b => b.category === 'connection').map(b => b.slotIndex), [1]);
});
test('selected-wing camera frames every full enlarged book and excludes competing books at laptop and tablet aspect ratios', () => {
 for (const bay of detailedLibraryBays) {
  const camera = getLibraryBayCamera(bay.category);assert.equal(camera.fov,48);
  for (const aspect of [1293 / 490, 1293 / 500, 4 / 3]) {
   for (const book of featuredLibraryBooks) {
    const selected=book.category===bay.category;
    if(selected){
     // Conservative full-model bounds include spine overhang, page depth and enlarged 1.23 hover scale.
     const angle=book.localPosition[0]*-.035,c=Math.cos(angle),sin=Math.sin(angle);
     for(const x of [-.506,.48])for(const y of [-.7,.7])for(const z of [-.158,.174]){
      const p:[number,number,number]=[book.localPosition[0]+1.23*(x*c+z*sin),book.localPosition[1]+.045+1.23*y,book.localPosition[2]+.06+1.23*(-x*sin+z*c)];
      const projected=projectLibraryPoint(camera,transformLibraryBayPoint(bay,p),aspect);
      assert.ok(projected.visible,`${book.roman} full bound clipped at ${aspect}`);assert.ok(Math.abs(projected.x)<.96&&Math.abs(projected.y)<.96,'visible margin around cover/title/edges');
     }
     const bottom=projectLibraryPoint(camera,transformLibraryBayPoint(bay,[book.localPosition[0],2.06,.82]),aspect);
     const top=projectLibraryPoint(camera,transformLibraryBayPoint(bay,[book.localPosition[0],3.74,.82]),aspect);
     assert.ok(Math.abs(top.y-bottom.y)>.85,'selected covers occupy over42.5% of scene height');
    }else assert.equal(projectLibraryPoint(camera,book.worldPosition,aspect).visible,false,'another wing must not dominate the focused display');
   }
  }
 }
 for (const camera of [libraryHallCamera, libraryReadingCamera]) assert.ok([...camera.position, ...camera.target, camera.fov].every(Number.isFinite));
 assert.ok(!projectLibraryPoint(libraryHallCamera, [0, 5.5, 22], 2).visible);
 assert.throws(() => projectLibraryPoint(libraryHallCamera, [0, 0, 0], 0));
});
test('pose field of view is applied through perspective optics and settles without an idle animation loop',async()=>{
 const {PerspectiveCamera}=await import('three');const camera=new PerspectiveCamera(libraryHallCamera.fov,1293/490,.1,110);
 let fov=camera.fov,steps=0;
 while(fov!==48&&steps<1000){fov=advanceHallFieldOfView(fov,48,1/60,false);steps++;}
 assert.equal(fov,48);assert.ok(steps<250);camera.setFocalLength(hallFocalLength(fov,camera.getFilmHeight()));assert.ok(Math.abs(camera.fov-48)<1e-9);
 assert.equal(advanceHallFieldOfView(60,48,1/60,true),48);assert.equal(advanceHallFieldOfView(48,48,1/60,false),48);
 assert.equal(advanceHallFieldOfView(60,48,0,false),60);assert.ok(advanceHallFieldOfView(60,48,10,false)>48);
 assert.throws(()=>hallFocalLength(0,35));assert.throws(()=>hallFocalLength(48,0));
 const {readFileSync}=await import('node:fs');const scene=readFileSync('features/spatial-library/LibraryScene.tsx','utf8');
 assert.match(scene,/fov:pose\.fov/);assert.match(scene,/setFocalLength\(hallFocalLength/);assert.match(scene,/fieldDistance<\.003/);
});
test('triangle accounting includes three content cabinets, seven volumes and additional architecture', () => {
 const counts = { CABINET: 100_000, LECTERN: 30_000, BOOK: 8_000, GALLERY_ARCADE: 40_000, ARMILLARY: 50_000 };
 const budget = estimateLibraryHallTriangles(counts, 20_000);
 assert.equal(budget.total, 736_000); assert.equal(budget.books, 56_000); assert.equal(budget.cabinets, 300_000); assert.ok(budget.withinTarget);
 assert.equal(estimateLibraryHallTriangles({ ...counts, CABINET: 400_000 }).withinTarget, false);
 assert.throws(() => estimateLibraryHallTriangles({ ...counts, ARMILLARY: -1 }));
 assert.throws(() => estimateLibraryHallTriangles(counts, Infinity));
});
