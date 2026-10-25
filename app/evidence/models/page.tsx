import { content } from "@/lib/content";
import { PageIntro, SourceCard } from "@/components/UI";
export const metadata = {
  title: "Compare explanatory models",
  alternates: { canonical: "/evidence/models" },
};
export default function Page() {
  return (
    <>
      <PageIntro
        eyebrow="THEORETICAL ACCOUNTS / SIDE BY SIDE"
        title="More than one model."
        accent="Make the predictions visible."
        description="A mechanism is an explanation to test. Similar practices can be compatible with different explanations."
      />
      <div className="model-grid">
        {content.models.map((m) => (
          <article className="panel section-pad" key={m.id}>
            <span className="badge">Theoretical account</span>
            <h2>{m.title}</h2>
            <p className="lead">{m.focus}</p>
            <h3>Prediction to investigate</h3>
            <p>{m.prediction}</p>
            <h3>Limits</h3>
            <p>{m.limits}</p>
            <h3>Evidence depth</h3>
            <p>{m.evidence}</p>
            <h3>Outcome in this integrated product</h3>
            <p>Not assessed.</p>
            <details>
              <summary>Inspect sources</summary>
              {m.sourceIds.map((id) => (
                <SourceCard key={id} id={id} />
              ))}
            </details>
          </article>
        ))}
      </div>
      <section className="panel section-pad">
        <h2>Use the same case to discriminate.</h2>
        <p>
          A person replies constructively to criticism while bodily discomfort
          remains. An appraisal account asks about perceived demand and
          capability; a learning account asks what transfers across contexts.
          That observation alone cannot identify reconsolidation or establish a
          universal mechanism.
        </p>
      </section>
    </>
  );
}
