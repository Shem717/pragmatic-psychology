import test from 'node:test';
import assert from 'node:assert/strict';
import {initialSpatialLibraryState,mayRenderLibraryScene,spatialLibraryReducer} from '../lib/spatial-library-state';
import {libraryVolumes} from '../lib/spatial-library';
test('spatial library entry is explicit; category, book, back and reset remain consistent',()=>{
  let state=initialSpatialLibraryState;assert.equal(state.entered,false);
  state=spatialLibraryReducer(state,{type:'enter'});assert.equal(state.entered,true);assert.equal(state.attempt,1);
  state=spatialLibraryReducer(state,{type:'ready'});assert.equal(state.ready,true);
  state=spatialLibraryReducer(state,{type:'category',category:'connection'});assert.equal(state.category,'connection');
  const volume=libraryVolumes.find(book=>book.category==='practice')!;
  state=spatialLibraryReducer(state,{type:'book',id:volume.id});assert.equal(state.bookId,volume.id);assert.equal(state.category,'practice');
  state=spatialLibraryReducer(state,{type:'close-book'});assert.equal(state.bookId,null);assert.equal(state.category,'practice');
  assert.equal(spatialLibraryReducer(state,{type:'book',id:'unknown'}),state);
  state=spatialLibraryReducer(state,{type:'hall'});assert.equal(state.category,null);assert.equal(state.bookId,null);assert.equal(state.entered,true);
  state=spatialLibraryReducer(state,{type:'catalog'});assert.equal(state.entered,false);
});
test('Focus, phone, context failure and declined entry never require the 3D renderer to read a volume',()=>{
  const allowed={entered:true,focused:false,phone:false,failure:null};
  assert.equal(mayRenderLibraryScene(allowed),true);
  for(const override of [{entered:false},{focused:true},{phone:true},{failure:'No context'}]) assert.equal(mayRenderLibraryScene({...allowed,...override}),false);
  let state=spatialLibraryReducer(initialSpatialLibraryState,{type:'failure',reason:'No context'});
  state=spatialLibraryReducer(state,{type:'book',id:libraryVolumes[0].id});assert.equal(state.bookId,libraryVolumes[0].id);assert.equal(state.entered,false);
  state=spatialLibraryReducer(state,{type:'enter'});assert.equal(state.failure,null);assert.equal(state.ready,false);
});
test('all scene book bindings match the real catalog, not an invented or duplicate inventory', async()=>{
  const {readFileSync}=await import('node:fs');
  const source=readFileSync('features/spatial-library/LibraryScene.tsx','utf8');
  const ids=Array.from(source.matchAll(/id: '([A-Za-z0-9_-]{11})', roman:/g),match=>match[1]);
  assert.deepEqual(ids.sort(),libraryVolumes.map(book=>book.id).sort());
  assert.equal(new Set(ids).size,7);
  assert.match(source,/frameloop="demand"/);assert.match(source,/dpr=\{\[1, 1\.5\]\}/);
});
test('notes remain available contextually without returning to primary navigation prominence',async()=>{
  const {readFileSync}=await import('node:fs');
  const shell=readFileSync('components/Shell.tsx','utf8');
  const primary=shell.split('<nav className="primary-nav"')[1].split('</nav>')[0];
  assert.doesNotMatch(primary,/href="\/notebook"/);
  assert.match(shell,/>My notes<\/Link>/);
  assert.match(readFileSync('components/Workspace.tsx','utf8'),/draft-notes-link/);
  assert.match(readFileSync('features/spatial-library/BookReader.tsx','utf8'),/book-notes-link/);
});
