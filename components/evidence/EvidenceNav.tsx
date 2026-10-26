"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Orbit, Library, Columns3, ArrowUpRight } from "lucide-react";
export function EvidenceNav() {
  const path = usePathname().replace(/\/$/, "");
  useEffect(() => {
    const reveal = () => {
      const element = document.getElementById(location.hash.slice(1));
      if (!element) return;
      let disclosure = element.closest("details");
      let opened = false;
      while (disclosure) {
        if (!disclosure.open) { disclosure.open = true; opened = true; }
        disclosure = disclosure.parentElement?.closest("details") ?? null;
      }
      if (opened) element.scrollIntoView({ block: "start" });
    };
    const frame = requestAnimationFrame(reveal);
    window.addEventListener("hashchange", reveal);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("hashchange", reveal); };
  }, [path]);
  return <nav className="research-nav" aria-label="Evidence">
    <Link href="/evidence" aria-current={path === "/evidence" || path.includes("/claims/") ? "page" : undefined}><Orbit size={18} aria-hidden="true" />Claims & connections</Link>
    <Link href="/evidence/sources" aria-current={path === "/evidence/sources" ? "page" : undefined}><Library size={18} aria-hidden="true" />Source library</Link>
    <Link href="/evidence/models" aria-current={path === "/evidence/models" ? "page" : undefined}><Columns3 size={18} aria-hidden="true" />Explanatory models</Link>
    <Link href="/research" className="research-nav-register">Open questions<ArrowUpRight size={15} aria-hidden="true" /></Link>
  </nav>;
}
