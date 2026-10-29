import { restoreCharismaBaseline } from './charisma-baseline';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
// Pin schema-normalized key order as well as raw objects.
const accepted = new Set(["34b20fb9cd42715cd5bb2338819265e434c6957d7c273af4e459ef7f1aefd4ae","4ef259bfdd095c3cd4aef03608239bf5e325a4151da3934a4f42157aa5363ae9","ca6a7352ed41ab753d459d25ce76fb07406788ef06a388290df71e0407e1ed43","2382b9fced39fe7d7b09a8aeb71c165faf7895c70162c163346b303f6479b878","63fa79368b913c2f49f2c12cab19fd7220da69d4d5f0be6adc9c9bef4748cc89","e3277cee4d66794b4bcf8c85704cdbf3349c6676726ac7d9bae49f20b0242cc7","bc86bb22475126ad4959b361ae589ff4c660c68c3e4b2b8363041bef179df182","9e4b4718960b513b94ba3f054d365cf0da0d0364c4c544cc4f8e52e903045131","6d2dbd3a5aa2ebae014499b9151e3b713ae9277be80494097c9c130827310a53","8a2cb36200e6ad9ce3241aab3ee8c66529d20489adfa979ccebc005ec7f4d31d","78b22d3a6096c7e0c46a258d202061de476462a4cccd3a8997b152f3498bb8fb","d58cd1087d53571871652d22b86fffc47f0205f6c90ffb5bfb5b652ba2d90041","28f50b6363ba3b93a5b716c1346aa701cd594bdd850aa0e7a4a1e13d92afdcd6","81e1f0b0d5d03f00e42c144823aff63246e8a228f53801cd93444caa81a8a351","d7600bf22a7d6d025c4f43bfd1d558756ad747f77754488f57ec4526b9f818f9","b80151c689a8f6c08f0c9cbc41678f0137bcf7a04ac9b848e1a6ffd585834f4a","cf8acb9983c8dbc26debe41b1473954b74c57e9bbc750818778d213b2aad826d","899e3004caa4a2fe4357ebe0e570e7a9eb91a9fb07c7ba4ac4b6ad4d87b61724"]);
/** Remove only exact byte-pinned sleep memory additions, rejecting unexpected changes. */
export function restoreSleepMemoryBaseline(value: unknown): unknown {
 value = restoreCharismaBaseline(value);
 if(Array.isArray(value)) return value.filter(item => {
  if(!item || typeof item !== 'object') return true;
  const r=item as Record<string,unknown>;
  if(r.id==='CL-sleep-word-pair-boundaries'||['R115','R116','R117','R118'].includes(String(r.id))||r.claimId==='CL-sleep-word-pair-boundaries') {
   assert.ok(accepted.has(createHash('sha256').update(JSON.stringify(item)).digest('hex')), 'Unexpected sleep memory addition drift'); return false;
  }
  return true;
 }).map(restoreSleepMemoryBaseline);
 if(!value || typeof value !== 'object') return value;
 return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,restoreSleepMemoryBaseline(item)]));
}
