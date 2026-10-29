import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
// Pin schema-normalized key order as well as raw objects.
const accepted = new Set(["dbe218ef172d60b105bfd7124f9cc16a5272db8db1ef5db0ac531a4cd2c471b9","279ac30aad1e54e1ba64ac2f0977763e616c345915cebdaa3ef18c53466f8cd4","f4ae6359ab3c0668212847c8e79b00a9886652006a35611b8a600bb62d75ecb1","d182bdc0fa7148ac3b63e2ed8b75f1e290c310c6080bad3e403908500933b0f4", "3b76957286a6a7240230c51b3afb0ba926b682aec86fae99a31e6130e5a42f87", "6ce7d4c178085980353b931c54f78f2a7717b54971a1df70b1b5c9dae1339a9d", "b6109919ce82253a335ac048faa9cc4ad598ada0c57455368b2a624c63c3a967", "f3516edd104915e1fc2da39aea434e25826996b5ed35e75a50dcf89c86d10212", "25c478db7201d64a0a00d2a5c52247efc97bb58cd5941a0e91c7cb0319d78ecc", "0cb25b0a57d00d434570db5dff6c7174a49b98cdccd47d1e221bd0671cbd0c38", "c93ad71dfa80d327ff5e425f963a1de074a85a000f3262c7d1a62ca7c7cf0e4d", "d4156366ddbd06905bd39924a2c539e627e01b7d400bb07971e0b1a97f1bef82", "ca5a5ec0a0fe42f59ba058ecdb7e1b384c841aebfa55e19856440be281448631", "162245e4e84d6be1ba5635def9d2c6f93e0cdd560c1e1e56d20cf098aaf81bd7"]);
/** Remove only exact byte-pinned deception additions, rejecting unexpected changes. */
export function restoreDeceptionBaseline(value: unknown): unknown {
 if(Array.isArray(value)) return value.filter(item => {
  if(!item || typeof item !== 'object') return true;
  const r=item as Record<string,unknown>;
  if(r.id==='CL-nonverbal-deception-boundaries'||['R109','R110','R111'].includes(String(r.id))||r.claimId==='CL-nonverbal-deception-boundaries') {
   assert.ok(accepted.has(createHash('sha256').update(JSON.stringify(item)).digest('hex')), 'Unexpected deception addition drift'); return false;
  }
  return true;
 }).map(restoreDeceptionBaseline);
 if(!value || typeof value !== 'object') return value;
 return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,restoreDeceptionBaseline(item)]));
}
