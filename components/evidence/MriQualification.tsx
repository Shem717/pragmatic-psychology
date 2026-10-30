import { mriQualification as note } from "@/lib/mri-source-qualification";
import { SourceQualificationNote } from "@/components/evidence/SourceQualificationNote";
export function MriQualification() { return <SourceQualificationNote note={note} titleId="mri-qualification-title" />; }
