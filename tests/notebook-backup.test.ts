import test from 'node:test';
import assert from 'node:assert/strict';
import { backupBlob, makeDraft, serialize } from '../features/notebook-data';
import { parseBackup } from '../features/notebook-backup';

test('full backup restores more than 100 records and 2 MB including a large record', async () => {
  const records = Array.from({length: 105}, (_, i) => {
    const draft = makeDraft('identity', `Synthetic ${i}`);
    draft.fields.note = 'n'.repeat(10000);
    return draft;
  });
  records[0].observations = Array.from({length: 100}, (_, i) => ({
    id: `o${i}`, date: new Date().toISOString(), type: 'imagined' as const,
    outcome: 'inconclusive' as const, prediction: 'p'.repeat(10000), actual: 'a'.repeat(10000),
    context: 'c'.repeat(10000), unintended: 'u'.repeat(10000),
  }));
  const blob = backupBlob(records);
  assert.ok(blob.size > 2 * 1024 * 1024);
  assert.deepEqual(await parseBackup(blob), records);
  const legacy = [{ ...records[0], observations: [] }];
  assert.deepEqual(await parseBackup(new Blob([serialize(legacy)])), legacy);
});

test('streamed import rejects truncation, duplicates, oversized frames and invalid records', async () => {
  const draft = makeDraft('identity', 'Synthetic');
  const text = await backupBlob([draft]).text();
  await assert.rejects(parseBackup(new Blob([text.replace(/\["complete",1\]\n$/, '')])));
  await assert.rejects(parseBackup(new Blob([text.replace('["end"]', '["field","x","1"]\n["field","x","2"]\n["end"]')])));
  await assert.rejects(parseBackup(new Blob([text.replace('["end"]', `["field","x","${'x'.repeat(600000)}"]\n["end"]`)])));
  assert.throws(() => backupBlob([draft, draft]));
});
