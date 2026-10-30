import { ratioQualification as note } from "@/lib/ratio-source-qualification";
function linkedText(text: string) {
  return text.split(/(https:\/\/[^\s]+)/).map((part, index) => part.startsWith("https://") ? <a key={index} href={part} target="_blank" rel="noreferrer">{part}</a> : part);
}
export function RatioQualification() {
  return <article className="dossier-content" id={note.id} aria-labelledby="ratio-qualification-title">
    <section className="dossier-section"><p className="research-fine">{note.status}</p><h2 id="ratio-qualification-title">{note.title}</h2>{note.paragraphs.map((paragraph,index)=><p key={index}>{linkedText(paragraph)}</p>)}</section>
  </article>;
}
