"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Orbit } from 'lucide-react';
import { practiceSteps } from '@/lib/observatory-state';
import { romanNumeral } from '@/lib/presentation';
import { useDraft } from '@/features/useDraft';

export function PracticeOrrery() {
  const { draft, set }=useDraft('identity','identity','Identity-to-Competence plan');
  const [selected,setSelected]=useState(0);
  const router=useRouter();
  const step=practiceSteps[selected];
  const fields=draft?.fields || {};
  return <section className="observatory-practice" aria-labelledby="orrery-title">
    <div className="observatory-panel-title"><Orbit size={27} aria-hidden="true"/><div><span className="eyebrow">II / THE PRACTICE ORRERY</span><h2 id="orrery-title">Move the work forward, not a progress meter.</h2></div></div>
    <p>The orrery is a map of a repeatable inquiry. Its positions do not measure skill, identity or scientific certainty. Open a step in your existing practice plan; no entry is overwritten here.</p>
    <nav className="orrery-step-controls" aria-label="Practice cycle">{practiceSteps.map((item,index)=><button key={item.id} aria-pressed={selected===index} onClick={()=>setSelected(index)}><span aria-hidden="true">{romanNumeral(index+1)}</span><strong>{item.title}</strong></button>)}</nav>
    <div className="orrery-step-reading"><span className="small-label">{step.title.toUpperCase()} / CURRENT PLAN</span><h3>{step.prompt}</h3>{step.id==='observation' ? <><p>{draft?.observations.length ? `${draft.observations.length} recorded observation${draft.observations.length===1?'':'s'} in this plan.` : 'No observations recorded in this plan yet.'}</p>{draft?.observations.slice(-3).map((observation)=><blockquote key={observation.id}><small>{observation.type} · {observation.outcome}</small><p>{observation.actual || 'No outcome description entered.'}</p></blockquote>)}</> : <blockquote>{fields[step.field]?.trim() || 'No entry for this part of the current plan yet. You can write one in the practice explorer.'}</blockquote>}<button className="primary" disabled={!draft} onClick={()=>{set('stage',String(step.stage));router.push('/explore/identity');}}>Open {step.title.toLowerCase()} in the practice explorer <ArrowRight size={17} aria-hidden="true"/></button></div>
    <div className="actions"><Link href="/explore/identity">Open the complete Identity-to-Competence plan</Link><Link href="/notebook">My notes</Link></div><p className="fine">A recorded result is not a validated assessment. Failures, mixed outcomes and missing observations remain visible. If you have several saved plans, choose the intended one in My notes.</p>
  </section>;
}
