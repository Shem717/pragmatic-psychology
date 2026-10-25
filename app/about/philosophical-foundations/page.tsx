import { PageIntro } from "@/components/UI";
export const metadata = {
  title: "Philosophical foundations",
  alternates: { canonical: "/about/philosophical-foundations" },
};
export default function Page() {
  return (
    <div className="archive-route archive-support">
      <PageIntro scene="quiet"
        eyebrow="PHILOSOPHY / INTERPRETATION"
        title="Meaning has a lineage."
        description="Spiritual and philosophical teachings can motivate inquiry without becoming empirical proof."
      />
      <article className="panel section-pad prose">
        <span className="badge">
          Philosophical teaching · Empirical confidence not applicable
        </span>
        <h2>Self-governance and responsibility</h2>
        <p>
          The framework explores deliberate understanding, noncontingent worth,
          disciplined conduct and responsibility toward others. These are
          normative commitments and interpretations, rather than measured
          clinical outcomes.
        </p>
        <h2>The Ra Contact</h2>
        <p>
          The Ra Contact is part of the project’s philosophical background.
          Relevant session references include 5.2, 42.2–3, 42.9–10, 52.7 and
          74.11. They are presented as spiritual teachings and interpretive
          context, not as neuroscientific studies or evidence that a proposed
          mechanism works.
        </p>
        <p>
          Source PDFs are not redistributed. The existence of a spiritual
          teaching does not establish a physiological claim, treatment effect or
          duty to override another person’s agency.
        </p>
      </article>
    </div>
  );
}
