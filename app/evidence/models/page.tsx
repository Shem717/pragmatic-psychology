import Link from "next/link";
import { content } from "@/lib/content";
import { EvidenceHeading } from "@/components/evidence/EvidenceHeading";
import { SourceCard } from "@/components/UI";
import { ModelComparison } from "@/features/evidence/ModelComparison";
export const metadata = { title: "Compare explanatory models", alternates: { canonical: "/evidence/models" } };
export default function Page() {
  return <>
    <EvidenceHeading eyebrow="EXPLANATORY MODELS / SIDE BY SIDE" title="One observation. Several explanations." description="A mechanism is an explanation to test. Compare predictions, not the confidence with which a story is told." />
    <nav className="research-local-nav" aria-label="Sections in model comparison"><a href="#shared-case">The shared case</a><a href="#model-comparison">Compare predictions</a><a href="#model-sources">Inspect the sources</a></nav>
    <section className="model-shared-case" id="shared-case"><div><p className="research-eyebrow">01 / THE SAME CASE</p><h2>Constructive action.<br />Discomfort remains.</h2></div><div><p>A person replies constructively to criticism while bodily discomfort remains. An appraisal account asks about perceived demand and capability; a learning account asks what transfers across contexts.</p><p>That observation alone cannot identify reconsolidation or establish a universal mechanism.</p><span className="research-fine">Illustrative educational case · no individual mechanism has been measured</span></div></section>
    <ModelComparison models={content.models} />
    <section id="model-sources" className="model-source-section"><p className="research-eyebrow">03 / INSPECT THE BASIS</p><h2>The sources behind each account.</h2><p>The source library retains each record’s access depth, limitations and review states.</p>{content.models.map((model) => <details key={model.id} id={`model-${model.id}`} className="model-source-group"><summary><span>{model.title}</span><span>{model.sourceIds.length} sources <span aria-hidden="true">＋</span></span></summary><p className="research-fine">{model.evidence}</p><div className="model-source-links">{model.sourceIds.map((id) => <Link key={id} href={`/evidence/sources#source-${id}`}>Open {id} in source library</Link>)}</div>{model.sourceIds.map((id) => <SourceCard key={id} id={id} compact />)}</details>)}</section>
  </>;
}
