import { spaceQualification as note } from "@/lib/space-source-qualification";
import { SourceQualificationNote } from "@/components/evidence/SourceQualificationNote";
export function SpaceQualification() {
  return <SourceQualificationNote note={note} titleId="space-qualification-title" />;
}
