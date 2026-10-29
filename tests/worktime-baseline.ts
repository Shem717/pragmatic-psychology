import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
// Pin schema-normalized key order as well as raw objects.
const accepted = new Set(["2f884ff1e9d9392c2cbcecc4d26e7072102fa9acc1d0a00f374510b0c6dfc795","fb22697575ea7a06060a73de0eb802bba1d91d5d6ac3efc814e696a8b597b807","f2953459beb623671315921a2afe2c7179c1fde1fea261d18cfd6a64c43c6127","f629c7a9bb5922134b2223620f891ccaedd92e3df48dcfd2d84bd2c1db18ada7","96124b72dc9ef64d8cc69ec8e06e782e3d846670dbc0e6813ebd75b56df0f1d3","2aa7285999aff277cd7cb0cd3dbabd332af7e9cedb088375a1f1e467a857b51b","ec4437c1403524c274486174a5f7936b2213f55ea135b76c337e3e1356a89598"]);
/** Remove only exact byte-pinned worktime additions, rejecting unexpected changes. */
export function restoreWorktimeBaseline(value: unknown): unknown {
 if(Array.isArray(value)) return value.filter(item => {
  if(!item || typeof item !== 'object') return true;
  const r=item as Record<string,unknown>;
  if(r.id==='CL-worktime-stress-boundaries'||['R112'].includes(String(r.id))||r.claimId==='CL-worktime-stress-boundaries') {
   assert.ok(accepted.has(createHash('sha256').update(JSON.stringify(item)).digest('hex')), 'Unexpected worktime addition drift'); return false;
  }
  return true;
 }).map(restoreWorktimeBaseline);
 if(!value || typeof value !== 'object') return value;
 return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,restoreWorktimeBaseline(item)]));
}
