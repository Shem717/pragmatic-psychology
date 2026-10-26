"use client";
import { useEffect, useRef, type ReactNode } from 'react';
import { X, Compass } from 'lucide-react';

/** Native modal provides Escape and keyboard containment; explicit origin owns return focus. */
export function InstrumentDialog({title,onClose,resolveReturnFocus,children,sideWorkbench=false}:{sideWorkbench?:boolean;title:string;onClose:()=>void;resolveReturnFocus:()=>HTMLElement|null;children?:ReactNode}) {
  const dialog=useRef<HTMLDialogElement>(null);
  const close=useRef<HTMLButtonElement>(null);
  useEffect(()=>{
    const element=dialog.current;
    if(!element)return;
    element.showModal();close.current?.focus({preventScroll:true});
    return()=>{element.close();const target=resolveReturnFocus();if(target?.isConnected && target.getClientRects().length)target.focus({preventScroll:true});};
  },[resolveReturnFocus]);
  return <dialog id="observatory-instrument-dialog" className={`instrument-dialog${sideWorkbench ? " instrument-dialog-side" : ""}`} ref={dialog} aria-labelledby="instrument-dialog-title" onCancel={(event)=>{event.preventDefault();onClose();}} onClick={(event)=>{if(event.target===event.currentTarget)onClose();}}>
    <article className="instrument-dialog-shell"><header className="instrument-dialog-header"><div><span className="eyebrow"><Compass size={14} aria-hidden="true"/> THE OBSERVATORY / WORKING INSTRUMENT</span><h2 id="instrument-dialog-title">{title}</h2></div><button ref={close} onClick={onClose} aria-label="Return to the room"><X size={18} aria-hidden="true"/><span>Return to the room</span></button></header><div className="instrument-dialog-body">{children}</div></article>
  </dialog>;
}
