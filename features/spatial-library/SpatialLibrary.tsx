"use client";
import { Component, useCallback, useEffect, useReducer, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, BookOpen, ChevronLeft, Compass, Library, Search, X } from 'lucide-react';
import { useWorkspace } from '@/components/Workspace';
import { libraryCategories, libraryVolumes, filterLibraryVolumes, getLibraryVolume, type LibraryCategoryId } from '@/lib/spatial-library';
import { initialSpatialLibraryState, mayRenderLibraryScene, spatialLibraryReducer } from '@/lib/spatial-library-state';
import { romanNumeral } from '@/lib/presentation';
import { BookReader } from './BookReader';
const LibraryScene = dynamic(()=>import('./LibraryScene'), {ssr:false,loading:()=> <div className="spatial-scene-loading" role="status"><Compass size={34} aria-hidden="true" /><span>Opening the reading hall…</span></div>});
function useMedia(query:string) {
  const subscribe=useCallback((notify:()=>void)=>{const media=window.matchMedia(query);media.addEventListener('change',notify);return()=>media.removeEventListener('change',notify);},[query]);
  return useSyncExternalStore(subscribe,()=>window.matchMedia(query).matches,()=>false);
}
class SceneBoundary extends Component<{children:ReactNode;onFailure:(reason:string)=>void},{failed:boolean}> {
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  componentDidCatch(){this.props.onFailure('The 3D room could not be opened on this device. Every volume remains available in the catalog.');}
  render(){return this.state.failed ? null : this.props.children;}
}
export function SpatialLibrary() {
  const {prefs}=useWorkspace();
  const wingControls=useRef<HTMLDivElement>(null);
  const stageElement=useRef<HTMLDivElement>(null);
  const entrancePending=useRef(false);
  const catalogHeading=useRef<HTMLHeadingElement>(null);
  const catalogFilters=useRef<HTMLElement>(null);
  const readerOrigin=useRef<{button:HTMLButtonElement|null;category:LibraryCategoryId|null}>({button:null,category:null});
  const phone=useMedia('(max-width: 699px), (max-height: 450px) and (pointer: coarse)');
  const reducedMotion=useMedia('(prefers-reduced-motion: reduce)');
  const focused=prefs.mode==='Focused';
  const [state,dispatch]=useReducer(spatialLibraryReducer,initialSpatialLibraryState);
  const [query,setQuery]=useState('');
  const [readingBook,setReadingBook]=useState<string|null>(null);
  const sceneVisible=mayRenderLibraryScene({entered:state.entered,focused,phone,failure:state.failure});
  const category=libraryCategories.find((item)=>item.id===state.category);
  const volumes=filterLibraryVolumes(query,state.category);
  const alignStage=useCallback(()=>{
    const stage=stageElement.current;
    if(!stage)return;
    const header=document.querySelector<HTMLElement>('.site-header');
    const position=header ? getComputedStyle(header).position : '';
    const offset=header && (position==='sticky'||position==='fixed') ? Math.max(0,header.getBoundingClientRect().bottom) : 0;
    window.scrollTo({top:Math.max(0,window.scrollY+stage.getBoundingClientRect().top-offset-16),behavior:'instant'});
  },[]);
  const chooseCategory=useCallback((id:LibraryCategoryId)=>{setQuery('');dispatch({type:'category',category:id});if(stageElement.current?.classList.contains('is-entered'))requestAnimationFrame(alignStage);},[alignStage]);
  const openBook=useCallback((id:string,button:HTMLButtonElement|null=null)=>{
    const volume=getLibraryVolume(id);
    if(!volume) return;
    readerOrigin.current={button,category:volume.category};
    setReadingBook(null);dispatch({type:'book',id});
  },[]);
  const chooseBook=useCallback((id:string)=>openBook(id),[openBook]);
  const closeBook=useCallback(()=>{setReadingBook(null);dispatch({type:'close-book'});},[]);
  const resolveReaderFocus=useCallback(()=>{
    const origin=readerOrigin.current;
    if(origin.button?.isConnected && origin.button.getClientRects().length) return origin.button;
    const selector=`button[data-library-category="${origin.category}"]`;
    const wing=wingControls.current?.querySelector<HTMLButtonElement>(selector);
    if(wing?.isConnected && wing.getClientRects().length) return wing;
    return catalogFilters.current?.querySelector<HTMLButtonElement>(selector) || catalogHeading.current;
  },[]);
  const sceneReady=useCallback(()=>{
    dispatch({type:'ready'});
    requestAnimationFrame(()=>{if(document.activeElement===document.body) wingControls.current?.querySelector<HTMLButtonElement>('button')?.focus({preventScroll:true});});
  },[]);
  const sceneFailure=useCallback((reason:string)=>dispatch({type:'failure',reason}),[]);
  const returnToHall=()=>{setQuery('');dispatch({type:'hall'});if(stageElement.current?.classList.contains('is-entered'))requestAnimationFrame(alignStage);};
  const showCatalog=()=>{dispatch({type:'catalog'});requestAnimationFrame(()=>catalogHeading.current?.focus());};
  const enterRoom=()=>{entrancePending.current=true;dispatch({type:'enter'});};
  useEffect(()=>{
    if(!sceneVisible || !entrancePending.current)return;
    // Measure after the entered layout and responsive header have both committed.
    let secondFrame=0;
    const frame=requestAnimationFrame(()=>{secondFrame=requestAnimationFrame(()=>{
      alignStage();
      entrancePending.current=false;
    });});
    return()=>{cancelAnimationFrame(frame);cancelAnimationFrame(secondFrame);};
  },[sceneVisible,alignStage]);
  useEffect(()=>{
    if (!state.bookId) return;
    const timer=window.setTimeout(()=>setReadingBook(state.bookId),sceneVisible && !reducedMotion ? 850 : 0);
    return()=>window.clearTimeout(timer);
  },[state.bookId,sceneVisible,reducedMotion]);
  return <section className="spatial-library" aria-labelledby="spatial-title">
    <header className="spatial-heading"><div><span className="eyebrow">THE CELESTIAL ARCHIVE · SEVEN SELECTED VOLUMES</span><h1 id="spatial-title">{phone ? <>Seven volumes.<br/><em>A world of inquiry.</em></> : <>A library you can <em>step inside.</em></>}</h1><p>{phone ? "Choose a volume. Open a question. Bring an idea back into ordinary life." : "Enter the hall. Choose a wing. Open a book—and bring an idea back into ordinary life."}</p></div><Link className="spatial-guide-link" href="/library/resources/field-guide"><BookOpen size={19} aria-hidden="true" /> Read the field guide <ArrowUpRight size={16} aria-hidden="true" /></Link></header>
    {!focused && !phone ? <div ref={stageElement} className={`spatial-stage ${sceneVisible ? 'is-entered' : ''}`} aria-label="Three-dimensional library exploration">
      {sceneVisible ? <div className="spatial-render-window"><SceneBoundary key={state.attempt} onFailure={sceneFailure}><LibraryScene category={state.category} bookId={state.bookId} reducedMotion={reducedMotion} onCategory={chooseCategory} onBook={chooseBook} onReady={sceneReady} onFailure={sceneFailure}/></SceneBoundary></div> : <div className="spatial-threshold"><div className="spatial-threshold-art" aria-hidden="true"/><div className="spatial-threshold-copy"><span className="small-label">AN ANCIENT ROOM FOR PRESENT QUESTIONS</span><h2>Enter the<br /><em>reading hall.</em></h2><p>A real 3D space of stone, brass and bound ideas. Explore three wings, then open one of seven volumes at the reading desk.</p><button className="primary spatial-enter" onClick={enterRoom}><Compass size={19} aria-hidden="true" />{state.failure ? 'Try the 3D room again' : 'Enter the 3D library'}<ArrowRight size={18} aria-hidden="true" /></button><a className="text-link" href="#library-catalog">Or browse the complete catalog <ArrowRight size={15} aria-hidden="true" /></a><small>3D loads only when you enter. No account, sound or app installation required.</small></div></div>}
      {sceneVisible && <><div className="spatial-hud"><span><i aria-hidden="true"/> {category ? category.title : 'The grand reading hall'}</span><div><button onClick={returnToHall} disabled={!state.category}><ChevronLeft size={16} aria-hidden="true" /> Return to hall</button><button onClick={showCatalog}><Library size={16} aria-hidden="true" /> Catalog view</button></div></div>{!state.ready && <div className="spatial-opening" role="status">Preparing the hall’s materials and lights…</div>}<div ref={wingControls} className="spatial-wings" aria-label="Travel to a library wing">{libraryCategories.map((wing)=><button key={wing.id} data-library-category={wing.id} aria-pressed={state.category===wing.id} onClick={()=>chooseCategory(wing.id)}><span aria-hidden="true">{wing.roman}</span><strong>{wing.title}</strong><small>{libraryVolumes.filter((book)=>book.category===wing.id).length} {libraryVolumes.filter((book)=>book.category===wing.id).length===1 ? 'volume' : 'volumes'}<ArrowRight size={14} aria-hidden="true" /></small></button>)}</div></>}
    </div> : <div className={`spatial-basic-note${phone&&!focused ? " is-compact" : ""}`}><Library size={23} aria-hidden="true" /><p>{focused ? 'Focused experience: the complete library, without the 3D room.' : 'The celestial archive, ready to read. Explore the seven selected volumes below.'}</p></div>}
    {sceneVisible && <p className="spatial-navigation-note">Choose a wing, then select a highlighted book. The catalog below offers the same controls by keyboard.</p>}
    {state.bookId && readingBook!==state.bookId && <p className="spatial-book-arriving" role="status">Bringing the volume to the reading desk…</p>}
    {state.failure && <p role="status" className="spatial-failure">{state.failure}</p>}
    {reducedMotion && !focused && !phone && <p className="spatial-motion-note">Reduced-motion preference respected: camera changes are immediate, without animated travel.</p>}
    <section id="library-catalog" className="spatial-catalog kingdom-catalog" aria-labelledby="catalog-title">
      <div className="catalogue-vault" aria-hidden="true"/><div className="spatial-catalog-heading"><div><span className="catalogue-heading-mark" aria-hidden="true"><Compass size={35} strokeWidth={1}/></span><span className="eyebrow">THE SAME SEVEN BOOKS. EVERY WAY IN.</span><h2 id="catalog-title" ref={catalogHeading} tabIndex={-1}>{category?.title || 'Browse the collection.'}</h2><p>{category?.description || 'Search, choose a wing, or open a volume directly. Every book also has a conventional companion page.'}</p></div><label className="spatial-search"><span>Search the seven volumes</span><span className="spatial-search-field"><Search size={18} aria-hidden="true"/><input type="search" value={query} onChange={(event)=>setQuery(event.target.value)} placeholder="An idea, question or practice…"/>{query && <button aria-label="Clear library search" onClick={()=>setQuery('')}><X size={16} aria-hidden="true"/></button>}</span></label></div>
      <nav ref={catalogFilters} className="spatial-category-tabs" aria-label="Filter library catalog"><button aria-pressed={!state.category} onClick={returnToHall}>All seven volumes</button>{libraryCategories.map((wing)=><button key={wing.id} data-library-category={wing.id} aria-pressed={state.category===wing.id} onClick={()=>chooseCategory(wing.id)}>{wing.title}</button>)}</nav>
      <p className="spatial-result-count" role="status"><span className="catalogue-count-text">{volumes.length} {volumes.length===1?'volume':'volumes'}{query ? ` matching “${query}”` : ' in this view'}.</span><span className="catalogue-rule" aria-hidden="true"><Compass size={21} strokeWidth={1}/></span></p>
      <div className="spatial-volume-grid">{volumes.map((book)=><article key={book.id} className="spatial-volume kingdom-volume" data-wing={book.category}>
        <button className="spatial-volume-open" onClick={(event)=>openBook(book.id,event.currentTarget)} aria-label={`Open book: ${book.title}`}>
          <span className="volume-display" aria-hidden="true">
            <span className="volume-alcove"/><span className="volume-arch"/><span className="volume-plinth"/>
            <span className="volume-book" style={{'--book-color':book.color} as React.CSSProperties}>
              <span className="volume-book-spine"><Compass size={17} strokeWidth={1.2}/><span>{romanNumeral(book.number)}</span></span>
              <span className="volume-book-pages"/>
              <span className="spatial-volume-cover">
                <svg className="volume-cover-engraving" viewBox="0 0 200 290" fill="none"><path d="M9 35V9h26M165 9h26v26M191 255v26h-26M35 281H9v-26M15 30V15h15M170 15h15v15M185 260v15h-15M30 275H15v-15"/><path d="M9 9l19 19M191 9l-19 19M191 281l-19-19M9 281l19-19"/><path d="M22 9l-7 13-6-7M178 9l7 13 6-7M191 268l-13 7 7 6M9 268l13 7-7 6"/><path d="M75 43h50M83 47h34M75 244h50M83 248h34"/></svg>
                <span className="volume-topline">SOVEREIGN PSYCHOLOGY</span>
                <span className="volume-crest"><Compass size={38} strokeWidth={1}/></span>
                <span className="volume-short-title">{book.shortTitle}</span>
                <span className="volume-roman">{romanNumeral(book.number)}</span>
                <span className="volume-imprint">THE SELECTED COLLECTION</span>
              </span>
            </span>
          </span>
          <span className="spatial-volume-copy"><span className="small-label">VOLUME {romanNumeral(book.number)}<span className="volume-title-rule" aria-hidden="true"/></span><strong>{book.title}</strong><span>{book.summary}</span><span className="volume-open-label">Open the book <span className="volume-arrow"><ArrowRight size={17} aria-hidden="true" /></span></span></span>
        </button>
        <Link className="spatial-plain-link" href={`/library/videos/${book.id}`}>Read the companion page <ArrowRight size={14} aria-hidden="true" /></Link>
      </article>)}
      {!focused && volumes.length > 0 && volumes.length % 3 === 1 && <aside className="catalogue-hall-invitation">
        <div className="catalogue-hall-art" aria-hidden="true"/><span className="catalogue-hall-orbit" aria-hidden="true"><Compass size={70} strokeWidth={.75}/></span>
        <div><span className="eyebrow">BEYOND THE SHELF</span><h3>Seven volumes.<br/>A world of inquiry.</h3><p>Choose a book here, or return to the spatial hall and find it among the three wings. The same ideas remain yours to explore.</p>{!phone ? <button onClick={()=>{returnToHall();enterRoom();requestAnimationFrame(()=>wingControls.current?.querySelector<HTMLButtonElement>('button')?.focus({preventScroll:true}));}}><Compass size={17} aria-hidden="true"/> {sceneVisible ? 'Return to the reading hall' : 'Enter the 3D reading hall'} <ArrowRight size={16} aria-hidden="true"/></button> : <Link className="button" href="/library/resources/field-guide">Explore the field guide <ArrowRight size={16} aria-hidden="true"/></Link>}</div>
      </aside>}
      </div>
      {!volumes.length && <div className="spatial-empty"><h3>No volume matches that search.</h3><p>Try a broader term or browse all seven books.</p><button onClick={returnToHall}>Show the whole collection</button></div>}
    </section>
    <div className="spatial-library-note"><span className="small-label">A COLLECTION, NOT A CLAIM OF CERTAINTY</span><p>The room is an imaginative setting; background bindings are decorative. Its seven selected books contain the existing educational video companions: actionable takeaways, worked examples, current evidence notes and original source links. They are not published books, private transcripts or validated treatment protocols.</p><div className="actions"><Link href="/start">Start with one ordinary situation <ArrowRight size={16} aria-hidden="true" /></Link><Link href="/evidence/sources">Inspect the source index</Link><Link href="/library/cases/CS-001">Case-material publication boundary</Link></div></div>
    {state.bookId && readingBook===state.bookId && <BookReader key={state.bookId} bookId={state.bookId} onClose={closeBook} resolveReturnFocus={resolveReaderFocus}/>}
  </section>;
}
