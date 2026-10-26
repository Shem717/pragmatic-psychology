import test from 'node:test';
import assert from 'node:assert/strict';
import { initialObservatoryState, observatoryReducer, showObservatoryScene, observatoryStations, practiceSteps } from '../lib/observatory-state';

test('observatory opens directly on capable immersive screens, and preserves all instruments in fallback',()=>{
  assert.equal(showObservatoryScene(initialObservatoryState,false,false),true);
  assert.equal(showObservatoryScene(initialObservatoryState,true,false),false);
  assert.equal(showObservatoryScene(initialObservatoryState,false,true),false);
  assert.equal(showObservatoryScene(observatoryReducer(initialObservatoryState,{type:'plain'}),false,false),false);
  const selected=observatoryReducer(initialObservatoryState,{type:'station',station:'evidence'});
  const failed=observatoryReducer(selected,{type:'failure',reason:'No graphics available'});
  assert.equal(showObservatoryScene(failed,false,false),false);
  assert.equal(failed.station,'evidence');
  const retry=observatoryReducer(failed,{type:'retry'});
  assert.equal(retry.failure,null);assert.equal(retry.attempt,1);assert.equal(retry.station,'evidence');
});
test('all three stations can be selected and returned to the whole-room view without changing draft data',()=>{
  for(const station of observatoryStations){const state=observatoryReducer(initialObservatoryState,{type:'station',station:station.id});assert.equal(state.station,station.id);assert.equal(observatoryReducer(state,{type:'hall'}).station,null);}
  assert.deepEqual(observatoryStations.map((station)=>station.id),['telescope','practice','evidence']);
  assert.deepEqual(practiceSteps.map((step)=>step.stage),[1,3,4,5]);
});

import { content } from '../lib/content';
import { filterObservatoryClaims, resolveObservatoryClaim, observatoryRoomScrollTop } from '../lib/observatory-state';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { EvidenceDesk } from '../features/observatory/EvidenceDesk';

test('Evidence Desk never presents a retired default or an unmatched record as current',()=>{
  const retired={...content.claims.find((claim)=>claim.slug==='flexibility')!,reviewStatus:'superseded'};
  const current=content.claims.find((claim)=>claim.slug==='confidence')!;
  const matches=filterObservatoryClaims([retired,current],'');
  assert.deepEqual(matches,[current]);
  assert.equal(resolveObservatoryClaim(matches,'flexibility'),current);
  assert.equal(resolveObservatoryClaim(filterObservatoryClaims([retired,current],'no-such-claim'),'flexibility'),null);
  const html=renderToStaticMarkup(createElement(EvidenceDesk));
  assert.doesNotMatch(html,/Claim superseded|Claim withdrawn|REVISION NOTICE/);
  assert.match(html,/A repertoire needs feedback/);
});
test('room alignment subtracts the actual sticky header and clamps above-document positions',()=>{
  assert.equal(observatoryRoomScrollTop(-400,700,80),212);
  assert.equal(observatoryRoomScrollTop(0,0,80),0);
  assert.equal(observatoryRoomScrollTop(120,0,0),112);
});
