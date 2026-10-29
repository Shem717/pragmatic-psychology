import { restoreSleepMemoryBaseline } from './sleep-memory-baseline';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
// Pin schema-normalized key order as well as raw objects.
const accepted = new Set(["644ac06a34c1089580d9c7f803e8c2a8a8c835bc0411b4c14ca4140f29a5ce6c","7732324e147430f95e4dac6fc992502211b9d52683c83670446bd0674e5cc2ad","806a35ab75d17bd20e69de832b5c71ba3c15b6ff0b1e8ed2f01f8f923ab53f77","12df6324e22eaa10343dcf7d7cee827bbc2b53f2c44c1ff94c8e27cae3be897a","19d702f4c366ad7e9cfc2ffc2c5d243524ed4277442563f0d0c8c14bfbbdf5a0","4fcac11df688956c23f3afebd777f1a10bf57b73380e3c36cab70c54b6e76dd8","4948a9cee979550bf8cfa4c4960666b03ca43b8ac7b841e68402ffe6550293ae"]);
/** Remove only exact byte-pinned paced breathing additions, rejecting unexpected changes. */
export function restorePacedBreathingBaseline(value: unknown): unknown {
 value = restoreSleepMemoryBaseline(value);
 if(Array.isArray(value)) return value.filter(item => {
  if(!item || typeof item !== 'object') return true;
  const r=item as Record<string,unknown>;
  if(r.id==='CL-paced-breathing-comparator-boundaries'||['R114'].includes(String(r.id))||r.claimId==='CL-paced-breathing-comparator-boundaries') {
   assert.ok(accepted.has(createHash('sha256').update(JSON.stringify(item)).digest('hex')), 'Unexpected paced breathing addition drift'); return false;
  }
  return true;
 }).map(restorePacedBreathingBaseline);
 if(!value || typeof value !== 'object') return value;
 return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,restorePacedBreathingBaseline(item)]));
}
