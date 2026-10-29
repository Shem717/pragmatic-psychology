import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
// Pin schema-normalized key order as well as raw objects.
const accepted = new Set(["9d74920a9b575d7646d5bc91e6e1941c506a90704e195a77b272065a68e4182e","fa16ea7af50df7e7ee82ec7201f2b1eb628aca73eb8f5fbb3e71c4c6e1aaf6df","0993e050b7c1068454826c434c48fa38fab2f1b528f45eab209e7156546de58f","1ec8b9dc1ed535ffd4baae8a2262b946d8ba258aea8a63e1e4898c18b13d2ea7","6b9b7363c7408dd179a87417a5e94b85186ce97f8ee7341bddb9312f641fdaaa","2c6fc11715f48b58cee38767f4bad8813afa993ab4641973accff74e8faf8d5a","3e2c303ce103a12b62fe76df6414741836f68b5093aecc2b267b59b944123aa4"]);
/** Remove only exact byte-pinned academic interest additions, rejecting unexpected changes. */
export function restoreAcademicInterestBaseline(value: unknown): unknown {
 if(Array.isArray(value)) return value.filter(item => {
  if(!item || typeof item !== 'object') return true;
  const r=item as Record<string,unknown>;
  if(r.id==='CL-academic-interest-boundaries'||['R113'].includes(String(r.id))||r.claimId==='CL-academic-interest-boundaries') {
   assert.ok(accepted.has(createHash('sha256').update(JSON.stringify(item)).digest('hex')), 'Unexpected academic interest addition drift'); return false;
  }
  return true;
 }).map(restoreAcademicInterestBaseline);
 if(!value || typeof value !== 'object') return value;
 return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,restoreAcademicInterestBaseline(item)]));
}
