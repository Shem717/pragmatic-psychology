import { intrusiveThoughtQualification as note } from "@/lib/intrusiveThought-source-qualification";
import { SourceQualificationNote } from "@/components/evidence/SourceQualificationNote";
export function IntrusiveThoughtQualification() {
  return <SourceQualificationNote note={note} titleId="intrusive-thought-statistic-sample-window-title" />;
}
