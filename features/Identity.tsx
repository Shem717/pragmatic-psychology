"use client";
import { useRef, useState } from "react";
import { safeIndex } from "@/lib/indices";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, Download } from "lucide-react";
import { LoopField, stagePositions } from "@/components/Maps";
import { DraftActions } from "@/components/Workspace";
import { useDraft } from "./useDraft";
import { download, transferSummary, type Observation } from "./notebook-data";
const stages = [
  {
    title: "Chosen identity",
    short: "Identity",
    description:
      "Name a capability you intend to develop. An aspiration is a starting point, not evidence that you already possess a skill.",
    fields: [
      ["identity", "What do you intend to become able to do?"],
      ["why", "Why does this matter?"],
      ["jurisdiction", "What is within your authority?"],
    ],
  },
  {
    title: "Operating model",
    short: "Operating model",
    description:
      "Translate the aspiration into an observable action and a testable prediction. Make the assumptions visible.",
    fields: [
      ["situation", "In which ordinary situation?"],
      ["action", "What observable conduct will you test?"],
      ["prediction", "What do you predict will happen?"],
      ["criterion", "What observation would challenge the prediction?"],
    ],
  },
  {
    title: "Calibrated conviction",
    short: "Conviction",
    description:
      "How strongly you believe something and what evidence supports it are different judgments. The rating is a self-report, not a probability of truth.",
    fields: [["support", "What factual evidence supports your confidence?"]],
  },
  {
    title: "Rehearsed conduct",
    short: "Rehearsal",
    description:
      "Choose a usable format and rehearse one manageable action. No intensity target or repetition count is required.",
    fields: [
      ["rehearsal", "What specific conduct will you rehearse?"],
      ["stopWhen", "When would you stop or modify the rehearsal?"],
    ],
  },
  {
    title: "Corrective evidence",
    short: "Evidence",
    description:
      "Record what actually happened. Imagined practice, role-play and real-world observations stay distinct. Failed and inconclusive results are useful evidence.",
    fields: [],
  },
  {
    title: "Updated self-concept",
    short: "Revision",
    description:
      "Retain what the evidence supports, acknowledge its limits and revise the claim about your capability. Your worth does not depend on one result.",
    fields: [
      ["revision", "What does the evidence support?"],
      ["limits", "What does it not establish?"],
      ["adjustment", "What will you change?"],
    ],
  },
  {
    title: "Iteration",
    short: "Retest",
    description:
      "Choose another context or a later review. One success does not establish durability or general competence.",
    fields: [
      ["nextContext", "What is the next context or test?"],
      ["nextPrediction", "What do you now predict?"],
    ],
  },
];
// A fictional, ordinary example. It never populates or overwrites a personal draft.
const workedExample = [
  "I want to ask for clarification without becoming defensive. I can choose my question and tone, not the other person’s reaction.",
  "At my next routine review, I will ask for one concrete example before explaining. I predict I can finish the question; interrupting before they answer would challenge that prediction.",
  "I have asked a clear question in a low-stakes conversation before. That is limited support, not proof that I can do it under pressure. My baseline in reviews is untested.",
  "I will say aloud: ‘Could you show me one example so I understand?’ Text rehearsal is enough. If practice becomes overwhelming, I will stop and choose a smaller step.",
  "Fictional real-world observation: I asked the question and waited for the answer. My voice shook. The question was completed, but this was one familiar colleague in a quiet setting.",
  "This supports ‘I can ask one clarifying question in this setting,’ not ‘I am always confident.’ Next time I will bring a note so I can follow the answer.",
  "At a later low-stakes review, I will try the same question with another colleague and record whether I finish it. I will keep a failed or inconclusive result rather than relabel it a success.",
];
const fieldExamples: Record<string, string> = {
  identity: "Example: Ask for clarification before defending my work.",
  why: "Example: Understand feedback well enough to choose a useful revision.",
  jurisdiction: "Example: My question, preparation and tone; not their opinion.",
  situation: "Example: A routine review of a draft with a colleague.",
  action: "Example: Ask for one concrete example and let them finish.",
  prediction: "Example: I will finish my question even if I feel awkward.",
  criterion: "Example: I interrupt or abandon the question before it is clear.",
  support: "Example: I have done this in a casual conversation, not yet in a review.",
  rehearsal: "Example: Say the question aloud once, or write it on a note.",
  stopWhen: "Example: Stop if practice becomes overwhelming; choose a smaller step.",
  revision: "Example: I asked clearly in this setting while still feeling nervous.",
  limits: "Example: One result does not establish confidence in every context.",
  adjustment: "Example: Bring a note to help me listen to the answer.",
  nextContext: "Example: A later, low-stakes review with another colleague.",
  nextPrediction: "Example: I can ask the same question and record what happens.",
  testPrediction: "Example: I will ask for an example before explaining myself.",
  actual: "Example: I asked and waited. My voice shook, but I finished.",
  context: "Example: A familiar colleague, quiet setting, one observation only.",
  unintended: "Example: I was distracted by checking whether I sounded calm.",
};
export function Identity() {
  const { draft, set, update } = useDraft(
    "identity",
    "identity",
    "Identity-to-Competence plan",
  );
  const f = draft?.fields || {};
  const stage = safeIndex(f.stage, 7);
  const current = stages[stage] || stages[0];
  const [error, setError] = useState("");
  const errorRef = useRef<HTMLParagraphElement>(null);
  const valid = () => {
    if (
      stage === 2 &&
      f.conviction !== undefined &&
      f.conviction !== "" &&
      (!Number.isFinite(Number(f.conviction)) ||
        Number(f.conviction) < 0 ||
        Number(f.conviction) > 100)
    ) {
      setError(
        "Enter a self-reported conviction from 0 to 100, or leave it blank. Your other work is preserved.",
      );
      setTimeout(() => errorRef.current?.focus(), 0);
      return false;
    }
    return true;
  };
  const move = (n: number) => {
    if (valid()) {
      set("stage", String(n));
      setError("");
    }
  };
  const addObservation = () => {
    if (!f.actual?.trim()) {
      setError(
        "Describe the observed outcome before adding an observation. A draft can still be saved.",
      );
      return;
    }
    const o: Observation = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      type: (f.testType || "imagined") as Observation["type"],
      outcome: (f.outcome || "inconclusive") as Observation["outcome"],
      prediction: f.testPrediction || f.prediction || "",
      actual: f.actual,
      context: f.context || "",
      unintended: f.unintended || "",
    };
    update((d) => ({
      ...d,
      observations: [...d.observations, o],
      fields: { ...d.fields, actual: "", context: "", unintended: "" },
    }));
    setError("");
  };
  return (
    <>
      <details className="worked-example identity-example">
        <summary>See a complete example: responding to feedback</summary>
        <p className="fine">Fictional learning example, not an outcome promised to you. Reading it does not change your draft.</p>
        <ol className="example-steps">
          {stages.map((s, i) => (
            <li key={s.short}><strong>{s.title}</strong><p>{workedExample[i]}</p></li>
          ))}
        </ol>
      </details>
      <div className="instrument-grid identity-grid">
        <section className="panel identity-map">
          <div className="panel-top">
            <span>01 · THE CONTINUING LOOP</span>
            <span>ASPIRATION · OBSERVATION</span>
          </div>
          <div className="loop-stage" role="group" aria-label="Identity practice stages">
            <LoopField active={stage} />
            <div className="loop-center">
              <span>{String(stage + 1).padStart(2, "0")} / 07 · {current.short.toUpperCase()}</span>
              <strong>
                Belief, tested
                <br />
                by conduct.
              </strong>
              <small>Conceptual sequence · not a neural pathway</small>
            </div>
            {stages.map((s, i) => (
              <button
                key={s.short}
                className="stage-node"
                aria-label={`Stage ${i + 1}: ${s.title}`}
                aria-pressed={i === stage}
                onClick={() => move(i)}
                style={{
                  left: `clamp(54px, ${stagePositions[i][0]}%, calc(100% - 54px))`,
                  top: stagePositions[i][1] + "%",
                }}
              >
                <span className="orb">{String(i + 1).padStart(2, "0")}</span>
                <span>{s.short}</span>
              </button>
            ))}
          </div>
          <div className="map-footer">
            You may revisit any stage. Completing the sequence does not certify
            competence.
          </div>
        </section>
        <aside className="panel inspector stage-inspector">
          <div className="panel-top">
            <span>02 · STAGE INSPECTOR</span>
            <span>{String(stage + 1).padStart(2, "0")} / 07</span>
          </div>
          <span className="badge">
            {stage === 4
              ? "OBSERVATION"
              : stage === 2
                ? "SELF-REPORT"
                : "WORKING DRAFT"}
          </span>
          <h2>{current.title}</h2>
          <p>{current.description}</p>
          <details className="stage-example">
            <summary>Example for this stage</summary>
            <p>{workedExample[stage]}</p>
          </details>
          {current.fields.map(([key, label]) => (
            <label key={key}>
              {label}
              <textarea
                aria-label={label}
                placeholder={fieldExamples[key]}
                rows={3}
                maxLength={10000}
                value={f[key] || ""}
                onChange={(e) => set(key, e.target.value)}
              />
            </label>
          ))}
          {stage === 2 && (
            <>
              <label>
                Subjective conviction (optional, 0–100)
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={f.conviction || ""}
                  onChange={(e) => {
                    set("conviction", e.target.value);
                    setError("");
                  }}
                  aria-describedby="confidence-help identity-error"
                  aria-invalid={!!error}
                />
              </label>
              <p id="confidence-help" className="fine">
                A self-report of belief strength. It is not a skill score.
              </p>
              <label>
                Factual support
                <select
                  aria-label="Factual support"
                  value={f.supportLevel || "unknown"}
                  onChange={(e) => set("supportLevel", e.target.value)}
                >
                  {["unknown", "limited", "mixed", "substantial"].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
              <label>
                Baseline performance
                <select
                  aria-label="Baseline performance"
                  value={f.baseline || "not tested"}
                  onChange={(e) => set("baseline", e.target.value)}
                >
                  <option>not tested</option>
                  <option>observed</option>
                </select>
              </label>
              {Number(f.conviction) > 80 && f.baseline !== "observed" && (
                <p className="callout">
                  What supports a strong expectation before a field observation?
                  You can hold the aspiration while leaving demonstrated ability
                  untested.
                </p>
              )}
            </>
          )}
          {stage === 3 && (
            <label>
              Rehearsal format
              <select
                aria-label="Rehearsal format"
                value={f.format || "text"}
                onChange={(e) => set("format", e.target.value)}
              >
                {["text", "imagery", "role-play", "behavioral planning"].map(
                  (x) => (
                    <option key={x}>{x}</option>
                  ),
                )}
              </select>
            </label>
          )}
          {stage === 4 && (
            <>
              <label>
                Test type
                <select
                  aria-label="Test type"
                  value={f.testType || "imagined"}
                  onChange={(e) => set("testType", e.target.value)}
                >
                  <option value="imagined">Imagined</option>
                  <option value="role-play">Role-play</option>
                  <option value="real-world">Real-world</option>
                </select>
              </label>
              <label>
                Outcome
                <select
                  aria-label="Outcome"
                  value={f.outcome || "inconclusive"}
                  onChange={(e) => set("outcome", e.target.value)}
                >
                  <option value="inconclusive">Inconclusive</option>
                  <option value="observed">Observed conduct</option>
                  <option value="failed">
                    Failed / did not meet criterion
                  </option>
                </select>
              </label>
              {[
                ["testPrediction", "Predicted outcome"],
                ["actual", "What actually happened?"],
                ["context", "Context and limitations"],
                ["unintended", "Unintended or unwanted effects"],
              ].map(([key, label]) => (
                <label key={key}>
                  {label}
                  <textarea
                    aria-label={label}
                    placeholder={fieldExamples[key]}
                    rows={2}
                    value={f[key] || ""}
                    onChange={(e) => set(key, e.target.value)}
                  />
                </label>
              ))}
              <button className="primary" onClick={addObservation}>
                Add observation
              </button>
            </>
          )}
          {stage === 6 && (
            <label>
              Optional review date
              <input
                type="date"
                value={f.reviewDate || ""}
                onChange={(e) => set("reviewDate", e.target.value)}
              />
              <span className="fine">
                A note for you. No notification service is enabled.
              </span>
            </label>
          )}
          <p id="identity-error" ref={errorRef} tabIndex={-1} role="alert">
            {error}
          </p>
          <div className="actions">
            <button
              aria-label="Previous stage"
              disabled={stage === 0}
              onClick={() => move(stage - 1)}
            >
              <ArrowLeft size={16} aria-hidden="true" /> Previous
            </button>
            <button disabled={stage === 6} onClick={() => move(stage + 1)}>
              Next stage <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
          <DraftActions draftKey="identity" />
        </aside>
      </div>
      <section className="panel transfer-strip">
        <div className="strip-icon"><ArrowUpRight aria-hidden="true" /></div>
        <div>
          <div className="eyebrow">THE REAL-WORLD TEST</div>
          <h2>
            Rehearsal is a hypothesis.
            <br />
            Conduct is evidence.
          </h2>
          <p role="status">
            {draft
              ? transferSummary(draft)
              : "Real-world transfer: not yet tested."}
          </p>
        </div>
        <div className="actions">
          <button disabled={!draft} onClick={() => draft && download([draft])}>
            Export plan <Download size={16} aria-hidden="true" />
          </button>
          <button
            disabled={!draft}
            onClick={() => draft && download([draft], true)}
          >
            Readable export <Download size={16} aria-hidden="true" />
          </button>
        </div>
      </section>
      <section className="panel section-pad">
        <div className="small-label">OBSERVATION LOG</div>
        <h2>Keep the outcomes distinct.</h2>
        {!draft?.observations.length ? (
          <p>No observations recorded. The plan remains aspirational.</p>
        ) : (
          draft.observations.map((o) => (
            <article className="observation" key={o.id}>
              <span className="badge">
                {o.type} · {o.outcome}
              </span>
              <span className="fine">
                {" "}
                {new Date(o.date).toLocaleDateString()}
              </span>
              <h3>{o.actual}</h3>
              <dl>
                <dt>Predicted</dt>
                <dd>{o.prediction || "Not recorded"}</dd>
                <dt>Context / limits</dt>
                <dd>{o.context || "Not recorded"}</dd>
                <dt>Unintended effects</dt>
                <dd>{o.unintended || "Not recorded"}</dd>
              </dl>
            </article>
          ))
        )}
        <Link href="/evidence/claims/identity">
          What supports this learning architecture? <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </section>
    </>
  );
}
