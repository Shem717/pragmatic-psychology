import { PanicDiagnosticQualification } from "@/components/evidence/PanicDiagnosticQualification";
import { FreezingAssaultQualification } from "@/components/evidence/FreezingAssaultQualification";
import { TraumaTransmissionQualification } from "@/components/evidence/TraumaTransmissionQualification";
import { SleepLatencyQualification } from "@/components/evidence/SleepLatencyQualification";
import { MriQualification } from "@/components/evidence/MriQualification";
import "./source-notes.css";
import { HrvQualification } from "@/components/evidence/HrvQualification";
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
    <section className="source-note-index" id="source-note-topics" aria-labelledby="source-note-topics-title"><h2 id="source-note-topics-title">Choose a source note</h2><p>Researcher-authored qualifications, not additional canonical claims or scientific acceptance. Independent human scientific review remains pending.</p><nav aria-label="Source qualification notes"><ul><li><a href="#caffeine-and-adenosine">Caffeine and adenosine</a></li><li><a href="#age-groups-and-aging">Age groups and aging</a></li><li><a href="#sensory-kit-evidence">Sensory kit evidence</a></li><li><a href="#relationship-ratios">Relationship ratios</a></li><li><a href="#bereavement-cardiac-statistic">Bereavement cardiac statistic</a></li><li><a href="#alcohol-and-sleep">Alcohol and sleep</a></li><li><a href="#relaxation-related-anxiety">Relaxation-related anxiety</a></li><li><a href="#postpartum-screening-estimates">Postpartum screening estimates</a></li><li><a href="#mindfulness-comparators">Mindfulness comparators</a></li><li><a href="#choline-mrs-measurement">Choline MRS measurement</a></li><li><a href="#breathing-hrv-measures">Breathing and HRV measures</a></li><li><a href="#mindfulness-mri">Mindfulness structural MRI</a></li><li><a href="#writing-and-sleep-onset">Writing and sleep onset</a></li><li><a href="#trauma-and-inheritance">Trauma and inheritance</a></li><li><a href="#nonresistance-and-immobility">Nonresistance and immobility</a></li><li><a href="#panic-and-medical-exclusion">Panic and medical exclusion</a></li></ul></nav></section>
    <EvidenceHeading eyebrow="SOURCE QUALIFICATIONS" title="Separate the explanation from the evidence."
      description="Researcher-authored notes on selected source assertions. These are not additional canonical claims or scientific acceptance." />
    <article className="dossier-content source-note" id={note.id} aria-labelledby="qualification-title">
      <section className="dossier-section"><a className="source-note-return" href="#source-note-topics">Back to source topics</a><p className="research-fine">{note.status}</p><h2 id="qualification-title">{note.title}</h2><p>{note.summary}</p><h3>Keep the measurements separate.</h3><p>{note.measurements}</p></section>
      <section className="dossier-section" aria-labelledby="inspected-title"><h2 id="inspected-title">What was inspected</h2><ul>{note.references.map((reference) => <li key={reference.url}><p>{reference.text} <a href={reference.url} target="_blank" rel="noreferrer">Read the cited primary source</a></p></li>)}</ul></section>
      <section className="dossier-section" aria-labelledby="held-title"><h2 id="held-title">Still held</h2><p>{note.holds}</p><h3>Attribution and limits</h3><p>{note.attribution}</p><a href={note.videoUrl} target="_blank" rel="noreferrer">Original source video — nm1TxQj9IsQ</a></section>
      <footer className="dossier-section"><a className="source-note-return" href="#source-note-topics">Back to source topics</a></footer>
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
    <HrvQualification />
    <MriQualification />
    <SleepLatencyQualification />
    <TraumaTransmissionQualification />
    <FreezingAssaultQualification />
    <PanicDiagnosticQualification />
  </>;
}
