import Link from "next/link";
import { content } from "@/lib/content";
import { publishedLearningPaths } from "@/lib/learning-paths";
import { PageIntro } from "@/components/UI";
import { LearningProfile } from "@/features/learning-paths/LearningProfile";
export const metadata = { title: "Formative learning profile", alternates: { canonical: "/learn/profile" } };
export default function Page() {
  return <>
    <PageIntro scene="curriculum" eyebrow="YOUR LEARNING / FORMATIVE PROFILE" title="Keep the evidence in view." description="A private view of your educational self-ratings and recorded work across eight disciplines. Unassessed is a valid state; no rank is assigned." />
    <nav className="actions" aria-label="Learning routes"><Link href="/learn">All disciplines</Link>{publishedLearningPaths.map((path) => <Link key={path.id} href={`/learn/paths/${path.slug}`}>{path.title}</Link>)}</nav>
    <LearningProfile disciplines={content.disciplines.map(({ id, slug, title, learningGoal }) => ({ id, slug, title, learningGoal }))} />
  </>;
}
