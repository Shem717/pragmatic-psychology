import assert from 'node:assert/strict';
export const policyBoundaryNote = "Adjacent policy-explanation research illustrates a measurement boundary, not evidence for the training interventions above: two preregistered close replications found lower self-rated policy understanding after mechanistic explanation but did not reproduce reduced policy-position extremity. They did not measure objectively calibrated understanding.";
export const policyBoundaryHistory = {"date": "2026-10-27", "change": "Added an adjacent context-only policy-explanation measurement boundary; training statement, confidence and original evidence remain unchanged."};
/** Reverse only the four exact authorized claim deltas; do not ignore fields. */
export function restoreCalibrationBaseline(value: unknown): unknown {
 if(Array.isArray(value)) return value.map(restoreCalibrationBaseline);
 if(!value || typeof value !== 'object') return value;
 const object=structuredClone(value) as Record<string,unknown>;
 if(object.id==='CL-calibration-training-boundaries') {
  assert.equal(object.contentVersion,'1.1');
  assert.ok(Array.isArray(object.limitations));assert.equal(object.limitations.length,7);assert.equal(object.limitations[6],policyBoundaryNote);
  assert.ok(Array.isArray(object.sourceIds));assert.deepEqual(object.sourceIds,['R72','R75','R73','R74','R91']);
  assert.ok(Array.isArray(object.history));assert.equal(object.history.length,2);assert.deepEqual(object.history[1],policyBoundaryHistory);
  object.limitations=object.limitations.slice(0,6);object.sourceIds=object.sourceIds.slice(0,4);object.history=object.history.slice(0,1);object.contentVersion='1.0';return object;
 }
 return Object.fromEntries(Object.entries(object).map(([key,item])=>[key,restoreCalibrationBaseline(item)]));
}
