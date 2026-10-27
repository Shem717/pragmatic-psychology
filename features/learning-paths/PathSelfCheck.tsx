"use client";
import { useState } from "react";
import type { LearningPath } from "@/lib/learning-paths";
import styles from "./LearningPath.module.css";

export function PathSelfCheck({ check }: { check: NonNullable<LearningPath["selfCheck"]> }) {
  const [selected, setSelected] = useState("");
  const option = check.options.find((item) => item.id === selected);
  return <>
    <fieldset className={styles.check}>
      <legend>{check.prompt}</legend>
      {check.options.map((item) => <label key={item.id} className={styles.choice}>
        <input type="radio" name="perspective-fit-self-check" value={item.id} checked={selected === item.id} onChange={() => setSelected(item.id)} />
        <span>{item.text}</span>
      </label>)}
    </fieldset>
    <div className={styles.feedback} role="status" aria-live="polite">
      {option ? <p>{option.feedback}</p> : <p>Choose an interpretation to see its explanation, or continue without answering.</p>}
    </div>
    <p className="fine">A formative check, not a test of your worth or a mastery assessment. Answers are not saved, scored or used to assign a rank.</p>
  </>;
}
