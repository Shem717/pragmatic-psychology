import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { InstrumentDialog } from '../features/observatory/InstrumentDialog';

test('side workbench remains one labeled native dialog with the same return control',()=>{
 for(const sideWorkbench of [false,true]){
  const html=renderToStaticMarkup(createElement(InstrumentDialog,{title:'Perspective Telescope',sideWorkbench,onClose:()=>{},resolveReturnFocus:()=>null},createElement('label',null,'An action',createElement('textarea',{id:'test-action'}))));
  assert.equal((html.match(/<dialog\b/g)||[]).length,1);
  assert.equal((html.match(/id="test-action"/g)||[]).length,1);
  assert.match(html,/aria-labelledby="instrument-dialog-title"/);
  assert.match(html,/aria-label="Return to the room"/);
  assert.equal(html.includes('instrument-dialog-side'),sideWorkbench);
 }
});
