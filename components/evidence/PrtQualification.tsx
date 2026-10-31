import { prtQualification as note } from "@/lib/prt-source-qualification";
import { SourceQualificationNote } from "@/components/evidence/SourceQualificationNote";
export function PrtQualification() {
  return <SourceQualificationNote note={note} titleId="prt-qualification-title" />;
}
