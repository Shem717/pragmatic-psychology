import { romanNumeral } from "@/lib/presentation";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen, Play } from "lucide-react";
import { notFound } from "next/navigation";
import { content } from "@/lib/content";
import { PageIntro } from "@/components/UI";
import { Video } from "@/components/Video";
export function generateStaticParams() { return content.videos.map(v => ({id:v.youtubeId})); }
export async function generateMetadata({ params }: { params: Promise<{id:string}> }) { const {id}=await params; const v=content.videos.find(v=>v.youtubeId===id);return {title:v?.title||"Video unavailable",alternates:{canonical:"/library/videos/"+id}}; }
export default async function Page({params}:{params:Promise<{id:string}>}) {
  const {id}=await params;const v=content.videos.find(v=>v.youtubeId===id);if(!v)notFound();
  return <div className="video-reading archive-route archive-library">
    <PageIntro scene="library" eyebrow={"VIDEO COMPANION / "+romanNumeral(v.episode)+" OF VII"} title={v.title} description={v.summary} />
    <div className="section-links"><a href="#takeaways"><BookOpen size={16} aria-hidden="true" /> Key takeaways</a><a href="#practice">Try it in ordinary life</a><a href="#watch"><Play size={16} aria-hidden="true" /> Watch the video</a></div>
    <section id="takeaways" className="panel section-pad"><span className="small-label">I / UNDERSTAND THE IDEA</span><h2>Key actionable takeaways</h2><p className="fine">Practical companion guidance adapted from the linked discussion and framed by current evidence. Source moments identify the topic, not a verbatim instruction.</p>
      <ol className="takeaway-list">{v.takeaways?.map((t,i)=><li key={i}><div><h3>{t.title}</h3><p>{t.text}</p>{t.timestamp&&<a className="takeaway-source" href={"https://www.youtube.com/watch?v="+v.youtubeId+"&t="+(t.seconds||0)+"s"}>Video context {t.timestamp} <ArrowUpRight size={13} aria-hidden="true" /></a>}</div></li>)}</ol>
    </section>
    <section id="practice" className="panel section-pad video-practice"><span className="small-label">II / MAKE IT USEFUL</span><h2>One situation. A small next step.</h2><dl><dt>Example</dt><dd>{v.example}</dd><dt>Try this</dt><dd>{v.action}</dd><dt>Reflect</dt><dd>{v.reflection}</dd></dl><div className="actions"><Link className="button primary" href="/explore/perspectives">Plan a response <ArrowRight size={17} aria-hidden="true" /></Link><Link href="/explore/identity">Build and test a capability</Link></div></section>
    {v.episode === 7 && <aside className="panel section-pad"><span className="small-label">A SUPPORTING PRACTICE / SELF-COMMAND</span><h2>Before choosing a replacement, examine the payoff.</h2><p>Keep the cue, small replacement and environmental support above. Add an expected-versus-observed payoff check, including immediate and later consequences. This separate worksheet draws on a Judson Brewer interview; it is not an additional video in the selected collection.</p><Link className="text-link" href="/learn/curriculum/self-command#practice-habit-payoff">Open the habit payoff worksheet <ArrowRight size={17} aria-hidden="true" /></Link></aside>}
    <p className="video-scope">{v.evidenceNote}</p>
    <section id="watch" className="archive-screening"><span className="small-label">III / RETURN TO THE DISCUSSION</span><h2>Watch the original video</h2><Video id={v.youtubeId} title={v.platformTitle} /><p><a href={"https://www.youtube.com/watch?v="+v.youtubeId}>{v.platformTitle} <ArrowUpRight size={17} aria-hidden="true" /></a></p></section>
    <details><summary>Source context and evidence</summary><p>{v.sourceNote||v.transcriptStatus}</p><p>{v.rights} The written takeaways are editorial adaptations, not a redistributed transcript or a claim that the original video has been changed.</p><p>The integrated Sovereignty Method is an educational framework, not a validated standalone clinical treatment.</p><ul>{v.evidenceUrls?.map((url,i)=><li key={url}><a href={url}>Supporting source {i+1} <ArrowUpRight size={14} aria-hidden="true" /></a></li>)}</ul><div className="section-links">{v.relatedClaimSlugs?.map(slug=><Link key={slug} href={"/evidence/claims/"+slug}>{content.claims.find(c=>c.slug===slug)?.shortTitle||slug} <ArrowUpRight size={14} aria-hidden="true" /></Link>)}</div></details>
    <div className="actions"><Link href="/library">Return to all seven videos</Link><Link href="/library/resources/field-guide">Read the educational guide</Link></div>
  </div>;
}
