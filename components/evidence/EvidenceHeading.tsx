import type { ReactNode } from "react";
export function EvidenceHeading({ eyebrow, title, description, aside }: { eyebrow: string; title: string; description: string; aside?: ReactNode }) {
  return <header className="research-heading"><div><p className="research-eyebrow">{eyebrow}</p><h1>{title}</h1><p className="research-lede">{description}</p></div>{aside && <div className="research-heading-aside">{aside}</div>}</header>;
}
