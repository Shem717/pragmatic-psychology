import { PerspectiveCamera, Vector3 } from 'three';
import type { ObservatoryStation } from './observatory-state';

export type ObservatoryPoint = [number, number, number];
export type ObservatoryBounds = { min: ObservatoryPoint; max: ObservatoryPoint };
export const observatoryStationLocations: Record<ObservatoryStation, ObservatoryPoint> = {
  telescope: [-2.7, 0, -1], practice: [1.15, 0, -4.2], evidence: [4.2, 0, 1],
};
export const observatoryTelescopeYaw = -.62;
export const observatoryOrreryHitRadius = 1.46;
/** Conservative world-space envelopes, including supports. Update when an asset moves. */
export const observatoryInstrumentBounds: Record<ObservatoryStation, ObservatoryBounds> = {
  telescope: { min: [-5, 0, -3.4], max: [-.4, 4.6, 1.4] },
  practice: { min: [-.35, 0, -5.7], max: [2.65, 4.3, -2.3] },
  evidence: { min: [2.35, 0, -.9], max: [6.05, 3.2, 2.9] },
};
export type ObservatoryLayout = {
  position: ObservatoryPoint;
  target: ObservatoryPoint;
  fov: number;
  panelWidth: number;
  occludedWidth: number;
  sideWorkbench: boolean;
  viewOffset: { fullWidth: number; fullHeight: number; offsetX: number; offsetY: number; width: number; height: number } | null;
};
export type ObservatoryLayoutInput = {
  /** Canvas dimensions, not browser chrome or the dialog dimensions. */
  width: number; height: number;
  viewportWidth?: number; viewportHeight?: number;
  station: ObservatoryStation | null;
  workbenchOpen: boolean;
  /** Optional controller result of the viewport media query, not canvas height. */
  sideWorkbench?: boolean;
  bounds?: ObservatoryBounds;
};
export function observatoryBoundsCorners(bounds: ObservatoryBounds): Vector3[] {
  return [0, 1].flatMap(x => [0, 1].flatMap(y => [0, 1].map(z => new Vector3(
    x ? bounds.max[0] : bounds.min[0], y ? bounds.max[1] : bounds.min[1], z ? bounds.max[2] : bounds.min[2],
  ))));
}
export function getObservatoryLayout(input: ObservatoryLayoutInput): ObservatoryLayout {
  const width = Math.max(1, input.width), height = Math.max(1, input.height);
  const viewportWidth = input.viewportWidth ?? width, viewportHeight = input.viewportHeight ?? height;
  const eligible = input.sideWorkbench ?? (viewportWidth >= 1200 && viewportHeight >= 600);
  const sideWorkbench = Boolean(input.station && input.workbenchOpen && eligible);
  const panelWidth = sideWorkbench ? Math.min(viewportWidth * .54, 720, width - 1) : 0;
  const occludedWidth = panelWidth ? Math.min(width - 1, panelWidth + 24) : 0;
  // A rightward frustum shift moves the look-at point left on the full canvas.
  // Reserve panel + right inset + breathing room. Screen x = W/2 - offsetX.
  const viewOffset = occludedWidth ? { fullWidth: width, fullHeight: height, offsetX: occludedWidth / 2, offsetY: 0, width, height } : null;
  const hallFov = Math.min(74, Math.max(60, 2 * Math.atan(Math.tan(Math.PI / 6) * 1.7 / (width / height)) * 180 / Math.PI));
  if (!input.station) return { position: [.6, 2.6, 9.8], target: [0, 3, -1.8], fov: hallFov, panelWidth: 0, occludedWidth: 0, sideWorkbench: false, viewOffset: null };
  const bounds = input.bounds ?? observatoryInstrumentBounds[input.station];
  const center = new Vector3(...bounds.min).add(new Vector3(...bounds.max)).multiplyScalar(.5);
  // Slight three-quarter inspection, not a top-down miniature view.
  const forwardToCamera = new Vector3(input.station === 'telescope' ? .22 : input.station === 'practice' ? -.1 : .08, .035, 1).normalize();
  const right = new Vector3().crossVectors(new Vector3(0, 1, 0), forwardToCamera).normalize();
  const up = new Vector3().crossVectors(forwardToCamera, right).normalize();
  const fov = 48;
  const tanVertical = Math.tan(fov * Math.PI / 360);
  const tanHorizontal = tanVertical * (width - occludedWidth) / height;
  const usableFraction = .82; // Clear space around all corners, not just the center.
  let distance = 0;
  for (const corner of observatoryBoundsCorners(bounds)) {
    const relative = corner.sub(center), depth = relative.dot(forwardToCamera);
    distance = Math.max(distance, depth + Math.abs(relative.dot(right)) / (tanHorizontal * usableFraction), depth + Math.abs(relative.dot(up)) / (tanVertical * usableFraction));
  }
  const position = center.clone().addScaledVector(forwardToCamera, distance + .15);
  return { position: position.toArray() as ObservatoryPoint, target: center.toArray() as ObservatoryPoint, fov, panelWidth, occludedWidth, sideWorkbench, viewOffset };
}
/** Apply on pose/viewport change; camera travel remains the scene's responsibility. */
export function applyObservatoryProjection(camera: PerspectiveCamera, layout: ObservatoryLayout, width: number, height: number): void {
  camera.fov = layout.fov;
  camera.aspect = Math.max(1, width) / Math.max(1, height);
  if (layout.viewOffset) {
    const v = layout.viewOffset;
    camera.setViewOffset(v.fullWidth, v.fullHeight, v.offsetX, v.offsetY, v.width, v.height);
  } else camera.clearViewOffset();
  camera.updateProjectionMatrix();
}
