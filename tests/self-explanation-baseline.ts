import assert from 'node:assert/strict';
export const boundaryNote = 'Different activity, different outcome: Explanation is not retrieval practice. In a separate child card task, both groups saw the same demonstrations; prompts to explain adult and own choices were compared with prompts to report those choices. Outcomes were immediate choices with new shapes—not delayed retention or broad transfer.';
export const boundaryHistory = {date:'2026-10-27',change:'Added a separately mapped context-only child explanation-task boundary note; retrieval-practice statement, confidence and original evidence remain unchanged.'};
/** Reverse only the four exact authorized claim deltas before historical fingerprints.
 * A malformed or additional delta throws; no field is generally ignored. */
export function restoreRetrievalBaseline(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(restoreRetrievalBaseline);
  if (!value || typeof value !== 'object') return value;
  const object = structuredClone(value) as Record<string, unknown>;
  if (object.id === 'CL-retrieval-retention-transfer') {
    assert.equal(object.contentVersion, '1.1');
    assert.ok(Array.isArray(object.limitations));assert.equal(object.limitations.length,5);assert.equal(object.limitations[4],boundaryNote);
    assert.ok(Array.isArray(object.sourceIds));assert.deepEqual(object.sourceIds,['R55','R56','R57','R36','R37','R90']);
    assert.ok(Array.isArray(object.history));assert.equal(object.history.length,2);assert.deepEqual(object.history[1],boundaryHistory);
    object.limitations=object.limitations.slice(0,4);object.sourceIds=object.sourceIds.slice(0,5);object.contentVersion='1.0';object.history=object.history.slice(0,1);
    return object;
  }
  return Object.fromEntries(Object.entries(object).map(([key,item])=>[key,restoreRetrievalBaseline(item)]));
}
