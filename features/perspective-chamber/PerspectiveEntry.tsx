"use client";
import { useEffect, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { useWorkspace } from "@/components/Workspace";
import { makeDraft, readDrafts, type Draft } from "../notebook-data";

export function PerspectiveEntry({ example, children }: { example: { id: string; title: string }; children: ReactNode }) {
  const requested = useSearchParams().get("case") === example.id;
  const { entries, load } = useWorkspace();
  const active = entries.perspective?.draft;
  const open = active?.fields.scenario === example.id && active.fields.personal !== "yes";
  useEffect(() => {
    if (!requested || open) return;
    const matches = (draft: Draft) => draft.type === "perspective" && draft.fields.scenario === example.id && draft.fields.personal !== "yes";
    const inTab = Object.values(entries).filter((entry) => matches(entry.draft)).sort((a, b) => b.draft.updatedAt.localeCompare(a.draft.updatedAt))[0];
    if (inTab) { load(inTab.draft, inTab.persisted); return; }
    let cancelled = false;
    async function openExample() {
      const records = await readDrafts().catch(() => []);
      if (cancelled) return;
      const saved = records.filter(matches).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
      if (saved) { load(saved); return; }
      const next = makeDraft("perspective", `${example.title} · Perspective Chamber`);
      next.fields.scenario = example.id;
      load(next, false);
    }
    void openExample();
    return () => { cancelled = true; };
  }, [entries, example, load, open, requested]);
  useEffect(() => {
    if (!requested || !open || location.hash !== "#chamber-stage-title") return;
    const heading = document.getElementById("chamber-stage-title");
    heading?.focus({ preventScroll: true });
    heading?.scrollIntoView({ block: "start" });
  }, [requested, open]);
  return requested && !open ? <p role="status">Opening the revision request…</p> : children;
}
