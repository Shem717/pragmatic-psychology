"use client";
import { resolvePerspectiveScenario, patchPerspectiveField } from "@/lib/perspective-scenarios";
import type { RelationalScenario } from "@/lib/relational-scenarios";
import { romanNumeral } from "@/lib/presentation";
import { useState, useRef, useEffect } from "react";
import { safeIndex } from "@/lib/indices";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Scenario } from "@/lib/content";
import { NeuralField } from "@/components/Maps";
import { DraftActions, useWorkspace } from "@/components/Workspace";
import { useDraft } from "./useDraft";
import { download } from "./notebook-data";
const positions = [
  [25, 23],
  [76, 30],
  [24, 73],
  [76, 79],
];
export function Perspectives({ scenarios, legacyScenarios }: { scenarios: RelationalScenario[]; legacyScenarios: Scenario[] }) {
  const { draft, update } = useDraft(
    "perspective",
    "perspective",
    "Perspective exploration",
  );
  const { getDraft, setDraft } = useWorkspace();
  const router = useRouter();
  const [hovered, setHovered] = useState<number | null>(null);
  const [mapVisible, setMapVisible] = useState(true);
  const stageRef = useRef<HTMLDivElement>(null);
  const [compare, setCompare] = useState(false),
    [error, setError] = useState("");
  const [safetyMode, setSafetyMode] = useState(false);
  const safetyHeading = useRef<HTMLHeadingElement>(null);
  const safetyButton = useRef<HTMLButtonElement>(null);
  const fields = draft?.fields || {};
  const resolution = resolvePerspectiveScenario(draft, scenarios, legacyScenarios);
  const selected = resolution.scenario;
  const selectedContext = scenarios.find((scenario) => scenario.id === selected.id);
  const set = (field: string, value: string) => update((record) => patchPerspectiveField(record, selected.id, field, value));
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setMapVisible(entry.isIntersecting),
      { rootMargin: "80px" },
    );
    if (stageRef.current) observer.observe(stageRef.current);
    return () => observer.disconnect();
  }, [safetyMode, resolution.kind]);
  const frameIndex = safeIndex(fields.frame, selected.frames.length);
  const frame = selected.frames[frameIndex] || selected.frames[0];
  const revealed = fields.revealed === "yes";
  const personal = fields.personal === "yes";
  const pick = (i: number) => set("frame", String(i));
  const changeScenario = (id: string) => {
    set("scenario", id);
    set("frame", "0");
    set("revealed", "");
    set("compareA", "0");
    set("compareB", "1");
    set("choice", "");
  };
  function transfer() {
    if (!fields.action?.trim()) {
      setError(
        "Name one observable action before continuing. Your other entries are preserved.",
      );
      return;
    }
    getDraft("identity", "identity", "Identity-to-Competence plan");
    setDraft("identity", (d) => ({
      ...d,
      fields: {
        ...d.fields,
        identity: fields.action,
        action: fields.action,
        prediction: fields.prediction || "",
        criterion: fields.switchWhen || "",
      },
    }));
    router.push("/explore/identity");
  }
  if (safetyMode) return <section className="panel section-pad relational-safety-view">
    <span className="eyebrow">SAFETY BEFORE REFRAMING</span><h2 ref={safetyHeading} tabIndex={-1}>You do not need a different perspective to deserve safety.</h2>
    <p>If there are threats, intimidation, coercive control, stalking, sexual pressure or violence, this is not simply a perspective problem. Prioritize safety and confidential support from a trusted person or appropriate local specialist service. You do not owe confrontation, reconciliation or a more generous interpretation.</p>
    <p>If there is immediate danger, contact local emergency services when safe. Consider whether this device or browsing history may be monitored before seeking support online.</p>
    <p><a href="https://www.nhs.uk/live-well/getting-help-for-domestic-violence/" target="_blank" rel="noopener">NHS guidance on recognizing abuse and getting support <ArrowUpRight size={15} aria-hidden="true" /><span className="sr-only"> (new tab)</span></a></p><p className="fine">This resource describes UK services; elsewhere, use appropriate local support. This website is not an emergency or clinical service. No disclosure or exercise is required. Your existing entries have not been cleared.</p>
    <div className="actions"><button onClick={() => { setSafetyMode(false); requestAnimationFrame(() => safetyButton.current?.focus()); }}>Return to the examples</button><Link href="/">Leave the exercise</Link></div>
  </section>;
  if (resolution.kind === "unavailable") return <section className="panel section-pad"><h2>Your saved example is unavailable.</h2><p>The saved scenario ID is not in this edition. Your entries remain intact; they have not been assigned to a different situation.</p><label>Choose a new example to continue<select value="" onChange={(event) => changeScenario(event.target.value)}><option value="" disabled>Choose deliberately</option>{scenarios.map((scenario) => <option key={scenario.id} value={scenario.id}>{scenario.title}</option>)}</select></label><p className="fine">Choosing an example keeps your written plan; review whether it still fits.</p><button disabled={!draft} onClick={() => draft && download([draft])}>Export the unchanged saved exploration</button></section>;
  return (
    <>
      <section className="relational-orientation" aria-label="About these examples"><p><strong>Ordinary relationships. More than one possible response.</strong> These seven fictional examples explore recurring themes in public help-seeking discussions—not personal case histories, diagnoses or a prevalence survey. A different lens must not excuse mistreatment.</p><button ref={safetyButton} className="relational-safety-button" onClick={() => { setSafetyMode(true); requestAnimationFrame(() => safetyHeading.current?.focus()); }}>Threats, control or harm? Put safety first <ArrowUpRight size={15} aria-hidden="true" /></button></section>
      <div className="instrument-grid perspective-grid">
        <section className="panel map-panel">
          <div className="panel-top">
            <span>I · PERSPECTIVE FIELD</span>
            <span>SELECT A LENS</span>
          </div>
          <div className="perspective-stage" ref={stageRef} role="group" aria-label="Choose a perspective">
            <NeuralField
              active={frameIndex}
              hovered={hovered}
              visible={mapVisible}
            />
            <div className="event-core">
              <span>THE SAME EVENT</span>
              <strong>
                {personal ? "Your ordinary situation" : selected.title}
              </strong>
            </div>
            {selected.frames.map((f, i) => (
              <button
                className="frame-node"
                key={f.id}
                style={{
                  left: positions[i][0] + "%",
                  top: positions[i][1] + "%",
                }}
                aria-pressed={frameIndex === i}
                onClick={() => pick(i)}
                onPointerEnter={() => setHovered(i)}
                onPointerLeave={(e) =>
                  setHovered(
                    document.activeElement === e.currentTarget ? i : null,
                  )
                }
                onFocus={() => setHovered(i)}
                onBlur={() => setHovered(null)}
              >
                <i aria-hidden="true">{romanNumeral(i + 1)}</i>
                <span>{f.name}</span>
              </button>
            ))}
            <span className="map-caption">
              CONCEPT MAP · NOT A BRAIN SCAN OR MEASURED PATHWAY
            </span>
          </div>
          <div className="map-reading" aria-live="polite" aria-atomic="true">
            <span className="reading-index">{romanNumeral(frameIndex + 1)}</span>
            <div key={frame.id} className="reading-transition"><span className="small-label">{frame.name} · POSSIBLE ACTION</span><p>{frame.interpretation}</p><strong>Next: {frame.action}</strong></div>
          </div>
        </section>
        <aside className="panel inspector perspective-situation">
          <div className="panel-top">II · THE SITUATION</div>
          <label>
            Choose a scenario
            <select
              aria-label="Choose a scenario"
              value={selected.id}
              onChange={(e) => changeScenario(e.target.value)}
            >
              {resolution.kind === "legacy" && <optgroup label="Earlier saved example"><option value={selected.id}>{selected.title} — retained for your notes</option></optgroup>}
              {Array.from(new Set(scenarios.map((scenario) => scenario.group))).map((group) => <optgroup key={group} label={group}>{scenarios.filter((scenario) => scenario.group === group).map((scenario) => <option key={scenario.id} value={scenario.id}>{scenario.title}</option>)}</optgroup>)}
            </select>
          </label>
          {resolution.kind === "legacy" && <p className="relational-legacy-note">This earlier example is retained because your saved exploration used it. New examples have different IDs; your original context and notes have not been rewritten.</p>}
          <p className="fine">Changing the example keeps your written plan. Review whether your existing entries still fit.</p>
          <label className="check-label">
            <input
              type="checkbox"
              checked={personal}
              onChange={(e) => set("personal", e.target.checked ? "yes" : "")}
            />{" "}
            Use my own ordinary situation
          </label>
          {personal ? (
            <>
              <label>
                Situation (optional, 500 characters)
                <textarea
                  aria-label="Situation (optional, 500 characters)"
                  maxLength={500}
                  value={fields.situation || ""}
                  onChange={(e) => set("situation", e.target.value)}
                />
              </label>
              <p className="fine">
                Avoid identifying details. The map’s sample frames remain
                educational examples.
              </p>
              <label>
                Observed facts
                <textarea
                  aria-label="Observed facts"
                  value={fields.facts || ""}
                  onChange={(e) => set("facts", e.target.value)}
                />
              </label>
              <label>
                Assumptions / unknowns
                <textarea
                  aria-label="Assumptions / unknowns"
                  value={fields.unknowns || ""}
                  onChange={(e) => set("unknowns", e.target.value)}
                />
              </label>
            </>
          ) : (
            <>
              <blockquote>{selected.facts.join(" ")}</blockquote>
              {selectedContext && <div className="relational-first-reading"><span className="small-label">ONE POSSIBLE FIRST READING — NOT A FACT</span><p>{selectedContext.interpretation}</p><span className="small-label">POSSIBLE FEELING OR URGE</span><p>{selectedContext.emotionUrge}</p></div>}
              <div className="small-label">WHAT REMAINS UNKNOWN</div>
              <ul>
                {selected.unknowns.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </>
          )}
          <div className="appraisals">
            <div className="small-label">TWO DISTINCT APPRAISALS</div>
            <label>
              Perceived threat
              <select
                aria-label="Perceived threat"
                value={fields.threat || "unknown"}
                onChange={(e) => set("threat", e.target.value)}
              >
                <option value="unknown">Unknown</option>
                <option value="low">Low</option>
                <option value="uncertain">Uncertain</option>
                <option value="substantial">Substantial</option>
              </select>
            </label>
            <label>
              Perceived coping resources
              <select
                aria-label="Perceived coping resources"
                value={fields.coping || "unknown"}
                onChange={(e) => set("coping", e.target.value)}
              >
                <option value="unknown">Unknown</option>
                <option value="limited">Limited</option>
                <option value="uncertain">Uncertain</option>
                <option value="available">Available</option>
              </select>
            </label>
            <p className="fine">
              Separate self-described judgments. No calculated anxiety or
              predicted physiology.
            </p>
            <details>
              <summary>What else matters?</summary>
              <p>
                Actual danger, fatigue, health, context, past learning,
                practical resources and other people’s support can all matter.
              </p>
            </details>
          </div>
        </aside>
      </div>
      {selectedContext?.resources?.length ? <aside className="relational-resources"><span className="small-label">IF USEFUL, TAKE THIS FURTHER</span><div className="section-links">{selectedContext.resources.map((resource) => <Link key={resource.href} href={resource.href}>{resource.label} <ArrowUpRight size={15} aria-hidden="true" /></Link>)}</div><p className="fine">Optional educational resources—not a required sequence or a promise of relief. If anxiety or loneliness is persistent or interfering with everyday life, qualified support may be useful.</p></aside> : null}
      <section className="panel response-strip" aria-live="polite">
        <div className="frame-number">
          {romanNumeral(frameIndex + 1)}
          <small>/ IV</small>
        </div>
        <div>
          <span className="small-label">ACTIVE PERSPECTIVE</span>
          <h2>{frame.name}</h2>
          <p>{frame.interpretation}</p>
          <div className="actions">
            <button
              aria-label="Previous perspective"
              disabled={frameIndex === 0}
              onClick={() => pick(frameIndex - 1)}
            >
              <ArrowLeft size={18} aria-hidden="true" />
            </button>
            <button
              aria-label="Next perspective"
              disabled={frameIndex === 3}
              onClick={() => pick(frameIndex + 1)}
            >
              <ArrowRight size={18} aria-hidden="true" />
            </button>
            <button
              aria-expanded={compare}
              onClick={() => setCompare(!compare)}
            >
              {compare ? "Close comparison" : "Compare any two perspectives"} <ArrowUpRight size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
        <div>
          <span className="small-label">A PRACTICAL NEXT MOVE</span>
          <p>{frame.action}</p>
          <span className="small-label">RECONSIDER WHEN</span>
          <p>{frame.switchWhen}</p>
          <details>
            <summary>Evidence for and against this lens</summary>
            <h3>Supports</h3>
            <ul>
              {frame.supports.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
            <h3>Challenges</h3>
            <ul>
              {frame.challenges.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </details>
        </div>
        <div>
          <span className="small-label">THE BOUNDARY</span>
          <p>{frame.ethicalBoundary}</p>
          <span className="badge">
            {selected.scope === "hypothetical-danger"
              ? "Hypothetical danger · no confrontation exercise"
              : "Educational example"}
          </span>
        </div>
      </section>
      {compare && (
        <section className="panel section-pad">
          <h2>Two lenses, the same facts.</h2>
          <div className="comparison-grid">
            {["compareA", "compareB"].map((key, k) => {
              const index = safeIndex(fields[key], selected.frames.length, k);
              const f = selected.frames[index];
              return (
                <article key={key}>
                  <label>
                    Comparison {k + 1}
                    <select
                      aria-label={`Comparison ${k + 1}`}
                      value={index}
                      onChange={(e) => set(key, e.target.value)}
                    >
                      {selected.frames.map((x, i) => (
                        <option
                          disabled={
                            i ===
                            safeIndex(
                              fields[k === 0 ? "compareB" : "compareA"],
                              selected.frames.length,
                              1 - k,
                            )
                          }
                          key={x.id}
                          value={i}
                        >
                          {x.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <h3>{f.name}</h3>
                  <p>{f.interpretation}</p>
                  <h4>Action</h4>
                  <p>{f.action}</p>
                  <h4>Reconsider when</h4>
                  <p>{f.switchWhen}</p>
                  <h4>Ethical boundary</h4>
                  <p>{f.ethicalBoundary}</p>
                </article>
              );
            })}
          </div>
        </section>
      )}
      <section className="panel evidence-update section-pad">
        <div className="split-heading">
          <div>
            <div className="small-label">{selectedContext ? "TEST THE INTERPRETATION" : "LET REALITY ANSWER"}</div>
            <h2>What changes with new evidence?</h2>
          </div>
          <button
            disabled={revealed || personal}
            onClick={() => set("revealed", "yes")}
          >
            {revealed ? <>Examples revealed <Check size={16} aria-hidden="true" /></> : <>{selectedContext ? "Reveal possible developments" : "Introduce new evidence"} <ArrowUpRight size={16} aria-hidden="true" /></>}
          </button>
        </div>
        {personal ? (
          <p>
            The curated evidence branch belongs to the selected example. Record
            your own observations in the plan below.
          </p>
        ) : (
          <div role="status">
            {revealed ? (
              <>{selectedContext && <p className="fine">These are separate fictional possibilities, not predictions or a single sequence of events. Consider how each would change your response.</p>}{selected.evidenceUpdates.map((u, index) => (
                <div key={u.id}>
                  {selectedContext && <span className="small-label">POSSIBILITY {romanNumeral(index + 1)}</span>}
                  <strong>{u.fact}</strong>
                  <p>{u.interpretation}</p>
                </div>
              ))}</>
            ) : (
              <p>
                A useful perspective remains open to correction. Revealing
                evidence will preserve your choices.
              </p>
            )}
          </div>
        )}
      </section>
      <section className="panel section-pad perspective-action-plan" id="action-plan">
        <div className="eyebrow">FROM INTERPRETATION TO CONDUCT</div>
        <h2>Choose your next move.</h2>
        <div className="form-grid">
          <label>
            Preferred response
            <select
              aria-label="Preferred response"
              value={fields.choice || ""}
              onChange={(e) => set("choice", e.target.value)}
            >
              <option value="">Still considering</option>
              {selected.frames.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
              <option value="need-information">Need more information</option>
            </select>
          </label>
          <label>
            One feasible action
            <textarea
              aria-label="One feasible action"
              value={fields.action || ""}
              onChange={(e) => {
                set("action", e.target.value);
                setError("");
              }}
              aria-describedby={error ? "perspective-error" : undefined}
            />
          </label>
          <label>
            Predicted result
            <textarea
              aria-label="Predicted result"
              value={fields.prediction || ""}
              onChange={(e) => set("prediction", e.target.value)}
            />
          </label>
          <label>
            What would change this plan?
            <textarea
              aria-label="What would change this plan?"
              value={fields.switchWhen || ""}
              onChange={(e) => set("switchWhen", e.target.value)}
            />
          </label>
        </div>
        <p id="perspective-error" role="alert">
          {error}
        </p>
        <DraftActions draftKey="perspective" />
        <div className="actions">
          <button disabled={!draft} onClick={() => draft && download([draft])}>
            Export this exploration <Download size={16} aria-hidden="true" />
          </button>
          <button className="primary" onClick={transfer}>
            Continue with this plan <ArrowRight size={16} aria-hidden="true" />
          </button>
          <Link href="/evidence/claims/flexibility">
            Inspect the underlying model <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <p className="fine">
          A chosen response is an intention. Demonstrated conduct needs an
          observation.
        </p>
      </section>
    </>
  );
}
