import { pmrQualification as note } from "@/lib/pmr-source-qualification";
import { SourceQualificationNote } from "@/components/evidence/SourceQualificationNote";

export function PmrQualification() {
  return <SourceQualificationNote note={note} titleId="pmr-immediate-relaxation-title" />;
}
