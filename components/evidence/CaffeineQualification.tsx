import { caffeineQualification as note } from "@/lib/source-qualifications";
export function CaffeineQualification() {
  return <article className="dossier-content source-note" id={note.id} aria-labelledby="qualification-title">
      <section className="dossier-section"><a className="source-note-return" href={`/evidence/source-qualifications/#${note.id}`}>Back to source topics</a><p className="research-fine">{note.status}</p><h2 id="qualification-title">{note.title}</h2><p>{note.summary}</p><h3>Keep the measurements separate.</h3><p>{note.measurements}</p></section>
      <section className="dossier-section" aria-labelledby="inspected-title"><h2 id="inspected-title">What was inspected</h2><ul>{note.references.map((reference) => <li key={reference.url}><p>{reference.text} <a href={reference.url} target="_blank" rel="noreferrer">Read the cited primary source</a></p></li>)}</ul></section>
      <section className="dossier-section" aria-labelledby="held-title"><h2 id="held-title">Still held</h2><p>{note.holds}</p><h3>Attribution and limits</h3><p>{note.attribution}</p><a href={note.videoUrl} target="_blank" rel="noreferrer">Original source video — nm1TxQj9IsQ</a></section>
      <footer className="dossier-section"><a className="source-note-return" href={`/evidence/source-qualifications/#${note.id}`}>Back to source topics</a></footer>
    </article>;
}
