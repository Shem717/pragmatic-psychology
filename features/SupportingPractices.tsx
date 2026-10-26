"use client";
import { useEffect } from 'react';
import { ArrowUpRight, ChevronDown, PenLine } from 'lucide-react';
import { supportingPractices } from '@/lib/supporting-practices';
import { supportingPracticeFieldKey } from '@/lib/supporting-practice-records';
import { romanNumeral } from '@/lib/presentation';
import { DraftActions } from '@/components/Workspace';
import { download, type Draft } from './notebook-data';

export function SupportingPractices({ slug, draft, set }: {
  slug: string;
  draft?: Draft;
  set: (field: string, value: string) => void;
}) {
  const practices = supportingPractices.filter((practice) => practice.discipline === slug);
  useEffect(() => {
    const revealLinkedPractice = () => {
      const linked = supportingPractices.find((practice) => practice.discipline === slug && `#practice-${practice.id}` === window.location.hash);
      if (!linked) return;
      const element = document.getElementById(`practice-${linked.id}`);
      if (element instanceof HTMLDetailsElement) element.open = true;
    };
    revealLinkedPractice();
    const reopenCurrentLink = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest('a');
      if (link?.getAttribute('href') === window.location.hash) revealLinkedPractice();
    };
    window.addEventListener('hashchange', revealLinkedPractice);
    document.addEventListener('click', reopenCurrentLink);
    return () => {
      window.removeEventListener('hashchange', revealLinkedPractice);
      document.removeEventListener('click', reopenCurrentLink);
    };
  }, [slug]);
  if (!practices.length) return null;
  return <section className="supporting-practices" aria-labelledby={`supporting-${slug}`}>
    <div className="supporting-heading"><span className="eyebrow">FROM UNDERSTANDING TO PRACTICE</span><h2 id={`supporting-${slug}`}>A smaller step you can try.</h2><p>Optional supporting practices, adapted for ordinary situations. Choose what fits; leave any prompt blank or stop. These are not assessments or validated interventions.</p><p className="fine">These source interviews are supporting references, separate from the seven selected videos in the Library. The prompts and examples are this site’s editorial adaptations, not verbatim protocols or evidence of effectiveness.</p></div>
    {practices.map((practice, index) => {
      const hasNotes = practice.fields.some((field) => draft?.fields[supportingPracticeFieldKey(practice.id, field.key)]?.trim());
      return <details className="panel supporting-practice" id={`practice-${practice.id}`} key={practice.id}>
        <summary><span className="supporting-seal" aria-hidden="true">{romanNumeral(index + 1)}</span><span><strong>{practice.title}</strong><small>{hasNotes ? 'Notes in this learning record · open to review' : 'Open this optional practice'}</small></span><ChevronDown size={19} aria-hidden="true" /></summary>
        <div className="supporting-body">
          <p className="practice-purpose">{practice.summary}</p>
          <p className="practice-boundary">{practice.safety}</p>
          <details className="practice-example"><summary>See an ordinary example</summary><p>{practice.example}</p><p className="fine">Fictional example, not a result or a prediction for you.</p></details>
          <p className="practice-storage"><PenLine size={16} aria-hidden="true" /><span>Write only what you want to keep. Entries stay in this tab until you choose Save on this device. After the first save, changes to this record save automatically. Saving or exporting here includes this discipline’s other practice fields and learning note.</span></p>
          <ol className="practice-fields">
            {practice.fields.map((field, fieldIndex) => {
              const key = supportingPracticeFieldKey(practice.id, field.key);
              const inputId = `field-${key}`;
              return <li key={field.key}><span className="practice-step" aria-hidden="true">{romanNumeral(fieldIndex + 1)}</span><div><label htmlFor={inputId}>{field.label}</label><p id={`${inputId}-hint`} className="practice-hint">{field.hint}</p><textarea id={inputId} aria-describedby={`${inputId}-hint`} rows={3} maxLength={10000} disabled={!draft} placeholder={field.placeholder} value={draft?.fields[key] || ''} onChange={(event) => set(key, event.target.value)} /></div></li>;
            })}
          </ol>
          <DraftActions draftKey={`learning-${slug}`} />
          <div className="actions"><button disabled={!draft} onClick={() => draft && download([draft])}>Export this discipline record</button><button disabled={!draft} onClick={() => draft && download([draft], true)}>Export readable notes</button></div>
          <aside className="practice-attribution" aria-label="Source idea and editorial adaptation"><span className="small-label">ATTRIBUTION, NOT AN EFFICACY CLAIM</span><p>{practice.attribution}</p><ul>{practice.sources.map((source) => <li key={source.url}><a href={source.url}>{source.label} <ArrowUpRight size={14} aria-hidden="true" /></a></li>)}</ul><p className="fine">Links point to the reviewed caption passages. Captions may contain errors. An interview supports attribution of an idea; it does not establish the effectiveness of this worksheet.</p></aside>
        </div>
      </details>;
    })}
  </section>;
}
