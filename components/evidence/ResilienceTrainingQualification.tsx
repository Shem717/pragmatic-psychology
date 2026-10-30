import Link from "next/link";
import { resilienceTrainingQualification as note } from "@/lib/resilience-training-source-qualification";
import { SourceQualificationNote } from "@/components/evidence/SourceQualificationNote";
export function ResilienceTrainingQualification() { return <SourceQualificationNote note={note} titleId="resilience-training-qualification-title"><p>Related measurement context, not additional supporting evidence: <Link href="/evidence/claims/assertiveness-training-boundaries/">Self-report and behavior</Link> · <Link href="/evidence/claims/grief-pattern-sequence-boundaries/">Group patterns and personal grief paths</Link>.</p></SourceQualificationNote>; }
