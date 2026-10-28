import assert from 'node:assert/strict';
export const autonomousBoundaryNote = "Endorsing a goal and specifying how to act are different questions. In these selected studies, self-concordance was associated with self-reported progress; a randomized reasons-reflection exercise did not demonstrate better progress; and classroom framing experiments measured short-term performance and voluntary participation. These designs do not establish that selecting personally authentic goals improves sustained real-world completion.";
export const autonomousBoundaryHistory = {"date": "2026-10-28", "change": "Added separately mapped context on goal endorsement, reasons reflection and classroom framing; the existing planning statement, confidence, R66 support and practices remain unchanged."};
/** Reverse only this exact context addition; reject unexpected structural drift. */
export function restoreAutonomousBaseline(value: unknown): unknown {
 if(Array.isArray(value)) return value.map(restoreAutonomousBaseline);
 if(!value || typeof value !== 'object') return value;
 const object=structuredClone(value) as Record<string,unknown>;
 if(object.id==='CL-action-planning-timing') {
  assert.equal(object.contentVersion,'1.1');
  assert.ok(Array.isArray(object.limitations));assert.equal(object.limitations.length,6);assert.equal(object.limitations[5],autonomousBoundaryNote);
  assert.ok(Array.isArray(object.sourceIds));assert.deepEqual(object.sourceIds,['R66','R95','R96','R97']);
  assert.ok(Array.isArray(object.history));assert.equal(object.history.length,2);assert.deepEqual(object.history[1],autonomousBoundaryHistory);
  object.limitations=object.limitations.slice(0,5);object.sourceIds=['R66'];object.history=object.history.slice(0,1);object.contentVersion='1.0';return object;
 }
 return Object.fromEntries(Object.entries(object).map(([key,item])=>[key,restoreAutonomousBaseline(item)]));
}
