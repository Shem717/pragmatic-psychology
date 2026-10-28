import assert from 'node:assert/strict';
export const stressBoundaryNote = "Useful practice difficulty is not a reason to induce distress. The selected laboratory studies do not establish that deliberately making study more stressful improves later pressured performance. Distinguish stress during learning from stress at recall, a matching interaction from a beneficial comparison, and brain activation from behavioral improvement. These studies do not establish classroom or broad-transfer benefits.";
export const stressBoundaryHistory = {"date": "2026-10-28", "change": "Added a separately mapped context-only boundary on induced stress and state matching; retrieval-practice statement, confidence, supporting evidence and practices remain unchanged."};
/** Reverse only this exact authorized context addition; unexpected changes throw. */
export function restoreStressBaseline(value: unknown): unknown {
 if(Array.isArray(value)) return value.map(restoreStressBaseline);
 if(!value || typeof value !== 'object') return value;
 const object=structuredClone(value) as Record<string,unknown>;
 if(object.id==='CL-retrieval-retention-transfer') {
  assert.equal(object.contentVersion,'1.2');
  assert.ok(Array.isArray(object.limitations));assert.equal(object.limitations.length,6);assert.equal(object.limitations[5],stressBoundaryNote);
  assert.ok(Array.isArray(object.sourceIds));assert.deepEqual(object.sourceIds,['R55','R56','R57','R36','R37','R90','R92','R93','R94']);
  assert.ok(Array.isArray(object.history));assert.equal(object.history.length,3);assert.deepEqual(object.history[2],stressBoundaryHistory);
  object.limitations=object.limitations.slice(0,5);object.sourceIds=object.sourceIds.slice(0,6);object.history=object.history.slice(0,2);object.contentVersion='1.1';return object;
 }
 return Object.fromEntries(Object.entries(object).map(([key,item])=>[key,restoreStressBaseline(item)]));
}
