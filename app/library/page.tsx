import Link from "next/link";
import { Play, ArrowUpRight, ArrowRight, BookOpen } from "lucide-react";
import { content } from "@/lib/content";
import { PageIntro } from "@/components/UI";
export const metadata = { title: "Library", alternates: { canonical: "/library" } };
export default function Page() {
  return <>
    <PageIntro eyebrow="THE LIBRARY / WATCH. UNDERSTAND. APPLY." title="Ideas worth putting to work." description="Seven selected videos. Clear takeaways, everyday examples and one manageable action on each page. No account required." />
    <section className="panel section-pad">
      <span className="small-label">A QUICK WAY IN</span><h2>An ordinary situation, investigated.</h2><p>Prefer to start by doing? Follow a five-minute worked example or read the short educational field guide.</p>
      <div className="actions"><Link className="button primary" href="/start">Start a guided session <ArrowRight size={17} aria-hidden="true" /></Link><Link className="button" href="/library/resources/field-guide"><BookOpen size={17} aria-hidden="true" /> Read the field guide</Link><a href="/field-guide-v2.md" download>Download the guide</a></div>
    </section>
    <div className="split-heading"><div><span className="eyebrow">THE VIDEO COLLECTION</span><h2>Choose the question you’re living.</h2></div><span className="badge">7 videos · practical companion pages</span></div>
    <section className="video-library-grid" aria-label="Selected video collection">{content.videos.map(v => <article className="panel video-card" key={v.youtubeId}>
      <div className="video-card-visual" aria-hidden="true"><span className="video-card-number">{String(v.episode).padStart(2,"0")} / SOVEREIGN PSYCHOLOGY</span><Play strokeWidth={1.3} /></div>
      <div className="video-card-body"><h2><Link href={"/library/videos/"+v.youtubeId}>{v.title}</Link></h2><p>{v.summary}</p><Link className="text-link" href={"/library/videos/"+v.youtubeId}>Explore the takeaways <ArrowUpRight size={17} aria-hidden="true" /></Link></div>
    </article>)}</section>
    <p className="video-scope">The written practices are educational adaptations informed by current evidence. Original video wording is preserved on YouTube; a compelling explanation is not proof that a method works for everyone.</p>
    <details><summary>About case material and source transparency</summary><p>Personal case narratives are not published here. A retrospective observation is not a mechanism measurement or an efficacy study.</p><div className="actions"><Link href="/library/cases/CS-001">Publication boundary</Link><Link href="/evidence/sources">Browse the source index</Link></div></details>
  </>;
}
