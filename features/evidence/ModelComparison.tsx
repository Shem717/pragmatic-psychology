"use client";
import { useState, type ReactNode } from "react";
import Link from "next/link";
import type { content } from "@/lib/content";

type Model = (typeof content.models)[number];
// Questions operationalize the already-published predictions as editorial
// study-design prompts. They are not observations or validated mechanism tests.
const observationQuestions: Record<string, string> = {
  appraisal: "With the same demand, does a change in perceived coping resources accompany a change in approach? Measure capability separately from confidence.",
  learning: "Does the new response transfer to a different context, or does an earlier response return when context or retrieval cues change?",
  reconsolidation: "Do matched retrieval conditions produce different later responses? Retrieval alone cannot identify reconsolidation; boundary conditions and replication remain decisive.",
  construction: "Do different contexts or learned concepts change the reported experience of bodily signals? Similar behavior alone does not identify a constructionist mechanism.",
};
const rows: { label: string; render: (m: Model) => ReactNode }[] = [
  { label: "What needs explaining?", render: (m) => m.focus },
  { label: "What does it predict?", render: (m) => m.prediction },
  { label: "What observation could help distinguish it?", render: (m) => observationQuestions[m.id] },
  { label: "What would limit the inference?", render: (m) => m.limits },
  { label: "What evidence is available?", render: (m) => m.evidence },
  { label: "Tested in this integrated product?", render: () => "Not assessed." },
  { label: "Where can I inspect the basis?", render: (m) => <div className="model-source-links">{m.sourceIds.map((id) => <Link href={`/evidence/sources#source-${id}`} key={id}>{id}</Link>)}</div> },
];
export function ModelComparison({ models }: { models: Model[] }) {
  const [left, setLeft] = useState(models[0].id);
  const [right, setRight] = useState(models[1].id);
  const [all, setAll] = useState(false);
  const selected = all ? models : [models.find((m) => m.id === left)!, models.find((m) => m.id === right)!];
  return <section className="model-comparison" id="model-comparison" aria-labelledby="model-comparison-title"><div className="research-index-heading"><div><p className="research-eyebrow">02 / ASK THE SAME QUESTIONS</p><h2 id="model-comparison-title">Different accounts. Comparable predictions.</h2></div></div>
    <div className="model-controls"><label>First model<select value={left} disabled={all} onChange={(e) => { if (e.target.value === right) setRight(left); setLeft(e.target.value); }}>{models.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}</select></label><span aria-hidden="true">&</span><label>Second model<select value={right} disabled={all} onChange={(e) => { if (e.target.value === left) setLeft(right); setRight(e.target.value); }}>{models.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}</select></label><button aria-pressed={all} onClick={() => setAll(!all)}>{all ? "Compare a pair" : "Show all four models"}</button></div>
    <p className="research-fine" role="status">{selected.length} models shown. The observation questions are editorial study-design prompts, not validated tests or findings. These accounts need not be mutually exclusive.</p>
    <div className="research-table-scroll" tabIndex={0} role="region" aria-label="Explanatory model comparison; scroll horizontally on small screens"><table className="research-comparison-table model-table"><caption>Compare the same question across explanations. Scroll across to see every selected model.</caption><thead><tr><th scope="col">Shared question</th>{selected.map((m) => <th key={m.id} scope="col">{m.title}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.label}><th scope="row">{row.label}</th>{selected.map((m) => <td key={m.id}>{row.render(m)}</td>)}</tr>)}</tbody></table></div>
  </section>;
}
