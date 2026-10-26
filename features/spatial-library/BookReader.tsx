"use client";
import { useEffect, useReducer, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, X } from 'lucide-react';
import { content } from '@/lib/content';
import { romanNumeral } from '@/lib/presentation';
import { bookChapters, createBookReaderState, getLibraryVolume, libraryCategories, navigateBookReader } from '@/lib/spatial-library';
import { Video } from '@/components/Video';

type BookReaderProps = { bookId: string; onClose: () => void; resolveReturnFocus?: () => HTMLElement | null };
/** Keyed inner reader resets chapters and unloads video when a different volume opens. */
export function BookReader(props: BookReaderProps) {
  return <ReaderContents key={props.bookId} {...props} />;
}
export default BookReader;

function ReaderContents({ bookId, onClose, resolveReturnFocus }: BookReaderProps) {
  const [state, navigate] = useReducer(navigateBookReader, bookId, createBookReaderState);
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const pageHeading = useRef<HTMLHeadingElement>(null);
  const volume = getLibraryVolume(bookId);
  const video = content.videos.find((item) => item.youtubeId === bookId);
  const category = libraryCategories.find((item) => item.id === volume?.category);
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (!element.open) element.showModal();
    closeButton.current?.focus({ preventScroll: true });
    return () => {
      element.close();
      // Close performs native restoration first; this explicit origin is the single final owner.
      const target=resolveReturnFocus?.() || previous;
      if (target?.isConnected) target.focus({ preventScroll: true });
    };
  }, [resolveReturnFocus]);
  const turnPage = (action: Parameters<typeof navigateBookReader>[1]) => {
    navigate(action);
    // Preserve reading position and make the newly selected chapter discoverable.
    requestAnimationFrame(() => pageHeading.current?.focus({ preventScroll: false }));
  };
  if (!volume || !video) return <dialog ref={dialog} className="book-dialog" aria-labelledby="book-missing-title" onCancel={(event) => { event.preventDefault(); onClose(); }}><div className="book-reader"><h2 id="book-missing-title">This volume is unavailable.</h2><button ref={closeButton} onClick={onClose}>Return to the library</button></div></dialog>;
  const chapter = bookChapters[state.page];
  return <dialog ref={dialog} className="book-dialog" aria-labelledby="book-reader-title" onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => {
    if (event.target !== event.currentTarget) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
  }}>
    <article className="book-reader">
      <header className="book-header"><div><span className="small-label">VOLUME {romanNumeral(volume.number)} · SELECTED VIDEO COMPANION</span><h2 id="book-reader-title">{volume.shortTitle}</h2></div><button ref={closeButton} className="book-close" onClick={onClose} aria-label="Close book and return to the library"><X size={19} aria-hidden="true" /><span>Return to library</span></button></header>
      <nav className="book-chapters" aria-label="Book chapters">{bookChapters.map((label, page) => <button type="button" key={label} aria-pressed={state.page === page} onClick={() => turnPage({ type: 'chapter', page })}><span aria-hidden="true">{romanNumeral(page + 1)}</span> {label}</button>)}</nav>
      <div className={`book-spread book-chapter-${chapter.toLowerCase()}`}>
        <aside className="book-page book-page-context" aria-label="Volume context">
          <div className="book-page-ornament" aria-hidden="true"><BookOpen size={38} strokeWidth={1} /></div>
          <span className="book-volume-number" aria-hidden="true">{romanNumeral(volume.number)}</span>
          <p className="small-label">{category?.title}</p>
          <h3>{volume.title}</h3>
          <p>{volume.summary}</p>
          <div className="book-context-note"><span className="small-label">HOW TO READ THIS VOLUME</span><p>This is an interactive edition of the existing video companion—not a transcript or a published book by the speaker. The written practices are editorial adaptations guided by current evidence.</p></div>
          <Link className="text-link" href={`/library/videos/${volume.id}/`} onClick={onClose}>Open the full companion page <ArrowUpRight size={16} aria-hidden="true" /></Link>
          <span className="book-page-mark" aria-hidden="true">SOVEREIGN PSYCHOLOGY · THE LIBRARY</span>
        </aside>
        <section className="book-page book-page-content" aria-labelledby="book-chapter-title">
          <span className="small-label">CHAPTER {romanNumeral(state.page + 1)} OF V</span>
          <h3 id="book-chapter-title" ref={pageHeading} tabIndex={-1}>{chapter}</h3>
          {state.page === 0 && <><p className="book-lede">{video.summary}</p><h4>Read with the limits in view</h4><p>{video.evidenceNote}</p><h4>A question to carry with you</h4><p>{video.reflection}</p><button className="book-next-inline" onClick={() => turnPage({ type: 'next' })}>Turn to the actionable takeaways <ArrowRight size={17} aria-hidden="true" /></button></>}
          {state.page === 1 && <><p>Source moments identify the discussion topic. These written steps are editorial adaptations, not verbatim instructions or proof of effectiveness.</p><ol className="book-takeaways">{video.takeaways?.map((takeaway, index) => <li key={takeaway.title}><span className="book-takeaway-number" aria-hidden="true">{romanNumeral(index + 1)}</span><div><h4>{takeaway.title}</h4><p>{takeaway.text}</p>{takeaway.timestamp && <a href={`https://www.youtube.com/watch?v=${video.youtubeId}&t=${takeaway.seconds || 0}s`}>Source moment {takeaway.timestamp} <ArrowUpRight size={14} aria-hidden="true" /></a>}</div></li>)}</ol></>}
          {state.page === 2 && <><h4>An ordinary example</h4><p>{video.example}</p><h4>One feasible action</h4><p>{video.action}</p><h4>Return with evidence</h4><p>{video.reflection}</p><div className="book-practice-links"><Link className="button primary" href="/explore/perspectives/" onClick={onClose}>Plan a response <ArrowRight size={16} aria-hidden="true" /></Link><Link href="/explore/identity/" onClick={onClose}>Build and test a capability</Link><Link className="book-notes-link" href="/notebook/" onClick={onClose}>My notes</Link>{video.episode === 7 && <Link href="/learn/curriculum/self-command/#practice-habit-payoff" onClick={onClose}>Examine the expected and observed habit payoff</Link>}</div><p className="fine">Use the existing workspaces to write and deliberately save your own notes. This reader does not record activity or assign a score.</p></>}
          {state.page === 3 && <><h4>Scope and evidence</h4><p>{video.evidenceNote}</p><h4>Original source</h4><p><a href={`https://www.youtube.com/watch?v=${video.youtubeId}`}>{video.platformTitle} <ArrowUpRight size={15} aria-hidden="true" /></a></p><p>{video.sourceNote || video.transcriptStatus}</p><p>{video.rights}</p><h4>Supporting references</h4><ul className="book-source-links">{video.evidenceUrls?.map((url, index) => <li key={url}><a href={url}>Supporting reference {index + 1} <span className="book-source-host">{new URL(url).hostname.replace(/^www\./, '')}</span><ArrowUpRight size={14} aria-hidden="true" /></a></li>)}</ul><h4>Inspect the related claims</h4><ul>{video.relatedClaimSlugs?.map((slug) => <li key={slug}><Link href={`/evidence/claims/${slug}/`} onClick={onClose}>{content.claims.find((claim) => claim.slug === slug)?.shortTitle || slug}</Link></li>)}</ul><p className="fine">The integrated Sovereignty Method remains an educational framework, not a validated standalone clinical treatment.</p></>}
          {state.page === 4 && <><p>The original video remains distinct from this written companion. YouTube is contacted only when you choose Load video.</p><Video key={video.youtubeId} id={video.youtubeId} title={video.platformTitle} /><p><a href={`https://www.youtube.com/watch?v=${video.youtubeId}`}>Watch the original on YouTube <ArrowUpRight size={16} aria-hidden="true" /></a></p></>}
          <span className="book-page-mark" aria-hidden="true">{romanNumeral(state.page + 1)} / V</span>
        </section>
      </div>
      <footer className="book-controls"><button disabled={state.page === 0} onClick={() => turnPage({ type: 'previous' })}><ArrowLeft size={17} aria-hidden="true" /> Previous chapter</button><span className="book-colophon" aria-live="polite">{chapter} · Chapter {state.page + 1} of {bookChapters.length}</span><button disabled={state.page === bookChapters.length - 1} onClick={() => turnPage({ type: 'next' })}>Next chapter <ArrowRight size={17} aria-hidden="true" /></button></footer>
    </article>
  </dialog>;
}
