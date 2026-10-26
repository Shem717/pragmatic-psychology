"use client";
import { Component, useCallback, useState, useSyncExternalStore, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, RotateCcw, Gem } from 'lucide-react';
import { useWorkspace } from '@/components/Workspace';
import type { BenchmarkConfiguration } from './BenchmarkScene';
import styles from './LibraryBenchmark.module.css';
const Scene=dynamic(()=>import('./BenchmarkScene'),{ssr:false});
const noop=()=>()=>{};
class GraphicsBoundary extends Component<{children:ReactNode;onFailure:(message:string)=>void},{failed:boolean}>{
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  componentDidCatch(){this.props.onFailure('Live 3D is unavailable in this browser. The labeled offline render below is a separate reference, not a live scene.');}
  render(){return this.state.failed?null:this.props.children;}
}
export function LibraryBenchmark({configuration,previewUrl,previewWidth,previewHeight,materialNotes}:{configuration:BenchmarkConfiguration;previewUrl:string;previewWidth:number;previewHeight:number;materialNotes:string[]}){
  const {prefs}=useWorkspace();
  const hydrated=useSyncExternalStore(noop,()=>true,()=>false);
  const subscribe=useCallback((notify:()=>void)=>{const media=window.matchMedia('(max-width:699px)');media.addEventListener('change',notify);return()=>media.removeEventListener('change',notify);},[]);
  const phone=useSyncExternalStore(subscribe,()=>window.matchMedia('(max-width:699px)').matches,()=>true);
  const [view,setView]=useState(configuration.views[0].id);
  const [failure,setFailure]=useState<string|null>(null);
  const [ready,setReady]=useState(false);
  const [attempt,setAttempt]=useState(0);
  const [reset,setReset]=useState(0);
  const focused=prefs.mode==='Focused';
  const live=hydrated&&!phone&&!focused&&!failure;
  const failed=useCallback((message:string)=>setFailure(message),[]);
  const loaded=useCallback(()=>setReady(true),[]);
  const starting=useCallback(()=>setReady(false),[]);
  const retry=()=>{setFailure(null);setReady(false);setAttempt(value=>value+1);};
  return <div className={`library-benchmark ${styles.benchmark}`}>
    <header className={styles.heading}><div><span className="eyebrow">EXPERIMENTAL / MATERIAL & ARCHITECTURE STUDY</span><h1>A closer look at the craft.</h1><p>One Blender-authored shelf bay and celestial centerpiece, exported into the browser. This is a quality benchmark—not a completed replacement hall.</p></div><Link href="/library"><ArrowLeft size={16} aria-hidden="true"/>Return to the Library</Link></header>
    {live?<><div className={styles.stage}><GraphicsBoundary key={attempt} onFailure={failed}><Scene configuration={configuration} view={view} reset={reset} onLoading={starting} onReady={loaded} onFailure={failed}/></GraphicsBoundary>{!ready&&<div className={styles.loading} role="status"><Gem size={26} aria-hidden="true"/>Loading the actual 3D assets…</div>}</div><nav className={styles.views} aria-label="Benchmark inspection views">{configuration.views.map(candidate=><button key={candidate.id} aria-pressed={view===candidate.id} onClick={()=>setView(candidate.id)}>{candidate.label}</button>)}<button onClick={()=>{setView(configuration.views[0].id);setReset(value=>value+1);}}><RotateCcw size={15} aria-hidden="true"/>Reset inspection</button></nav><p className={styles.hint}>Drag to inspect from a limited angle, or use the labeled camera views. Scroll to adjust viewing distance. No walking controls or animation are required.</p></>:<figure className={styles.preview}><Image unoptimized src={previewUrl} width={previewWidth} height={previewHeight} alt="Offline Blender render of the proposed detailed library bay and celestial centerpiece."/><figcaption><strong>Offline Blender render—not live browser 3D.</strong> {focused?'Focused mode keeps this study still.':phone?'The live material study is intended for a laptop or larger tablet.':failure||'Preparing the browser study…'}{failure&&!phone&&!focused&&<button onClick={retry}>Retry live 3D</button>}</figcaption></figure>}
    <section className={styles.notes} aria-label="What this benchmark shows"><div><span className="eyebrow">THE ACCEPTANCE TEST</span><h2>Judge the exported asset, not just the render.</h2><p>Inspect the silhouette, carving, leather, marble and light together. The shelves here are a material study, not additional readable volumes. Your existing seven Library volumes and reading tools are unchanged.</p></div><div><h3>What is modeled, baked and live</h3><ul>{materialNotes.map(note=><li key={note}>{note}</li>)}</ul><Link href="/library">Open the working Library <ArrowLeft size={15} aria-hidden="true"/></Link></div></section>
  </div>;
}
