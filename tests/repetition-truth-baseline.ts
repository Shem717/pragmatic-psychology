import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
const accepted = new Set(["f07853d4ea68dae567e5996c4001b1fb7e26be29c8128adab5302306cba203e4", "dfe26142b6e87cb7c88f5ef91bbdc4bc3b0cfa0e9d27b9ce230aa039ca06386f", "37a3ef963453b290b8b568102456112ed930005badbeea9ba4e7fbc88c1971ea", "0c351e7e4fc0f2cc72404e77771f58d47bf51b8585151e00bfdeca042dc91efa", "2706861bdcbb9bb1949221b4d3c4cac5a9d17e63099804c5f38bf40ac70c9990", "04aaed21edce824c67f22176ade09463156d28492451c7bd4d68d2d775837210", "bb42b40b4aa1e00165f4f4ab64f118d64cfc9fa1183061fcb09a4476567fdef5", "ea8aa7ec9ef1d65ec1969bc5d9ea0909ef8ffd5bb6570cc2a2b43dd04b15704d", "cc56fb3bf50785719841945f6ec3c258e7d0296f1fd33ed8769be9a613f193f3"]);
/** Remove only byte-pinned additive records for historical preservation proofs. Reject changed additions. */
export function restoreRepetitionBaseline(value: unknown): unknown {
 if(Array.isArray(value)) return value.filter(item => {
   if(!item || typeof item !== 'object') return true;
   const r=item as Record<string,unknown>;
   if(r.id==='CL-repetition-judged-truth'||['R100','R101','R102'].includes(String(r.id))||r.claimId==='CL-repetition-judged-truth') {
     assert.ok(accepted.has(createHash('sha256').update(JSON.stringify(item)).digest('hex')), 'Unexpected repetition addition drift'); return false;
   }
   return true;
 }).map(restoreRepetitionBaseline);
 if(!value || typeof value !== 'object') return value;
 return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,restoreRepetitionBaseline(item)]));
}
