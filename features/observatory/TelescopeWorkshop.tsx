"use client";
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Download, ScanSearch } from 'lucide-react';
import { content } from '@/lib/content';
import { relationalScenarios } from '@/lib/relational-scenarios';
import { resolvePerspectiveScenario } from '@/lib/perspective-scenarios';
import { safeIndex } from '@/lib/indices';
import { romanNumeral } from '@/lib/presentation';
import { buildObservatoryIdentityDraft, editObservatoryField, identityHandoffPolicy, observatoryTransferError, selectObservatoryScenario } from '@/lib/observatory-workflow';
import { DraftActions, useWorkspace } from '@/components/Workspace';
import { useDraft } from '@/features/useDraft';
import { download, readDrafts } from '@/features/notebook-data';

export function TelescopeWorkshop({ onLensChange }: { onLensChange: (index: number) => void }) {
  const { draft, update } = useDraft('perspective', 'perspective', 'Perspective exploration');
  useDraft('identity', 'identity', 'Identity-to-Competence plan');
  const { entries, load, save } = useWorkspace();
  const router = useRouter();
  const [compare, setCompare] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
  const [storageAttempt, setStorageAttempt] = useState(0);
  const [storageError, setStorageError] = useState('');
  const [error, setError] = useState('');
  const [confirmTransfer, setConfirmTransfer] = useState(false);
  const [busy, setBusy] = useState(false);
  const mounted = useRef(true);
  const confirmation = useRef<HTMLDivElement>(null);
  const transferButton = useRef<HTMLButtonElement>(null);
  const latestEntry = useRef(entries.identity);
  const latestDraft = useRef(draft);
  useLayoutEffect(() => { latestEntry.current = entries.identity; latestDraft.current = draft; }, [entries.identity, draft]);
  const resolution = resolvePerspectiveScenario(draft, relationalScenarios, content.scenarios);
  const selected = resolution.scenario;
  const fields = draft?.fields || {};
  const personal = fields.personal === 'yes';
  const context = relationalScenarios.find((scenario) => scenario.id === selected.id);
  const frameIndex = safeIndex(fields.frame, selected.frames.length);
  const frame = selected.frames[frameIndex];
  const compareA = safeIndex(fields.compareA, selected.frames.length);
  const compareB = safeIndex(fields.compareB, selected.frames.length, 1);
  const set = (field: string, value: string) => update((record) => editObservatoryField(record, selected.id, field, value));
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => { onLensChange(frameIndex); }, [frameIndex, onLensChange]);
  useEffect(() => {
    let active = true;
    readDrafts().then(() => { if (active) { setStorageReady(true); setStorageError(''); } }).catch(() => {
      if (active) { setStorageReady(false); setStorageError('Saved action plans could not be checked. Your current notes remain here. Export a backup or retry before creating a new plan.'); }
    });
    return () => { active = false; };
  }, [storageAttempt]);
  const pick = (index: number) => set('frame', String(Math.max(0, Math.min(selected.frames.length - 1, index))));
  const moveToPlan = () => {
    const current = latestDraft.current;
    const currentResolution = resolvePerspectiveScenario(current, relationalScenarios, content.scenarios);
    const issue = observatoryTransferError(current, currentResolution.kind === 'unavailable');
    if (issue || !current) { setError(issue || 'The working record is unavailable.'); return; }
    // Re-check after any asynchronous save: never silently replace new unsaved edits.
    const policy = identityHandoffPolicy(latestEntry.current, storageReady);
    if (policy === 'wait') { setError('Saved action plans have not been checked yet. No new plan was created.'); return; }
    if (policy === 'save-existing') {
      setConfirmTransfer(true);
      return;
    }
    const newPlan = buildObservatoryIdentityDraft(current, currentResolution.scenario, safeIndex(current.fields.frame, currentResolution.scenario.frames.length));
    load(newPlan, false);
    router.push('/explore/identity');
  };
  const requestTransfer = () => {
    setError('');
    const issue = observatoryTransferError(draft, resolution.kind === 'unavailable');
    if (issue) { setError(issue); return; }
    const policy = identityHandoffPolicy(entries.identity, storageReady);
    if (policy === 'wait') { setError('Please wait until saved action plans have been checked, or retry the device-storage check.'); return; }
    if (policy === 'save-existing') {
      setConfirmTransfer(true);
      requestAnimationFrame(() => confirmation.current?.focus());
      return;
    }
    moveToPlan();
  };
  const saveThenTransfer = async () => {
    setBusy(true);
    setError('');
    const saved = await save('identity');
    if (!mounted.current) return;
    if (!saved) { setBusy(false); setError('Your earlier action plan could not be saved. No new plan was created. Export it from My notes or retry saving.'); return; }
    // React publishes the saved entry on the next render; proceed only after that state is visible.
    requestAnimationFrame(() => {
      if (!mounted.current) return;
      setBusy(false);
      if (identityHandoffPolicy(latestEntry.current, storageReady) !== 'ready') { setError('The earlier plan still has unsaved changes. Save it again before creating a new plan.'); return; }
      setConfirmTransfer(false);
      moveToPlan();
    });
  };
  return <section className="telescope-workshop" aria-labelledby="telescope-workshop-title">
    <div className="telescope-intro"><span className="eyebrow">THE TELESCOPE / A PRACTICAL INQUIRY</span><h2 id="telescope-workshop-title">Keep the facts. Change the lens.</h2><p>Explore one ordinary situation through four possible readings. None can reveal a hidden motive. Compare what each helps you notice, then choose a feasible action and a reason to revise it.</p></div>
    <aside className="telescope-safety"><strong>Safety comes before reframing.</strong><p>Threats, coercive control, stalking, sexual pressure or violence are not simply a perspective problem. You do not owe confrontation, reconciliation or a more generous interpretation. Stop this exercise when safety is in question.</p><Link href="/explore/perspectives/">Open the full Rolodex and its safety guidance</Link></aside>
    {resolution.kind === 'legacy' && <p className="callout">Your earlier example and notes are retained. The lenses below belong to that original example, not a newly substituted relationship scenario. <Link href="/explore/perspectives/">Open the full Rolodex</Link>.</p>}
    {resolution.kind === 'unavailable' && <p className="callout">The saved example is no longer available here. Your written notes are retained. Choose a current example explicitly before making a new plan; the preview below is not a reinterpretation of your saved case.</p>}
    <div className="telescope-controls"><label htmlFor="telescope-scenario">Example<select id="telescope-scenario" value={resolution.kind === 'unavailable' ? fields.scenario : selected.id} disabled={!draft} onChange={(event) => { update((record) => selectObservatoryScenario(record, event.target.value)); setError(''); }}>{resolution.kind === 'legacy' && <option value={selected.id}>Retained example: {selected.title}</option>}{resolution.kind === 'unavailable' && <option value={fields.scenario}>Saved example unavailable</option>}{relationalScenarios.map((scenario) => <option key={scenario.id} value={scenario.id}>{scenario.group} — {scenario.title}</option>)}</select></label><label htmlFor="telescope-context">Work with<select id="telescope-context" value={personal ? 'personal' : 'example'} disabled={!draft} onChange={(event) => set('personal', event.target.value === 'personal' ? 'yes' : '')}><option value="example">The fictional example</option><option value="personal">My own ordinary situation</option></select></label></div>
    <p className="fine">Changing the example or lens does not clear or fill your written action plan. Review any retained notes when changing context.</p>
    {personal && <div className="telescope-context-fields"><p className="callout">The four lenses remain illustrations from the selected example. They are not personalized analysis of your situation. Keep identifying details out of your notes if you do not want to store them.</p>{[['situation','My ordinary situation'],['facts','What I actually observed'],['unknowns','What I do not know']].map(([key,label]) => <label key={key} htmlFor={`telescope-${key}`}>{label}<textarea id={`telescope-${key}`} rows={3} maxLength={10000} disabled={!draft} value={fields[key] || ''} onChange={(event) => set(key,event.target.value)} /></label>)}</div>}
    <div className="telescope-analysis-grid">
    <section className="telescope-facts" aria-labelledby="telescope-facts-title"><h3 id="telescope-facts-title"><ScanSearch size={18} aria-hidden="true" /> Facts that stay in view</h3>{personal ? <><p>{fields.facts?.trim() || 'Your observed facts will appear here as you write them above.'}</p><h4>Still unknown</h4><p>{fields.unknowns?.trim() || 'Unknowns can remain unknown; do not fill them with an assumed motive.'}</p></> : <><ul>{selected.facts.map((fact) => <li key={fact}>{fact}</li>)}</ul><h4>Still unknown</h4><ul>{selected.unknowns.map((unknown) => <li key={unknown}>{unknown}</li>)}</ul>{context && <><h4>The example’s first interpretation</h4><p>{context.interpretation}</p><p className="fine">Feeling / urge in this fictional example: {context.emotionUrge}</p></>}</>}</section>
    <div className="telescope-reading-side">
    <div className="telescope-lens-tabs" role="group" aria-label="Select a perspective lens">{selected.frames.map((lens,index) => <button key={lens.id} disabled={!draft} aria-pressed={index === frameIndex} onClick={() => pick(index)}><span aria-hidden="true">{romanNumeral(index+1)}</span> {lens.name}</button>)}</div>
    <div className="telescope-lens-reading"><div className="panel-top"><span>LENS {romanNumeral(frameIndex+1)} / {frame.name}</span><div className="actions"><button aria-label="Previous perspective lens" disabled={!draft || frameIndex===0} onClick={() => pick(frameIndex-1)}><ArrowLeft size={16} aria-hidden="true" /></button><button aria-label="Next perspective lens" disabled={!draft || frameIndex===selected.frames.length-1} onClick={() => pick(frameIndex+1)}><ArrowRight size={16} aria-hidden="true" /></button></div></div><div aria-live="polite"><h3>{frame.name}</h3><p>{frame.interpretation}</p></div><h4>A possible action—not a command</h4><p>{frame.action}</p><h4>What would change this reading?</h4><p>{frame.switchWhen}</p><h4>Boundary to retain</h4><p>{frame.ethicalBoundary}</p></div>
    <button aria-expanded={compare} aria-controls="telescope-comparison" onClick={() => setCompare(!compare)}>{compare ? 'Close the comparison' : 'Compare two lenses'}</button>
    {compare && <div id="telescope-comparison" className="telescope-compare">{[{key:'compareA',index:compareA,label:'First lens'},{key:'compareB',index:compareB,label:'Second lens'}].map(({key,index,label}) => <section key={key}><label htmlFor={`telescope-${key}`}>{label}<select id={`telescope-${key}`} value={index} disabled={!draft} onChange={(event) => set(key,event.target.value)}>{selected.frames.map((lens,i) => <option key={lens.id} value={i}>{lens.name}</option>)}</select></label><h4>{selected.frames[index].name}</h4><p>{selected.frames[index].interpretation}</p><p><strong>Possible action:</strong> {selected.frames[index].action}</p><p><strong>Revise when:</strong> {selected.frames[index].switchWhen}</p><p className="fine"><strong>Boundary:</strong> {selected.frames[index].ethicalBoundary}</p></section>)}</div>}
    </div>
    </div>
    <section className="telescope-action-fields" aria-labelledby="telescope-action-title"><span className="eyebrow">FROM A LENS TO CONDUCT</span><h3 id="telescope-action-title">Choose what you will actually try.</h3><p>Your words are retained across examples. An example action is not automatically copied into your plan.</p><p className="fine">Your writing stays in this tab until you choose Save on this device. After that first save, changes to this perspective record save automatically on this device. It is not an online account; export a copy for a backup. Creating an action plan below does not automatically save either record.</p>{[{key:'action',label:'One observable, feasible action',hint:'Include consent, your authority and a realistic stopping point. A pause or support request can be the action.'},{key:'prediction',label:'My checkable prediction',hint:'What do you expect to observe? Say what remains uncertain instead of promising a result.'},{key:'switchWhen',label:'When I would revise, stop or seek support',hint:'What new fact, response or cost would change your plan? Do not require a favorable interpretation in the face of contrary conduct.'}].map(({key,label,hint}) => <label key={key} htmlFor={`telescope-${key}`}>{label}<span id={`telescope-${key}-hint`} className="fine">{hint}</span><textarea id={`telescope-${key}`} aria-describedby={`telescope-${key}-hint`} rows={3} maxLength={10000} disabled={!draft} value={fields[key] || ''} onChange={(event) => set(key,event.target.value)} /></label>)}<DraftActions draftKey="perspective" /><button disabled={!draft} onClick={() => draft && download([draft])}><Download size={16} aria-hidden="true" /> Export perspective notes</button></section>
    <div className="telescope-handoff"><h3>Test it in the Identity-to-Competence workspace.</h3><p>Create a new, unsaved action plan from your chosen action, prediction and revision condition. Earlier saved plans remain on this device. Your perspective notes are not cleared.</p><button ref={transferButton} className="primary" disabled={!draft || !storageReady || busy} onClick={requestTransfer}>Create a new action plan <ArrowRight size={17} aria-hidden="true" /></button>{!storageReady && !storageError && <p role="status">Checking existing saved plans before enabling the handoff…</p>}{storageError && <div role="status"><p>{storageError}</p><button onClick={() => setStorageAttempt((attempt)=>attempt+1)}>Retry the storage check</button></div>}</div>
    {confirmTransfer && <div className="telescope-transfer-confirm" ref={confirmation} tabIndex={-1} role="group" aria-labelledby="telescope-transfer-title"><h3 id="telescope-transfer-title">Keep your earlier action plan first.</h3><p>There are unsaved changes in your existing Identity-to-Competence plan. Save that plan on this device before creating a separate one. If saving fails, nothing is replaced.</p><div className="actions"><button disabled={busy} onClick={() => void saveThenTransfer()}>{busy ? 'Saving the earlier plan…' : 'Save existing plan, then create new'}</button><button disabled={busy} onClick={() => { setConfirmTransfer(false); requestAnimationFrame(()=>transferButton.current?.focus()); }}>Cancel</button><Link href="/notebook/">Review My notes</Link></div></div>}
    {error && <p className="callout" role="alert">{error}</p>}
  </section>;
}
