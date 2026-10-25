import { romanNumeral } from "@/lib/presentation";
import Link from "next/link";
import { Orbit, Compass, Telescope, ArrowUpRight } from "lucide-react";
import { PageIntro, EducationalNote } from "@/components/UI";
export const metadata = {
  title: "Explore",
  alternates: { canonical: "/explore" },
};
export default function Explore() {
  return (
    <>
      <PageIntro scene="observatory"
        eyebrow="THREE WAYS INTO THE WORK"
        title="Choose an instrument."
        accent="Begin with a question."
        description="Explore an ordinary situation, develop a capability, or inspect the evidence behind a proposition."
      />
      <EducationalNote />
      <div className="instrument-route-list">
        {[
          [
            "01",
            "Perspective Rolodex",
            "Hold facts steady. Compare interpretations and appraisals, introduce new evidence, then choose one action.",
            "/explore/perspectives",
          ],
          [
            "02",
            "Identity-to-Competence Explorer",
            "Turn an aspiration into a prediction, a rehearsal and a real-world observation. Keep failures and uncertainty in view.",
            "/explore/identity",
          ],
          [
            "03",
            "Evidence Observatory",
            "Search claims, inspect scope and counterevidence, and compare explanatory models.",
            "/evidence",
          ],
        ].map(([n, t, d, u], i) => {
          const Icon = [Orbit, Compass, Telescope][i];
          return (
          <Link href={u} key={n} className="instrument-route">
            <span className="instrument-seal" aria-hidden="true"><Icon size={36} strokeWidth={1.25} /><span>{romanNumeral(i + 1)}</span></span>
            <div className="instrument-copy">
              <h2>{t}</h2>
              <p>{d}</p>
            </div>
            <ArrowUpRight size={22} aria-hidden="true" />
          </Link>
        );
        })}
      </div>
    </>
  );
}
