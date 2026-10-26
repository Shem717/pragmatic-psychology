/** One user-activated player at a time; no playback or consent is persisted. */
export function createVideoPlayback() {
  let active: string | null = null;
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((listener) => listener());
  return {
    getSnapshot: () => active,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    activate(id: string) { if (active !== id) { active = id; notify(); } },
    release(id: string) { if (active === id) { active = null; notify(); } },
  };
}
export const videoPlayback = createVideoPlayback();
