import { ratioQualification as note } from "@/lib/ratio-source-qualification";
import { SourceQualificationNote } from "@/components/evidence/SourceQualificationNote";
export function RatioQualification() {
  return <SourceQualificationNote note={note} titleId="ratio-qualification-title"></SourceQualificationNote>;
}
