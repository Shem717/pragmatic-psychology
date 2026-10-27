"use client";
import { useState } from "react";
import Link from "next/link";
import { DraftActions } from "@/components/Workspace";
import { useDraft } from "@/features/useDraft";
import { download } from "@/features/notebook-data";
import { pathFieldKey, pathRecordFields, PILOT_DISCIPLINE } from "@/lib/learning-path-records";
import styles from "./LearningPath.module.css";

const stages = ["Check what is observable", "Compare truth-compatible alternatives", "Choose conduct", "Make a prediction", "Observe and revise", "Revisit later; limit transfer claims"];
const choices: Record<string, { value: string; label: string }[]> = {
  observationType: [{ value: "imagined", label: "Fictional / imagined" }, { value: "role-play", label: "Role-play" }, { value: "real-world", label: "Ordinary real-world situation" }],
  outcome: [{ value: "observed", label: "Observed" }, { value: "failed", label: "Failed / did not happen as predicted" }, { value: "inconclusive", label: "Inconclusive / not enough information" }],
};
export function PathReflection({ prompts, labels }: { prompts: Record<string, string>; labels: Record<string, string> }) {
  const draftKey = `learning-${PILOT_DISCIPLINE}`;
  const { draft, set } = useDraft(draftKey, "learning", "Discernment practice");
  const [mode, setMode] = useState("fictional");
  const [activeStage, setActiveStage] = useState(0);
  return <section id="reflection" className={`panel section-pad ${styles.section}`} aria-labelledby="path-reflection-title">
    <span className="eyebrow">OPTIONAL / YOUR PRIVATE WORK</span>
    <h2 id="path-reflection-title">A record you can revise.</h2>
    <p>Use the fictional example, another nonpersonal example, or an ordinary situation of your own. Skip any field or stop at any time; there is no penalty and nothing is awarded for disclosure.</p>
    <p>Your text shares the existing Discernment learning record. Earlier notes, self-ratings and supporting-practice entries remain intact. Work stays in this tab until you explicitly save; later edits to that saved record autosave on this device. Device storage is not encrypted by this app or backed up to an account.</p>
    <div className="actions"><a href="#worked-example">Return to the fictional example</a><Link href="/learn/profile">Skip reflection · view the formative profile</Link></div>
    <label className={styles.field}>
      Example to think with
      <select value={mode} onChange={(event) => setMode(event.target.value)}>
        <option value="fictional">Fictional / nonpersonal example</option>
        <option value="ordinary">My own ordinary situation (optional)</option>
      </select>
    </label>
    <p className="fine">This choice does not fill or overwrite your notes, count as progress, or change the evidence status of a reflection.</p>
    <nav className={styles.stageNavigation} aria-label="Optional reflection steps">{["Facts", "Alternatives", "Conduct", "Prediction", "Feedback", "Later check"].map((label, index) => <button key={label} type="button" aria-pressed={activeStage === index} onClick={() => setActiveStage(index)}>{index + 1}. {label}</button>)}</nav>
    <p className="fine" role="status">Step {activeStage + 1} of 6 · all fields optional. Move freely between steps; nothing is scored.</p>
    {stages.map((stage, index) => <fieldset key={stage} hidden={activeStage !== index} className={styles.formStage}>
      <legend>{index + 1}. {stage}</legend>
      <div className={styles.fields}>{pathRecordFields.filter((field) => field.stage === index + 1).map((field) => {
        const id = pathFieldKey(field.key);
        const options = choices[field.key];
        return <label className={styles.field} key={field.key} htmlFor={id}>
          {labels[field.key] || field.label}
          <span id={`${id}-hint`} className={styles.hint}>{prompts[field.key]}</span>
          {options ? <select id={id} value={draft?.fields[id] || ""} aria-describedby={`${id}-hint`} onChange={(event) => set(id, event.target.value)}>
            <option value="">Not recorded</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select> : <textarea id={id} rows={3} maxLength={10000} value={draft?.fields[id] || ""} aria-describedby={`${id}-hint`} onChange={(event) => set(id, event.target.value)} />}
        </label>;
      })}</div>
    </fieldset>)}
    <div className="actions">
      <button type="button" disabled={activeStage === 0} onClick={() => setActiveStage((stage) => Math.max(0, stage - 1))}>Previous step</button>
      {activeStage < stages.length - 1 ? <button type="button" onClick={() => setActiveStage((stage) => Math.min(stages.length - 1, stage + 1))}>Continue · next optional step</button> : <Link href="/learn/profile">Continue to the formative profile</Link>}
    </div>
    <p className="fine">Later observations can be failed or inconclusive. A written reflection, a completed field or an imagined success is not independent evidence of capability, efficacy or transfer.</p>
    <DraftActions draftKey={draftKey} />
    <div className="actions">
      <button disabled={!draft} onClick={() => draft && download([draft])}>Export this learning record</button>
      <Link href="/learn/profile">View the formative profile</Link>
      <Link href="/learn/curriculum/discernment">Stop for now · return to Discernment</Link>
    </div>
  </section>;
}
