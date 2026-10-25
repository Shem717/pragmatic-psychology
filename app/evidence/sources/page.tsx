import { content } from "@/lib/content";
import { PageIntro, SourceCard } from "@/components/UI";
export const metadata = {
  title: "Source index",
  alternates: { canonical: "/evidence/sources" },
};
export default function Page() {
  return (
    <div className="archive-route archive-observatory">
      <PageIntro scene="observatory"
        eyebrow="PUBLIC BIBLIOGRAPHY"
        title="Follow the source."
        description="Access depth and limitations stay attached. Private working documents and conversation records are not part of this index."
      />
      <section className="panel section-pad archive-source-index">
        <div className="archive-section-heading"><span className="small-label">THE SOURCE SHELF</span><h2>Evidence, with its context attached.</h2><p>Read each source alongside its design and population. A source’s presence here does not mean it supports every claim in the framework.</p></div>
        {content.sources.map((s) => (
          <SourceCard id={s.id} key={s.id} />
        ))}
      </section>
    </div>
  );
}
