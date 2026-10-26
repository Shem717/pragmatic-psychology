import test from 'node:test';
import assert from 'node:assert/strict';
import { content } from '../lib/content';
import { libraryCategories, libraryVolumes, getLibraryVolume, filterLibraryVolumes, createBookReaderState, navigateBookReader, bookChapters } from '../lib/spatial-library';

test('the spatial library binds exactly the existing seven selected companions once', () => {
  assert.equal(libraryVolumes.length,7);
  assert.equal(new Set(libraryVolumes.map((volume) => volume.id)).size,7);
  assert.deepEqual(libraryVolumes.map((volume) => volume.id).sort(),content.videos.map((video) => video.youtubeId).sort());
  for (const volume of libraryVolumes) {
    const video=content.videos.find((item)=>item.youtubeId===volume.id)!;
    assert.equal(volume.title,video.title);
    assert.equal(volume.summary,video.summary);
    assert.equal(volume.number,video.episode);
    assert.ok(libraryCategories.some((category)=>category.id===volume.category));
    assert.match(volume.color,/^#[0-9a-f]{6}$/i);
  }
  assert.equal(getLibraryVolume('missing'),undefined);
  assert.equal(libraryVolumes.filter((volume)=>volume.category==='perspectives').length,3);
  assert.equal(libraryVolumes.filter((volume)=>volume.category==='practice').length,3);
  assert.equal(libraryVolumes.filter((volume)=>volume.category==='connection').length,1);
});
test('direct catalog filtering is complete and useful without the 3D room', () => {
  assert.equal(filterLibraryVolumes('',null).length,7);
  assert.equal(filterLibraryVolumes('  HABIT  ',null)[0]?.id,'CorAKleaql4');
  assert.equal(filterLibraryVolumes('agency connection','connection').length,1);
  assert.equal(filterLibraryVolumes('habit','perspectives').length,0);
  assert.equal(filterLibraryVolumes('nothing-matches-here',null).length,0);
  assert.deepEqual(filterLibraryVolumes('','practice').map((volume)=>volume.id),['eX1_yI7scug','ieR3n0laLAg','CorAKleaql4']);
});
test('reader next/back navigation is bounded, chapters selectable, and books reopen at the beginning', () => {
  let state=createBookReaderState(libraryVolumes[0].id);
  assert.equal(state.page,0);
  state=navigateBookReader(state,{type:'previous'});
  assert.equal(state.page,0);
  for(let index=0;index<10;index++)state=navigateBookReader(state,{type:'next'});
  assert.equal(state.page,bookChapters.length-1);
  state=navigateBookReader(state,{type:'chapter',page:2});assert.equal(state.page,2);
  state=navigateBookReader(state,{type:'previous'});assert.equal(state.page,1);
  state=navigateBookReader(state,{type:'reset'});assert.equal(state.page,0);
  state=navigateBookReader(state,{type:'chapter',page:99});assert.equal(state.page,4);
  assert.deepEqual(navigateBookReader(state,{type:'chapter',page:Number.NaN}),state);
  assert.deepEqual(navigateBookReader(state,{type:'open',bookId:'missing'}),state);
  state=navigateBookReader(state,{type:'open',bookId:libraryVolumes[4].id});
  assert.equal(state.bookId,libraryVolumes[4].id);assert.equal(state.page,0);
});
