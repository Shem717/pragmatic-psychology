import { notFound } from "next/navigation";
import { sourceNoteRoutes, sourceNoteHref, findSourceNoteRoute } from "@/lib/source-note-routes";
import { sourceNoteComponents } from "@/components/evidence/SourceNoteContent";
import "../source-notes.css";
export const dynamicParams = false;
export function generateStaticParams() {
  return sourceNoteRoutes.map(note => ({ slug: note.id }));
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const note = findSourceNoteRoute(slug);
  if (!note) notFound();
  return { title: `${note.label} · Source qualifications`, alternates: { canonical: sourceNoteHref(note.id) } };
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const note = findSourceNoteRoute(slug);
  if (!note) notFound();
  const NoteContent = sourceNoteComponents[note.id];
  return <>
    <nav className="source-note-breadcrumbs" aria-label="Breadcrumb"><ol>
      <li><a href="/evidence/">Evidence Observatory</a></li>
      <li><a href={`/evidence/source-qualifications/#${note.id}`}>Source qualifications</a></li>
      <li aria-current="page">{note.label}</li>
    </ol></nav>
    <header className="source-note-directory-heading">
      <p className="research-eyebrow">SOURCE QUALIFICATION</p>
      <h1>{note.label}</h1>
      <p>Researcher-authored qualification, not an additional canonical claim or scientific acceptance. Independent human scientific review remains pending.</p>
    </header>
    <NoteContent />
  </>;
}
