"use client";
import { useEffect, useRef, useState } from "react";
import { learningRecordSummary } from "@/lib/supporting-practice-records";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CircleDot, Download } from "lucide-react";
import { useWorkspace } from "@/components/Workspace";
import {
  CONTENT_VERSION,
  MAX_IMPORT_BYTES,
  deleteDrafts,
  download,
  parseImport,
  readDrafts,
  transferSummary,
  writeDrafts,
  type Draft,
} from "./notebook-data";
export function Notebook() {
  const { entries, load, forget } = useWorkspace();
  const router = useRouter();
  const [saved, setSaved] = useState<Draft[]>([]),
    [status, setStatus] = useState("Reading this device…"),
    [pending, setPending] = useState<Draft[]>([]),
    [policy, setPolicy] = useState("keep-both"),
    [alsoPrefs, setAlsoPrefs] = useState(false),
    [clearIds, setClearIds] = useState<string[]>([]);
  const importDialog = useRef<HTMLDialogElement>(null),
    clearDialog = useRef<HTMLDialogElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const refresh = async () => {
    try {
      const r = await readDrafts();
      setSaved(r);
      setStatus(
        r.length
          ? `${r.length} saved record${r.length === 1 ? "" : "s"} on this device.`
          : "No saved records on this device.",
      );
    } catch (e) {
      setStatus((e as Error).message);
    }
  };
  useEffect(() => {
    readDrafts()
      .then((r) => {
        setSaved(r);
        setStatus(
          r.length
            ? `${r.length} saved records on this device.`
            : "No saved records on this device.",
        );
      })
      .catch((e) => setStatus((e as Error).message));
  }, []);
  const memory = Object.values(entries).map((e) => e.draft);
  const all = [
    ...memory,
    ...saved.filter((s) => !memory.some((m) => m.id === s.id)),
  ];
  const dismiss = (d: HTMLDialogElement | null) => {
    d?.close();
    lastFocus.current?.focus();
  };
  const importFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      if (file.size > MAX_IMPORT_BYTES)
        throw new Error("File exceeds the 2 MB limit. Nothing changed.");
      const records = parseImport(await file.text());
      setPending(records);
      lastFocus.current = document.activeElement as HTMLElement;
      importDialog.current?.showModal();
    } catch (e) {
      setStatus((e as Error).message);
    }
  };
  const commitImport = async () => {
    try {
      const ids = new Set(saved.map((s) => s.id));
      const records = pending.flatMap((r) => {
        if (!ids.has(r.id)) return [r];
        if (policy === "skip") return [];
        if (policy === "replace") return [r];
        return [
          {
            ...r,
            id: crypto.randomUUID(),
            title: (r.title + " (imported copy)").slice(0, 200),
          },
        ];
      });
      await writeDrafts(records);
      for (const r of records) load(r);
      dismiss(importDialog.current);
      setPending([]);
      await refresh();
      setStatus(`${records.length} records imported on this device.`);
    } catch (e) {
      setStatus((e as Error).message);
    }
  };
  const clear = async () => {
    try {
      await deleteDrafts(clearIds);
      forget(clearIds, alsoPrefs);
      dismiss(clearDialog.current);
      await refresh();
      setStatus(
        "Selected notebook records removed. Other websites and storage were not changed.",
      );
    } catch (e) {
      setStatus((e as Error).message);
    }
  };
  const confirmClear = (ids: string[]) => {
    setClearIds(ids);
    lastFocus.current = document.activeElement as HTMLElement;
    clearDialog.current?.showModal();
  };
  return (
    <>
      <section className="panel section-pad">
        <div className="split-heading">
          <div>
            <span className="eyebrow">YOUR PRIVATE WORKSPACE</span>
            <h2>Portable notes. Deliberate saving.</h2>
            <p>
              Working drafts stay in this tab until you choose to save. Saved
              records use this browser’s device storage. They are not encrypted
              by this app or backed up to an account.
            </p>
          </div>
          <span className="local-seal">
            <CircleDot size={28} aria-hidden="true" /><small>ON THIS DEVICE</small>
          </span>
        </div>
        <div className="actions">
          <button disabled={!all.length} onClick={() => download(all)}>
            Export all as JSON <Download size={16} aria-hidden="true" />
          </button>
          <button disabled={!all.length} onClick={() => download(all, true)}>
            Readable Markdown <Download size={16} aria-hidden="true" />
          </button>
          <label className="file-button">
            Import JSON
            <input
              type="file"
              accept="application/json,.json"
              onChange={(e) => {
                void importFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>
          <button
            disabled={!all.length}
            onClick={() => confirmClear(all.map((x) => x.id))}
          >
            Clear this app’s notebook
          </button>
        </div>
        <p role="status" className="callout">
          {status}
        </p>
        <p className="fine">
          JSON only · 2 MB maximum · up to 100 records · imported markup is
          treated as text. Export a backup before clearing browser data.
        </p>
      </section>
      <section className="panel section-pad">
        <h2>Drafts & observations</h2>
        {!all.length ? (
          <div className="notebook-empty">
            <p>Start small. Choose one ordinary situation, make a plan and save it here. No account is required.</p>
            <div className="empty-state-actions">
              <Link className="button primary" href="/explore/perspectives">Explore a situation</Link>
              <Link className="button" href="/explore/identity">Build an action plan</Link>
              <Link className="button" href="/learn/curriculum/legitimate-authority">Try a Dominion practice</Link>
            </div>
            <p className="fine">Use “Save on this device” inside an activity. Return here to resume, export or add your next observation.</p>
          </div>
        ) : (
          all.map((r) => (
            <article key={r.id} className="editorial-row">
              <div>
                <span className="badge">
                  {r.type} ·{" "}
                  {saved.some((s) => s.id === r.id)
                    ? "Saved on this device"
                    : "In this tab · not saved"}
                </span>
                <h3>{r.title}</h3>
                <p>
                  {r.type === "identity"
                    ? transferSummary(r)
                    : r.type === "learning" ? learningRecordSummary(r.fields) : r.fields.action || r.fields.note || "Working draft"}
                </p>
                <p className="fine">
                  {new Date(r.updatedAt).toLocaleString()} · content{" "}
                  {r.contentVersion}
                  {r.contentVersion !== CONTENT_VERSION
                    ? " · Earlier content version retained; review the current explanation."
                    : ""}
                </p>
                <div className="actions">
                  <button
                    onClick={() => {
                      load(
                        r,
                        saved.some((s) => s.id === r.id),
                      );
                      router.push(
                        r.type === "identity"
                          ? "/explore/identity"
                          : r.type === "perspective"
                            ? "/explore/perspectives"
                            : "/learn/curriculum/" + r.fields.discipline,
                      );
                    }}
                  >
                    Resume record <ArrowRight size={16} aria-hidden="true" />
                  </button>
                  <button onClick={() => download([r])}>Export</button>
                  <button onClick={() => confirmClear([r.id])}>Remove</button>
                </div>
              </div>
            </article>
          ))
        )}
      </section>
      <dialog
        ref={importDialog}
        aria-labelledby="import-title"
        onCancel={() => lastFocus.current?.focus()}
      >
        <h2 id="import-title">Import {pending.length} notebook records?</h2>
        <p>
          Existing IDs require an explicit conflict choice. All records are
          validated before one storage transaction.
        </p>
        <label>
          If an ID already exists
          <select
            aria-label="If an ID already exists"
            value={policy}
            onChange={(e) => setPolicy(e.target.value)}
          >
            <option value="keep-both">
              Keep both (give imported copy a new ID)
            </option>
            <option value="skip">Skip the imported duplicate</option>
            <option value="replace">
              Replace that identified local record
            </option>
          </select>
        </label>
        <div className="actions">
          <button autoFocus onClick={() => dismiss(importDialog.current)}>
            Cancel
          </button>
          <button className="primary" onClick={() => void commitImport()}>
            Import records
          </button>
        </div>
        <p role="status">{status}</p>
      </dialog>
      <dialog
        ref={clearDialog}
        aria-labelledby="clear-title"
        onCancel={() => lastFocus.current?.focus()}
      >
        <h2 id="clear-title">Remove {clearIds.length} notebook records?</h2>
        <p>
          This removes the selected notes from this app’s IndexedDB store and
          this tab. Export first if you need a portable backup.
        </p>
        <label className="check-label">
          <input
            type="checkbox"
            checked={alsoPrefs}
            onChange={(e) => setAlsoPrefs(e.target.checked)}
          />{" "}
          Also remove this app’s presentation preferences
        </label>
        <div className="actions">
          <button autoFocus onClick={() => dismiss(clearDialog.current)}>
            Keep records
          </button>
          <button className="danger" onClick={() => void clear()}>
            Remove selected records
          </button>
        </div>
        <p role="status">{status}</p>
      </dialog>
    </>
  );
}
