import { ageQualification as note } from "@/lib/age-source-qualification";
import { SourceQualificationNote } from "@/components/evidence/SourceQualificationNote";
export function AgeQualification() {
  return <SourceQualificationNote note={note} titleId="age-qualification-title"></SourceQualificationNote>;
}
