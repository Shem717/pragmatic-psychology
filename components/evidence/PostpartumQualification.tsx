import { postpartumQualification as note } from "@/lib/postpartum-source-qualification";
import { SourceQualificationNote } from "@/components/evidence/SourceQualificationNote";
export function PostpartumQualification() {
  return <SourceQualificationNote note={note} titleId="postpartum-qualification-title"></SourceQualificationNote>;
}
