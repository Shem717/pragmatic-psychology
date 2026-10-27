"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Download, Shield, Sparkles } from "lucide-react";
import { resolvePerspectiveScenario, patchPerspectiveField } from "@/lib/perspective-scenarios";
import { personalLenses, chosenPerspectiveLabel } from "@/lib/perspective-records";
import type { RelationalScenario } from "@/lib/relational-scenarios";
import type { Scenario } from "@/lib/content";
import type { LearningPath } from "@/lib/learning-paths";
import { safeIndex } from "@/lib/indices";
import { romanNumeral } from "@/lib/presentation";
import { DraftActions, useWorkspace } from "@/components/Workspace";
import { SourceMoment } from "@/components/SourceMoment";
import { useDraft } from "./useDraft";
import { download, makeDraft } from "./notebook-data";
import { ChamberVault, LensAstrolabe } from "./perspective-chamber/ChamberArt";
import styles from "./perspective-chamber/Chamber.module.css";

const stages = [
  { label: 'Situation', title: 'Choose one moment to look at more clearly.', hint: 'A fictional example is enough. No personal disclosure is required.' },
  { label: 'Facts & meaning', title: 'What happened. What it might mean.', hint: 'Keep an observation separate from the meaning you give it. Uncertainty can stay uncertain.' },
  { label: 'Perspectives', title: 'Let more than one light fall on it.', hint: 'More than one reading may fit. None becomes true because it feels better.' },
  { label: 'Next response', title: 'Choose what is yours to do.', hint: 'An action, a boundary, support or a pause can all be useful responses. You do not control the other person’s reaction.' },
  { label: 'Revisit', title: 'Let what happened update the plan.', hint: 'Unclear or disappointing results still count as information. You do not have to repeat an unsafe interaction.' },
];
function WritingField({ name, label, hint, fields, set, rows = 3, limit = 10000 }: {
  name: string; label: string; hint?: string; fields: Record<string, string>; set: (key: string, value: string) => void; rows?: number; limit?: number;
}) {
  return <label className={styles.field} htmlFor={`chamber-${name}`}>{label}
    {hint && <span className={styles.hint} id={`chamber-${name}-hint`}>{hint}</span>}
    <textarea id={`chamber-${name}`} value={fields[name] || ''} rows={rows} maxLength={limit} aria-describedby={hint ? `chamber-${name}-hint` : undefined} onChange={(event) => set(name, event.target.value)} />
  </label>;
}
function LensEvidence({ frame }: { frame: Scenario['frames'][number] }) {
  return <div className={styles.evidence}>
    <div><h4>What supports it</h4><ul>{frame.supports.map((line) => <li key={line}>{line}</li>)}</ul></div>
    <div><h4>What challenges it</h4><ul>{frame.challenges.map((line) => <li key={line}>{line}</li>)}</ul></div>
    <div><h4>Possible next move</h4><p>{frame.action}</p></div>
    <div><h4>Boundary to keep</h4><p>{frame.ethicalBoundary}</p></div>
    <div><h4>Reconsider if</h4><p>{frame.switchWhen}</p></div>
  </div>;
}
export function Perspectives({ scenarios, legacyScenarios, sourceContext }: {
  scenarios: RelationalScenario[]; legacyScenarios: Scenario[]; sourceContext?: LearningPath['sourceContext'];
}) {
  const { draft, update, status } = useDraft('perspective', 'perspective', 'Perspective exploration');
  const { load, entries } = useWorkspace();
  const router = useRouter();
  const [stage, setStage] = useState(0);
  const [compare, setCompare] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [safetyMode, setSafetyMode] = useState(false);
  const [pendingCase, setPendingCase] = useState<{ id: string; personal: boolean } | null>(null);
  const [notice, setNotice] = useState('');
  const stageHeading = useRef<HTMLHeadingElement>(null);
  const cardHeading = useRef<HTMLHeadingElement>(null);
  const safetyHeading = useRef<HTMLHeadingElement>(null);
  const safetyButton = useRef<HTMLButtonElement>(null);
  const caseDialog = useRef<HTMLDialogElement>(null);
  const ledgerDetails = useRef<HTMLDetailsElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const focusStage = useRef(false);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 900px)');
    const adapt = () => { if (ledgerDetails.current) ledgerDetails.current.open = !media.matches; };
    adapt();
    media.addEventListener('change', adapt);
    return () => media.removeEventListener('change', adapt);
  }, [safetyMode]);
  const fields = draft?.fields || {};
  const resolution = resolvePerspectiveScenario(draft, scenarios, legacyScenarios);
  const selected = resolution.scenario;
  const context = resolution.kind === 'current' ? scenarios.find((item) => item.id === selected.id) : undefined;
  const personal = fields.personal === 'yes';
  const frameIndex = safeIndex(fields.frame, selected.frames.length);
  const frame = selected.frames[frameIndex];
  const frameNames = personal ? personalLenses : selected.frames.map((item) => item.name);
  const chosenLabel = resolution.kind === 'unavailable' ? (fields.choice ? `Earlier choice: ${fields.choice}` : 'Not chosen') : chosenPerspectiveLabel(fields, selected.frames);
  const set = (field: string, value: string) => update((record) => patchPerspectiveField(record, selected.id, field, value));
  const go = (index: number) => {
    if (index === stage) { stageHeading.current?.focus(); return; }
    focusStage.current = true; setStage(index); setShowCard(false);
  };
  useEffect(() => {
    if (focusStage.current) { stageHeading.current?.focus(); focusStage.current = false; }
  }, [stage, safetyMode]);
  const beginCase = (next: { id: string; personal: boolean }) => {
    const example = scenarios.find((item) => item.id === next.id) || legacyScenarios.find((item) => item.id === next.id) || scenarios[0];
    const record = makeDraft('perspective', next.personal ? 'My situation · Perspective Chamber' : `${example.title} · Perspective Chamber`);
    record.fields = { scenario: example.id, personal: next.personal ? 'yes' : '' };
    load(record, false);
    setCompare(false); setShowCard(false); setNotice('A separate case is open. Previous entries remain in My notes; unsaved cases still need saving or export.');
    caseDialog.current?.close(); setPendingCase(null); go(0);
  };
  const requestCase = (id: string, own: boolean) => {
    const next = { id, personal: own };
    if (draft && (Object.keys(fields).length || draft.observations.length)) {
      previousFocus.current = document.activeElement as HTMLElement;
      setPendingCase(next); caseDialog.current?.showModal();
    } else beginCase(next);
  };
  const cancelCase = () => { caseDialog.current?.close(); setPendingCase(null); previousFocus.current?.focus(); };
  const showSafety = () => { setSafetyMode(true); requestAnimationFrame(() => safetyHeading.current?.focus()); };
  const choose = () => {
    set('choice', personal ? `own-${frameIndex}` : frame.id);
    setNotice('Lens chosen for consideration. Your written action has not been replaced.');
  };
  const ledgerSituation = personal ? fields.situation || 'Your situation, in your own words' : resolution.kind === 'unavailable' ? 'Saved case · example unavailable' : selected.title;
  const ledgerFacts = fields.facts || (!personal && resolution.kind !== 'unavailable' ? selected.facts.join(' ') : 'Not recorded');
  const ledgerUnknowns = fields.unknowns || (!personal && resolution.kind !== 'unavailable' ? selected.unknowns.join(' ') : 'Not recorded');
  const field = (name: string, label: string, hint?: string, rows = 3) => <WritingField name={name} label={label} hint={hint} fields={fields} set={set} rows={rows} />;

  return <div className={styles.chamber}>
    <header className={styles.hero}>
      <ChamberVault />
      <div className={styles.heroCopy}>
        <span className={styles.eyebrow}>THE CHAMBER OF MANY LIGHTS</span>
        <h1>Perspective <em>Chamber</em></h1>
        <p>One situation. A wider view.<br />A response you can return to.</p>
        <button className={styles.goldButton} onClick={() => { if (safetyMode) { setSafetyMode(false); focusStage.current = true; } else stageHeading.current?.focus(); }}>Enter the working chamber <ArrowRight size={16} aria-hidden="true" /></button>
      </div>
      <span className={styles.heroInscription} aria-hidden="true">OBSERVE · CONSIDER · CHOOSE</span>
    </header>
    <div className={styles.threshold}>
      <p>Educational reflection, not treatment or a validated assessment. A different lens must not excuse mistreatment.</p>
      <button ref={safetyButton} onClick={showSafety}><Shield size={16} aria-hidden="true" /> Safety before reframing</button>
    </div>
    {safetyMode ? <section className={styles.safety} aria-labelledby="chamber-safety">
      <span className={styles.eyebrow}>NO EXERCISE IS OWED</span>
      <h2 id="chamber-safety" ref={safetyHeading} tabIndex={-1}>You do not need a different perspective to deserve safety.</h2>
      <p>Threats, intimidation, coercive control, stalking, sexual pressure or violence are not simply perspective problems. Prioritize safety and confidential support from a trusted person or appropriate local specialist service. You do not owe confrontation, reconciliation or a more generous interpretation.</p>
      <p>If there is immediate danger, contact local emergency services when safe. Consider whether this device or browsing history may be monitored before seeking support online.</p>
      <a href="https://www.nhs.uk/live-well/getting-help-for-domestic-violence/" target="_blank" rel="noopener">NHS guidance on recognizing abuse and getting support <ArrowUpRight size={16} aria-hidden="true" /><span className="sr-only"> (new tab)</span></a>
      <p className={styles.hint}>This resource describes UK services; elsewhere, use appropriate local support. This site is not an emergency or clinical service. Leaving does not erase notes, browsing history or other traces.</p>
      <div className={styles.actions}>
        {/* Direct client navigation intentionally avoids the anchor save dialog. It does not clear data. */}
        <button className={styles.goldButton} onClick={() => router.push('/')}>Leave the exercise now <ArrowUpRight size={16} aria-hidden="true" /></button>
        <button onClick={() => { setSafetyMode(false); requestAnimationFrame(() => safetyButton.current?.focus()); }}>Return to my case</button>
      </div>
    </section> : <>
      <nav className={styles.journey} aria-label="Perspective Chamber stages">
        {stages.map((item, index) => <button key={item.label} aria-current={stage === index ? 'step' : undefined} onClick={() => go(index)}><span className={styles.medallion} aria-hidden="true">{romanNumeral(index + 1)}</span><span>{item.label}</span></button>)}
      </nav>
      <div className={styles.workspace}>
        <aside className={styles.ledger} aria-label="Your current case ledger">
          <details ref={ledgerDetails} open><summary><span className={styles.eyebrow}>CASE LEDGER</span><strong>{personal ? 'Your reflection' : 'Fictional practice'}</strong><span className={styles.ledgerStatus}>{entries.perspective?.persisted ? 'Saved record · edits autosave' : 'In this tab · not saved'}</span></summary><div className={styles.ledgerBody}>
            <h3>{ledgerSituation}</h3>
            <dl><dt>Known / observed</dt><dd>{ledgerFacts}</dd><dt>Still unknown</dt><dd>{ledgerUnknowns}</dd><dt>Chosen lens</dt><dd>{chosenLabel}</dd><dt>Next response</dt><dd>{fields.action || 'Still considering'}</dd></dl>
            <button onClick={() => go(3)}>Edit my response</button>
          </div></details>
          <div className={styles.ledgerSave}><DraftActions draftKey="perspective" /><button disabled={!draft} onClick={() => draft && download([draft])}><Download size={15} aria-hidden="true" /> Export this case</button><button onClick={() => requestCase(selected.id,personal)}>Open a separate case</button>
            <p className={styles.hint}>Unsaved text can be lost if you reload or close this page. Save first if you want to keep it. After the first Save, edits to that record autosave on this device.</p>
            <details><summary>Privacy & local storage</summary><p className={styles.hint}>No account or cloud sync. Notes are not encrypted by this app. A separate case preserves earlier work in My notes but does not automatically save unsaved cases. Export a private backup.</p><Link href="/notebook">Open My notes</Link></details>
          </div>
        </aside>
        <section className={styles.workSurface} aria-labelledby="chamber-stage-title">
          <div className={styles.stageTop}><span>{romanNumeral(stage + 1)} / {stages[stage].label}</span><span>{personal ? 'YOUR REFLECTION' : 'FICTIONAL EXAMPLE'}</span></div>
          <div className={styles.stageBody} key={stage}>
            <h2 id="chamber-stage-title" tabIndex={-1} ref={stageHeading}>{stages[stage].title}</h2>
            <p className={styles.stageHint}>{stages[stage].hint}</p>
            {resolution.kind === 'legacy' && <p className={styles.retained}>Earlier saved example retained. Its original context, fields and observations have not been rewritten.</p>}
            {resolution.kind === 'unavailable' ? <div className={styles.retained}><h3>Your saved example is unavailable.</h3><p>Its ID is not in this edition. No different scenario has been assigned to your writing. Export or open a separate case; the original stays in My notes.</p><button onClick={() => requestCase(scenarios[0].id, false)}>Open a separate example</button><button disabled={!draft} onClick={() => draft && download([draft])}>Export unchanged case</button></div> : <>
            {stage === 0 && <>
              <div className={styles.modeChoices} role="group" aria-label="Reflection mode">
                <button aria-pressed={!personal} onClick={() => personal && requestCase(selected.id, false)}><BookOpen size={20} aria-hidden="true" /><strong>Explore an example</strong><span>Fictional, ordinary situations</span></button>
                <button aria-pressed={personal} onClick={() => !personal && requestCase(selected.id, true)}><Sparkles size={20} aria-hidden="true" /><strong>Reflect on my situation</strong><span>Only the details you want to keep</span></button>
              </div>
              {!personal ? <>
                <label className={styles.field}>Choose a fictional situation<select value={selected.id} onChange={(event) => requestCase(event.target.value, false)}>
                  {resolution.kind === 'legacy' && <option value={selected.id}>{selected.title} — earlier saved example</option>}
                  {Array.from(new Set(scenarios.map((item) => item.group))).map((group) => <optgroup key={group} label={group}>{scenarios.filter((item) => item.group === group).map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</optgroup>)}
                </select></label>
                <article className={styles.example}><span className={styles.eyebrow}>A FICTIONAL MOMENT</span><h3>{selected.title}</h3><blockquote>{selected.facts.join(' ')}</blockquote>{context && <p><strong>One possible first reading, not a fact:</strong> “{context.interpretation}”</p>}<p className={styles.hint}>An original educational composite—not a case history, diagnosis or account of how common this experience is.</p></article>
              </> : <p className={styles.retained}>Your case starts with your words. The chamber does not generate personalized advice. The four lens prompts are questions for you, not conclusions about your situation.</p>}
              <details className={styles.sources}><summary>Optional · the ideas behind this exercise</summary>
                {personal && <article className={styles.example}><span className={styles.eyebrow}>FICTIONAL REFERENCE · NOT YOUR CASE</span><h3>{selected.title}</h3><p>{selected.facts.join(' ')}</p></article>}
                <p>Check an interpretation against facts, consider what the context allows, and revise when observations call for it. An uncertain or unfavorable reading can be accurate; a positive one is not required.</p>
                {sourceContext && <><p className={styles.hint}>{sourceContext.notice}</p>{sourceContext.anchors.map((anchor) => <div key={anchor.videoId} className={styles.sourceMoment}><strong>{anchor.title}</strong><p>{anchor.attribution}</p><SourceMoment url={anchor.url} label={`Caption landmark · ${anchor.role}`} /></div>)}</>}
                <p><Link href="/learn/paths/perspective-fit">Read the worked lesson and scoped evidence</Link> · <Link href="/evidence/claims/flexibility">Inspect the underlying model</Link></p>
                <p className={styles.hint}>These sources do not establish that this custom instrument improves conduct or treats a condition. No video loads until you choose to play it.</p>
              </details>
              {personal && field('situation', 'My ordinary situation', 'Optional. Avoid identifying details. Use a low-stakes situation, not trauma or an unsafe confrontation.')}
              <p className={styles.hint}>Changing mode or example opens a separate case. It never re-labels this case’s written plan.</p>
            </>}
            {stage === 1 && <>
              {!personal && <div className={styles.factReading}>
                <div><span className={styles.eyebrow}>OBSERVED</span><ul>{selected.facts.map((line) => <li key={line}>{line}</li>)}</ul></div>
                {context && <div><span className={styles.eyebrow}>ONE INTERPRETATION</span><p>{context.interpretation}</p><p className={styles.hint}>Feeling or urge: {context.emotionUrge}</p></div>}
                <div><span className={styles.eyebrow}>STILL UNKNOWN</span><ul>{selected.unknowns.map((line) => <li key={line}>{line}</li>)}</ul></div>
              </div>}
              <div className={styles.fields}>
                {field('facts', 'What I observed', personal ? 'What could be seen, heard or checked? Distinguish direct observation from a report.' : 'Optional notes on the fictional facts. No answer is scored.')}
                {field('chamber_interpretation', 'My first interpretation', 'What meaning am I giving it? This can remain a possibility rather than a verdict.')}
                {field('unknowns', 'What remains unknown', 'Include information you do not have. You do not need to invent an answer.')}
                {field('chamber_feelingUrge', 'Feeling or urge', 'A feeling is real. It does not, by itself, establish another person’s intention.')}
              </div>
              <details className={styles.sources}><summary>Optional · threat and coping are separate judgments</summary><div className={styles.twoFields}>{[['threat','Perceived threat',['Low','Uncertain','Substantial']],['coping','Perceived coping resources',['Limited','Uncertain','Available']]].map(([key,label,options]) => <label className={styles.field} key={key as string}>{label}<select value={fields[key as string] || 'unknown'} onChange={(event) => set(key as string,event.target.value)}><option value="unknown">Unknown</option>{(options as string[]).map((option) => <option key={option} value={option.toLowerCase()}>{option}</option>)}</select></label>)}</div><p className={styles.hint}>Self-described judgments, not an anxiety score or predicted physiology. Actual danger, health, capacity, context and support matter.</p></details>
            </>}
            {stage === 2 && <>
              <div className={styles.council} role="group" aria-label={personal ? 'Choose a prompt for your own lens' : 'Explore the fictional lenses'}>
                <LensAstrolabe active={frameIndex} />
                <div className={styles.orbitCenter}><span>THE SAME</span><strong>{personal ? 'situation' : 'facts'}</strong><span>MANY POSSIBLE READINGS</span></div>
                {frameNames.map((name, index) => <button className={`${styles.lensNode} ${styles[`station${index}`]}`} key={name} aria-pressed={frameIndex === index} onClick={() => set('frame', String(index))}><span className={styles.lensNumber} aria-hidden="true">{romanNumeral(index + 1)}</span><span>{name}</span><small>{frameIndex === index ? 'Exploring' : 'Explore this lens'}</small></button>)}
              </div>
              <p className={styles.mapNote}>Conceptual lens selector · not a brain scan, score or measured pathway</p>
              <section className={styles.lensReading} aria-labelledby="active-lens-title"><span className={styles.eyebrow}>{personal ? 'YOUR WORDS · NOT GENERATED ADVICE' : 'FICTIONAL POSSIBILITY · NOT A VERDICT'}</span><h3 id="active-lens-title">{frameNames[frameIndex]}</h3>
                {personal ? <div className={styles.fields}>{field(`chamber_lens${frameIndex}`, 'A possible reading', 'It can be uncertain, unfavorable or incomplete. Do not make it positive merely to feel better.')}{field(`chamber_support${frameIndex}`, 'What supports it?', 'Which observations fit this reading?')}{field(`chamber_challenge${frameIndex}`, 'What challenges it?', 'What does not fit, or what information is missing?')}</div> : <><p className={styles.reading}>{frame.interpretation}</p><LensEvidence frame={frame} /></>}
                <button className={styles.goldButton} onClick={choose}>{fields.choice === (personal ? `own-${frameIndex}` : frame.id) ? 'Chosen for consideration' : 'Consider this lens for my response'} <ArrowRight size={16} aria-hidden="true" /></button>
                <p className={styles.hint}>Exploring is not endorsement. Choosing a lens does not replace your written action.</p>
              </section>
              <button className={styles.compareButton} aria-expanded={compare} onClick={() => setCompare(!compare)}>{compare ? 'Close comparison' : 'Compare two lenses side by side'}</button>
              {compare && <div className={styles.comparison}>{['compareA','compareB'].map((key, column) => {
                const index = safeIndex(fields[key], 4, column); const other = safeIndex(fields[column === 0 ? 'compareB' : 'compareA'], 4, 1-column); const candidate = selected.frames[index];
                return <article key={key}><label className={styles.field}>Comparison {column+1}<select value={index} onChange={(event) => set(key,event.target.value)}>{frameNames.map((name,i) => <option value={i} key={name} disabled={i===other}>{name}</option>)}</select></label>
                  {personal ? <><h4>My possible reading</h4><p>{fields[`chamber_lens${index}`] || 'Not written yet.'}</p><h4>Supports</h4><p>{fields[`chamber_support${index}`] || 'Not recorded.'}</p><h4>Challenges</h4><p>{fields[`chamber_challenge${index}`] || 'Not recorded.'}</p></> : <><p>{candidate.interpretation}</p><LensEvidence frame={candidate} /></>}
                </article>;
              })}</div>}
            </>}
            {stage === 3 && <>
              <div className={styles.chosen}><span className={styles.eyebrow}>LENS CHOSEN FOR CONSIDERATION</span><p>{chosenLabel}</p><button onClick={() => go(2)}>Reconsider the lenses</button></div>
              <label className={styles.field}>Kind of response<select value={fields.chamber_responseKind || ''} onChange={(event) => set('chamber_responseKind',event.target.value)}><option value="">Still considering</option><option value="ask-check">Ask or check</option><option value="boundary">Set or keep a boundary</option><option value="support">Seek support</option><option value="pause">Pause / take no action for now</option><option value="combination">A combination or another response</option></select></label>
              <div className={styles.fields}>
                {field('action', 'One feasible next step', 'Use your own words. A pause or no action is an option; no confrontation is required.')}
                {field('chamber_actionWhen', 'When or in what situation', 'Consider your actual capacity and what is safe and practical.', 2)}
                {field('chamber_boundary', 'A boundary I want to keep', 'What participation, responsibility or limit is yours to choose?', 2)}
                {field('prediction', 'What I expect might happen', 'An optional prediction, not a promise. Include uncertainty.', 2)}
                {field('switchWhen', 'What would make me stop or change course?', 'What new observation, constraint or safety concern would matter?', 2)}
              </div>
              <button className={styles.goldButton} onClick={() => { setShowCard(true); requestAnimationFrame(() => cardHeading.current?.focus()); }}>View my response card <ArrowRight size={16} aria-hidden="true" /></button>
              {showCard && <article className={styles.responseCard} aria-labelledby="response-card-title"><span className={styles.cardKicker}>{personal ? 'MY REFLECTION' : 'FICTIONAL PRACTICE'} / A RESPONSE TO RETURN TO</span><h3 id="response-card-title" ref={cardHeading} tabIndex={-1}>My next response</h3><p className={styles.cardLead}>{fields.action || 'Still considering. No next step has been recorded.'}</p><dl><dt>When</dt><dd>{fields.chamber_actionWhen || 'Not recorded'}</dd><dt>Boundary</dt><dd>{fields.chamber_boundary || 'Not recorded'}</dd><dt>Prediction</dt><dd>{fields.prediction || 'Not recorded'}</dd><dt>Reconsider if</dt><dd>{fields.switchWhen || 'Not recorded'}</dd></dl><p>An intention, not a prediction of another person’s response or evidence of demonstrated capability.</p><div className={styles.actions}><button onClick={() => go(4)}>Return later · plan a review</button><button disabled={!draft} onClick={() => draft && download([draft], true)}>Export readable case</button></div></article>}
            </>}
            {stage === 4 && <>
              <div className={styles.reviewPlan}><span className={styles.eyebrow}>WHAT I PLANNED</span><p>{fields.action || 'No next step recorded. You can return to the response stage or simply notice what happened.'}</p><strong>Prediction</strong><p>{fields.prediction || 'No prediction recorded.'}</p><button onClick={() => go(3)}>Review my response</button></div>
              {!personal && <details className={styles.sources} onToggle={(event) => { if (event.currentTarget.open && fields.revealed !== 'yes') set('revealed','yes'); }}><summary>Explore possible fictional developments</summary><p className={styles.hint}>Separate fictional possibilities—not predictions, one sequence of events or your observations.</p>{selected.evidenceUpdates.map((item,index) => <article key={item.id} className={styles.development}><span className={styles.eyebrow}>POSSIBILITY {romanNumeral(index+1)}</span><h3>{item.fact}</h3><p>{item.interpretation}</p></article>)}</details>}
              <label className={styles.field}>Observation context<select value={fields.chamber_reviewType || ''} onChange={(event) => set('chamber_reviewType',event.target.value)}><option value="">Not recorded</option><option value="imagined">Fictional / imagined</option><option value="role-play">Role-play</option><option value="real-world">Ordinary real-world situation</option></select></label>
              {field('chamber_reviewActual', 'What actually happened?', 'Separate an observation from a possibility you imagined. Nothing is classified as real-world by default.')}
              {field('chamber_reviewMeaning', 'What does that support—and not establish?', 'One outcome does not establish another person’s motives, your worth or a universal rule.')}
              {field('chamber_reviewAdjustment', 'Keep, change or stop?', 'What, if anything, would you do differently? You do not owe another attempt.')}
              <label className={styles.field}>Review date <span className={styles.hint}>A note for you; no reminder is sent.</span><input type="date" value={fields.chamber_reviewDate || ''} onChange={(event) => set('chamber_reviewDate',event.target.value)} /></label>
              {draft?.observations.length ? <details className={styles.sources}><summary>Earlier observations retained ({draft.observations.length})</summary>{draft.observations.map((observation) => <article key={observation.id}><h3>{observation.type} · {observation.outcome}</h3><p>Prediction: {observation.prediction}</p><p>Observed: {observation.actual}</p><p>Context: {observation.context}</p><p>Unintended effects: {observation.unintended}</p></article>)}</details> : null}
              <p className={styles.hint}>This is a revisable review note, not a competence test, clinical outcome or rank award.</p>
            </>}
            </>}
          </div>
          <footer className={styles.stageFooter}><button disabled={stage === 0} onClick={() => go(stage - 1)}><ArrowLeft size={16} aria-hidden="true" /> Previous</button><span>All writing is optional</span>{stage < 4 ? <button className={styles.goldButton} onClick={() => go(stage + 1)}>Continue <ArrowRight size={16} aria-hidden="true" /></button> : <button onClick={() => go(3)}>Return to my response</button>}</footer>
        </section>

      </div>
      <p className={styles.notice} role="status">{notice || (status === 'Not saved' ? 'Explore freely. Nothing is scored, and no personal writing is required.' : '')}</p>
      {resolution.kind !== 'unavailable' && context?.resources?.length ? <details className={styles.further}><summary>Optional resources for the fictional example</summary><p>These resources relate to “{selected.title},” not a personalized recommendation.</p><div className={styles.actions}>{context.resources.map((resource) => <Link key={resource.href} href={resource.href}>{resource.label} <ArrowUpRight size={15} aria-hidden="true" /></Link>)}</div><p className={styles.hint}>If difficulties persist or interfere with everyday life, qualified support may be useful. This exercise is not a substitute for care.</p></details> : null}
      <div className={styles.bottomLine}><span>Choose clarity, not a compulsory brighter story.</span><Link href="/explore">Stop for now · leave the chamber</Link></div>
    </>}
    <dialog ref={caseDialog} aria-labelledby="new-case-title" onCancel={() => { setPendingCase(null); previousFocus.current?.focus(); }}><h2 id="new-case-title">Open a separate case?</h2><p>Your current case will stay in My notes with its original context. No fields are copied into the new case. Unsaved cases remain only in this tab until you save or export them.</p><p>This does not save, delete or change any existing record on your device.</p><div className={styles.actions}><button autoFocus onClick={cancelCase}>Keep this case open</button><button onClick={() => pendingCase && beginCase(pendingCase)}>Open separate case</button></div></dialog>
  </div>;
}
