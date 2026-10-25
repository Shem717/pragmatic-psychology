import { ArrowUpRight, ArrowRight, Compass, Focus, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { NeuralField, LoopField, OrbitField } from "@/components/Maps";
import { content } from "@/lib/content";
import { ArrivalInstrument } from "@/components/ArrivalInstrument";
export const metadata = { alternates: { canonical: "/" } };
export default function Home() {
  return (
    <>
      <section className="arrival">
        <div className="arrival-copy">
          <span className="eyebrow">
            A WORKSPACE FOR PRACTICAL SELF-GOVERNANCE
          </span>
          <h1>
            See more clearly.{" "}
            <br />
            <em>
              Respond with{" "}
              <br />
              greater freedom.
            </em>
          </h1>
          <p className="arrival-lede">
            Explore the interpretations, learned responses and practical
            capacities that shape how you meet the world. Compare perspectives.
            Test ideas. Follow the evidence.
          </p>
          <div className="actions">
            <Link className="button primary" href="/start">
              Start here <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link className="text-link" href="/evidence">
              Investigate the evidence →
            </Link>
          </div>
          <p className="fine">
            Research-informed education · Original framework under development
          </p>
        </div>
        <ArrivalInstrument scenario={content.scenarios[0]} />
      </section>
      <section className="first-session" aria-labelledby="first-session-title">
        <div><span className="eyebrow">YOUR FIRST FIVE MINUTES</span><h2 id="first-session-title">Leave with a next move.</h2></div>
        <ol><li><Compass size={21} aria-hidden="true" /><span>Choose a situation<small>Start with ordinary life.</small></span></li><li><Focus size={21} aria-hidden="true" /><span>Explore a response<small>One lens is not the whole story.</small></span></li><li><CheckCircle2 size={21} aria-hidden="true" /><span>Save an action<small>Return with what happened.</small></span></li></ol>
        <Link href="/start" className="text-link">Begin the guided session <ArrowUpRight size={17} aria-hidden="true" /></Link>
      </section>
      <div className="arrival-rule">
        <span>THREE INSTRUMENTS. ONE CONTINUING INQUIRY.</span>
        <span>01 — 03</span>
      </div>
      <section className="instrument-gallery" id="method">
        <Link href="/explore/perspectives" className="instrument-preview">
          <div className="preview-visual preview-neural">
            <NeuralField id="preview" />
          </div>
          <div>
            <span className="small-label">01 / THE PERSPECTIVE LABORATORY</span>
            <h2>
              A repertoire.
              <br />
              Not a single lens. ↗
            </h2>
            <p>
              Hold the facts steady. Compare responses. Let new evidence change
              the plan.
            </p>
          </div>
        </Link>
        <Link href="/explore/identity" className="instrument-preview">
          <div className="preview-visual">
            <LoopField />
            <div className="mini-loop">
              {[
                "Identity",
                "Model",
                "Conviction",
                "Rehearsal",
                "Evidence",
                "Revision",
                "Retest",
              ].map((x, i) => (
                <span
                  key={x}
                  style={{
                    transform: `rotate(${i * 51.4}deg) translate(90px) rotate(${-i * 51.4}deg)`,
                  }}
                >
                  <i>{i + 1}</i>
                  {x}
                </span>
              ))}
            </div>
          </div>
          <div>
            <span className="small-label">02 / IDENTITY → COMPETENCE</span>
            <h2>
              Become what you
              <br />
              can demonstrate. ↗
            </h2>
            <p>
              Translate an aspiration into conduct, a field test, and an honest
              revision.
            </p>
          </div>
        </Link>
        <Link href="/evidence" className="instrument-preview" id="evidence">
          <div className="preview-visual">
            <OrbitField />
            <div className="mini-constellation">
              {["Models", "Findings", "Questions", "Limits", "Sources"].map(
                (x, i) => (
                  <span
                    key={x}
                    style={{
                      left: 20 + (i % 3) * 27 + "%",
                      top: 23 + Math.floor(i / 3) * 40 + "%",
                    }}
                  >
                    ✦<small>{x}</small>
                  </span>
                ),
              )}
            </div>
          </div>
          <div>
            <span className="small-label">03 / THE EVIDENCE OBSERVATORY</span>
            <h2>
              Follow the evidence.
              <br />
              Keep questions open. ↗
            </h2>
            <p>
              Trace each claim to its scope, sources, alternatives and
              unresolved questions.
            </p>
          </div>
        </Link>
      </section>
      <section className="editorial-feature">
        <span className="eyebrow">THE WORKING FRAMEWORK</span>
        <h2>
          Understanding is a beginning.
          <br />
          <em>Conduct brings it into the world.</em>
        </h2>
        <p>
          The Sovereignty Method connects truthful interpretation, chosen
          conduct and corrective experience. Components draw on research; the
          added value of the integrated framework remains an open question.
        </p>
        <div className="actions">
          <Link href="/learn/method">Read the current method →</Link>
          <Link href="/learn">Explore the Dominion Curriculum</Link>
        </div>
      </section>
      <section className="panel section-pad current-question">
        <span className="small-label">AN OPEN QUESTION · RQ-09</span>
        <h2>What does integration add?</h2>
        <p>
          Does combining interpretation, rehearsal, action and feedback improve
          outcomes beyond established components? The register preserves the
          question. The website does not pretend the study is complete.
        </p>
        <Link href="/research/RQ-09">Follow this research question ↗</Link>
      </section>
      <section className="library-teaser" id="series">
        <div>
          <span className="eyebrow">WATCH. UNDERSTAND. APPLY.</span>
          <h2>
            Seven videos.
            <br />Useful ideas, put to work.
          </h2>
          <p>
            Find a clear takeaway, see an everyday example, and choose one
            manageable action. Current evidence guides the written practice.
          </p>
        </div>
        <ol>
          {content.videos.map((v) => (
            <li key={v.id}>
              <Link href={"/library/videos/" + v.youtubeId}>
                <span>0{v.episode}</span>
                {v.title}
                <b>↗</b>
              </Link>
            </li>
          ))}
        </ol>
      </section>
      <span id="protocol" />
      <span id="science" />
    </>
  );
}
