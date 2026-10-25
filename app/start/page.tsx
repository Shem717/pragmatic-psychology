import Link from "next/link";
import { ArrowRight, Compass, ScanSearch, Target, NotebookPen, RefreshCw } from "lucide-react";
import { PageIntro } from "@/components/UI";
export const metadata = { title: "Start here", alternates: { canonical: "/start" } };
const steps = [
  { icon: Compass, title: "Pick something ordinary", text: "A colleague asks for a revision. You read it as criticism. Start with the words they actually used, not what you imagine they think.", prompt: "Fact: ‘Could you revise this section?’ Unknown: their intention." },
  { icon: ScanSearch, title: "Try another lens", text: "Compare curiosity, competence, a clear boundary and a strategic pause. Choose the response that fits the facts and your responsibilities.", prompt: "Curiosity: ‘Which part needs to be clearer?’" },
  { icon: Target, title: "Choose a visible action", text: "Make the next step small enough to do, and specific enough to observe. You do not have to feel perfectly confident first.", prompt: "At our next check-in, ask one clarifying question before defending the draft." },
  { icon: NotebookPen, title: "Save the plan deliberately", text: "Use Save on this device in the laboratory. Unsaved drafts disappear when you close or reload. Export a copy if you need a backup.", prompt: "Prediction: I can ask the question and identify one useful revision." },
  { icon: RefreshCw, title: "Return with evidence", text: "Record what you did, what happened and what remains uncertain. A difficult or inconclusive result is useful, too.", prompt: "Observed: I asked; we identified one revision. Next: try this in a different meeting." },
];
export default function Start() {
  return <>
    <PageIntro eyebrow="START HERE / A FIVE-MINUTE FIRST SESSION" title="One situation. One useful action." description="You do not need to master the framework before using it. Follow this worked example, then try the same sequence with a manageable situation of your own." />
    <div className="guided-path">{steps.map((step, i) => <section className="panel guided-step" key={step.title}>
      <span className="guide-number" aria-hidden="true"><step.icon size={24} /></span>
      <div><span className="small-label">STEP {i + 1} OF 5</span><h2>{step.title}</h2><p>{step.text}</p><p className="example-line">{step.prompt}</p></div>
    </section>)}</div>
    <section className="panel section-pad start-next"><h2>Ready to make it yours?</h2><p>Open the Perspective Laboratory, select a sample or enter your own ordinary situation, then choose a response and save your plan.</p><div className="actions"><Link className="button primary" href="/explore/perspectives">Try the Perspective Laboratory <ArrowRight size={18} aria-hidden="true" /></Link><Link href="/explore/identity">Build a capability instead</Link></div><p className="fine">An educational exercise, not a treatment protocol. Start with everyday decisions, not overwhelming experiences or immediate danger.</p></section>
  </>;
}
