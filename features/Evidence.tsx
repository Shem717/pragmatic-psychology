"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { isRetiredClaim } from "@/lib/claim-status";
import type { Claim } from "@/lib/content";
import { OrbitField } from "@/components/Maps";
const positions = Array.from({ length: 11 }, (_, i) => {
  const a = (i * 2 * Math.PI) / 11 - Math.PI / 2;
  return [50 + Math.cos(a) * 36, 50 + Math.sin(a) * 38];
});
export function Evidence({ claims }: { claims: Claim[] }) {
  const [q, setQ] = useState(""),
    [kind, setKind] = useState("all"),
    [population, setPopulation] = useState("all"),
    [confidence, setConfidence] = useState("all"),
    [selected, setSelected] = useState(claims[0].id),
    [compare, setCompare] = useState<string[]>([]);
  const ready = useRef(false);
  useEffect(() => {
    const read = () => {
      const p = new URLSearchParams(location.search);
      setQ(p.get("q") || "");
      setKind(p.get("kind") || "all");
      setPopulation(p.get("population") || "all");
      setConfidence(p.get("confidence") || "all");
    };
    read();
    ready.current = true;
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, []);
  useEffect(() => {
    if (!ready.current) return;
    const t = setTimeout(() => {
      const p = new URLSearchParams();
      if (q) p.set("q", q);
      if (kind !== "all") p.set("kind", kind);
      if (population !== "all") p.set("population", population);
      if (confidence !== "all") p.set("confidence", confidence);
      const url = location.pathname + (p.size ? "?" + p : "");
      if (url !== location.pathname + location.search)
        history.replaceState(null, "", url);
    }, 200);
    return () => clearTimeout(t);
  }, [q, kind, population, confidence]);
  const visible = claims.filter(
    (c) =>
      !isRetiredClaim(c) &&
      (kind === "all" || c.kind === kind) &&
      (population === "all" || c.population === population) &&
      (confidence === "all" || c.confidence === confidence) &&
      `${c.title} ${c.statement} ${c.researchQuestionIds.join(" ")}`
        .toLowerCase()
        .includes(q.trim().toLowerCase()),
  );
  const active = visible.find((c) => c.id === selected) || visible[0];
  const compared = claims.filter(
    (c) => !isRetiredClaim(c) && compare.includes(c.id),
  );
  const clear = () => {
    setQ("");
    setKind("all");
    setPopulation("all");
    setConfidence("all");
  };
  return (
    <>
      <div className="evidence-tools">
        <label className="search-label">
          Search claims
          <input
            type="search"
            placeholder="Memory, imagery, microbiome…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
        <label>
          Evidence type
          <select
            aria-label="Evidence type"
            value={kind}
            onChange={(e) => setKind(e.target.value)}
          >
            <option value="all">All types</option>
            {Array.from(new Set(claims.map((c) => c.kind))).map((x) => (
              <option key={x} value={x}>
                {x.replaceAll("-", " ")}
              </option>
            ))}
          </select>
        </label>
        <label>
          Population / context
          <select
            aria-label="Population / context"
            value={population}
            onChange={(e) => setPopulation(e.target.value)}
          >
            <option value="all">All contexts</option>
            {Array.from(new Set(claims.map((c) => c.population))).map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label>
          Confidence
          <select
            aria-label="Confidence"
            value={confidence}
            onChange={(e) => setConfidence(e.target.value)}
          >
            <option value="all">All levels</option>
            {Array.from(new Set(claims.map((c) => c.confidence))).map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <span role="status">{visible.length} claims</span>
      </div>
      <div className="instrument-grid evidence-grid">
        <section className="panel">
          <div className="panel-top">
            <span>01 · THE EVIDENCE LANDSCAPE</span>
            <span>SELECT TO INVESTIGATE</span>
          </div>
          <div className="constellation-stage">
            <OrbitField activePosition={active ? positions[claims.indexOf(active)] : undefined} />
            <div className="constellation-center">
              <span>THE OPEN QUESTION</span>
              <strong>
                What enables
                <br />
                lasting change?
              </strong>
            </div>
            {visible.map((c) => {
              const i = claims.indexOf(c);
              return (
                <button
                  key={c.id}
                  className="evidence-node"
                  data-kind={c.kind}
                  style={{
                    left: `clamp(50px, ${positions[i][0]}%, calc(100% - 50px))`,
                    top: positions[i][1] + "%",
                  }}
                  aria-pressed={active?.id === c.id}
                  onClick={() => setSelected(c.id)}
                >
                  <i aria-hidden="true">
                    {c.population === "Animal"
                      ? "◇"
                      : c.kind === "research-hypothesis"
                        ? "△"
                        : "○"}
                  </i>
                  <span>{c.title}</span>
                </button>
              );
            })}
          </div>
          <div className="map-footer">
            Distance, position and size organize reading. They do not encode
            truth, effect strength or causal influence.
          </div>
        </section>
        {active ? (
          <aside className="panel inspector claim-inspector">
            <div className="panel-top">02 · CLAIM INSPECTOR</div>
            <span className="badge">{active.kind.replaceAll("-", " ")}</span>
            <h2>{active.shortTitle}</h2>
            <p>{active.statement}</p>
            <span className="small-label">WHAT THIS DOES NOT ESTABLISH</span>
            <p>{active.limitations[0]}</p>
            <div className="source-note">
              <span className="small-label">FOLLOW THE EVIDENCE</span>
              <Link href={"/evidence/claims/" + active.slug}>
                Scope, sources & counterevidence
              </Link>
              <p>
                {active.population} · {active.confidence} confidence
              </p>
              <p className="fine">
                {active.researchQuestionIds.join(" / ")} · Reviewed{" "}
                {active.reviewedAt}
              </p>
            </div>
          </aside>
        ) : (
          <aside className="panel inspector">
            <h2>No matching claims.</h2>
            <p>Change the search or filters to inspect a record.</p>
            <button onClick={clear}>Clear filters</button>
          </aside>
        )}
      </div>
      <section className="panel claim-index">
        <div className="panel-top">
          <span>COMPLETE CLAIM INDEX · MAP ALTERNATIVE</span>
          <span>COMPARE UP TO THREE</span>
        </div>
        {!visible.length ? (
          <p className="section-pad">
            No matching records. <button onClick={clear}>Clear filters</button>
          </p>
        ) : (
          visible.map((c, i) => (
            <div className="claim-row" key={c.id}>
              <button
                className="claim-open"
                onClick={() => setSelected(c.id)}
                aria-pressed={active?.id === c.id}
              >
                <span className="claim-id">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>
                  {c.title}
                  <small>
                    {c.kind.replaceAll("-", " ")} · {c.population}
                  </small>
                </span>
              </button>
              <Link
                href={"/evidence/claims/" + c.slug}
                aria-label={"Read " + c.title}
              >
                Read
              </Link>
              <label className="check-label">
                <input
                  type="checkbox"
                  checked={compare.includes(c.id)}
                  disabled={!compare.includes(c.id) && compare.length === 3}
                  onChange={(e) =>
                    setCompare(
                      e.target.checked
                        ? [...compare, c.id]
                        : compare.filter((x) => x !== c.id),
                    )
                  }
                />{" "}
                Compare
              </label>
            </div>
          ))
        )}
      </section>
      {compared.length > 0 && (
        <section className="panel section-pad">
          <h2>Compare the scope.</h2>
          <p>
            {compared.length === 1
              ? "Choose another claim to compare."
              : "Read each proposition on its own terms."}
          </p>
          <div
            className="comparison-grid"
            style={{
              gridTemplateColumns: `repeat(${Math.min(compared.length, 3)}, minmax(0,1fr))`,
            }}
          >
            {compared.map((c) => (
              <article key={c.id}>
                <h3>{c.title}</h3>
                <span className="badge">{c.kind.replaceAll("-", " ")}</span>
                <h4>Scope</h4>
                <p>{c.scope}</p>
                <h4>Confidence rationale</h4>
                <p>{c.confidenceRationale}</p>
                <h4>Limit</h4>
                <p>{c.limitations.join(" ")}</p>
                <h4>Integrated product outcome</h4>
                <p>Not assessed.</p>
                <Link href={"/evidence/claims/" + c.slug}>
                  Inspect sources
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}
      <div className="section-links">
        <Link href="/evidence/models">Compare explanatory models</Link>
        <Link href="/research">Open the research register</Link>
        <Link href="/evidence/sources">Explore the sources</Link>
      </div>
    </>
  );
}
