import test from 'node:test';
import assert from 'node:assert/strict';
import { supportingPractices } from '../lib/supporting-practices';
import { supportingPracticeFieldKey, isSupportingPracticeField, notebookFieldLabel, learningRecordSummary } from '../lib/supporting-practice-records';
import { makeDraft, serialize, parseImport } from '../features/notebook-data';
import { hasMeaningfulDraftWork } from '../features/notebook-model';
import { disciplineSlugs } from '../lib/indices';
import { content } from '../lib/content';

test('exactly five attributed supporting practices fit existing disciplines without adding selected videos', () => {
  assert.deepEqual(supportingPractices.map((practice) => practice.id), ['attention-return','habit-payoff','emotion-specificity','listening-check','digital-use-agreement']);
  assert.equal(content.videos.length, 7);
  const allKeys: string[] = [];
  for (const practice of supportingPractices) {
    assert.ok(disciplineSlugs.includes(practice.discipline));
    assert.ok(practice.fields.length >= 5 && practice.fields.length <= 8);
    assert.match(practice.attribution, /editorial adaptation/i);
    assert.ok(practice.safety && practice.example && practice.sources.length);
    for (const source of practice.sources) {
      const url = new URL(source.url);
      assert.equal(url.hostname,'www.youtube.com');
      assert.ok(url.searchParams.get('v'));
      assert.ok(Number(url.searchParams.get('t')) > 0);
    }
    for (const field of practice.fields) {
      const key = supportingPracticeFieldKey(practice.id,field.key);
      assert.ok(key.length <= 80);
      assert.ok(isSupportingPracticeField(key));
      assert.ok(field.label && field.hint);
      assert.equal(notebookFieldLabel(key),`${practice.title} — ${field.label}`);
      allKeys.push(key);
    }
  }
  assert.equal(new Set(allKeys).size,allKeys.length);
  assert.equal(isSupportingPracticeField('rubric'),false);
  assert.equal(isSupportingPracticeField('practice_unknown_field'),false);
});
test('all worksheet entries round-trip in existing learning records, including both Awareness practices and old notes', () => {
  const records = Array.from(new Set(supportingPractices.map((practice) => practice.discipline))).map((discipline) => {
    const draft = makeDraft('learning',`${discipline} practice`);
    draft.fields = {discipline,note:'Existing private learning note',rubric:'2'};
    for(const practice of supportingPractices.filter((item) => item.discipline === discipline)) {
      for(const field of practice.fields) draft.fields[supportingPracticeFieldKey(practice.id,field.key)] = `Synthetic private response: ${field.label}`;
    }
    return draft;
  });
  assert.deepEqual(parseImport(serialize(records)),records);
  assert.equal(records.length,4);
  const awareness=records.find((record)=>record.fields.discipline==='awareness')!;
  assert.ok(Object.keys(awareness.fields).some((key)=>key.startsWith('practice_attention-return_')));
  assert.ok(Object.keys(awareness.fields).some((key)=>key.startsWith('practice_emotion-specificity_')));
  const old = makeDraft('learning','Earlier record');old.fields={discipline:'awareness',note:'Earlier note'};
  assert.deepEqual(parseImport(serialize([old])),[old]);
});
test('worksheet-only records have useful notebook summaries and trigger the existing unsaved-work protection', () => {
  const practice = supportingPractices[0];const field = practice.fields[0];
  const key = supportingPracticeFieldKey(practice.id,field.key);
  assert.match(learningRecordSummary({discipline:'awareness',[key]:'My chosen task'}),/My chosen task/);
  assert.equal(learningRecordSummary({discipline:'awareness',note:'Keep original note',[key]:'Other'}),'Keep original note');
  assert.equal(learningRecordSummary({discipline:'stewardship',[key]:'Wrong discipline'}),'Working draft');
  const draft = makeDraft('learning','Awareness practice');
  draft.fields={discipline:'awareness',rubric:'2'};
  assert.equal(hasMeaningfulDraftWork(draft),false);
  draft.fields[key]='My chosen task';
  assert.equal(hasMeaningfulDraftWork(draft),true);
  draft.fields[key]='   ';
  assert.equal(hasMeaningfulDraftWork(draft),false);
  draft.fields.note='Existing note';
  assert.equal(hasMeaningfulDraftWork(draft),true);
  assert.equal(notebookFieldLabel('note'),'note');
});
test('approved practical operations and boundaries remain represented', () => {
  const byId=Object.fromEntries(supportingPractices.map((practice)=>[practice.id,practice]));
  const text=(id:string)=>JSON.stringify(byId[id]);
  assert.match(text('attention-return'),/anchor/i);assert.match(text('attention-return'),/not failures|not treating|not failure|without treating drift as failure/i);
  assert.match(text('habit-payoff'),/immediate/i);assert.match(text('habit-payoff'),/later/i);assert.match(text('habit-payoff'),/expected/i);
  assert.match(text('emotion-specificity'),/two/i);assert.match(text('emotion-specificity'),/hypothes|possible/i);
  assert.match(text('listening-check'),/correction/i);assert.match(text('listening-check'),/consent|agree|permission/i);
  assert.match(text('digital-use-agreement'),/exception/i);assert.match(text('digital-use-agreement'),/review/i);
});
