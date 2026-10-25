import test from 'node:test';
import assert from 'node:assert/strict';
import { romanNumeral } from '../lib/presentation';
test('decorative chapter ordinals cover eight disciplines without changing numeric data',()=>{
  assert.deepEqual(Array.from({length:8},(_,i)=>romanNumeral(i+1)),['I','II','III','IV','V','VI','VII','VIII']);
  assert.equal(romanNumeral(14),'XIV');assert.equal(romanNumeral(0),'0');assert.equal(romanNumeral(1.5),'1.5');
});
