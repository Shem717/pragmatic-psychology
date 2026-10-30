import Link from "next/link";
import { movementLearningQualification as note } from "@/lib/movement-learning-source-qualification";
import { SourceQualificationNote } from "@/components/evidence/SourceQualificationNote";
export function MovementLearningQualification() { return <SourceQualificationNote note={note} titleId="movement-learning-qualification-title"><p>Related measurement context, not additional supporting evidence: <Link href="/evidence/claims/cognitive-training-transfer/">Practiced gains and transfer</Link> · <Link href="/evidence/claims/academic-interest-boundaries/">Academic interest and other outcomes</Link>.</p></SourceQualificationNote>; }
