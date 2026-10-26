import test from 'node:test';
import assert from 'node:assert/strict';
import { Box3, PerspectiveCamera, Ray, Vector3 } from 'three';
import { applyObservatoryProjection, getObservatoryLayout, observatoryBoundsCorners, observatoryInstrumentBounds } from '../lib/observatory-layout';
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
test('orrery viewing rays clear the telescope and the evidence desk major opaque surfaces', () => {
  // Scene-level EvidenceDesk has open space above/under its tabletop; its entire
  // selection envelope is not a solid occluder. Conservative world boxes below
  // cover tabletop, plaque and lamp at the exported Evidence station location.
  const telescope = observatoryInstrumentBounds.telescope;
  const obstacles = [
    new Box3(new Vector3(...telescope.min), new Vector3(...telescope.max)),
    new Box3(new Vector3(2.6, 1.6, -.13), new Vector3(5.8, 1.92, 2.13)),
    new Box3(new Vector3(2.5, .3, 2.1), new Vector3(5.9, 1.67, 2.8)),
    new Box3(new Vector3(2.8, 1.9, .3), new Vector3(3.4, 2.8, .8)),
  ];
  for (const [width, height] of [[1200, 460], [1440, 650], [1920, 760]]) {
    const layout = getObservatoryLayout({ width, height, viewportHeight: 900, station: 'practice', workbenchOpen: true });
    const origin = new Vector3(...layout.position);
    for (const point of [[4.05, 2.75, -3.7], [4.05, 1.08, -1.9], [2.65, 2.75, -3.7], [5.45, 2.75, -3.7], [4.05, 4.1, -3.7]]) {
      const target = new Vector3(...point), ray = new Ray(origin, target.clone().sub(origin).normalize());
      for (const obstacle of obstacles) {
        const hit = ray.intersectBox(obstacle, new Vector3());
        assert.ok(!hit || origin.distanceTo(hit) >= origin.distanceTo(target), 'foreground instrument blocks orrery body/plaque sightline');
      }
    }
  }
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
