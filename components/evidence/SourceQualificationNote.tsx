import type { ReactNode } from "react";
import { sourceNoteLinkLabels, sourceNoteSections } from "@/lib/source-note-navigation";
type Note = { readonly id: string; readonly title: string; readonly status: string; readonly paragraphs: readonly string[] };
function linkedText(text: string) {
  return text.split(/(\[[^\]]+\]\(https:\/\/[^\s)]+\)|https:\/\/[^\s]+)/).map((part, index) => {
    const link = part.match(/^\[([^\]]+)\]\((https:\/\/[^\s)]+)\)$/);
    if (link) return <a key={index} href={link[2]} target="_blank" rel="noreferrer">{link[1]}</a>;
    return part.startsWith("https://") ? <a key={index} href={part} target="_blank" rel="noreferrer">{sourceNoteLinkLabels[part] ?? part}</a> : part;
  });
}
export function SourceQualificationNote({ note, titleId, children }: { note: Note; titleId: string; children?: ReactNode }) {
  const sections = sourceNoteSections[note.id] ?? [{ heading: "Reviewed point and its limits", indices: note.paragraphs.map((_, index) => index) }];
  return <article className="dossier-content source-note" id={note.id} aria-labelledby={titleId}>
    <header className="dossier-section source-note-heading"><a className="source-note-return" href={`/evidence/source-qualifications/#${note.id}`}>Back to source topics</a><p className="research-fine">{note.status}</p><h2 id={titleId}>{note.title}</h2></header>
    {sections.map((section, sectionIndex) => <section key={section.heading} className="dossier-section" aria-labelledby={`${note.id}-section-${sectionIndex}`}><h3 id={`${note.id}-section-${sectionIndex}`}>{section.heading}</h3>{section.indices.map(index => <p data-source-paragraph={index} key={index}>{linkedText(note.paragraphs[index])}</p>)}</section>)}
    <footer className="dossier-section source-note-footer">{children}<a className="source-note-return" href={`/evidence/source-qualifications/#${note.id}`}>Back to source topics</a></footer>
  </article>;
}
