import { cardiacQualification as note } from "@/lib/cardiac-source-qualification";
import { SourceQualificationNote } from "@/components/evidence/SourceQualificationNote";
export function CardiacQualification() {
  return <SourceQualificationNote note={note} titleId="cardiac-qualification-title"></SourceQualificationNote>;
}
