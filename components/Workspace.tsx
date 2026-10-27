"use client";
import { Sparkles, Focus, ChevronDown } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import type { Draft } from "@/features/notebook-data";
import { settleRecordSave } from "@/lib/workspace-records";
import { activatePerspectiveEntry } from "@/lib/perspective-records";
import { makeDraft, hasMeaningfulDraftWork } from "@/features/notebook-model";

type Entry = {
  draft: Draft;
  persisted: boolean;
  dirty: boolean;
  status: string;
};
type WorkspaceState = {
  entries: Record<string, Entry>;
  setDraft: (key: string, fn: (d: Draft) => Draft) => void;
  getDraft: (
    key: string,
    type: Draft["type"],
    title: string,
  ) => Entry | undefined;
  save: (key: string) => Promise<boolean>;
  load: (draft: Draft, persisted?: boolean) => void;
  prefs: { mode: string; paused: boolean };
  setPrefs: (
    p: Partial<{ mode: string; paused: boolean }>,
  ) => void;
  notice: string;
  forget: (ids: string[], preferences?: boolean) => void;
};
const Context = createContext<WorkspaceState | null>(null);
export function useWorkspace() {
  const c = useContext(Context);
  if (!c) throw new Error("Workspace is unavailable");
  return c;
}
export function Workspace({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<Record<string, Entry>>({});
  const entriesRef = useRef(entries);
  entriesRef.current = entries;
  const [prefs, updatePrefs] = useState({
    mode: "Immersive",
    paused: false,
  });
  const [notice, setNotice] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const r = document.documentElement;
    updatePrefs({
      mode: r.dataset.mode || "Immersive",
      paused: false,
    });
  }, []);
  const setPrefs = useCallback((p: Partial<typeof prefs>) => {
    updatePrefs((old) => {
      const next = { ...old, ...p, paused: false };
      const r = document.documentElement;
      r.dataset.mode = next.mode;
      r.dataset.paused = String(next.paused);
      try {
        localStorage.setItem("ppo.preferences.v1", JSON.stringify(next));
      } catch {
        setNotice(
          "Preferences apply in this tab. Device storage is unavailable.",
        );
      }
      return next;
    });
  }, []);
  const getDraft = useCallback(
    (key: string, type: Draft["type"], title: string) => {
      if (!entriesRef.current[key]) {
        const e = {
          draft: {
            ...makeDraft(type, title),
            fields: type === "learning" ? { discipline: key.slice(9) } : {},
          },
          persisted: false,
          dirty: false,
          status: "Not saved",
        };
        setEntries((old) => ({ ...old, [key]: old[key] || e }));
      }
      return entriesRef.current[key];
    },
    [],
  );
  const setDraft = useCallback(
    (key: string, fn: (d: Draft) => Draft) =>
      setEntries((old) => {
        if (!old[key]) return old;
        const next = fn(old[key].draft);
        return {
          ...old,
          [key]: {
            ...old[key],
            draft: { ...next, updatedAt: new Date().toISOString() },
            dirty:
              old[key].persisted ||
              old[key].dirty ||
              hasMeaningfulDraftWork(next),
            status: old[key].persisted ? "Saving changes…" : "Not saved",
          },
        };
      }),
    [],
  );
  const save = useCallback(async (key: string) => {
    const e = entriesRef.current[key];
    if (!e) return false;
    try {
      const { writeDrafts } = await import("@/features/notebook-data");
      await writeDrafts([e.draft]);
      setEntries((old) => settleRecordSave(old, e.draft));
      return true;
    } catch (error) {
      setEntries((old) => settleRecordSave(old, e.draft, (error as Error).message));
      return false;
    }
  }, []);
  // Only explicitly saved records are eligible for subsequent autosave.
  useEffect(() => {
    const keys = Object.keys(entries).filter(
      (k) =>
        entries[k].dirty &&
        entries[k].persisted &&
        entries[k].status === "Saving changes…",
    );
    if (!keys.length) return;
    const timer = setTimeout(() => {
      keys.forEach((k) => void save(k));
    }, 500);
    return () => clearTimeout(timer);
  }, [entries, save]);
  const load = useCallback((draft: Draft, persisted = true) => {
    const key =
      draft.type === "perspective"
        ? "perspective"
        : draft.type === "identity"
          ? "identity"
          : `learning-${draft.fields.discipline || draft.id}`;
    setEntries((old) => {
      const next = { draft, persisted, dirty: !persisted, status: persisted ? "Saved on this device" : "Not saved" };
      // Keep separate perspective cases, including unsaved ones, available in My notes.
      return draft.type === "perspective" ? activatePerspectiveEntry(old, next) : { ...old, [key]: next };
    });
  }, []);
  useEffect(() => {
    const listener = (e: BeforeUnloadEvent) => {
      if (Object.values(entriesRef.current).some((x) => x.dirty)) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", listener);
    return () => window.removeEventListener("beforeunload", listener);
  }, []);
  useEffect(() => {
    const click = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a");
      if (
        !a ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey ||
        a.target === "_blank" ||
        a.download
      )
        return;
      const u = new URL(a.href, location.href);
      if (u.origin !== location.origin || u.pathname === location.pathname)
        return;
      if (
        Object.values(entriesRef.current).some((x) => x.dirty && !x.persisted)
      ) {
        e.preventDefault();
        previousFocus.current = document.activeElement as HTMLElement;
        setPending(u.pathname + u.search + u.hash);
        dialog.current?.showModal();
      }
    };
    document.addEventListener("click", click, true);
    return () => document.removeEventListener("click", click, true);
  }, []);
  const forget = useCallback((ids: string[], preferences = false) => {
    setEntries((old) =>
      Object.fromEntries(
        Object.entries(old).filter(([, e]) => !ids.includes(e.draft.id)),
      ),
    );
    if (preferences) {
      updatePrefs({ mode: "Immersive", paused: false });
      document.documentElement.dataset.mode = "Immersive";
      document.documentElement.dataset.paused = "false";
      try {
        localStorage.removeItem("ppo.preferences.v1");
      } catch {
        setNotice("Preferences could not be removed from device storage.");
      }
    }
  }, []);
  const close = () => {
    dialog.current?.close();
    setPending(null);
    previousFocus.current?.focus();
  };
  const leave = () => {
    const href = pending;
    setEntries((old) =>
      Object.fromEntries(
        Object.entries(old).map(([k, v]) => [k, { ...v, dirty: false }]),
      ),
    );
    close();
    if (href) router.push(href);
  };
  return (
    <Context.Provider
      value={{
        entries,
        setDraft,
        getDraft,
        save,
        load,
        prefs,
        setPrefs,
        notice,
        forget,
      }}
    >
      {children}
      <dialog
        ref={dialog}
        aria-labelledby="leave-title"
        onCancel={() => {
          setPending(null);
          previousFocus.current?.focus();
        }}
      >
        <h2 id="leave-title">Keep your working draft?</h2>
        <p>
          Your text is still in this tab, but has not been saved on this device.
          Reloading or closing the tab removes it.
        </p>
        <div className="actions">
          <button autoFocus onClick={close}>
            Keep editing
          </button>
          <button onClick={leave}>Leave without saving</button>
          <button
            className="primary"
            onClick={async () => {
              const keys = Object.keys(entriesRef.current).filter(
                (k) => entriesRef.current[k].dirty,
              );
              const results = await Promise.all(keys.map(save));
              if (results.every(Boolean)) leave();
            }}
          >
            Save on this device & leave
          </button>
        </div>
        <p role="status">
          {
            Object.values(entries).find((x) =>
              /failed|unavailable/i.test(x.status),
            )?.status
          }
        </p>
      </dialog>
      <span className="sr-only" aria-live="polite">
        {pathname ? notice : ""}
      </span>
    </Context.Provider>
  );
}
export function Preferences() {
  const { prefs, setPrefs } = useWorkspace();
  return (
    <div className="environment-control">
    <details className="environment-menu">
      <summary aria-label={`Experience: ${prefs.mode}`}><span aria-hidden="true">{prefs.mode === "Focused" ? <Focus size={17} /> : <Sparkles size={17} />}</span> {prefs.mode}<ChevronDown size={14} aria-hidden="true" /></summary>
    <div className="preferences" aria-label="Experience">
      <label>
        Experience
        <select
          aria-label="Experience mode"
          value={prefs.mode}
          onChange={(e) => setPrefs({ mode: e.target.value })}
        >
          <option>Immersive</option>
          <option>Focused</option>
        </select>
      </label>
    </div>
    </details>

    </div>
  );
}
export function DraftActions({ draftKey }: { draftKey: string }) {
  const { entries, save } = useWorkspace();
  const e = entries[draftKey];
  return (
    <div className="draft-actions">
      <p role="status">
        {e?.status || "Not saved"}
        {e?.persisted && !e.dirty
          ? " · " + new Date(e.draft.updatedAt).toLocaleTimeString()
          : ""}
      </p>
      <button
        className="primary"
        disabled={!e}
        onClick={() => void save(draftKey)}
      >
        Save on this device
      </button>
      <Link className="draft-notes-link" href="/notebook">My notes</Link>
    </div>
  );
}
