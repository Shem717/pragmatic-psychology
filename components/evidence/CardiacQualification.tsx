import { cardiacQualification as note } from "@/lib/cardiac-source-qualification";
function linkedText(text: string) {
  return text.split(/(https:\/\/[^\s]+)/).map((part, index) => part.startsWith("https://") ? <a key={index} href={part} target="_blank" rel="noreferrer">{part}</a> : part);
}
export function CardiacQualification() {
  return <article className="dossier-content" id={note.id} aria-labelledby="cardiac-qualification-title">
    <section className="dossier-section"><p className="research-fine">{note.status}</p><h2 id="cardiac-qualification-title">{note.title}</h2>{note.paragraphs.map((paragraph,index)=><p key={index}>{linkedText(paragraph)}</p>)}</section>
  </article>;
}
