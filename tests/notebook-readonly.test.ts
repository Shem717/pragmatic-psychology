import test from "node:test";
import assert from "node:assert/strict";
import { makeDraft, readExistingDrafts, writeDrafts } from "../features/notebook-data";

/** Fault-injection contract tests. These do not claim to be browser-engine tests. */
async function withFactory(factory: Partial<IDBFactory>, run: () => Promise<void>) {
  const original = Object.getOwnPropertyDescriptor(globalThis, "indexedDB");
  Object.defineProperty(globalThis, "indexedDB", { configurable: true, value: factory });
  try { await run(); }
  finally {
    if (original) Object.defineProperty(globalThis, "indexedDB", original);
    else Reflect.deleteProperty(globalThis, "indexedDB");
  }
}

test("first-visit profile read aborts database creation and returns no records", async () => {
  let aborted = 0;
  const request = {} as IDBOpenDBRequest;
  Object.assign(request, { transaction: { abort: () => { aborted++; queueMicrotask(() => request.onerror?.(new Event("error"))); } } });
  await withFactory({ open: (_name, version) => {
    assert.equal(version, undefined, "Read-only projection must not request a schema upgrade");
    queueMicrotask(() => request.onupgradeneeded?.(new Event("upgradeneeded") as IDBVersionChangeEvent));
    return request;
  } }, async () => {
    assert.deepEqual(await readExistingDrafts(), []);
    assert.equal(aborted, 1);
  });
});

test("saved-profile read uses only a readonly transaction and leaves records intact", async () => {
  const draft = makeDraft("learning", "Synthetic old record");
  draft.fields = { discipline: "discernment", note: "Preserve this old note" };
  const before = JSON.stringify(draft);
  let closed = 0;
  const tx = {} as IDBTransaction;
  Object.assign(tx, { objectStore: () => ({ getAll: () => {
    queueMicrotask(() => tx.oncomplete?.(new Event("complete")));
    return { result: [draft] };
  } }) });
  const db = { version: 1, objectStoreNames: { contains: (name: string) => name === "drafts" }, close: () => { closed++; }, transaction: (store: string, mode: string) => {
    assert.equal(store, "drafts"); assert.equal(mode, "readonly"); return tx;
  } };
  const request = { result: db } as unknown as IDBOpenDBRequest;
  await withFactory({ open: () => { queueMicrotask(() => request.onsuccess?.(new Event("success"))); return request; } }, async () => {
    assert.deepEqual(await readExistingDrafts(), [draft]);
    assert.equal(JSON.stringify(draft), before);
    assert.equal(closed, 1);
  });
});

test("a future database schema is closed, not migrated or overwritten by the profile", async () => {
  let closed = false;
  const request = { result: { version: 2, close: () => { closed = true; } } } as unknown as IDBOpenDBRequest;
  await withFactory({ open: () => { queueMicrotask(() => request.onsuccess?.(new Event("success"))); return request; } }, async () => {
    await assert.rejects(readExistingDrafts(), /unsupported format.*preserved/);
    assert.equal(closed, true);
  });
});

test("denied storage and aborted quota writes reject without changing in-memory text", async () => {
  const draft = makeDraft("learning", "Synthetic reflection");
  draft.fields = { discipline: "discernment", "path_perspective-fit_facts": "Keep my working text" };
  const before = JSON.stringify(draft);
  await withFactory({ open: () => { throw new DOMException("Storage is disabled", "SecurityError"); } }, async () => {
    await assert.rejects(writeDrafts([draft]), /Storage is disabled/);
    await assert.rejects(readExistingDrafts(), /Storage is disabled/);
    assert.equal(JSON.stringify(draft), before);
  });
  const tx = {} as IDBTransaction;
  Object.assign(tx, { objectStore: () => ({ put: () => { queueMicrotask(() => tx.onabort?.(new Event("abort"))); } }) });
  const request = { result: { close: () => {}, transaction: (_store: string, mode: string) => { assert.equal(mode, "readwrite"); return tx; } } } as unknown as IDBOpenDBRequest;
  await withFactory({ open: () => { queueMicrotask(() => request.onsuccess?.(new Event("success"))); return request; } }, async () => {
    await assert.rejects(writeDrafts([draft]), /working text is intact/);
    assert.equal(JSON.stringify(draft), before);
  });
});
