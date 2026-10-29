import { restoreDeceptionBaseline } from './deception-baseline';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
// Accept exact raw JSON and schema-normalized key order; values remain pinned.
const accepted = new Set(["baddd0c1f0fb84ac44a6cd37f38bfb315b1c573db939b630421ab4a45ae30780", "4fc6f4bd79b6e1df2ec019787faa3bba850df1817823679a5b157d9387c72737", "cbe9e750cf71be4a5b4c75070f90c22162973bba1abdb03082d71ddb1e63e3fb", "251e4a9925503de4e782a0a3abad956a890487da6dee54cd20724e05b312ae30", "38f6c202791d480b2d1fb495731526857efbb1f970984585415435b60fde052a", "298ee7a5e31bda5b4616ea763de5a38ec83e83f36472c72fe22b2086910af5dc", "8902a0da1ad8d7d2ac4cdccc68b689edf1a8751d695ba61010295281a5be3495"]);
/** Remove only exact byte-pinned assertiveness additions, rejecting unexpected changes. */
export function restoreAssertivenessBaseline(value: unknown): unknown {
 value = restoreDeceptionBaseline(value);
 if(Array.isArray(value)) return value.filter(item => {
  if(!item || typeof item !== 'object') return true;
  const r=item as Record<string,unknown>;
  if(r.id==='CL-assertiveness-training-boundaries'||['R108'].includes(String(r.id))||r.claimId==='CL-assertiveness-training-boundaries') {
   assert.ok(accepted.has(createHash('sha256').update(JSON.stringify(item)).digest('hex')), 'Unexpected assertiveness addition drift'); return false;
  }
  return true;
 }).map(restoreAssertivenessBaseline);
 if(!value || typeof value !== 'object') return value;
 return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,restoreAssertivenessBaseline(item)]));
}
