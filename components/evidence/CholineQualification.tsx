import { cholineQualification as note } from "@/lib/choline-source-qualification";
function linkedText(text: string) {
  return text.split(/(https:\/\/[^\s]+)/).map((part, index) => part.startsWith("https://") ? <a key={index} href={part} target="_blank" rel="noreferrer">{part}</a> : part);
}
export function CholineQualification() {
  return <article className="dossier-content" id={note.id} aria-labelledby="choline-qualification-title">
    <section className="dossier-section"><p className="research-fine">{note.status}</p><h2 id="choline-qualification-title">{note.title}</h2>{note.paragraphs.map((paragraph,index)=><p key={index}>{linkedText(paragraph)}</p>)}</section>
  </article>;
}
