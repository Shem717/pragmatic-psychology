import Link from "next/link";
import { PageIntro } from "@/components/UI";
export const metadata = {
  title: "Educational field guide",
  alternates: { canonical: "/library/resources/field-guide" },
};
export default function Page() {
  return (
    <>
      <PageIntro
        eyebrow="FIELD GUIDE / VERSION 2.0 · 25 OCTOBER 2026"
        title="One ordinary situation."
        accent="An honest inquiry."
        description="A practical educational guide to interpretation, conduct and corrective evidence. No signup required."
      />
      <article className="panel section-pad prose">
        <h2>1. Begin with what happened.</h2>
        <p>
          A colleague says your proposal overlooks a recurring cost. The comment
          is an observable event; the critic’s motive and the size of an error
          remain unknown.
        </p>
        <h2>2. Separate two appraisals.</h2>
        <p>
          How substantial does the demand appear? What resources do you think
          are available? Describe these independently. Neither is a diagnosis or
          a measured nervous-system state.
        </p>
        <h2>3. Compare truth-compatible responses.</h2>
        <p>
          Curiosity asks for the calculation. Competence checks it. An assertive
          boundary addresses conduct if needed. A strategic pause allows time to
          review. Unsupported claims about jealousy do not answer the facts.
        </p>
        <h2>4. Choose conduct and a switch condition.</h2>
        <p>
          Ask for the cost breakdown. Predict that you can hear the answer and
          check it. If the cost is documented, revise the proposal. If conduct
          becomes insulting, address that separately.
        </p>
        <h2>5. Let evidence change the plan.</h2>
        <p>
          An omitted recurring cost appears. Correcting the work is a useful
          response; feeling calm is not a prerequisite. Record what actually
          happened, including limitations or unwanted effects.
        </p>
        <h2>6. Keep rehearsal separate from transfer.</h2>
        <p>
          A written or imagined reply is a rehearsal. A role-play is a different
          test. A real conversation supplies an observation in that context. One
          successful attempt does not establish durable general competence.
        </p>
        <h2>7. Preserve the correction.</h2>
        <p>
          Write what the evidence supports, what remains unknown and what to try
          next. A failed or inconclusive outcome belongs in the record. Save
          only if you choose; export a portable backup.
        </p>
        <h2>Scope</h2>
        <p>
          This is education for manageable ordinary situations. It is not a
          self-administered trauma protocol, a medical treatment, a
          reconsolidation procedure or a physiological measurement. No intensity
          target, universal repetition count or cure guarantee is provided.
        </p>
        <div className="actions">
          <Link className="button primary" href="/explore/perspectives">
            Open the criticism example →
          </Link>
          <a href="/field-guide-v2.md" download>
            Download Markdown ↓
          </a>
        </div>
      </article>
    </>
  );
}
