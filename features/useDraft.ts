"use client";
import { useEffect } from "react";
import { useWorkspace } from "@/components/Workspace";
import { readDrafts, type Draft } from "./notebook-data";
export function useDraft(key: string, type: Draft["type"], title: string) {
  const { entries, getDraft, setDraft, load } = useWorkspace();
  useEffect(() => {
    const existing = getDraft(key, type, title);
    if (existing) return;
    let active = true;
    readDrafts()
      .then((records) => {
        if (!active) return;
        const current = getDraft(key, type, title);
        if (current?.dirty) return;
        const record = records
          .filter(
            (r) =>
              r.type === type &&
              (type !== "learning" || r.fields.discipline === key.slice(9)),
          )
          .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
        if (record) load(record);
      })
      .catch(() => {
        /* Keep the in-memory draft; saving reports storage failures explicitly. */
      });
    return () => {
      active = false;
    };
  }, [getDraft, key, type, title, load]);
  const entry = entries[key];
  const set = (field: string, value: string) =>
    setDraft(key, (d) => ({ ...d, fields: { ...d.fields, [field]: value } }));
  return {
    draft: entry?.draft,
    set,
    update: (fn: (d: Draft) => Draft) => setDraft(key, fn),
    status: entry?.status,
  };
}
