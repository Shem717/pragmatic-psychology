import { relationalScenarios } from "@/lib/relational-scenarios";
import { content } from "@/lib/content";
import { PageIntro, EducationalNote } from "@/components/UI";
import { Perspectives } from "@/features/Perspectives";
export const metadata = {
  title: "Perspective Rolodex",
  alternates: { canonical: "/explore/perspectives" },
};
export default function Page() {
  return (
    <div className="perspective-workbench">
      <PageIntro scene="workbench"
        eyebrow="I / THE PERSPECTIVE LABORATORY"
        title="One situation."
        accent="More ways to respond."
        description="Explore the interpretation. Examine the evidence. Choose your next move."
        meta="7 relational situations · 4 perspectives each"
      />
      <EducationalNote />
      <Perspectives scenarios={relationalScenarios} legacyScenarios={content.scenarios} />
    </div>
  );
}
