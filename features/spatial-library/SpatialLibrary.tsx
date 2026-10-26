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
  const chooseCategory=useCallback((id:LibraryCategoryId)=>{setQuery('');dispatch({type:'category',category:id});},[]);
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
  const returnToHall=()=>{setQuery('');dispatch({type:'hall'});};
  const showCatalog=()=>{dispatch({type:'catalog'});requestAnimationFrame(()=>catalogHeading.current?.focus());};
  const enterRoom=()=>{
    dispatch({type:'enter'});
    requestAnimationFrame(()=>{
      const stage=stageElement.current;
      if(!stage) return;
      const header=document.querySelector<HTMLElement>('.site-header');
      const position=header ? getComputedStyle(header).position : '';
      const offset=header && (position==='sticky' || position==='fixed') ? header.getBoundingClientRect().height : 0;
      window.scrollTo({top:window.scrollY+stage.getBoundingClientRect().top-offset-10,behavior:'instant'});
    });
  };
  useEffect(()=>{
    if (!state.bookId) return;
    const timer=window.setTimeout(()=>setReadingBook(state.bookId),sceneVisible && !reducedMotion ? 850 : 0);
    return()=>window.clearTimeout(timer);
  },[state.bookId,sceneVisible,reducedMotion]);
  return <section className="spatial-library" aria-labelledby="spatial-title">
    <header className="spatial-heading"><div><span className="eyebrow">THE CELESTIAL ARCHIVE · SEVEN SELECTED VOLUMES</span><h1 id="spatial-title">A library you can <em>step inside.</em></h1><p>Enter the hall. Choose a wing. Open a book—and bring an idea back into ordinary life.</p></div><Link className="spatial-guide-link" href="/library/resources/field-guide"><BookOpen size={19} aria-hidden="true" /> Read the field guide <ArrowUpRight size={16} aria-hidden="true" /></Link></header>
    {!focused && !phone ? <div ref={stageElement} className={`spatial-stage ${sceneVisible ? 'is-entered' : ''}`} aria-label="Three-dimensional library exploration">
      {sceneVisible ? <div className="spatial-render-window"><SceneBoundary key={state.attempt} onFailure={sceneFailure}><LibraryScene category={state.category} bookId={state.bookId} reducedMotion={reducedMotion} onCategory={chooseCategory} onBook={chooseBook} onReady={sceneReady} onFailure={sceneFailure}/></SceneBoundary></div> : <div className="spatial-threshold"><div className="spatial-threshold-art" aria-hidden="true"/><div className="spatial-threshold-copy"><span className="small-label">AN ANCIENT ROOM FOR PRESENT QUESTIONS</span><h2>Enter the<br /><em>reading hall.</em></h2><p>A real 3D space of stone, brass and bound ideas. Explore three wings, then open one of seven volumes at the reading desk.</p><button className="primary spatial-enter" onClick={enterRoom}><Compass size={19} aria-hidden="true" />{state.failure ? 'Try the 3D room again' : 'Enter the 3D library'}<ArrowRight size={18} aria-hidden="true" /></button><a className="text-link" href="#library-catalog">Or browse the complete catalog <ArrowRight size={15} aria-hidden="true" /></a><small>3D loads only when you enter. No account, sound or app installation required.</small></div></div>}
      {sceneVisible && <><div className="spatial-hud"><span><i aria-hidden="true"/> {category ? category.title : 'The grand reading hall'}</span><div><button onClick={returnToHall} disabled={!state.category}><ChevronLeft size={16} aria-hidden="true" /> Return to hall</button><button onClick={showCatalog}><Library size={16} aria-hidden="true" /> Catalog view</button></div></div>{!state.ready && <div className="spatial-opening" role="status">Preparing the hall’s materials and lights…</div>}<div ref={wingControls} className="spatial-wings" aria-label="Travel to a library wing">{libraryCategories.map((wing)=><button key={wing.id} data-library-category={wing.id} aria-pressed={state.category===wing.id} onClick={()=>chooseCategory(wing.id)}><span aria-hidden="true">{wing.roman}</span><strong>{wing.title}</strong><small>{libraryVolumes.filter((book)=>book.category===wing.id).length} {libraryVolumes.filter((book)=>book.category===wing.id).length===1 ? 'volume' : 'volumes'}<ArrowRight size={14} aria-hidden="true" /></small></button>)}</div></>}
    </div> : <div className="spatial-basic-note"><Library size={23} aria-hidden="true" /><p>{focused ? 'Focused experience: the complete library, without the 3D room.' : 'Compact library: all seven volumes, ready to read. The spatial room is designed for laptops, desktops and larger tablets.'}</p></div>}
    {sceneVisible && <p className="spatial-navigation-note">Choose a wing, then select a highlighted book. The catalog below offers the same controls by keyboard.</p>}
    {state.bookId && readingBook!==state.bookId && <p className="spatial-book-arriving" role="status">Bringing the volume to the reading desk…</p>}
    {state.failure && <p role="status" className="spatial-failure">{state.failure}</p>}
    {reducedMotion && !focused && !phone && <p className="spatial-motion-note">Reduced-motion preference respected: camera changes are immediate, without animated travel.</p>}
    <section id="library-catalog" className="spatial-catalog" aria-labelledby="catalog-title">
      <div className="spatial-catalog-heading"><div><span className="eyebrow">THE SAME SEVEN BOOKS. EVERY WAY IN.</span><h2 id="catalog-title" ref={catalogHeading} tabIndex={-1}>{category?.title || 'Browse the collection.'}</h2><p>{category?.description || 'Search, choose a wing, or open a volume directly. Every book also has a conventional companion page.'}</p></div><label className="spatial-search"><span>Search the seven volumes</span><span className="spatial-search-field"><Search size={18} aria-hidden="true"/><input type="search" value={query} onChange={(event)=>setQuery(event.target.value)} placeholder="An idea, question or practice…"/>{query && <button aria-label="Clear library search" onClick={()=>setQuery('')}><X size={16} aria-hidden="true"/></button>}</span></label></div>
      <nav ref={catalogFilters} className="spatial-category-tabs" aria-label="Filter library catalog"><button aria-pressed={!state.category} onClick={returnToHall}>All seven volumes</button>{libraryCategories.map((wing)=><button key={wing.id} data-library-category={wing.id} aria-pressed={state.category===wing.id} onClick={()=>chooseCategory(wing.id)}>{wing.title}</button>)}</nav>
      <p className="spatial-result-count" role="status">{volumes.length} {volumes.length===1?'volume':'volumes'}{query ? ` matching “${query}”` : ' in this view'}.</p>
      <div className="spatial-volume-grid">{volumes.map((book)=><article key={book.id} className="spatial-volume"><button className="spatial-volume-open" onClick={(event)=>openBook(book.id,event.currentTarget)} aria-label={`Open book: ${book.title}`}><span className="spatial-volume-cover" style={{'--book-color':book.color} as React.CSSProperties} aria-hidden="true"><span className="volume-topline">SOVEREIGN PSYCHOLOGY</span><span className="volume-crest"><Compass size={35} strokeWidth={1}/></span><span className="volume-short-title">{book.shortTitle}</span><span className="volume-roman">{romanNumeral(book.number)}</span><span className="volume-imprint">THE SELECTED COLLECTION</span></span><span className="spatial-volume-copy"><span className="small-label">VOLUME {romanNumeral(book.number)}</span><strong>{book.title}</strong><span>{book.summary}</span><span className="volume-open-label">Open the book <ArrowUpRight size={17} aria-hidden="true" /></span></span></button><Link className="spatial-plain-link" href={`/library/videos/${book.id}`}>Read the companion page <ArrowUpRight size={14} aria-hidden="true" /></Link></article>)}</div>
      {!volumes.length && <div className="spatial-empty"><h3>No volume matches that search.</h3><p>Try a broader term or browse all seven books.</p><button onClick={returnToHall}>Show the whole collection</button></div>}
    </section>
    <div className="spatial-library-note"><span className="small-label">A COLLECTION, NOT A CLAIM OF CERTAINTY</span><p>The room is an imaginative setting. Its seven books contain the existing educational video companions: actionable takeaways, worked examples, current evidence notes and original source links. They are not published books, private transcripts or validated treatment protocols.</p><div className="actions"><Link href="/start">Start with one ordinary situation <ArrowRight size={16} aria-hidden="true" /></Link><Link href="/evidence/sources">Inspect the source index</Link><Link href="/library/cases/CS-001">Case-material publication boundary</Link></div></div>
    {state.bookId && readingBook===state.bookId && <BookReader key={state.bookId} bookId={state.bookId} onClose={closeBook} resolveReturnFocus={resolveReaderFocus}/>}
  </section>;
}
