"use client";
import { Compass, ArrowUpRight, Menu, X, Sparkles, ShieldCheck, Eye, BookOpen, ScanSearch, Combine, Crosshair, Target, Sprout } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Preferences } from "./Workspace";
import { romanNumeral } from "@/lib/presentation";
const instruments = [
  ["/explore/perspectives", "01", "Perspective Rolodex", "Change the lens."],
  [
    "/explore/identity",
    "02",
    "Identity · Competence",
    "Connect belief to conduct.",
  ],
  ["/evidence", "03", "Evidence Observatory", "Follow what we know."],
];
export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const path = usePathname().replace(/\/$/, "") || "/";
  return (
    <header className="site-header" onKeyDown={(event) => {
      if (event.key === "Escape" && menuOpen) {
        event.preventDefault();
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    }} onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setMenuOpen(false);
    }}>
      <Link href="/" className="brand" aria-label="Sovereign Psychology home">
        <span className="brand-mark" aria-hidden="true">
          <Compass size={36} strokeWidth={1.3} />
        </span>
        <span>
          SOVEREIGN PSYCHOLOGY<small>THE OBSERVATORY</small>
        </span>
      </Link>
      <button ref={menuButton} type="button" className="mobile-menu-toggle" aria-expanded={menuOpen} aria-controls="header-navigation" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}<span>{menuOpen ? "Close" : "Menu"}</span>
      </button>
      <div id="header-navigation" className={`header-navigation${menuOpen ? " is-open" : ""}`}>
      <nav className="primary-nav" aria-label="Primary" onClick={(event) => {
        if ((event.target as HTMLElement).closest("a")) setMenuOpen(false);
      }}>
        <Link href="/explore" aria-current={path.startsWith("/explore") ? "page" : undefined}>Explore</Link>
        <Link href="/learn" aria-current={path.startsWith("/learn") ? "page" : undefined}>Learn</Link>
        <Link href="/evidence" aria-current={path.startsWith("/evidence") ? "page" : undefined}>Evidence</Link>
        <Link href="/library" aria-current={path.startsWith("/library") ? "page" : undefined}>Library</Link>
      </nav>
      <Preferences />
      </div>
    </header>
  );
}
export function Sidebar() {
  const path = usePathname().replace(/\/$/, "") || "/";
  return (
    <aside className="sidebar">
      <Link href="/start" className="rail-start"><Sparkles size={16} aria-hidden="true" /> Start here <small>One useful action in five minutes</small></Link>
      <div className="small-label">YOUR INSTRUMENTS</div>
      <nav aria-label="Instruments">
        {instruments.map(([href, n, title, desc]) => (
          <Link
            key={href}
            href={href}
            aria-current={path === href ? "page" : undefined}
          >
            <span className="rail-icon" aria-label={`Instrument ${Number(n)}`}>{romanNumeral(Number(n))}</span>
            <span>
              <strong>{title}</strong>
              <small>{desc}</small>
            </span>
          </Link>
        ))}
      </nav>
      <div className="rail-divider" />
      <div className="small-label">DOMINION CURRICULUM</div>
      <p className="rail-subtitle">Eight disciplines of self-governance</p>
      <nav className="discipline-nav" aria-label="Dominion Curriculum disciplines">
        {[
          "Legitimate Authority",
          "Awareness",
          "Understanding",
          "Discernment",
          "Integration",
          "Self-Command",
          "Competence",
          "Stewardship",
        ].map((x, i) => (
          <Link
            key={x}
            href={"/learn/curriculum/" + x.toLowerCase().replaceAll(" ", "-")}
            aria-current={
              path ===
              "/learn/curriculum/" + x.toLowerCase().replaceAll(" ", "-")
                ? "page"
                : undefined
            }
          >
            <span aria-hidden="true">{(() => { const Icon = [ShieldCheck, Eye, BookOpen, ScanSearch, Combine, Crosshair, Target, Sprout][i]; return <Icon size={16} strokeWidth={1.5} />; })()}</span>
            {x}
          </Link>
        ))}
      </nav>
      <div className="rail-quote">
        <Sparkles size={22} aria-hidden="true" />
        <p>Understanding becomes useful when it changes what you can do.</p>
        <small>
          Framework by
          <br />
          Samuel Raymond Clow
        </small>
      </div>
      <Link href="/research" className="rail-bottom">
        RESEARCH REGISTER <ArrowUpRight size={14} aria-hidden="true" />
      </Link>
    </aside>
  );
}
export function Footer() {
  return (
    <footer className="workspace-footer">
      <div className="footer-signature"><Compass size={34} strokeWidth={1} aria-hidden="true" /><div><strong>SOVEREIGN PSYCHOLOGY</strong><span>Understanding · Investigation · Application</span></div></div>
      <div className="footer-invitation">Continue your inquiry.<Link href="/library">Enter the library <ArrowUpRight size={15} aria-hidden="true" /></Link></div>
      <div className="footer-colophon"><nav aria-label="Notes, about and policies"><Link href="/notebook">My notes</Link><Link href="/about">About</Link><Link href="/privacy">Privacy</Link><Link href="/accessibility">Accessibility</Link></nav><span>Education · Framework under development</span></div>
    </footer>
  );
}
