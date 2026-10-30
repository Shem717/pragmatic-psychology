import { relaxationQualification as note } from "@/lib/relaxation-source-qualification";
import { SourceQualificationNote } from "@/components/evidence/SourceQualificationNote";
export function RelaxationQualification() {
  return <SourceQualificationNote note={note} titleId="relaxation-qualification-title"></SourceQualificationNote>;
}
