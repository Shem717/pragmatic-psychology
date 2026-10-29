import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
// Pin schema-normalized key order as well as raw objects.
const accepted = new Set(["71866a9859eca8fa6b13b28c7d2f614c123bc9f449f7414314e4a94ac1e6d018","0c916473534288f1055fcc433df08e24741c8195b3cb0b86735169b4f9e4201f","6bc778188476cfa4dc7252387f95baf2d361f96860e0f8fc9f53630b364c7074","78202c4884cac9875dec2ff18b2a47b537caf225fac6351e3fc439fccc7fd7ee","92f6070836372f5fbdc722bdaf4e6aad5dc0934d737c79a588acb7c75ea3ce9e","4803f2416c9824ecde220cb559d308cc34d91edbb4daa6131f097310b706b33b","e3a94792e7374a90613ac45cd9e5d39c875d9f779e79a353dd6f3d7cf4f30a34"]);
/** Remove only exact byte-pinned charisma additions, rejecting unexpected changes. */
export function restoreCharismaBaseline(value: unknown): unknown {
 if(Array.isArray(value)) return value.filter(item => {
  if(!item || typeof item !== 'object') return true;
  const r=item as Record<string,unknown>;
  if(r.id==='CL-charisma-speech-impressions'||['R119'].includes(String(r.id))||r.claimId==='CL-charisma-speech-impressions') {
   assert.ok(accepted.has(createHash('sha256').update(JSON.stringify(item)).digest('hex')), 'Unexpected charisma addition drift'); return false;
  }
  return true;
 }).map(restoreCharismaBaseline);
 if(!value || typeof value !== 'object') return value;
 return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,restoreCharismaBaseline(item)]));
}
