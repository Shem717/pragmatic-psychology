import { ArrowUpRight, ArrowRight, Compass, Focus, CheckCircle2 } from "lucide-react";
import Link from "next/link";

import { content } from "@/lib/content";
import { ArrivalInstrument } from "@/components/ArrivalInstrument";
export const metadata = { alternates: { canonical: "/" } };
export default function Home() {
  return (
    <div className="epic-home">
      <section className="sovereign-hero" aria-labelledby="hero-title">
        <div className="hero-world" aria-hidden="true" />
        <div className="hero-atmosphere" aria-hidden="true"><i /><i /><i /></div>
        <div className="hero-copy">
          <span className="eyebrow"><span className="hero-sigil" aria-hidden="true">✦</span> THE SOVEREIGN PSYCHOLOGY OBSERVATORY</span>
          <h1 id="hero-title">See more clearly.<br /><em>Respond with<br />greater freedom.</em></h1>
          <p className="hero-lede">Explore the interpretations, learned responses and practical capacities that shape how you meet the world.</p>
          <p className="hero-invitation">Compare perspectives. Test ideas. Follow the evidence.</p>
          <div className="actions">
            <Link className="button primary" href="/start">Enter the observatory <ArrowRight size={18} aria-hidden="true" /></Link>
            <Link className="text-link" href="/learn">Explore the curriculum <ArrowUpRight size={17} aria-hidden="true" /></Link>
          </div>
          <p className="hero-disclosure">Research-informed education · Framework under development</p>
        </div>
        <div className="hero-caption" aria-hidden="true"><span>THE OBSERVATORY</span><i />A world for examining your own.</div>
      </section>
      <div className="home-interior">
      <section className="portal-section" id="method" aria-labelledby="portal-title">
        <div className="portal-heading"><div><span className="eyebrow">CHOOSE YOUR INQUIRY</span><h2 id="portal-title">Different doors. A more deliberate life.</h2></div><span className="portal-count">THREE INSTRUMENTS · EIGHT DISCIPLINES</span></div>
        <div className="world-portals">
          {[
            { slug: "perspective", href: "/explore/perspectives", number: "01", label: "PERSPECTIVE LABORATORY", title: "See beyond a single lens.", text: "Hold the facts steady. Discover how another interpretation changes your next move.", action: "Compare perspectives" },
            { slug: "identity", href: "/explore/identity", number: "02", label: "IDENTITY · COMPETENCE", title: "Become what you practice.", text: "Turn an aspiration into conduct, a field test and an honest revision.", action: "Build a practice" },
            { slug: "evidence", href: "/evidence", number: "03", label: "EVIDENCE OBSERVATORY", title: "Let the evidence lead.", text: "Trace claims to their sources. Know what is supported—and what remains open.", action: "Investigate the evidence" },
            { slug: "dominion", href: "/learn", number: "04", label: "DOMINION CURRICULUM", title: "Cultivate self-governance.", text: "Eight connected disciplines. Explore the capacities behind deliberate conduct.", action: "Explore the eight disciplines" },
          ].map((portal) => <Link href={portal.href} className={`world-portal portal-${portal.slug}`} key={portal.slug} id={portal.slug === "evidence" ? "evidence" : undefined}>
            <div className="portal-art" aria-hidden="true"><span>{portal.number}</span><i /></div>
            <div className="portal-copy"><span className="small-label">{portal.label}</span><h3>{portal.title}</h3><p>{portal.text}</p><span className="portal-action">{portal.action}<ArrowUpRight size={17} aria-hidden="true" /></span></div>
          </Link>)}
        </div>
      </section>
      <section className="live-inquiry" aria-labelledby="live-inquiry-title">
        <div className="live-inquiry-copy"><span className="eyebrow">NOT JUST SOMETHING TO READ</span><h2 id="live-inquiry-title">One event.<br /><em>More than one way<br />to meet it.</em></h2><p>A delayed reply. A difficult conversation. A plan that falls apart. The facts matter—and so does the meaning you give them.</p><p>Try the live study. Change the interpretive lens and watch the possible response change. Then take a situation of your own into the laboratory.</p><Link className="text-link" href="/explore/perspectives">Open the perspective laboratory <ArrowUpRight size={18} aria-hidden="true" /></Link><span className="inquiry-note">An illustrative exercise, not a psychological assessment.</span></div>
        <ArrivalInstrument scenario={content.scenarios[0]} />
      </section>
      <section className="first-session" aria-labelledby="first-session-title">
        <div><span className="eyebrow">YOUR FIRST FIVE MINUTES</span><h2 id="first-session-title">Leave with a next move.</h2></div>
        <ol><li><Compass size={21} aria-hidden="true" /><span>Choose a situation<small>Start with ordinary life.</small></span></li><li><Focus size={21} aria-hidden="true" /><span>Explore a response<small>One lens is not the whole story.</small></span></li><li><CheckCircle2 size={21} aria-hidden="true" /><span>Save an action<small>Return with what happened.</small></span></li></ol>
        <Link href="/start" className="text-link">Begin the guided session <ArrowUpRight size={17} aria-hidden="true" /></Link>
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
          <Link href="/learn/method">Read the current method ·</Link>
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
        <Link href="/research/RQ-09">Follow this research question</Link>
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
                <b aria-hidden="true">+</b>
              </Link>
            </li>
          ))}
        </ol>
      </section>
      <span id="protocol" />
      <span id="science" />
      </div>
    </div>
  );
}
