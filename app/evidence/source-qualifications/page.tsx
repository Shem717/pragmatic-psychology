import { CholineQualification } from "@/components/evidence/CholineQualification";
import { MeditationBenefitQualification } from "@/components/evidence/MeditationBenefitQualification";
import { PostpartumQualification } from "@/components/evidence/PostpartumQualification";
import { RelaxationQualification } from "@/components/evidence/RelaxationQualification";
import { AlcoholQualification } from "@/components/evidence/AlcoholQualification";
import { CardiacQualification } from "@/components/evidence/CardiacQualification";
import { RatioQualification } from "@/components/evidence/RatioQualification";
import { SensoryQualification } from "@/components/evidence/SensoryQualification";
import { AgeQualification } from "@/components/evidence/AgeQualification";
import Link from "next/link";
import { EvidenceHeading } from "@/components/evidence/EvidenceHeading";
import { caffeineQualification as note } from "@/lib/source-qualifications";
export const metadata = { title: "Source qualifications", alternates: { canonical: "/evidence/source-qualifications" } };
export default function Page() {
  return <>
    <Link href="/evidence" className="research-back">Back to the Evidence Observatory</Link>
    <EvidenceHeading eyebrow="SOURCE QUALIFICATIONS" title="Separate the explanation from the evidence."
      description="Researcher-authored notes on selected source assertions. These are not additional canonical claims or scientific acceptance." />
    <nav aria-label="Source qualification notes"><a href="#caffeine-and-adenosine">Caffeine and adenosine</a>{" · "}<a href="#age-groups-and-aging">Age groups and aging</a>{" · "}<a href="#sensory-kit-evidence">Sensory kit evidence</a>{" · "}<a href="#relationship-ratios">Relationship ratios</a>{" · "}<a href="#bereavement-cardiac-statistic">Bereavement cardiac statistic</a>{" · "}<a href="#alcohol-and-sleep">Alcohol and sleep</a>{" · "}<a href="#relaxation-related-anxiety">Relaxation-related anxiety</a>{" · "}<a href="#postpartum-screening-estimates">Postpartum screening estimates</a>{" · "}<a href="#mindfulness-comparators">Mindfulness comparators</a>{" · "}<a href="#choline-mrs-measurement">Choline MRS measurement</a></nav>
    <article className="dossier-content" id={note.id} aria-labelledby="qualification-title">
      <section className="dossier-section"><p className="research-fine">{note.status}</p><h2 id="qualification-title">{note.title}</h2><p>{note.summary}</p><h3>Keep the measurements separate.</h3><p>{note.measurements}</p></section>
      <section className="dossier-section" aria-labelledby="inspected-title"><h2 id="inspected-title">What was inspected</h2><ul>{note.references.map((reference) => <li key={reference.url}><p>{reference.text} <a href={reference.url} target="_blank" rel="noreferrer">Read the cited primary source</a></p></li>)}</ul></section>
      <section className="dossier-section" aria-labelledby="held-title"><h2 id="held-title">Still held</h2><p>{note.holds}</p><h3>Attribution and limits</h3><p>{note.attribution}</p><a href={note.videoUrl} target="_blank" rel="noreferrer">Original source video — nm1TxQj9IsQ</a></section>
    </article>
    <AgeQualification />
    <SensoryQualification />
    <RatioQualification />
    <CardiacQualification />
    <AlcoholQualification />
    <RelaxationQualification />
    <PostpartumQualification />
    <MeditationBenefitQualification />
    <CholineQualification />
  </>;
}
