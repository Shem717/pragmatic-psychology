import { plantDiversityQualification as note } from "@/lib/plantDiversity-source-qualification";
import { SourceQualificationNote } from "@/components/evidence/SourceQualificationNote";
export function PlantDiversityQualification() {
  return <SourceQualificationNote note={note} titleId="plant-diversity-category-not-threshold-title" />;
}
