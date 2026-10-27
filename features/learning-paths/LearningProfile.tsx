"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useWorkspace } from "@/components/Workspace";
import { readExistingDrafts, type Draft } from "@/features/notebook-data";
import { hasMeaningfulDraftWork } from "@/features/notebook-model";
import { deriveLearningProfile, proposedMilestones } from "@/lib/learning-path-records";
import styles from "./LearningPath.module.css";

type Discipline = { id: string; slug: string; title: string; learningGoal: string };
export function LearningProfile({ disciplines }: { disciplines: Discipline[] }) {
  const { entries } = useWorkspace();
  const [saved, setSaved] = useState<Draft[]>([]);
  const [storage, setStorage] = useState("Reading this device’s records…");
  useEffect(() => {
    let active = true;
    readExistingDrafts().then((records) => {
      if (!active) return;
      setSaved(records);
      setStorage("Showing saved records plus any current work in this tab. Reading this profile does not save or change a record.");
    }).catch(() => {
      if (active) setStorage("Device storage could not be read. Only current work in this tab is shown; saved records have not been changed.");
    });
    return () => { active = false; };
  }, []);
  const memory = Object.values(entries).map((entry) => entry.draft);
  const memoryIds = new Set(memory.map((record) => record.id));
  const profile = deriveLearningProfile([...memory, ...saved.filter((record) => !memoryIds.has(record.id))]);
  return <>
    <section className={`panel section-pad ${styles.section}`} aria-labelledby="profile-evidence-title">
      <h2 id="profile-evidence-title">Eight disciplines. No global score.</h2>
      <p role="status">{storage}</p>
      <p>These are your existing educational self-ratings and the presence of private notes—not validated measurements, verified competence or clinical outcomes. No self-rating is inferred from page visits, clicks, reading, confidence or the number of records.</p>
      <div className={styles.profileGrid}>{disciplines.map((discipline) => {
        const row = profile.find((item) => item.discipline === discipline.slug)!;
        const working = Object.values(entries).filter((entry) => entry.draft.type === "learning" && entry.draft.fields.discipline === discipline.slug);
        const unsaved = working.some((entry) => !entry.persisted && (hasMeaningfulDraftWork(entry.draft) || /^[1-4]$/.test(entry.draft.fields.rubric ?? "")));
        const saving = working.some((entry) => entry.persisted && entry.dirty);
        const persisted = working.some((entry) => entry.persisted) || saved.some((record) => record.type === "learning" && record.fields.discipline === discipline.slug);
        return <article key={discipline.id} className={styles.profileCard}>
          <span className={styles.status}>Self-assessment · {row.rating === 0 ? "Unassessed" : "Self-reported"}</span>
          <h3>{discipline.title}</h3><p>{discipline.learningGoal}</p>
          <p className="fine" data-storage-state={unsaved ? "unsaved" : saving ? "saving" : persisted ? "saved" : "none"}>{unsaved ? "Includes unsaved work in this tab. Save it in the activity before closing or reloading." : saving ? "Includes changes awaiting device autosave. Check the activity’s save status." : persisted ? "Saved record available on this device." : "No saved record available in this view."}</p>
          <p><strong>{row.rating === 0 ? "Unassessed" : `${row.rating} · ${row.ratingLabel}`}</strong></p>
          <ul>
            <li>{row.hasNote ? "A learning note is present; its quality has not been assessed." : "No general learning note is recorded."}</li>
            {row.pathRecordCount > 0 && <li>Perspective-fit reflection present; not independently assessed.</li>}
            {row.outcomes.length > 0 && <li>Recorded outcomes: {row.outcomes.join(", ")}. These are self-reports, not awards.</li>}
            {row.hasDelayedObservation && <li>A later-context note is present; durable transfer has not been established.</li>}
          </ul>
          <Link href={`/learn/curriculum/${discipline.slug}`}>Open {discipline.title}</Link>
        </article>;
      })}</div>
    </section>
    <section className={`panel section-pad ${styles.section}`} aria-labelledby="milestone-requirements-title">
      <span className="eyebrow">PROVISIONAL / REQUIREMENTS, NOT AWARDS</span>
      <h2 id="milestone-requirements-title">Five proposed evidence milestones.</h2>
      <p>All remain unassessed here. This site does not assign a rank. These are proposed evidence requirements, not a validated developmental scale, a hierarchy of human worth or a credential.</p>
      <ol className={styles.milestones}>{proposedMilestones.map((milestone) => <li key={milestone.title}>
        <h3>{milestone.title} <span className={styles.status}>Unassessed · proposed</span></h3><p>{milestone.requirement}</p>
      </li>)}</ol>
      <p className="fine">Imagined practice, repeated clicks and self-confidence cannot establish these requirements. Stronger claims need observable performance, delayed checks, varied contexts, acknowledged failures and independent scrutiny.</p>
      <div className="actions"><Link href="/learn">All eight disciplines</Link><Link href="/notebook">Review, export or manage your notes</Link></div>
    </section>
  </>;
}
