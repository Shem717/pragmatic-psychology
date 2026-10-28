import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
const accepted = new Set(["a8a6766f3974b53d430740fb02afefc281bb457febe7a4fcc11d89c20ccc82ec", "b0f5c1733108614966c02b3ea2c318996e389a08ff14773f827924b336ea5b06", "74d139d41ddc8287abece7658a9239c5fa452fec3b3cd9aeea89b359d799492b", "de2e665672e9a9eb8f477908a614f19e07cbbdeb50b02d6e1fc258a898ad5f3f", "8b74a5e292bf312420eb30564746ca6fccdf7eb88432ecc3545e98759cf9770f", "3c2baecb67b6e8e71ce0dfe514ebf56ed99972f8e8500840e757c36320216cad", "db96ae29991d2e0208a0602bde38826195a7fbc02ff7a9cea978834cee5fb2f3", "3065a61ee1f050800abefb0a74333f2fa50d72e47f4e71b29c587bbe2b03d565"]);
/** Remove only exact byte-pinned sleep additions, rejecting unexpected changes. */
export function restoreSleepBaseline(value: unknown): unknown {
 if(Array.isArray(value)) return value.filter(item => {
  if(!item || typeof item !== 'object') return true;
  const r=item as Record<string,unknown>;
  if(r.id==='CL-sleep-opportunity-attention'||['R103','R104'].includes(String(r.id))||r.claimId==='CL-sleep-opportunity-attention') {
   assert.ok(accepted.has(createHash('sha256').update(JSON.stringify(item)).digest('hex')), 'Unexpected sleep addition drift'); return false;
  }
  return true;
 }).map(restoreSleepBaseline);
 if(!value || typeof value !== 'object') return value;
 return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,restoreSleepBaseline(item)]));
}
