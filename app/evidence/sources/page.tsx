import { content } from "@/lib/content";
import { PageIntro, SourceCard } from "@/components/UI";
export const metadata = {
  title: "Source index",
  alternates: { canonical: "/evidence/sources" },
};
export default function Page() {
  return (
    <>
      <PageIntro
        eyebrow="PUBLIC BIBLIOGRAPHY"
        title="Follow the source."
        description="Access depth and limitations stay attached. Private working documents and conversation records are not part of this index."
      />
      <section className="panel section-pad">
        {content.sources.map((s) => (
          <SourceCard id={s.id} key={s.id} />
        ))}
      </section>
    </>
  );
}
