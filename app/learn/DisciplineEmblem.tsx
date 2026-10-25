import { romanNumeral } from "@/lib/presentation";
import { ShieldCheck, Eye, BookOpen, ScanSearch, Combine, Crosshair, Target, Sprout } from "lucide-react";

// The same eight discipline symbols used in the curriculum navigation.
const emblems = [ShieldCheck, Eye, BookOpen, ScanSearch, Combine, Crosshair, Target, Sprout];
export function DisciplineEmblem({ index }: { index: number }) {
  const Icon = emblems[index] ?? BookOpen;
  return (
    <span className="discipline-seal" aria-hidden="true">
      <svg className="seal-orbits" width="72" height="72" viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="43" />
        <circle cx="50" cy="50" r="35" />
        <path d="M50 2v12M50 86v12M2 50h12M86 50h12M19 19l8 8M73 73l8 8M19 81l8-8M73 27l8-8" />
      </svg>
      <Icon className="seal-symbol" size={30} strokeWidth={1.35} />
      <span className="seal-number">{romanNumeral(index + 1)}</span>
    </span>
  );
}
