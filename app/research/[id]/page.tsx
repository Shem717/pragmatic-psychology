import Link from "next/link";
import { notFound } from "next/navigation";
import { content } from "@/lib/content";
import { PageIntro } from "@/components/UI";
export function generateStaticParams() {
  return content.research.map((r) => ({ id: r.id }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return {
    title: id + " · Research register",
    alternates: { canonical: "/research/" + id },
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const r = content.research.find((r) => r.id === id);
  if (!r) notFound();
  return (
    <>
      <PageIntro
        eyebrow={r.id + " / " + r.subtype}
        title={r.id}
        description={r.summary}
      />
      <section className="panel section-pad prose">
        <span className="badge">{r.status}</span>
        <h2>Preserve the distinction.</h2>
        <p>
          {r.subtype === "Normative safety restriction"
            ? "This is a publishing and safety constraint under its preserved source identifier. It is not an efficacy hypothesis."
            : r.subtype === "Active correction record"
              ? "This record governs correction of unsupported historical assertions. It does not validate those assertions."
              : "This record defines an inquiry. It does not establish an empirical finding or a validated treatment."}
        </p>
        <h3>Next evidence needed</h3>
        <p>{r.nextStep}</p>
        <h3>Falsifiability / decision criterion</h3>
        <p>{r.falsifier}</p>
        <h3>Ownership & review</h3>
        <p>
          Framework and research agenda: Samuel Raymond Clow. AI-assisted public
          editorial derivative dated {r.reviewedAt}. No recruitment or study
          participation occurs through the notebook.
        </p>
        <Link href="/evidence">Inspect relevant evidence</Link>
        <p>
          <Link href="/research">Return to register</Link>
        </p>
      </section>
    </>
  );
}
