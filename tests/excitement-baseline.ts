import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
const accepted = new Set(["8da657f346ed692208e5bfd83dd48e6ef623ced9c1d57f6450e4d86ecebcd026", "17385211dc4b0531cd8e0f25ae8c5b6b03bd9468173b89fb4f232b6c3fe26c4a", "963074339d42cb9acc15de719220a9422abbe9d0b211810d89ee40c8a30b0181", "adaac4e5523b532aad948be1a6e0967c58abce2cdfc8d9bda4aceaed53656e5c", "62aa2803589a71ac46197f48c6d2d8c081415c8f1d2651dd449bb9d18af54a8a", "daf81c4ec4cf0fd36fd5c8b7ae1b07cef9e5f6418cfb1f0cc0d2f90063fa4f9b", "e9586cf198b2bb1cab189d107654f8572df49511a51a1797531d7917acfb3bcf", "c999c7a6661d5b65978bcd17b0763df0d4e0772a7f4010e0d9606757603a8ae5", "db7df7478f7f1f60e87693209d0e765670bfeedb44fe7f70ebc6fbcc18715780", "d7969d00ce863c7cc667b545a3c0fa5996b84dccebc7597e83ce1a759f330721", "07816269c06252e2742d92c24460ef9951a57f2554ba9d0a9cbb762dd45f2958"]);
/** Remove only exact byte-pinned excitement additions, rejecting unexpected changes. */
export function restoreExcitementBaseline(value: unknown): unknown {
 if(Array.isArray(value)) return value.filter(item => {
  if(!item || typeof item !== 'object') return true;
  const r=item as Record<string,unknown>;
  if(r.id==='CL-excitement-performance-boundaries'||['R105','R106','R107'].includes(String(r.id))||r.claimId==='CL-excitement-performance-boundaries') {
   assert.ok(accepted.has(createHash('sha256').update(JSON.stringify(item)).digest('hex')), 'Unexpected excitement addition drift'); return false;
  }
  return true;
 }).map(restoreExcitementBaseline);
 if(!value || typeof value !== 'object') return value;
 return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,restoreExcitementBaseline(item)]));
}
