import { aceOddsQualification as note } from "@/lib/aceOdds-source-qualification";
import { SourceQualificationNote } from "@/components/evidence/SourceQualificationNote";
export function AceOddsQualification() {
  return <SourceQualificationNote note={note} titleId="ace-obesity-odds-not-risk-title" />;
}
