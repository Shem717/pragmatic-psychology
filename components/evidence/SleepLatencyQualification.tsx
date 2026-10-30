import { sleepLatencyQualification as note } from "@/lib/sleep-latency-source-qualification";
import { SourceQualificationNote } from "@/components/evidence/SourceQualificationNote";
export function SleepLatencyQualification() { return <SourceQualificationNote note={note} titleId="sleep-latency-qualification-title" />; }
