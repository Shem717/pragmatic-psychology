import Link from "next/link";
import { Compass, ArrowRight } from "lucide-react";
export default function NotFound() {
  return (
    <div className="panel section-pad archive-status">
      <Compass className="archive-nav-icon" size={40} strokeWidth={1.2} aria-hidden="true" />
      <span className="eyebrow">404 · RECORD NOT FOUND</span>
      <h1>This page is not in the Observatory.</h1>
      <p>The record may be unavailable or the address may be incomplete.</p>
      <div className="actions"><Link className="button primary" href="/explore">Explore the instruments <ArrowRight size={17} aria-hidden="true" /></Link><Link className="button" href="/library">Visit the library</Link></div>
    </div>
  );
}
