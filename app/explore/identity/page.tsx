import { PageIntro, EducationalNote } from "@/components/UI";
import { Identity } from "@/features/Identity";
export const metadata = {
  title: "Identity-to-Competence Explorer",
  alternates: { canonical: "/explore/identity" },
};
export default function Page() {
  return (
    <div className="identity-workbench">
      <PageIntro
        eyebrow="02 / THE IDENTITY LABORATORY"
        title="Become what you can"
        accent="demonstrate."
        description="Trace an aspiration through conviction, conduct and corrective evidence."
        meta="7 stages · One continuing loop"
      />
      <EducationalNote />
      <Identity />
    </div>
  );
}
