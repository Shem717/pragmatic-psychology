import { cholineQualification as note } from "@/lib/choline-source-qualification";
import { SourceQualificationNote } from "@/components/evidence/SourceQualificationNote";
export function CholineQualification() {
  return <SourceQualificationNote note={note} titleId="choline-qualification-title"></SourceQualificationNote>;
}
