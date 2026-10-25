import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { content } from "@/lib/content";
import { PageIntro } from "@/components/UI";
export const metadata = {
  title: "Research register",
  alternates: { canonical: "/research" },
};
export default function Page() {
  return (
    <div className="archive-route archive-observatory">
      <PageIntro scene="observatory"
        eyebrow="RESEARCH & DEVELOPMENT / PUBLIC DERIVATIVE"
        title="Questions worth keeping."
        accent="Claims worth testing."
        description="Fourteen research questions and twenty-one H records. Their IDs preserve continuity; their status does not imply completed research."
      />
      <p className="callout">
        H-012 is an active correction record. H-020 is a normative safety
        restriction. Neither is an experiment or an empirical finding. Public
        wording is an editorial derivative; original formulations remain
        preserved privately.
      </p>
      <section className="panel section-pad archive-register">
        <div className="archive-section-heading"><span className="small-label">THE INQUIRY REGISTER</span><h2>Uncertainty, kept in view.</h2><p>Open a record to inspect the next evidence needed and the criterion that could change its standing.</p></div>
        {content.research.map((r) => (
          <article className="research-row" key={r.id}>
            <Link href={"/research/" + r.id}>
              <span className="research-id">{r.id}</span>
              <span>
                <small>
                  {r.subtype} · {r.status}
                </small>
                <p>
                  {r.summary.replace(new RegExp("^" + r.id + "[: —]*"), "")}
                </p>
              </span>
              <ArrowUpRight size={19} aria-hidden="true" />
            </Link>
          </article>
        ))}
      </section>
    </div>
  );
}
