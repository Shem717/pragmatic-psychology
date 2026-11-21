"use client";

import { useEffect, useRef, type ReactNode } from 'react';

export function CompanionSources({ children }: { children: ReactNode }) {
  const disclosure = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    let frame = 0;
    function revealPassage() {
      const target = document.getElementById(location.hash.slice(1));
      if (!target || !disclosure.current?.contains(target)) return;
      disclosure.current.open = true;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        target.focus({ preventScroll: true });
        target.scrollIntoView({ block: 'start' });
      });
    }
    revealPassage();
    window.addEventListener('hashchange', revealPassage);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('hashchange', revealPassage);
    };
  }, []);
  return <details ref={disclosure}><summary>Source context and evidence</summary>{children}</details>;
}
