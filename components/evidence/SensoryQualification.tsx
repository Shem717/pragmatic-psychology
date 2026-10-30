import { sensoryQualification as note } from "@/lib/sensory-source-qualification";
import { SourceQualificationNote } from "@/components/evidence/SourceQualificationNote";
export function SensoryQualification() {
  return <SourceQualificationNote note={note} titleId="sensory-qualification-title"></SourceQualificationNote>;
}
