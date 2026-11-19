import { Suspense } from "react";
import { relationalScenarios, revisionRequestId } from "@/lib/relational-scenarios";
import { content } from "@/lib/content";
import { getLearningPath } from "@/lib/learning-paths";
import { Perspectives } from "@/features/Perspectives";
import { PerspectiveEntry } from "@/features/perspective-chamber/PerspectiveEntry";
export const metadata = {
  title: "Perspective Chamber",
  description: "One situation, more than one possible reading. Separate facts from interpretations, choose a response and return to what happened.",
  alternates: { canonical: "/explore/perspectives" },
};
export default function Page() {
  const example = relationalScenarios.find((item) => item.id === revisionRequestId)!;
  const chamber = <Perspectives scenarios={relationalScenarios} legacyScenarios={content.scenarios} sourceContext={getLearningPath('perspective-fit')?.sourceContext} />;
  return <Suspense fallback={chamber}><PerspectiveEntry example={{ id: example.id, title: example.title }}>{chamber}</PerspectiveEntry></Suspense>;
}
