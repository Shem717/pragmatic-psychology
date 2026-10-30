import { alcoholQualification as note } from "@/lib/alcohol-source-qualification";
import { SourceQualificationNote } from "@/components/evidence/SourceQualificationNote";
export function AlcoholQualification() {
  return <SourceQualificationNote note={note} titleId="alcohol-qualification-title"></SourceQualificationNote>;
}
