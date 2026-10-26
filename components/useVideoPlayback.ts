"use client";
import { useEffect, useId, useRef, useSyncExternalStore } from 'react';
import { videoPlayback } from '@/lib/video-playback';
const serverSnapshot = () => null;

export function useVideoPlayback() {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const active = useSyncExternalStore(videoPlayback.subscribe, videoPlayback.getSnapshot, serverSnapshot) === id;
  useEffect(() => {
    // Native details keeps its children mounted. Explicitly stop hidden playback.
    const ancestors: HTMLDetailsElement[] = [];
    let element = root.current?.parentElement;
    while (element) {
      if (element instanceof HTMLDetailsElement) ancestors.push(element);
      element = element.parentElement;
    }
    const stopWhenHidden = () => {
      if (ancestors.some((details) => !details.open)) videoPlayback.release(id);
    };
    ancestors.forEach((details) => details.addEventListener('toggle', stopWhenHidden));
    return () => {
      ancestors.forEach((details) => details.removeEventListener('toggle', stopWhenHidden));
      videoPlayback.release(id);
    };
  }, [id]);
  return { id, root, active, activate: () => videoPlayback.activate(id), close: () => videoPlayback.release(id) };
}
