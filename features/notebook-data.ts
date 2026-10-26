import { z } from "zod";
import { notebookFieldLabel } from "@/lib/supporting-practice-records";
import { disciplineSlugs } from "@/lib/indices";
export const CONTENT_VERSION = "2.0";
export const MAX_IMPORT_BYTES = 2 * 1024 * 1024;
const bounded = z.string().max(10000);
export const draftSchema = z
  .object({
    schemaVersion: z.literal(1),
    id: z.string().min(1).max(100),
    type: z.enum(["perspective", "identity", "learning"]),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    contentVersion: z.string().max(20),
    title: z.string().max(200),
    fields: z.record(z.string().max(80), bounded),
    observations: z
      .array(
        z.object({
          id: z.string().max(100),
          date: z.iso.datetime(),
          type: z.enum(["imagined", "role-play", "real-world"]),
          outcome: z.enum(["observed", "failed", "inconclusive"]),
          prediction: bounded,
          actual: bounded,
          context: bounded,
          unintended: bounded,
        }),
      )
      .max(200),
  })
  .refine(
    (d) =>
      d.type !== "learning" || disciplineSlugs.includes(d.fields.discipline),
    "Unknown curriculum identifier.",
  );
export type Draft = z.infer<typeof draftSchema>;
export type Observation = Draft["observations"][number];
export const exportSchema = z.object({
  schemaVersion: z.literal(1),
  notice: z.string().optional(),
  exportedAt: z.iso.datetime(),
  records: z.array(draftSchema).max(100),
});
export { makeDraft } from "./notebook-model";
export function parseImport(text: string) {
  if (new TextEncoder().encode(text).byteLength > MAX_IMPORT_BYTES)
    throw new Error("File exceeds the 2 MB limit.");
  const value = exportSchema.safeParse(JSON.parse(text));
  if (!value.success)
    throw new Error(
      "Unsupported or invalid notebook file. Nothing has been changed.",
    );
  if (
    new Set(value.data.records.map((r) => r.id)).size !==
    value.data.records.length
  )
    throw new Error("The import contains duplicate IDs. Nothing changed.");
  return value.data.records;
}
export function serialize(records: Draft[]) {
  return JSON.stringify(
    {
      schemaVersion: 1,
      notice:
        "Personal notebook. Stored locally; not clinical or research data. Keep this file private.",
      exportedAt: new Date().toISOString(),
      records,
    },
    null,
    2,
  );
}
export function download(records: Draft[], markdown = false) {
  const text = markdown
    ? records
        .map(
          (r) =>
            `# ${r.title}\n\nContent version ${r.contentVersion} · ${r.updatedAt}\n\n${Object.entries(
              r.fields,
            )
              .map(([k, v]) => `## ${notebookFieldLabel(k)}\n${v}`)
              .join(
                "\n\n",
              )}\n\n${r.observations.map((o) => `## ${o.type} / ${o.outcome}\nPrediction: ${o.prediction}\nObserved: ${o.actual}\nContext: ${o.context}\nUnintended effects: ${o.unintended}`).join("\n\n")}`,
        )
        .join("\n\n---\n\n")
    : serialize(records);
  const url = URL.createObjectURL(
    new Blob([text], { type: markdown ? "text/markdown" : "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = `observatory-notebook-${new Date().toISOString().slice(0, 10)}.${markdown ? "md" : "json"}`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
const DB = "ppo-notebook";
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => {
      const db = r.result;
      if (!db.objectStoreNames.contains("drafts"))
        db.createObjectStore("drafts", { keyPath: "id" });
    };
    r.onsuccess = () => {
      r.result.onversionchange = () => r.result.close();
      resolve(r.result);
    };
    r.onerror = () =>
      reject(
        new Error(
          "Device storage is unavailable. Your in-memory work is intact; export a backup.",
        ),
      );
    r.onblocked = () =>
      reject(
        new Error(
          "Another tab is using the notebook. Close it and retry, or export your work.",
        ),
      );
  });
}
async function transaction<T>(
  mode: IDBTransactionMode,
  work: (store: IDBObjectStore) => () => T,
): Promise<T> {
  const db = await openDB();
  return new Promise<T>((resolve, reject) => {
    let tx: IDBTransaction | undefined;
    const fail = () => {
      db.close();
      reject(
        new Error(
          "Device storage did not complete the operation. Your working text is intact; export a backup and retry.",
        ),
      );
    };
    try {
      tx = db.transaction("drafts", mode);
      const result = work(tx.objectStore("drafts"));
      tx.oncomplete = () => {
        db.close();
        try {
          resolve(result());
        } catch {
          reject(
            new Error(
              "Saved data has an unsupported format. Existing records were preserved.",
            ),
          );
        }
      };
      tx.onerror = tx.onabort = fail;
    } catch {
      try {
        tx?.abort();
      } catch {
        /* An already-ended transaction cannot be aborted. */
      }
      fail();
    }
  });
}
export async function readDrafts(): Promise<Draft[]> {
  return transaction("readonly", (store) => {
    const request = store.getAll();
    return () => z.array(draftSchema).parse(request.result);
  });
}
export async function writeDrafts(records: Draft[]): Promise<void> {
  const clean = z.array(draftSchema).parse(records);
  return transaction("readwrite", (store) => {
    for (const record of clean) store.put(record);
    return () => undefined;
  });
}
export async function deleteDrafts(ids: string[]): Promise<void> {
  return transaction("readwrite", (store) => {
    for (const id of ids) store.delete(id);
    return () => undefined;
  });
}
export function transferSummary(r: Draft) {
  const tests = r.observations.filter((o) => o.type === "real-world");
  return tests.length
    ? `${tests.length} real-world observation${tests.length === 1 ? "" : "s"} · ${tests.filter((o) => o.outcome === "failed").length} failed · ${tests.filter((o) => o.outcome === "inconclusive").length} inconclusive. Scope remains specific to these contexts.`
    : "Real-world transfer: not yet tested. Imagined and role-play records do not establish transfer.";
}
