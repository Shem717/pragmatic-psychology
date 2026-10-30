import Link from "next/link";
import { meditationBenefitQualification as note } from "@/lib/meditation-benefit-qualification";
function linkedText(text: string) {
  return text.split(/(https:\/\/[^\s]+)/).map((part, index) => part.startsWith("https://") ? <a key={index} href={part} target="_blank" rel="noreferrer">{part}</a> : part);
}
export function MeditationBenefitQualification() {
  return <article className="dossier-content" id={note.id} aria-labelledby="meditation-benefit-qualification-title">
    <section className="dossier-section"><p className="research-fine">{note.status}</p><h2 id="meditation-benefit-qualification-title">{note.title}</h2>{note.paragraphs.map((paragraph,index)=><p key={index}>{linkedText(paragraph)}</p>)}<p><Link href="/evidence/claims/meditation-adverse-ascertainment/">Separate evidence on meditation adverse experiences</Link></p></section>
  </article>;
}
