import { libraryCategories, libraryVolumes, type LibraryCategoryId } from './spatial-library';
import { romanNumeral } from './presentation';

export type HallVector = [number, number, number];
export type HallModuleRoot = 'CABINET' | 'LECTERN' | 'GALLERY_ARCADE' | 'ARMILLARY';
export type HallPlacement = { root: HallModuleRoot; angleDegrees: number; position: HallVector; rotationY: number; scale: number };
export type LibraryBayPlacement = HallPlacement & { category: LibraryCategoryId };
export type HallCamera = { position: HallVector; target: HallVector; fov: number };
export const libraryHallDimensions = { radius: 12.5, bayHeight: 8.55, galleryBase: 8.8, galleryTop: 13.5, domeBase: 14, oculusTop: 18 } as const;
export const libraryHallTriangleTarget = 1_300_000;
function placement(root: HallModuleRoot, angleDegrees: number, y = 0): HallPlacement {
  const radians = angleDegrees * Math.PI / 180;
  return { root, angleDegrees, position: [12.5 * Math.sin(radians), y, -12.5 * Math.cos(radians)], rotationY: -radians, scale: 1 };
}
export const detailedLibraryBays: LibraryBayPlacement[] = libraryCategories.map((category, index) => ({ ...placement('CABINET', (index - 1) * 30), category: category.id }));
/** No filler collection: the four former side bays are now architectural wall panels. */
export const distantLibraryBays: HallPlacement[] = [];
export const upperLibraryGallery = [-90, -60, -30, 0, 30, 60, 90].map(angle => placement('GALLERY_ARCADE', angle, 8.8));
export const libraryArmillaryPlacement: HallPlacement = { root: 'ARMILLARY', angleDegrees: 0, position: [0, 10.6, -.5], rotationY: 0, scale: 1.1 };
export const libraryHallCamera: HallCamera = { position: [0, 3.7, 15.2], target: [0, 6.3, -5.5], fov: 60 };
export const libraryReadingCamera: HallCamera = { position: [.35, 4.1, 8.3], target: [0, 2.2, 3.2], fov: 49 };
/** Three.js right-handed Y rotation; authored local +Z points into the hall. */
export function transformLibraryBayPoint(bay: HallPlacement, local: HallVector): HallVector {
  const c = Math.cos(bay.rotationY), s = Math.sin(bay.rotationY);
  return [bay.position[0] + bay.scale * (local[0] * c + local[2] * s), bay.position[1] + local[1] * bay.scale, bay.position[2] + bay.scale * (-local[0] * s + local[2] * c)];
}
export function getLibraryBayCamera(category: LibraryCategoryId): HallCamera {
  const bay = detailedLibraryBays.find(item => item.category === category);
  if (!bay) throw new Error(`Unknown library category: ${category}`);
  // The selected display is the subject; the full arch belongs to the wide hall view.
  return { position: transformLibraryBayPoint(bay, [0, 3.25, 4.6]), target: transformLibraryBayPoint(bay, [0, 3.05, .82]), fov: 48 };
}
export const libraryBookMountSlots = [-1.35, 0, 1.35] as const;
/** Content is derived, never copied: authored decorative books have no content binding. */
export const featuredLibraryBooks = detailedLibraryBays.flatMap(bay => {
  const volumes = libraryVolumes.filter(volume => volume.category === bay.category);
  if (volumes.length !== 1 && volumes.length !== 3) throw new Error('Library mount layout expects one or three selected volumes per wing.');
  return volumes.map((volume, index) => {
    const slotIndex = volumes.length === 1 ? 1 : index;
    const localPosition: HallVector = [libraryBookMountSlots[slotIndex], 2.9, .82];
    return { ...volume, roman: romanNumeral(volume.number), slotIndex, localPosition, worldPosition: transformLibraryBayPoint(bay, localPosition), rotationY: bay.rotationY };
  });
});
function subtract(a: HallVector, b: HallVector): HallVector { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
function dot(a: HallVector, b: HallVector) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
function cross(a: HallVector, b: HallVector): HallVector { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
function normalize(a: HallVector): HallVector { const length = Math.hypot(...a); if (!length) throw new Error('Camera direction must be nonzero.'); return [a[0] / length, a[1] / length, a[2] / length]; }
/** Pure perspective projection for bounds tests; x/y are normalized device coordinates. */
export function projectLibraryPoint(camera: HallCamera, point: HallVector, aspect: number) {
  if (!Number.isFinite(aspect) || aspect <= 0 || camera.fov <= 0 || camera.fov >= 180) throw new Error('Invalid camera projection.');
  const forward = normalize(subtract(camera.target, camera.position));
  const right = normalize(cross(forward, [0, 1, 0])), up = cross(right, forward), delta = subtract(point, camera.position), depth = dot(delta, forward);
  const halfHeight = depth * Math.tan(camera.fov * Math.PI / 360);
  const x = dot(delta, right) / (halfHeight * aspect), y = dot(delta, up) / halfHeight;
  return { x, y, depth, visible: depth > 0 && Math.abs(x) <= 1 && Math.abs(y) <= 1 };
}
/** Instancing reduces draw calls, not triangle work; count every visible copy. */
export function estimateLibraryHallTriangles(counts: { CABINET: number; LECTERN: number; BOOK: number; GALLERY_ARCADE: number; ARMILLARY: number }, additionalTriangles = 0) {
  for (const value of [...Object.values(counts), additionalTriangles]) if (!Number.isFinite(value) || value < 0 || !Number.isInteger(value)) throw new Error('Triangle counts must be finite nonnegative integers.');
  const cabinets = counts.CABINET * detailedLibraryBays.length;
  const books = counts.BOOK * featuredLibraryBooks.length;
  const gallery = counts.GALLERY_ARCADE * upperLibraryGallery.length;
  const total = cabinets + books + gallery + counts.ARMILLARY + counts.LECTERN + additionalTriangles;
  return { cabinets, books, gallery, armillary: counts.ARMILLARY, lectern: counts.LECTERN, additional: additionalTriangles, total, target: libraryHallTriangleTarget, withinTarget: total <= libraryHallTriangleTarget };
}

/** PerspectiveCamera.setFocalLength updates its projection matrix without mutating React state. */
export function hallFocalLength(fov:number,filmHeight:number){
  if(!Number.isFinite(fov)||fov<=0||fov>=180||!Number.isFinite(filmHeight)||filmHeight<=0)throw new Error('Invalid perspective optics');
  return .5*filmHeight/Math.tan(fov*Math.PI/360);
}
/** Time-based convergence, bounded on long frames; Focus/reduced motion jumps immediately. */
export function advanceHallFieldOfView(current:number,target:number,delta:number,reducedMotion:boolean){
  if(reducedMotion||Math.abs(current-target)<.003)return target;
  return current+(target-current)*(1-Math.exp(-Math.min(Math.max(delta,0),.06)*3.4));
}
