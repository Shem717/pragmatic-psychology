"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { NeuralField } from "./Maps";
import type { Scenario } from "@/lib/content";

/** A public example from the same reviewed records used by the full instrument. */
export function ArrivalInstrument({ scenario }: { scenario: Scenario }) {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  const frame = scenario.frames[active];
  const event = scenario.facts[0].replace(/^A colleague writes:\s*/, "");
  return (
    <div className="arrival-instrument" ref={ref}>
      <div className="arrival-instrument-heading"><span className="signal-light" /> A LIVE PERSPECTIVE STUDY <span>01 / 03</span></div>
      <div className="arrival-lens">
        <NeuralField id="arrival" active={active} visible={visible} />
        <div className="lens-reticle" aria-hidden="true" />
        <div className="arrival-event"><span className="small-label">HOLD THE EVENT STEADY</span><p>“{event}”</p></div>
        <span className="lens-note">ONE EVENT · FOUR POSSIBLE RESPONSES</span>
      </div>
      <div className="lens-selector" role="group" aria-label="Try a perspective">
        {scenario.frames.map((item, i) => <button key={item.id} aria-pressed={active === i} onClick={() => setActive(i)}><span>0{i + 1}</span>{item.name}</button>)}
      </div>
      <div className="arrival-reading" aria-live="polite" aria-atomic="true">
        <div key={frame.id} className="reading-transition"><span className="small-label">THROUGH THE LENS OF {frame.name.toUpperCase()}</span><p>{frame.interpretation}</p><span className="arrival-action">Next: {frame.action}</span></div>
      </div>
      <div className="arrival-instrument-footer"><span>Conceptual illustration · educational example</span><Link href="/explore/perspectives">Open the full laboratory</Link></div>
    </div>
  );
}
