import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
const source = readFileSync('public/preferences.js', 'utf8');
test('legacy Sunny preference becomes the single visual identity without losing Focused or notebook data', () => {
  const store = new Map([['ppo.preferences.v1', JSON.stringify({atmosphere:'Sunny',mode:'Focused',paused:true})],['unrelated-notebook-marker','preserve']]);
  const dataset: Record<string,string> = {atmosphere:'Sunny',mode:'Immersive'};
  runInNewContext(source, {document:{documentElement:{dataset}},localStorage:{getItem:(key:string)=>store.get(key)??null,setItem:(key:string,value:string)=>store.set(key,value)}});
  assert.equal(dataset.atmosphere,undefined);
  assert.equal(dataset.mode,'Focused');
  assert.equal(dataset.paused,'false');
  assert.deepEqual(JSON.parse(store.get('ppo.preferences.v1')!),{mode:'Focused',paused:false});
  assert.equal(store.get('unrelated-notebook-marker'),'preserve');
});
test('experience initialization tolerates unavailable storage and malformed saved preferences', () => {
  for(const value of ['broken','null','{}']) {
    const dataset: Record<string,string> = {mode:'Immersive'};
    assert.doesNotThrow(()=>runInNewContext(source,{document:{documentElement:{dataset}},localStorage:{getItem:()=>value,setItem:()=>{throw new Error('Unavailable');}}}));
    assert.equal(dataset.mode,'Immersive');
  }
  assert.doesNotThrow(()=>runInNewContext(source,{document:{documentElement:{dataset:{mode:'Immersive'}}},localStorage:{getItem:()=>{throw new Error('Unavailable');}}}));
});
