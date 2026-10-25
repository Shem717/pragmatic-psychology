import { content } from "@/lib/content";
import { PageIntro } from "@/components/UI";
import { Evidence } from "@/features/Evidence";
export const metadata = {
  title: "Evidence Observatory",
  alternates: { canonical: "/evidence" },
};
export default function Page() {
  return (
    <>
      <PageIntro
        eyebrow="03 / THE EVIDENCE OBSERVATORY"
        title="Follow the evidence."
        accent="Keep the questions open."
        description="Investigate the claim, its scope, its limits and the questions it leaves behind."
        meta="11 claims · 31 sources · 35 research records"
      />
      <Evidence claims={content.claims} />
    </>
  );
}
