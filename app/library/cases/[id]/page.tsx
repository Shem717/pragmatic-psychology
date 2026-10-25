import { PageIntro } from "@/components/UI";
import Link from "next/link";
import { notFound } from "next/navigation";
export function generateStaticParams() {
  return ["CS-001", "CS-002", "CS-003"].map((id) => ({ id }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return {
    title: "Case publication boundary",
    robots: { index: false, follow: false },
    alternates: { canonical: "/library/cases/" + id },
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!["CS-001", "CS-002", "CS-003"].includes(id)) notFound();
  return (
    <div className="archive-route archive-support">
      <PageIntro scene="quiet"
        eyebrow={id + " / WITHHELD"}
        title="Personal material stays private."
        description="No approved public case narrative is included in this release."
      />
      <section className="panel section-pad prose">
        <h2>Observation and inference are different.</h2>
        <p>
          A future approved case would distinguish reported observation,
          interpretation, competing explanations, unmeasured variables and date
          precision. A personal report cannot establish mechanism or clinical
          efficacy.
        </p>
        <p>
          The historical record is preserved privately. No relationship detail,
          private source text or implied publication permission is supplied
          here.
        </p>
        <Link href="/explore/perspectives">
          Use an authored educational example ·
        </Link>
      </section>
    </div>
  );
}
