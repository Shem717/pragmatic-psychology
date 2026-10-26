import { PageIntro } from "@/components/UI";
import { Notebook } from "@/features/NotebookView";
export const metadata = {
  title: "My notes",
  robots: { index: false, follow: false },
  alternates: { canonical: "/notebook" },
};
export default function Page() {
  return (
    <div className="notebook-workbench">
      <PageIntro scene="workbench"
        eyebrow="OPTIONAL LOCAL NOTES / NO ACCOUNT REQUIRED"
        title="My notes."
        accent="Keep what you learn."
        description="Your optional practice notes, observations and next tests. Saved records stay in this browser on this device, not an online account. Nothing you write here is sent to the Observatory; export a copy when you want a backup."
      />
      <Notebook />
    </div>
  );
}
