import { adhdDiagnosticQualification as note } from "@/lib/adhd-diagnostic-source-qualification";
import { SourceQualificationNote } from "@/components/evidence/SourceQualificationNote";
export function AdhdDiagnosticQualification() { return <SourceQualificationNote note={note} titleId="adhd-diagnostic-qualification-title" />; }
