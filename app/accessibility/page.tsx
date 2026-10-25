import { PageIntro } from "@/components/UI";
export const metadata = {
  title: "Accessibility",
  alternates: { canonical: "/accessibility" },
};
export default function Page() {
  return (
    <>
      <PageIntro
        eyebrow="ACCESSIBILITY / SUPPORTED CONTROLS"
        title="The same work, more ways in."
        description="Keyboard controls, textual alternatives and a quieter presentation are part of the instrument design."
      />
      <article className="panel section-pad prose">
        <h2>Navigate and inspect</h2>
        <p>
          Use the skip link to reach the main content. All map selections are
          buttons; the evidence map also has a complete claim index. Perspective
          comparisons stack on small screens. Forms use visible labels, errors
          and text status. Standard Tab navigation remains available.
        </p>
        <h2>Choose the presentation</h2>
        <p>
          Focused mode removes ambient effects while retaining functionality.
          Sunny and Night provide separate color environments. Focused mode
          stops decorative motion and prioritizes the exercise. The operating system’s reduced-motion
          preference takes precedence. Text can be resized and pages reflow to
          narrow viewports.
        </p>
        <h2>Honest verification limits</h2>
        <p>
          The design targets WCAG AA. Automated and browser checks do not
          establish full conformance. Physical-device, software-keyboard and
          independent screen-reader acceptance are separate checks and must not
          be inferred from a rendered screenshot.
        </p>
        <h2>If a visual instrument is difficult</h2>
        <p>
          Use its labeled buttons, complete claim index, written detail pages
          and readable exports. Imagery is optional; text, behavioral planning
          and role-play formats are available.
        </p>
      </article>
    </>
  );
}
