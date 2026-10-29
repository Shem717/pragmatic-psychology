import { restoreMemoryBaseline } from './memory-wording-baseline';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
const accepted = new Set(["cb48a9e9f16d622635e8a54c446bf5a6a99af15563f2edf69b3d73fc36f87d9b","0df4dd25de186e0de7bc09607962f552a37d8f69da79603cdb0e0ced6cdd9fe2","db768763f9e686f270364575cfc347601ef53222d9f97146b7ab0a4f96426dac","c02d35ca0c090e1a1bfedcd5d187158841ed4f79fbea0620f3913b602a3cba09","143b6ce2a3c5467a92ffe3b6ec8b762bce5ddbe977bdc6db651be1c020283540","d5377fe7602b3f7b0fe6a9811e0b0d62ace9fc45c8d5f35527d4fbb1330cec3a","0b93853571c4b84f0935e936c1a109d5db60d5de8fe9cd8d590ea756b53839fb","c7480918cedce338497e19354f0dd063c4a24091ebbeff06323cd17278ede3b0","7620eddcf05a03eeba16ca5c4013a9c8958d19f2be77156a0e5707cb92cbc574","577e5fa66bc5bc8d3c4056dc803c98e9de52a44357a865ac968295014bba014c","87d8ae9f7d22f1dffbfef0029c68c3a7619886793306e4798d86cd40fc674b7c","21f50d89183bc408ff34db13d370d2947fd8a366b57adc1e0a36630f8f9143f8","86e6c43153c9077b3691ed4bd8abcb2852baa7f1a5739eab3919f4070e20d06a","e11d97dee09b07f4348fdbe29cee7945c026b050d100af02eb35f3a9830a9405","ebf7025713a2779297419b89defb60ca44000ae9ad1162f796c92d344f7e10e2","5bebc101dc07e1483d640ea778919517affefe0a0649d4b1c7ec5fe6b8612a7e","98ff3ffe101533e314a8702bf21a44f0b4683c2792cba44d2350a0f81cf8a3dd","ef4b2316d61cc5c289b4a48992a79bca0f5bdbc32bcc12b5bdf38f9c2acca758","b0899c45dcbe21b5d27582d65a177552a6f5165584c37dd61c26f9b4b30a2c7e","2370e26eaf542f8f08abc8fc289eefc913c021012292d23384f7300792d27ffe","bc337e6a46f3915ba2f3f6a91291a7750fc7dd21f08dff946df415e8b20aa619","c278725d39196045b966ed20aed39f646d787920f843b472941853c79052e3e9","63b3053ccc01eab7e95dd141fa3f3f91697dd67908b16ee075d2e737b169700d","63f557f82e05a16bc5231493588db967dc5df172fb907837afc538241b91c98a","5b208a45a8dc9d6bbeff1c83917a780f954b87eb2990ce85e0f9a544152f12de","0bf916ee671be8bd926b728b00ed281ca2e78b63551cb41e3ceea8fa170cb42a","3cb7485d9e6bee32e5ec8a8aa979044b287027113f927375ff0754f3b9da57ad","f30a1622ac6427683ae89b02654aba2402725c95998b3c6ee5dff467750e5d4b","cd45151dcc8f089ec72e31e9d3cac259d393c216d14f91dd4c539ea8a470af82","c5a3a6b1c05a9c29b136e28e1bbb9f2769b72e78fd943cd7c2cba48b685427a8"]);
/** Remove only exact pinned new C/D/E-tranche records (D/E only); reject drift. */
export function restoreCdeBaseline(value: unknown): unknown {
 value = restoreMemoryBaseline(value);
 if(Array.isArray(value)) return value.filter(item => {
  if(!item || typeof item !== 'object') return true;
  const r=item as Record<string,unknown>;
  if(["CL-grief-pattern-sequence-boundaries","CL-meditation-adverse-ascertainment"].includes(String(r.id))||["R120","R121","R122","R123","R124","R125"].includes(String(r.id))||["CL-grief-pattern-sequence-boundaries","CL-meditation-adverse-ascertainment"].includes(String(r.claimId))) {
   assert.ok(accepted.has(createHash('sha256').update(JSON.stringify(item)).digest('hex')), 'Unexpected CDE addition drift'); return false;
  }
  return true;
 }).map(restoreCdeBaseline);
 if(!value || typeof value !== 'object') return value;
 return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,restoreCdeBaseline(item)]));
}
