import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { observationError } from '../features/observation-validation';

test('observation limits permit the boundary and reject overflow without mutation', () => {
  const fields = ['', 'x'.repeat(10000), '', ''];
  assert.equal(observationError(199, fields), null);
  assert.match(observationError(200, fields)!, /200/);
  const oversized = ['', 'x'.repeat(10001), '', ''];
  assert.match(observationError(0, oversized)!, /10,000/);
  assert.equal(oversized[1].length, 10001);
  assert.match(observationError(0, ['', ' ', '', ''])!, /observed outcome/);
});
