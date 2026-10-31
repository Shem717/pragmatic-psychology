import { sourceNoteRoutes, sourceNoteHref } from "@/lib/source-note-routes";
import "./source-notes.css";
export const metadata = { title: "Source qualifications", alternates: { canonical: "/evidence/source-qualifications/" } };
export default function Page() {
  return <>
    <a href="/evidence/" className="research-back">Back to the Evidence Observatory</a>
    <header className="source-note-directory-heading">
      <p className="research-eyebrow">SOURCE QUALIFICATIONS</p>
      <h1>Source qualifications</h1>
      <p>Researcher-authored qualifications, not additional canonical claims or scientific acceptance. Independent human scientific review remains pending.</p>
    </header>
    <section className="source-note-index" id="source-note-topics" aria-labelledby="source-note-topics-title">
      <h2 id="source-note-topics-title">Choose a source note</h2>
      <p>Each note has its own page. Older topic bookmarks lead to the matching link below.</p>
      <nav aria-label="Source qualification notes"><ul>{sourceNoteRoutes.map(note => <li key={note.id}><a id={note.id} href={sourceNoteHref(note.id)}>{note.label}</a></li>)}</ul></nav>
    </section>
  </>;
}
