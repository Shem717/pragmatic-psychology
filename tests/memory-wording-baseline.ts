import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
const pins = new Set(["d4f877d97ce0b1e642f62cb52e2545551fea67d3f61d402c0a92619157bbf809","25872eeffa483cfc70c21ddddecefd512b542a026bebf4a9405facd3133c90d3","5b337ec152b5b1f419f970a9ef57f2ddbe7f753d674e75e08dea161dfc193a20", "dd0865708a36a1f40f6cd398c21adc29cb08500b66e85c29088d55c7aa6d9478", "600e65581a1e7a41d4e19b319642f1f51f8c370f7fb724fc75d4534385145228", "fff3f7f55cd33aea8d76b4b8d127ebfbf9f27c19f8251df90bdddbe25dba3796", "2c54ed9085ccc7888facc4f3831f2fe2cb60a356f09582d71d4c6f64df5e746f", "70c6316b8c63dac1dbedc45f789e3423d79a37401beeb19b9ab5c1660a5a1336"]);
export function restoreMemoryBaseline(value: unknown): unknown {
 if(Array.isArray(value)) return value.filter(item=>{
  if(!item || typeof item!=='object') return true;
  const r=item as Record<string,unknown>;
  if(r.id==='CL-pragmatic-recall-boundaries'||r.id==='R126'||r.claimId==='CL-pragmatic-recall-boundaries') {
   assert.ok(pins.has(createHash('sha256').update(JSON.stringify(item)).digest('hex')),'Unexpected memory-wording addition drift');return false;
  }return true;
 }).map(restoreMemoryBaseline);
 if(!value || typeof value!=='object')return value;
 return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,restoreMemoryBaseline(v)]));
}
