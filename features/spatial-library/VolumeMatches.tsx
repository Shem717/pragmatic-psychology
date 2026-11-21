import { ArrowRight } from 'lucide-react';
import { romanNumeral } from '@/lib/presentation';
import { highlightWords, searchWords, singular } from '@/lib/search-words';
import type { CompanionPassage } from '@/lib/companion-edition';
import type { LibrarySearchResult } from '@/lib/spatial-library';

function markedText(text: string, terms: Set<string>) {
  return text.split(highlightWords).map((piece, i) => {
    const [word] = searchWords(piece);
    return word && terms.has(singular(word)) ? <mark key={i}>{piece}</mark> : piece;
  });
}

export function VolumeMatches({ results, query }: { results: LibrarySearchResult[]; query: string }) {
  const terms = new Set(searchWords(query).map(singular));
  return <div className="volume-search-results">{results.map(({ volume, matches }) => {
    const [best, ...rest] = matches;
    const renderMatch = (item: CompanionPassage) => <div className="volume-match" key={item.id}>
      <span className="match-kind">{item.label}</span>
      <a href={'/library/videos/' + volume.id + '/#' + item.id} aria-label={item.title + ' in ' + volume.title}>
        {markedText(item.title, terms)} <ArrowRight size={15} aria-hidden="true" />
      </a>
      {item.text && <p>{markedText(item.text, terms)}</p>}
    </div>;
    return <article className="volume-search-result" key={volume.id}>
      <header><span className="small-label">Volume {romanNumeral(volume.number)}</span><h3>{volume.title}</h3></header>
      {renderMatch(best)}
      {rest.length > 0 && <details><summary>{rest.length} more matching {rest.length === 1 ? 'passage' : 'passages'}</summary>{rest.map(renderMatch)}</details>}
    </article>;
  })}</div>;
}
