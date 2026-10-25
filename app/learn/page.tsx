import Link from "next/link";
import { content } from "@/lib/content";
import { PageIntro } from "@/components/UI";
export const metadata = {
  title: "Dominion Curriculum",
  alternates: { canonical: "/learn" },
};
export default function Page() {
  return (
    <>
      <PageIntro
        eyebrow="THE MASTER DOMINION CURRICULUM"
        title="The Dominion Curriculum."
        accent="Eight disciplines. One practice."
        description="Deepen understanding, earn capability and preserve openness to correction. The curriculum is an educational proposal rather than a clinical program."
      />
      <section className="panel section-pad">
        <h2>Choose a path through the work.</h2>
        <p>
          Begin with a question that matters. A suggested twelve-week path
          introduces authority, awareness and understanding in weeks 1–3;
          discernment and integration in weeks 4–6; self-command and competence
          in weeks 7–10; stewardship and teach-back in weeks 11–12. It is an
          optional structure, not a required dose or countdown.
        </p>
        <Link href="/learn/method">Read the current Sovereignty Method ·</Link>
      </section>
      <section className="curriculum-list">
        {content.disciplines.map((d, i) => (
          <Link
            href={"/learn/curriculum/" + d.slug}
            className="curriculum-row"
            key={d.id}
          >
            <span>{String(i + 1).padStart(2, "0")}</span>
            <div>
              <h2>{d.title}</h2>
              <p>{d.learningGoal}</p>
            </div>
            <b aria-hidden="true">+</b>
          </Link>
        ))}
      </section>
      <p className="fine">
        Original eight-discipline synthesis: Samuel Raymond Clow. Practices and
        public explanations are AI-assisted educational derivatives. The
        proposed 0–4 rubric is not a validated scale; zero means unassessed.
      </p>
    </>
  );
}
