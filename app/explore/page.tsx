import Link from "next/link";
import { PageIntro, EducationalNote } from "@/components/UI";
export const metadata = {
  title: "Explore",
  alternates: { canonical: "/explore" },
};
export default function Explore() {
  return (
    <>
      <PageIntro
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
        ].map(([n, t, d, u]) => (
          <Link href={u} key={n} className="instrument-route">
            <span>{n}</span>
            <div>
              <h2>{t}</h2>
              <p>{d}</p>
            </div>
            <b aria-hidden="true">+</b>
          </Link>
        ))}
      </div>
    </>
  );
}
