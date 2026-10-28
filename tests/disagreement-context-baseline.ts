import assert from 'node:assert/strict';
export const disagreementBoundaryNote = "Adjacent wording research (not evidence about suppression): In one study of 253 university students, hypothetical conflict openings using I-language received lower predicted-defensiveness ratings than the study's you-language versions; communicating both perspectives also received lower ratings than the other perspective conditions. Actual defensive behavior was not measured, and the wording changed more than pronouns alone. In a separate randomized writing study, a package teaching four receptiveness strategies, with instructions to use receptive language, improved immediate receptiveness and collaboration-intention ratings by opposing-view readers compared with an unrelated-reading, natural-response control. These were ratings of written disagreement, not demonstrated understanding or prevention of escalation. Neither study establishes that replacing \u201calways\u201d or \u201cnever,\u201d describing a behavior specifically, or using a particular script prevents conflict. These findings do not create an obligation to disclose feelings, explain a boundary, hedge a refusal, remain in danger or manage another person's aggression. They are not remedies for coercion or abuse, and one immediate response does not diagnose someone's character.";
export const disagreementBoundaryHistory = {"date": "2026-10-28", "change": "Added separately mapped context on anticipated defensiveness and bundled receptiveness-writing ratings; the existing suppression statement, confidence, R61/R62 support and practices remain unchanged."};
/** Reverse only the exact approved context addition; reject structural drift. */
export function restoreDisagreementBaseline(value: unknown): unknown {
 if(Array.isArray(value)) return value.map(restoreDisagreementBaseline);
 if(!value || typeof value !== 'object') return value;
 const object=structuredClone(value) as Record<string,unknown>;
 if(object.id==='CL-expression-experience') {
  assert.equal(object.contentVersion,'1.1');
  assert.ok(Array.isArray(object.limitations));assert.equal(object.limitations.length,4);assert.equal(object.limitations[3],disagreementBoundaryNote);
  assert.ok(Array.isArray(object.sourceIds));assert.deepEqual(object.sourceIds,['R61','R62','R98','R99']);
  assert.ok(Array.isArray(object.history));assert.equal(object.history.length,2);assert.deepEqual(object.history[1],disagreementBoundaryHistory);
  object.limitations=object.limitations.slice(0,3);object.sourceIds=['R61','R62'];object.history=object.history.slice(0,1);object.contentVersion='1.0';return object;
 }
 return Object.fromEntries(Object.entries(object).map(([key,item])=>[key,restoreDisagreementBaseline(item)]));
}
