import { panicDiagnosticQualification as note } from "@/lib/panic-diagnostic-source-qualification";
import { SourceQualificationNote } from "@/components/evidence/SourceQualificationNote";
export function PanicDiagnosticQualification() { return <SourceQualificationNote note={note} titleId="panic-diagnostic-qualification-title" />; }
