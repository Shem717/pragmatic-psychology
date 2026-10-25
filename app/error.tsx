"use client";
import { RotateCcw, Compass } from "lucide-react";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="panel section-pad archive-status">
      <Compass className="archive-nav-icon" size={40} strokeWidth={1.2} aria-hidden="true" />
      <span className="eyebrow">A PAUSE IN THE INQUIRY</span>
      <h1>This view could not load.</h1>
      <p>Your device’s saved records have not been cleared. Retry, or return to the notebook to export a backup.</p>
      <div className="actions"><button className="primary" onClick={reset}><RotateCcw size={17} aria-hidden="true" /> Retry</button><a className="button" href="/notebook/">Open notebook</a></div>
    </div>
  );
}
