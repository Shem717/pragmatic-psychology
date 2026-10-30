import { hrvQualification as note } from "@/lib/hrv-source-qualification";
import { SourceQualificationNote } from "@/components/evidence/SourceQualificationNote";
export function HrvQualification() {
  return <SourceQualificationNote note={note} titleId="hrv-qualification-title"></SourceQualificationNote>;
}
