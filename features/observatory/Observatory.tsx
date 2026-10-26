"use client";
import { Component, useCallback, useEffect, useReducer, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Compass, Telescope, Orbit, Search, RotateCcw } from 'lucide-react';
import { useWorkspace } from '@/components/Workspace';
import { observatoryStations, initialObservatoryState, observatoryReducer, showObservatoryScene, observatoryRoomScrollTop, type ObservatoryStation } from '@/lib/observatory-state';
import { InstrumentDialog } from './InstrumentDialog';
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
  const sideWorkbench=useMedia('(min-width: 1200px) and (min-height: 600px)');
  const focused=prefs.mode==='Focused' || (hydrated && document.documentElement.dataset.mode==='Focused');
  const [state,dispatch]=useReducer(observatoryReducer,initialObservatoryState);
  const [lens,setLens]=useState(0);
  const [hovered,setHovered]=useState<ObservatoryStation|null>(null);
  const instrumentOrigin=useRef<HTMLButtonElement|null>(null);
  const panel=useRef<HTMLDivElement>(null);
  const panelTitle=useRef<HTMLHeadingElement>(null);
  const room=useRef<HTMLDivElement>(null);
  const stationNav=useRef<HTMLElement>(null);
  const active=state.station || 'telescope';
  const renderScene=hydrated && showObservatoryScene(state,focused,phone);
  const activeStation=observatoryStations.find((station)=>station.id===active)!;
  const failure=useCallback((reason:string)=>dispatch({type:'failure',reason}),[]);
  const ready=useCallback(()=>dispatch({type:'ready'}),[]);
  const alignRoom=useCallback((focusRoom=true)=>{
    const target=room.current;
    if(!target) return;
    const header=document.querySelector<HTMLElement>('.site-header');
    const position=header ? getComputedStyle(header).position : '';
    const offset=header && (position==='sticky'||position==='fixed') ? header.getBoundingClientRect().height : 0;
    if(focusRoom)target.focus({preventScroll:true});
    window.scrollTo({top:observatoryRoomScrollTop(target.getBoundingClientRect().top,window.scrollY,offset),behavior:'instant'});
  },[]);
  useEffect(()=>{if(!renderScene && state.instrument)dispatch({type:'close-instrument'});},[renderScene,state.instrument]);
  const chooseStation=useCallback((station:ObservatoryStation,origin:HTMLButtonElement|null=null)=>{
    instrumentOrigin.current=origin;
    setHovered(null);
    dispatch({type:'open-instrument',station,spatial:renderScene});
    if(renderScene) requestAnimationFrame(()=>alignRoom(false));
    if(!renderScene) requestAnimationFrame(()=>{panelTitle.current?.focus({preventScroll:true});panel.current?.scrollIntoView({block:'start',behavior:'instant'});});
  },[renderScene,alignRoom]);
  const chooseMesh=useCallback((station:ObservatoryStation)=>chooseStation(station),[chooseStation]);
  const resolveInstrumentOrigin=useCallback(()=>{
    const origin=instrumentOrigin.current;
    if(origin?.isConnected && origin.getClientRects().length)return origin;
    return stationNav.current?.querySelector<HTMLButtonElement>(`button[data-observatory-station="${state.station || 'telescope'}"]`) || panelTitle.current;
  },[state.station]);
  const closeInstrument=useCallback(()=>dispatch({type:'close-instrument'}),[]);
  const openWork=()=>{
    if(renderScene) { chooseStation(active); return; }
    requestAnimationFrame(()=>{
      panelTitle.current?.focus({preventScroll:true});
      panel.current?.scrollIntoView({block:'start',behavior:'instant'});
    });
  };
  const skipRoom=()=>{dispatch({type:'plain'});requestAnimationFrame(()=>{panelTitle.current?.focus({preventScroll:true});panel.current?.scrollIntoView({block:'start',behavior:'instant'});});};
  const returnToRoom=()=>{
    dispatch({type:'hall'});
    requestAnimationFrame(()=>alignRoom());
  };
  return <div className="observatory-experience">
    <header className="observatory-room-heading"><div><span className="eyebrow">SOVEREIGN PSYCHOLOGY / THE OBSERVATORY</span><h1>A room for clearer choices.</h1></div>{renderScene&&<button className="text-link" onClick={skipRoom}>Skip the room. Use the instruments <ArrowRight size={16} aria-hidden="true"/></button>}</header>
    {renderScene ? <div ref={room} className="observatory-room" role="region" tabIndex={-1} aria-label="Three-dimensional observatory">
      <div className="observatory-render-window"><ObservatoryBoundary key={state.attempt} onFailure={failure}><ObservatoryScene station={state.station} workbench={sideWorkbench && !!state.instrument} lens={lens} reducedMotion={reducedMotion} onStation={chooseMesh} onHover={setHovered} highlighted={hovered} onReady={ready} onFailure={failure}/></ObservatoryBoundary></div>
      {!state.ready&&<div className="observatory-loading" role="status"><Compass size={35} aria-hidden="true"/><span>Preparing stone, brass and starlight…</span><button onClick={skipRoom}>Continue with the instruments now</button></div>}
      {hovered && <div className="observatory-hover-label" role="status">Open {observatoryStations.find((station)=>station.id===hovered)?.title} <ArrowUpRight size={15} aria-hidden="true"/></div>}
      <div className="observatory-room-caption"><span>REAL 3D SETTING · EDUCATIONAL INSTRUMENTS</span><button onClick={returnToRoom} disabled={!state.station}><RotateCcw size={14} aria-hidden="true"/>Room view</button></div>
    </div> : <div className={`observatory-plain-intro${phone&&!focused ? " is-compact" : ""}`}>{phone&&!focused&&<div className="observatory-compact-art" aria-hidden="true"/>}<Compass size={36} aria-hidden="true"/><div><h2>{focused?'A focused place to think.':phone?'Three instruments. A clearer next move.':state.failure?'The room is optional. The work is here.':'The same instruments, without the spatial room.'}</h2><p>Choose a situation, inspect the evidence or continue a practice plan. Each instrument opens a different path through the same inquiry.</p></div>{hydrated&&!focused&&!phone&&<button onClick={()=>dispatch({type:'retry'})}>Show the spatial room</button>}</div>}
    {state.failure&&<p className="observatory-device-note" role="status">{state.failure}</p>}
    <nav ref={stationNav} className="observatory-station-nav" aria-label="Observatory instruments">{observatoryStations.map((station,index)=>{const Icon=[Telescope,Orbit,Search][index];return <button key={station.id} aria-pressed={active===station.id} data-observatory-station={station.id} aria-haspopup={renderScene ? "dialog" : undefined} aria-label={`Open ${station.title}`} aria-controls={renderScene ? "observatory-instrument-dialog" : "observatory-workbench"} onFocus={()=>setHovered(station.id)} onBlur={()=>setHovered(null)} onClick={(event)=>chooseStation(station.id,event.currentTarget)}><Icon size={24} strokeWidth={1.4} aria-hidden="true"/><span><small>{station.roman} / INSTRUMENT</small><strong>{station.title}</strong><span>{station.subtitle}</span></span><ArrowRight size={17} aria-hidden="true"/></button>;})}</nav>
    <div className="observatory-room-instructions"><p>{renderScene?'Hover an instrument to reveal its invitation, then select it to open the working panel here. The matching buttons work by keyboard. No walking controls are required.':'All three working panels are available using the labeled controls.'}{reducedMotion&&renderScene?' Reduced motion: camera changes are immediate.':''}</p><button className="primary" onClick={openWork}>Use {activeStation.title} <ArrowRight size={16} aria-hidden="true"/></button></div>
    <div ref={panel} id="observatory-workbench" className="observatory-workbench">
      <header className="observatory-workbench-heading"><div><span className="eyebrow">THE INSTRUMENT, IN YOUR HANDS</span><h2 ref={panelTitle} tabIndex={-1}>{activeStation.title}</h2></div>{renderScene&&<button onClick={returnToRoom}>Back to the room <Compass size={16} aria-hidden="true"/></button>}</header>
      {!state.instrument&&active==='telescope'&&<TelescopeWorkshop onLensChange={setLens}/>}
      {!state.instrument&&active==='practice'&&<PracticeOrrery/>}
      {!state.instrument&&active==='evidence'&&<EvidenceDesk/>}
    </div>
    {renderScene&&state.instrument&&<InstrumentDialog key={state.instrument} sideWorkbench={sideWorkbench} title={observatoryStations.find((station)=>station.id===state.instrument)!.title} onClose={closeInstrument} resolveReturnFocus={resolveInstrumentOrigin}>{state.instrument==='telescope'?<TelescopeWorkshop onLensChange={setLens}/>:state.instrument==='practice'?<PracticeOrrery/>:<EvidenceDesk/>}</InstrumentDialog>}
    <section className="observatory-direct-paths" aria-label="Direct instrument routes"><h2>Prefer the familiar route?</h2><p>The full workspaces remain available. The observatory is another way in—not a replacement for your notes or a measure of your progress.</p><div className="actions"><Link href="/explore/perspectives">Perspective Rolodex <ArrowUpRight size={15} aria-hidden="true"/></Link><Link href="/explore/identity">Identity-to-Competence Explorer <ArrowUpRight size={15} aria-hidden="true"/></Link><Link href="/evidence">Evidence register <ArrowUpRight size={15} aria-hidden="true"/></Link><Link href="/start">Guided first session <ArrowUpRight size={15} aria-hidden="true"/></Link></div></section>
  </div>;
}
