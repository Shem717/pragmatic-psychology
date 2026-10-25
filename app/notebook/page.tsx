import { PageIntro } from "@/components/UI";
import { Notebook } from "@/features/NotebookView";
export const metadata = {
  title: "Your notebook",
  robots: { index: false, follow: false },
  alternates: { canonical: "/notebook" },
};
export default function Page() {
  return (
    <div className="notebook-workbench">
      <PageIntro scene="workbench"
        eyebrow="LOCAL NOTEBOOK / NO ACCOUNT REQUIRED"
        title="Keep what you learn."
        accent="Revise what you believe."
        description="Your working notes, observations and next tests. Nothing you write here is sent to the Observatory."
      />
      <Notebook />
    </div>
  );
}
