"use client";
import { useRef } from 'react';
import { ArrowUpRight, Play, X } from 'lucide-react';
import { parseYouTubeSource, buildYouTubeEmbedUrl } from '@/lib/video-source';
import { useVideoPlayback } from './useVideoPlayback';

/** Expands at the cited passage; activating another source unloads this iframe. */
export function SourceMoment({ url, label }: { url: string; label: string }) {
  const source = parseYouTubeSource(url);
  const { id: playerId, root: playerRoot, active, activate, close: release } = useVideoPlayback();
  const trigger = useRef<HTMLButtonElement>(null);
  const regionId = `source-player-${playerId}`;
  if (!source) return <a className="source-external" href={/^https?:\/\//.test(url) ? url : undefined}>{label} · External source <ArrowUpRight size={13} aria-hidden="true" /></a>;
  const close = () => { release(); trigger.current?.focus({ preventScroll: true }); };
  return <div className="source-moment" ref={playerRoot}>
    <div className="source-moment-actions"><button ref={trigger} type="button" className="source-moment-trigger" aria-expanded={active} aria-controls={regionId} aria-describedby={`${regionId}-notice`} onClick={() => active ? close() : activate()}><Play size={14} aria-hidden="true" />{active ? 'Close source' : 'Watch here'} · {label}</button><a className="source-external" href={url} target="_blank" rel="noopener">YouTube <ArrowUpRight size={12} aria-hidden="true" /><span className="sr-only"> (opens a new tab)</span></a></div>
    <p className="source-privacy" id={`${regionId}-notice`}>Watch here connects to YouTube. Your place and notes stay here.</p>
    {active && <section id={regionId} className="source-moment-expansion" aria-label={`Inline video: ${label}`}>
      <div className="source-player-heading"><span>AT THE SOURCE · {label}</span><button type="button" onClick={close} aria-label={`Close video: ${label}`}><X size={16} aria-hidden="true" /> Close</button></div>
      <div className="source-player-frame"><iframe key={`${source.videoId}-${source.start}`} src={buildYouTubeEmbedUrl(source)} title={`${label} — YouTube source video`} allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /></div>
      <p className="source-player-help">Press Play if needed. {source.start > 0 ? 'The player starts near the cited moment;' : 'The player starts at the beginning;'} YouTube may show ads or restrict playback. <a href={url} target="_blank" rel="noopener">Open on YouTube instead<span className="sr-only"> (new tab)</span> <ArrowUpRight size={12} aria-hidden="true" /></a></p>
    </section>}
  </div>;
}
