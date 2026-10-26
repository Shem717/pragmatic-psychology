"use client";
import { SupportingPractices } from "./SupportingPractices";
import { useDraft } from "./useDraft";
import { DraftActions } from "@/components/Workspace";
import { download } from "./notebook-data";
export function Learning({ slug, title }: { slug: string; title: string }) {
  const key = "learning-" + slug;
  const { draft, set } = useDraft(key, "learning", title + " practice");
  return (
    <>
    <SupportingPractices slug={slug} draft={draft} set={set} />
    <section className="panel section-pad">
      <h2>Your learning record</h2>
      <p>
        Optional. Your own text stays in this tab unless you choose to save it
        on this device.
      </p>
      <label>
        Observation, artifact or revision
        <textarea
          aria-label="Observation, artifact or revision"
          rows={6}
          value={draft?.fields.note || ""}
          onChange={(e) => {
            set("discipline", slug);
            set("note", e.target.value);
          }}
        />
      </label>
      <label>
        Proposed educational rubric
        <select
          aria-label="Proposed educational rubric"
          value={draft?.fields.rubric || "0"}
          onChange={(e) => {
            set("discipline", slug);
            set("rubric", e.target.value);
          }}
        >
          <option value="0">0 · Unassessed</option>
          <option value="1">1 · Can describe</option>
          <option value="2">2 · Can practice with guidance</option>
          <option value="3">3 · Can demonstrate in context</option>
          <option value="4">4 · Can transfer and teach back</option>
        </select>
      </label>
      <p className="fine">
        An educational self-assessment, not a validated scale. Zero means
        unassessed. No global score is calculated.
      </p>
      <DraftActions draftKey={key} />
      <button disabled={!draft} onClick={() => draft && download([draft])}>
        Export learning record ↓
      </button>
    </section>
    </>
  );
}
