"use client";
import { Component, useCallback, useReducer, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Compass, Telescope, Orbit, Search, RotateCcw } from 'lucide-react';
import { useWorkspace } from '@/components/Workspace';
import { observatoryStations, initialObservatoryState, observatoryReducer, showObservatoryScene, type ObservatoryStation } from '@/lib/observatory-state';
import { TelescopeWorkshop } from './TelescopeWorkshop';
import { PracticeOrrery } from './PracticeOrrery';
import { EvidenceDesk } from './EvidenceDesk';
const ObservatoryScene=dynamic(()=>import('./ObservatoryScene'),{ssr:false,loading:()=> <div className="observatory-loading" role="status"><Compass size={35} aria-hidden="true"/><span>Opening the observatory…</span></div>});
const noopSubscribe=()=>()=>{};
function useMedia(query:string) {
  const subscribe=useCallback((notify:()=>void)=>{const media=window.matchMedia(query);media.addEventListener('change',notify);return()=>media.removeEventListener('change',notify);},[query]);
  return useSyncExternalStore(subscribe,()=>window.matchMedia(query).matches,()=>false);
}
class ObservatoryBoundary extends Component<{children:ReactNode;onFailure:(reason:string)=>void},{failed:boolean}> {
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  componentDidCatch(){this.props.onFailure('The spatial room is unavailable here. Every instrument remains available below.');}
  render(){return this.state.failed ? null : this.props.children;}
}
export function Observatory() {
  const {prefs}=useWorkspace();
  const hydrated=useSyncExternalStore(noopSubscribe,()=>true,()=>false);
  const phone=useMedia('(max-width: 699px), (max-height: 450px) and (pointer: coarse)');
  const reducedMotion=useMedia('(prefers-reduced-motion: reduce)');
  const focused=prefs.mode==='Focused' || (hydrated && document.documentElement.dataset.mode==='Focused');
  const [state,dispatch]=useReducer(observatoryReducer,initialObservatoryState);
  const [lens,setLens]=useState(0);
  const panel=useRef<HTMLDivElement>(null);
  const panelTitle=useRef<HTMLHeadingElement>(null);
  const room=useRef<HTMLDivElement>(null);
  const stationNav=useRef<HTMLElement>(null);
  const active=state.station || 'telescope';
  const renderScene=hydrated && showObservatoryScene(state,focused,phone);
  const activeStation=observatoryStations.find((station)=>station.id===active)!;
  const failure=useCallback((reason:string)=>dispatch({type:'failure',reason}),[]);
  const ready=useCallback(()=>dispatch({type:'ready'}),[]);
  const chooseStation=useCallback((station:ObservatoryStation)=>{
    dispatch({type:'station',station});
  },[]);
  const openWork=()=>{
    requestAnimationFrame(()=>{
      panelTitle.current?.focus({preventScroll:true});
      panel.current?.scrollIntoView({block:'start',behavior:'instant'});
    });
  };
  const skipRoom=()=>{dispatch({type:'plain'});openWork();};
  const returnToRoom=()=>{
    dispatch({type:'hall'});
    requestAnimationFrame(()=>{room.current?.scrollIntoView({block:'start',behavior:'instant'});stationNav.current?.querySelector<HTMLButtonElement>('button')?.focus({preventScroll:true});});
  };
  return <div className="observatory-experience">
    <header className="observatory-room-heading"><div><span className="eyebrow">SOVEREIGN PSYCHOLOGY / THE OBSERVATORY</span><h1>A room for clearer choices.</h1></div><button className="text-link" onClick={skipRoom}>Skip the room. Use the instruments <ArrowRight size={16} aria-hidden="true"/></button></header>
    {renderScene ? <div ref={room} className="observatory-room" aria-label="Three-dimensional observatory">
      <div className="observatory-render-window"><ObservatoryBoundary key={state.attempt} onFailure={failure}><ObservatoryScene station={state.station} lens={lens} reducedMotion={reducedMotion} onStation={chooseStation} onReady={ready} onFailure={failure}/></ObservatoryBoundary></div>
      {!state.ready&&<div className="observatory-loading" role="status"><Compass size={35} aria-hidden="true"/><span>Preparing stone, brass and starlight…</span><button onClick={skipRoom}>Continue with the instruments now</button></div>}
      <div className="observatory-room-caption"><span>REAL 3D SETTING · EDUCATIONAL INSTRUMENTS</span><button onClick={returnToRoom} disabled={!state.station}><RotateCcw size={14} aria-hidden="true"/>Room view</button></div>
    </div> : <div className="observatory-plain-intro"><Compass size={36} aria-hidden="true"/><div><h2>{focused?'A focused place to think.':phone?'The instruments, ready for a smaller screen.':state.failure?'The room is optional. The work is here.':'The same instruments, without the spatial room.'}</h2><p>Choose a situation, inspect the evidence or continue a practice plan. Nothing depends on 3D, motion or a particular device.</p></div>{hydrated&&!focused&&!phone&&<button onClick={()=>dispatch({type:'retry'})}>Show the spatial room</button>}</div>}
    {state.failure&&<p className="observatory-device-note" role="status">{state.failure}</p>}
    <nav ref={stationNav} className="observatory-station-nav" aria-label="Observatory instruments">{observatoryStations.map((station,index)=>{const Icon=[Telescope,Orbit,Search][index];return <button key={station.id} aria-pressed={active===station.id} aria-controls="observatory-workbench" onClick={()=>chooseStation(station.id)}><Icon size={24} strokeWidth={1.4} aria-hidden="true"/><span><small>{station.roman} / INSTRUMENT</small><strong>{station.title}</strong><span>{station.subtitle}</span></span><ArrowRight size={17} aria-hidden="true"/></button>;})}</nav>
    <div className="observatory-room-instructions"><p>{renderScene?'Select a physical instrument or its labeled button. The camera guides you there; its working panel is just below. No walking controls are required.':'All three working panels are available using the labeled controls.'}{reducedMotion&&renderScene?' Reduced motion: camera changes are immediate.':''}</p><button className="primary" onClick={openWork}>Use {activeStation.title} <ArrowRight size={16} aria-hidden="true"/></button></div>
    <div ref={panel} id="observatory-workbench" className="observatory-workbench">
      <header className="observatory-workbench-heading"><div><span className="eyebrow">THE INSTRUMENT, IN YOUR HANDS</span><h2 ref={panelTitle} tabIndex={-1}>{activeStation.title}</h2></div>{renderScene&&<button onClick={returnToRoom}>Back to the room <Compass size={16} aria-hidden="true"/></button>}</header>
      {active==='telescope'&&<TelescopeWorkshop onLensChange={setLens}/>}
      {active==='practice'&&<PracticeOrrery/>}
      {active==='evidence'&&<EvidenceDesk/>}
    </div>
    <section className="observatory-direct-paths" aria-label="Direct instrument routes"><h2>Prefer the familiar route?</h2><p>The full workspaces remain available. The observatory is another way in—not a replacement for your notes or a measure of your progress.</p><div className="actions"><Link href="/explore/perspectives">Perspective Rolodex <ArrowUpRight size={15} aria-hidden="true"/></Link><Link href="/explore/identity">Identity-to-Competence Explorer <ArrowUpRight size={15} aria-hidden="true"/></Link><Link href="/evidence">Evidence register <ArrowUpRight size={15} aria-hidden="true"/></Link><Link href="/start">Guided first session <ArrowUpRight size={15} aria-hidden="true"/></Link></div></section>
  </div>;
}
