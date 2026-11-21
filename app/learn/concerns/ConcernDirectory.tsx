'use client';

import { useRef, useState } from 'react';
import { ArrowRight, Search, X } from 'lucide-react';
import { concernGroups, findConcerns } from '@/lib/concern-guide';
import styles from './concerns.module.css';

export function ConcernDirectory() {
  const [query, setQuery] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const entries = findConcerns(query);
  const groups = concernGroups.filter(group => entries.some(entry => entry.group === group.id));
  function clear() {
    setQuery('');
    input.current?.focus();
  }

  return <div className={styles.directory}>
    <div className={styles.searchArea}>
      <label htmlFor="concern-search">Find a concern or condition</label>
      <div className={styles.field}>
        <Search size={20} aria-hidden="true" />
        <input type="search" id="concern-search" ref={input} value={query} onChange={event => setQuery(event.target.value)}
          placeholder="Try “putting things off,” “lonely,” or “ADHD”" />
        {query && <button type="button" onClick={clear} aria-label="Clear concern search"><X size={18} aria-hidden="true" /></button>}
      </div>
      <p className={styles.status} role="status">{entries.length} {entries.length === 1 ? 'entry' : 'entries'}{query.trim() ? ' matching “' + query.trim() + '”' : ' in the guide'}</p>
    </div>
    {groups.length > 1 && <nav className={styles.jumpLinks} aria-label="Jump to a concern group">
      {groups.map(group => <a key={group.id} href={'#' + group.id}>{group.title}</a>)}
    </nav>}
    {groups.map(group => <section className={styles.group} key={group.id} aria-labelledby={group.id}>
      <h2 id={group.id} tabIndex={-1}>{group.title}</h2>
      <div className={styles.entries}>{entries.filter(entry => entry.group === group.id).map(entry =>
        <article key={entry.id} className={styles.entry} aria-labelledby={entry.id}>
          <h3 id={entry.id} tabIndex={-1}>{entry.title}</h3>
          <p>{entry.description}</p>
          <ul>{entry.resources.map(resource => <li key={resource.href}>
            <a href={resource.href}><span className={styles.kind}>{resource.kind}</span>
              <span>{resource.title} <ArrowRight size={14} aria-hidden="true" /></span>
            </a>
          </li>)}</ul>
        </article>)}</div>
    </section>)}
    {!entries.length && <section className={styles.empty}><h2>No matching entry</h2><p>Try a shorter phrase, a condition name, or its abbreviation.</p>
      <button className="button" onClick={clear}>Show all entries</button></section>}
  </div>;
}
