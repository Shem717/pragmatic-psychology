import Link from "next/link";
import { meditationBenefitQualification as note } from "@/lib/meditation-benefit-qualification";
import { SourceQualificationNote } from "@/components/evidence/SourceQualificationNote";
export function MeditationBenefitQualification() {
  return <SourceQualificationNote note={note} titleId="meditation-benefit-qualification-title"><p><Link href="/evidence/claims/meditation-adverse-ascertainment/">Separate evidence on meditation adverse experiences</Link></p></SourceQualificationNote>;
}
