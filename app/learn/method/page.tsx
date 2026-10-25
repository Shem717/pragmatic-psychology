import Link from "next/link";
import { PageIntro } from "@/components/UI";
export const metadata = {
  title: "The Sovereignty Method",
  alternates: { canonical: "/learn/method" },
};
export default function Page() {
  return (
    <>
      <PageIntro
        eyebrow="THE SOVEREIGNTY METHOD / CURRENT EDUCATIONAL DERIVATIVE"
        title="Perceive truthfully."
        accent="Choose. Test. Revise."
        description="A working framework by Samuel Raymond Clow for connecting interpretation, agency, practical conduct and corrective evidence."
      />
      <article className="panel section-pad prose">
        <p className="lead">
          The aim is a more capable relationship with reality: understanding
          circumstances accurately, choosing conduct within your authority,
          learning from what happens, and recovering when a model proves
          insufficient.
        </p>
        <h2>Four interacting domains</h2>
        <ol>
          <li>
            <strong>External environment:</strong> actual events, other people,
            resources and constraints.
          </li>
          <li>
            <strong>Cognitive appraisals:</strong> priors, goals, expectations
            and conviction.
          </li>
          <li>
            <strong>Organismic conditions:</strong> health, bodily state and
            biological context.
          </li>
          <li>
            <strong>Observable adaptive action:</strong> what a person does and
            what follows.
          </li>
        </ol>
        <p>
          These domains interact. They are not a validated causal equation or a
          one-way physiological chain.
        </p>
        <h2>A useful ordinary practice</h2>
        <ol>
          <li>
            Describe an ordinary situation. Separate observation from
            interpretation.
          </li>
          <li>
            Identify what is within your authority and what remains unknown.
          </li>
          <li>Compare truth-compatible perspectives and their consequences.</li>
          <li>
            Define a manageable action, a prediction and a reconsideration
            condition.
          </li>
          <li>
            Rehearse in a usable format if helpful, without a prescribed
            intensity or count.
          </li>
          <li>
            Observe actual conduct and unintended effects. Keep imagined and
            real-world outcomes distinct.
          </li>
          <li>
            Revise the scope of the capability claim and choose a later test.
          </li>
        </ol>
        <h2>What has been corrected</h2>
        <p>
          Learning involves interacting systems. This framework does not
          establish a unique route to a fear circuit, a reconsolidation timer,
          memory erasure, a mandatory repetition dose, or a universal outcome.
          Established therapies have condition-specific evidence. The integrated
          Sovereignty Method remains unvalidated as a standalone treatment.
        </p>
        <h2>Feelings can remain.</h2>
        <p>
          Chosen conduct, grief, fear and uncertainty can coexist. Failure and
          inconclusive outcomes are evidence, not a verdict on worth or a reason
          to assume that more intensity is required.
        </p>
        <h2>Source and authorship</h2>
        <p>
          This public derivative reconciles the working framework’s later
          corrections while preserving the original source documents privately.
          Original framework and Perspective Rolodex concept: Samuel Raymond
          Clow. Public editorial synthesis and examples: AI-assisted.
          Independent human clinical review is pending; no clinical efficacy is
          claimed.
        </p>
        <div className="actions">
          <Link href="/explore/perspectives">Try an ordinary scenario ·</Link>
          <Link href="/evidence/sources">Review the evidence</Link>
        </div>
      </article>
    </>
  );
}
