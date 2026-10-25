"use client";
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
export function Perspectives({ scenarios }: { scenarios: Scenario[] }) {
  const { draft, set } = useDraft(
    "perspective",
    "perspective",
    "Perspective exploration",
  );
  const { getDraft, setDraft } = useWorkspace();
  const router = useRouter();
  const [hovered, setHovered] = useState<number | null>(null);
  const [mapVisible, setMapVisible] = useState(true);
  const stageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setMapVisible(entry.isIntersecting),
      { rootMargin: "80px" },
    );
    if (stageRef.current) observer.observe(stageRef.current);
    return () => observer.disconnect();
  }, []);
  const [compare, setCompare] = useState(false),
    [error, setError] = useState("");
  const fields = draft?.fields || {};
  const selected =
    scenarios.find((s) => s.id === fields.scenario) || scenarios[0];
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
  return (
    <>
      <div className="instrument-grid perspective-grid">
        <section className="panel map-panel">
          <div className="panel-top">
            <span>01 · PERSPECTIVE FIELD</span>
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
                <i>{String(i + 1).padStart(2, "0")}</i>
                <span>{f.name}</span>
              </button>
            ))}
            <span className="map-caption">
              CONCEPT MAP · NOT A BRAIN SCAN OR MEASURED PATHWAY
            </span>
          </div>
          <div className="map-reading" aria-live="polite" aria-atomic="true">
            <span className="reading-index">{String(frameIndex + 1).padStart(2, "0")}</span>
            <div key={frame.id} className="reading-transition"><span className="small-label">{frame.name} → POSSIBLE ACTION</span><p>{frame.interpretation}</p><strong>↳ {frame.action}</strong></div>
          </div>
        </section>
        <aside className="panel inspector perspective-situation">
          <div className="panel-top">02 · THE SITUATION</div>
          <label>
            Choose a scenario
            <select
              aria-label="Choose a scenario"
              value={selected.id}
              onChange={(e) => changeScenario(e.target.value)}
            >
              {scenarios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </label>
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
      <section className="panel response-strip" aria-live="polite">
        <div className="frame-number">
          {String(frameIndex + 1).padStart(2, "0")}
          <small>/ 04</small>
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
            <div className="small-label">LET REALITY ANSWER</div>
            <h2>What changes with new evidence?</h2>
          </div>
          <button
            disabled={revealed || personal}
            onClick={() => set("revealed", "yes")}
          >
            {revealed ? <>Evidence introduced <Check size={16} aria-hidden="true" /></> : <>Introduce new evidence <ArrowUpRight size={16} aria-hidden="true" /></>}
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
              selected.evidenceUpdates.map((u) => (
                <div key={u.id}>
                  <strong>{u.fact}</strong>
                  <p>{u.interpretation}</p>
                </div>
              ))
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
