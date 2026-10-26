import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AppRouterContext, type AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime.js';
import { Workspace } from '../components/Workspace';
import { SupportingPractices } from '../features/SupportingPractices';
import { makeDraft } from '../features/notebook-model';
import { supportingPractices } from '../lib/supporting-practices';
import { supportingPracticeFieldKey } from '../lib/supporting-practice-records';
import { disciplineSlugs } from '../lib/indices';

const router: AppRouterInstance = {
  bfcacheId: 'worksheet-layout-test',
  back() {}, forward() {}, refresh() {}, push() {}, replace() {}, prefetch() {},
};

test('every learning worksheet places its inline source after the example and before writing or saving', () => {
  let checked = 0;
  for (const slug of disciplineSlugs) {
    const practices = supportingPractices.filter((practice) => practice.discipline === slug);
    const draft = makeDraft('learning', `${slug} practice`);
    draft.fields = { discipline: slug, note: 'Existing learning note', rubric: '2' };
    for (const practice of practices) {
      for (const field of practice.fields) {
        draft.fields[supportingPracticeFieldKey(practice.id, field.key)] = `Saved response for ${practice.id} ${field.key}`;
      }
    }
    const before = structuredClone(draft);
    const html = renderToStaticMarkup(createElement(AppRouterContext.Provider, { value: router },
      createElement(Workspace, null, createElement(SupportingPractices, {
        slug, draft, set: () => assert.fail('Rendering must not change worksheet fields'),
      })),
    ));
    assert.deepEqual(draft, before, `${slug}: existing learning state is unchanged`);
    if (!practices.length) assert.doesNotMatch(html, /class="supporting-practice/);
    for (const [index, practice] of Array.from(practices.entries())) {
      const start = html.indexOf(`id="practice-${practice.id}"`);
      const end = index + 1 < practices.length ? html.indexOf(`id="practice-${practices[index + 1].id}"`) : html.length;
      assert.ok(start >= 0 && end > start, `${practice.id}: worksheet exists`);
      const worksheet = html.slice(start, end);
      const markers = ['class="practice-example"', 'class="practice-attribution"', 'class="practice-storage"', 'class="practice-fields"', 'class="draft-actions"', 'Export this discipline record'];
      const positions = markers.map((marker) => worksheet.indexOf(marker));
      for (const [i, position] of Array.from(positions.entries())) {
        assert.ok(position >= 0 && (!i || position > positions[i - 1]), `${practice.id}: ${markers[i]} follows ${markers[i - 1] ?? 'the heading'}`);
      }
      const attribution = worksheet.slice(positions[1], positions[2]);
      assert.equal((attribution.match(/class="source-moment-trigger"/g) || []).length, practice.sources.length);
      assert.match(attribution, /Watch here/);
      assert.match(attribution, /aria-expanded="false"/);
      assert.doesNotMatch(worksheet, /<iframe/);
      for (const field of practice.fields) {
        const key = supportingPracticeFieldKey(practice.id, field.key);
        assert.ok(worksheet.includes(`id="field-${key}"`));
        assert.ok(worksheet.includes(`>${draft.fields[key]}</textarea>`), `${practice.id}: saved response remains visible`);
      }
      checked++;
    }
  }
  assert.equal(checked, supportingPractices.length);
});
