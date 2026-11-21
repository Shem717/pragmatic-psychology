import { Fragment } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen, Play } from "lucide-react";
import { notFound } from "next/navigation";
import { content } from "@/lib/content";
import { romanNumeral } from "@/lib/presentation";
import { getCompanionEdition } from "@/lib/spatial-library";
import { PageIntro } from "@/components/UI";
import { SourceMoment } from "@/components/SourceMoment";
import { Video } from "@/components/Video";
import { CompanionSources } from "@/features/spatial-library/CompanionSources";

type PageProps = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return content.videos.map(video => ({ id: video.youtubeId }));
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return { title: getCompanionEdition(id)?.overview.title || "Video unavailable", alternates: { canonical: "/library/videos/" + id } };
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const video = content.videos.find(item => item.youtubeId === id);
  const edition = getCompanionEdition(id);
  if (!video || !edition) notFound();
  const watchUrl = "https://www.youtube.com/watch?v=" + id;
  const originalTitle = <p><strong>Original video title: </strong><a href={watchUrl}>{edition.original.title} <ArrowUpRight size={17} aria-hidden="true" /></a></p>;

  return <div className="video-reading archive-route archive-library">
    <div id={edition.overview.id} tabIndex={-1}>
      <PageIntro scene="library" eyebrow={"VIDEO COMPANION / " + romanNumeral(video.episode) + " OF VII"} title={edition.overview.title} description={edition.overview.text}>
        <p id={edition.shelf.id} tabIndex={-1} className="fine">{edition.shelf.title} · {edition.shelf.text}</p>
      </PageIntro>
    </div>
    <nav className="section-links" aria-label="In this volume">
      <a href="#takeaways"><BookOpen size={16} aria-hidden="true" /> Key takeaways</a>
      <a href="#practice">Try it in ordinary life</a><a href="#watch"><Play size={16} aria-hidden="true" /> Watch the video</a>
    </nav>
    <section id={edition.takeawayIntro.id} tabIndex={-1} className="panel section-pad">
      <span className="small-label">I / UNDERSTAND THE IDEA</span>
      <h2>{edition.takeawayIntro.title}</h2><p className="fine">{edition.takeawayIntro.text}</p>
      <ol className="takeaway-list">{edition.takeaways.map(item => <li key={item.id} id={item.id} tabIndex={-1}>
        <div><h3>{item.title}</h3><p>{item.text}</p>
          {item.timestamp && <SourceMoment url={watchUrl + "&t=" + item.seconds + "s"} label={"Source moment " + item.timestamp} />}
        </div>
      </li>)}</ol>
    </section>
    <section id={edition.practice.id} tabIndex={-1} className="panel section-pad video-practice">
      <span className="small-label">II / MAKE IT USEFUL</span><h2>{edition.practice.title}</h2>
      <dl>{edition.exercises.map(item => <Fragment key={item.id}><dt>{item.title}</dt><dd id={item.id} tabIndex={-1}>{item.text}</dd></Fragment>)}</dl>
      <div className="actions">{edition.practiceLinks.map((link, i) => <Link key={link.id} id={link.id} className={i === 0 ? "button primary" : undefined} href={link.href}>{link.title}{i === 0 && <ArrowRight size={17} aria-hidden="true" />}</Link>)}</div>
      <p className="fine" id={edition.practiceTools.id} tabIndex={-1}><strong>{edition.practiceTools.title}.</strong> {edition.practiceTools.text}</p>
    </section>
    {edition.worksheet && <aside className="panel section-pad" id={edition.worksheet.id} tabIndex={-1}>
      <span className="small-label">A SUPPORTING PRACTICE / SELF-COMMAND</span><h2>{edition.worksheet.title}</h2><p>{edition.worksheet.text}</p>
      {edition.worksheetLink && <Link className="text-link" id={edition.worksheetLink.id} href={edition.worksheet.href}>{edition.worksheetLink.title} <ArrowRight size={17} aria-hidden="true" /></Link>}
    </aside>}
    <p className="video-scope" id={edition.evidence.id} tabIndex={-1}><strong>{edition.evidence.title}.</strong> {edition.evidence.text}</p>
    <section id={edition.watch.id} tabIndex={-1} className="archive-screening">
      <span className="small-label">III / RETURN TO THE DISCUSSION</span><h2>{edition.watch.title}</h2><p>{edition.watch.text}</p>
      {edition.original.text ? <>
        <div id={edition.original.id} tabIndex={-1}>{originalTitle}<p>{edition.original.text}</p></div>
        <Video id={id} title={edition.original.title} />
      </> : <>
        <Video id={id} title={edition.original.title} />
        <div id={edition.original.id} tabIndex={-1}>{originalTitle}</div>
      </>}
    </section>
    <CompanionSources>
      {[edition.context, edition.rights, edition.editionNote, edition.takeawayNote, edition.methodNote].map(note =>
        <p key={note.id} id={note.id} tabIndex={-1}><strong>{note.title}.</strong> {note.text}</p>)}
      <ul>{edition.references.map(item => <li id={item.id} tabIndex={-1} key={item.id}>
        <a href={item.href}>{item.text} · {item.title} <ArrowUpRight size={14} aria-hidden="true" /></a>
      </li>)}</ul>
      <div className="section-links">{edition.claims.map(item => <Link id={item.id} key={item.id} href={item.href}>{item.title} <ArrowUpRight size={14} aria-hidden="true" /></Link>)}</div>
    </CompanionSources>
    <div className="actions"><Link href="/library">Return to all seven videos</Link><Link href="/library/resources/field-guide">Read the educational guide</Link></div>
  </div>;
}
