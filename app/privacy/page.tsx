import Link from "next/link";
import { PageIntro } from "@/components/UI";
export const metadata = {
  title: "Privacy and local data",
  alternates: { canonical: "/privacy" },
};
export default function Page() {
  return (
    <>
      <PageIntro
        eyebrow="DATA BEHAVIOR / VERSION 2.0"
        title="Your reflections stay here."
        description="No account, reflection upload, runtime AI service or subscription form is used in this release."
      />
      <article className="panel section-pad prose">
        <h2>Working drafts and device storage</h2>
        <p>
          Personal text lives in memory until you explicitly save. Saved
          notebook records use this browser’s IndexedDB database, ppo-notebook.
          Atmosphere, mode and motion preferences use the localStorage key
          ppo.preferences.v1. The app does not encrypt these records. Other
          people with access to this device or browser profile may be able to
          read them.
        </p>
        <h2>What leaves the browser</h2>
        <p>
          Page requests and public filters reach the hosting infrastructure.
          Personal reflections are not placed in URLs, analytics, logs or
          requests. This app includes no session replay or third-party
          analytics. Vercel may process ordinary infrastructure request metadata
          under its hosting policies.
        </p>
        <h2>Third-party media and links</h2>
        <p>
          Videos connect to YouTube only after you press Load video. External
          source links navigate to their publishers. Those services have their
          own data practices. Privacy-enhanced embedding does not mean zero
          tracking.
        </p>
        <h2>Export, import and removal</h2>
        <p>
          Exports are local files that can contain personal text. Keep them
          private. JSON imports are validated and do not execute markup.
          Clear-data controls remove only this app’s selected notebook records;
          presentation preferences are a separate explicit choice. Browser
          clearing or device failure can erase saved notes, so keep an export
          when needed.
        </p>
        <h2>Email and research</h2>
        <p>
          No email addresses are collected, no campaigns run, and the notebook
          is not a research study. No private case narratives or source
          conversations are included in the published application.
        </p>
        <Link href="/notebook">Manage this device’s notebook →</Link>
      </article>
    </>
  );
}
