import test from 'node:test';
import assert from 'node:assert/strict';
import { Box3, DoubleSide, Euler, Mesh, MeshBasicMaterial, PerspectiveCamera, Ray, Raycaster, SphereGeometry, Vector3 } from 'three';
import { applyObservatoryProjection, getObservatoryLayout, observatoryBoundsCorners, observatoryInstrumentBounds, observatoryOrreryHitRadius, observatoryStationLocations } from '../lib/observatory-layout';
import type { ObservatoryStation } from '../lib/observatory-state';

test('wide side workbench fits every instrument corner in the genuinely unobscured region', () => {
  for (const [width, height, viewportHeight] of [[1200, 460, 650], [1440, 650, 900], [1920, 760, 1080], [2560, 760, 1440]]) {
    for (const station of ['telescope', 'practice', 'evidence'] as ObservatoryStation[]) {
      const layout = getObservatoryLayout({ width, height, viewportHeight, station, workbenchOpen: true });
      const camera = new PerspectiveCamera(70, 1, .1, 100);
      camera.position.set(...layout.position); camera.lookAt(...layout.target);
      applyObservatoryProjection(camera, layout, width, height); camera.updateMatrixWorld();
      assert.equal(camera.fov, 48, 'FOV must reach the real camera');
      const center = new Vector3(...layout.target).project(camera);
      assert.ok(Math.abs((center.x + 1) * width / 2 - (width - layout.occludedWidth) / 2) < .001);
      for (const point of observatoryBoundsCorners(observatoryInstrumentBounds[station])) {
        point.project(camera);
        const x = (point.x + 1) * width / 2, y = (1 - point.y) * height / 2;
        assert.ok(x >= 0 && x <= width - layout.occludedWidth, `${station} clipped or hidden by panel: x=${x}`);
        assert.ok(y >= 0 && y <= height, `${station} vertically clipped: y=${y}`);
        assert.ok(point.z > -1 && point.z < 1);
      }
    }
  }
});
test('whole orrery base, plaque and rings remain clear in arrival and selected views', () => {
  const location = new Vector3(...observatoryStationLocations.practice);
  const points: Vector3[] = [];
  // Both base rims, full plaque perimeter (front/back) and all three orbital
  // silhouettes are checked, rather than only a few useful upper-body points.
  for (let i = 0; i < 144; i++) {
    const angle = i * Math.PI / 72;
    for (const y of [0, .3]) points.push(new Vector3(Math.cos(angle) * 1.35, y, Math.sin(angle) * 1.35).add(location));
    for (const [index, radius] of Array.from([.69, 1.05, 1.4].entries())) points.push(new Vector3(Math.cos(angle) * (radius + .038), 0, Math.sin(angle) * (radius + .038)).applyEuler(new Euler(.25 + index * .32, .3 * index, .15 * index)).add(new Vector3(0, 2.75, 0)).add(location));
    points.push(new Vector3(Math.cos(angle)*1.445,Math.sin(angle)*1.445,0).applyEuler(new Euler(0,0,.2)).add(new Vector3(0,2.75,0)).add(location));
    const t = i / 143;
    for (const z of [1.508, 1.62]) {
      for (const y of [.55 - .297, .55 + .297]) points.push(new Vector3(-.9045 + t * 1.809, y, z).add(location));
      for (const x of [-.9045, .9045]) points.push(new Vector3(x, .55 - .297 + t * .594, z).add(location));
    }
  }
  const obstacles = ['telescope', 'evidence'].map(id => {
    const b = observatoryInstrumentBounds[id as ObservatoryStation];
    return new Box3(new Vector3(...b.min), new Vector3(...b.max));
  });
  for (const [width, height, viewportHeight] of [[1200, 417, 651], [1293, 417, 651], [1440, 650, 900], [1920, 760, 1080], [1024, 768, 1024], [1024, 534, 768]]) {
    for (const station of [null, 'practice'] as const) {
      const layout = getObservatoryLayout({ width, height, viewportHeight, station, workbenchOpen: true });
      const origin = new Vector3(...layout.position);
      for (const target of points) {
        const ray = new Ray(origin, target.clone().sub(origin).normalize());
        for (const obstacle of obstacles) {
          const hit = ray.intersectBox(obstacle, new Vector3());
          assert.ok(!hit || origin.distanceTo(hit) >= origin.distanceTo(target), `${station ?? 'arrival'} orrery silhouette blocked at ${target.toArray()}`);
        }
      }
    }
  }
});
test('tight invisible orrery proxy catches orbital gaps but not other instrument sightlines', () => {
  const geometry = new SphereGeometry(observatoryOrreryHitRadius, 20, 12);
  const material = new MeshBasicMaterial({ transparent: true, opacity: 0, colorWrite: false, depthWrite: false, side: DoubleSide });
  const proxy = new Mesh(geometry, material);
  const center = new Vector3(...observatoryStationLocations.practice).add(new Vector3(0, 2.75, 0));
  proxy.position.copy(center); proxy.updateMatrixWorld();
  for (const station of [null, 'practice'] as const) {
    const layout = getObservatoryLayout({ width: 1440, height: 650, viewportHeight: 900, station, workbenchOpen: true });
    const origin = new Vector3(...layout.position), direction = center.clone().sub(origin).normalize();
    const right = new Vector3().crossVectors(direction, new Vector3(0, 1, 0)).normalize();
    for (const offset of [0, -.9, .9]) {
      const target = center.clone().addScaledVector(right, observatoryOrreryHitRadius * offset);
      const raycaster = new Raycaster(origin, target.sub(origin).normalize());
      assert.ok(raycaster.intersectObject(proxy).length > 0, 'transparent orbital proxy misses center/edge');
    }
    for (const id of ['telescope', 'evidence'] as const) {
      const bounds = observatoryInstrumentBounds[id];
      for (const target of observatoryBoundsCorners(bounds)) {
        const raycaster = new Raycaster(origin, target.clone().sub(origin).normalize(), 0, origin.distanceTo(target));
        assert.equal(raycaster.intersectObject(proxy).length, 0, `proxy steals ${id} entry ray`);
      }
      assert.equal(new Box3(new Vector3(...bounds.min), new Vector3(...bounds.max)).distanceToPoint(center) < observatoryOrreryHitRadius, false, 'proxy overlaps another instrument envelope');
    }
  }
  geometry.dispose(); material.dispose();
});
test('narrow and short viewports use readable conventional dialog geometry', () => {
  for (const [width, height] of [[1199, 800], [1440, 599], [768, 1024]]) {
    const layout = getObservatoryLayout({ width, height, station: 'telescope', workbenchOpen: true });
    assert.equal(layout.sideWorkbench, false); assert.equal(layout.panelWidth, 0); assert.equal(layout.viewOffset, null);
  }
});
test('closing or returning to hall clears off-axis projection and applies hall FOV', () => {
  const camera = new PerspectiveCamera();
  const open = getObservatoryLayout({ width: 1440, height: 760, station: 'evidence', workbenchOpen: true });
  applyObservatoryProjection(camera, open, 1440, 760); assert.equal(camera.view?.enabled, true);
  const closed = getObservatoryLayout({ width: 1440, height: 760, station: 'evidence', workbenchOpen: false });
  applyObservatoryProjection(camera, closed, 1440, 760); assert.equal(camera.view?.enabled, false);
  const hall = getObservatoryLayout({ width: 1440, height: 760, station: null, workbenchOpen: false });
  applyObservatoryProjection(camera, hall, 1440, 760);
  assert.equal(camera.fov, 60); assert.ok(Math.hypot(hall.position[0], hall.position[2]) < 11.4); assert.ok(hall.position[1] < 3);
});
test('interior arrival contains all three complete instrument envelopes', () => {
  for (const [width, height] of [[1200, 417], [1293, 417], [1440, 666], [1920, 760], [1024, 768], [1024, 534]]) {
    const layout = getObservatoryLayout({ width, height, station: null, workbenchOpen: false });
    const camera = new PerspectiveCamera();
    camera.position.set(...layout.position); camera.lookAt(...layout.target);
    applyObservatoryProjection(camera, layout, width, height); camera.updateMatrixWorld();
    for (const [station, bounds] of Object.entries(observatoryInstrumentBounds)) for (const point of observatoryBoundsCorners(bounds)) {
      point.project(camera);
      assert.ok(Math.abs(point.x) <= 1 && Math.abs(point.y) <= 1, `${station} outside arrival frame`);
    }
  }
});
