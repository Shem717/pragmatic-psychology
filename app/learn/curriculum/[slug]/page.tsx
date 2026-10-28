import { EvidenceWeightLesson } from "@/components/EvidenceWeightLesson";
import { romanNumeral } from "@/lib/presentation";
import Link from "next/link";
import { DisciplineEmblem } from "../../DisciplineEmblem";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { content } from "@/lib/content";
import { PageIntro } from "@/components/UI";
import { Learning } from "@/features/Learning";
import { supportingPractices } from "@/lib/supporting-practices";
import { publishedLearningPaths } from "@/lib/learning-paths";
export function generateStaticParams() {
  return content.disciplines.map((d) => ({ slug: d.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const d = content.disciplines.find((d) => d.slug === slug);
  return {
    title: d?.title || "Discipline unavailable",
    alternates: { canonical: "/learn/curriculum/" + slug },
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const d = content.disciplines.find((d) => d.slug === slug);
  if (!d) notFound();
  const disciplineIndex = content.disciplines.findIndex((item) => item.id === d.id);
  return (
    <>
      <PageIntro scene="curriculum"
        eyebrow={"CHAPTER " + romanNumeral(disciplineIndex + 1) + " / DOMINION CURRICULUM"}
        title={d.title}
        description={d.learningGoal}
      />
      {supportingPractices.some((practice) => practice.discipline === slug) && <nav className="section-links" aria-label="Supporting practices in this discipline">{supportingPractices.filter((practice) => practice.discipline === slug).map((practice) => <a key={practice.id} href={`#practice-${practice.id}`}>{practice.title} <ArrowRight size={15} aria-hidden="true" /></a>)}</nav>}
      {publishedLearningPaths.filter((path) => path.primaryDiscipline === slug).map((path) => <section className="panel section-pad" key={path.id}><span className="eyebrow">CONNECTED LEARNING PATH</span><h2>{path.title}</h2><p>{path.summary}</p><Link className="button" href={`/learn/paths/${path.slug}`}>Try the guided fictional example</Link></section>)}
      <section className="panel section-pad prose discipline-practice">
        <div className="discipline-heading">
          <DisciplineEmblem index={disciplineIndex} />
          <h2>{d.practiceTitle}</h2>
        </div>
        <p className="lead">{d.practice}</p>
        {d.slug === "legitimate-authority" && (
          <details className="worked-example curriculum-example" open>
            <summary>Worked example: changing a shared deadline</summary>
            <p>A colleague asks you to move a shared project deadline. You can propose a change, but you cannot promise it on everyone’s behalf.</p>
            <dl className="example-boundaries">
              <dt>My authority</dt><dd>I can describe my workload, offer a realistic delivery time and decide what I personally commit to.</dd>
              <dt>Shared decision</dt><dd>The project owner and affected colleagues need to agree before the shared deadline changes.</dd>
              <dt>Boundary</dt><dd>I will not assign work to someone else or announce agreement that has not been given.</dd>
              <dt>One observable action</dt><dd>Ask: “I can deliver my section on Thursday. Who needs to agree before we change the overall deadline?”</dd>
              <dt>What counts as evidence?</dt><dd>Record whom I consulted, what each person actually agreed to and whether I kept my own commitment. A confident tone alone is not evidence of authority.</dd>
              <dt>If the answer is no</dt><dd>Keep the existing agreement, explain my constraint and ask which scope or resource can change. Revise my plan rather than claim permission.</dd>
            </dl>
            <p className="fine">Fictional example. Authority depends on the actual role, consent and context; this is not legal or workplace-policy advice.</p>
          </details>
        )}
        <h3>Keep an evidence artifact</h3>
        <p>{d.artifact}</p>
        <h3>Teach it back</h3>
        <p>
          Explain the principle in your own words, give a counterexample, and
          name one situation where your present understanding may fail.
        </p>
        <Link className="button primary" href={d.link}>
          Open the connected instrument <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </section>
      {d.slug === "discernment" && <EvidenceWeightLesson />}
      <Learning slug={d.slug} title={d.title} />
      <Link href="/learn"><ArrowLeft size={16} aria-hidden="true" /> All eight Dominion disciplines</Link>
    </>
  );
}
