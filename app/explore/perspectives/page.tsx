import { relationalScenarios } from "@/lib/relational-scenarios";
import { content } from "@/lib/content";
import { getLearningPath } from "@/lib/learning-paths";
import { Perspectives } from "@/features/Perspectives";
export const metadata = {
  title: "Perspective Chamber",
  description: "One situation, more than one possible reading. Separate facts from interpretations, choose a response and return to what happened.",
  alternates: { canonical: "/explore/perspectives" },
};
export default function Page() {
  return <Perspectives scenarios={relationalScenarios} legacyScenarios={content.scenarios} sourceContext={getLearningPath('perspective-fit')?.sourceContext} />;
}
