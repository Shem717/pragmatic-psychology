import type { ReactNode } from "react";
export function EvidenceHeading({ eyebrow, title, description, aside, room = "observatory" }: {
  eyebrow: string;
  title: string;
  description: string;
  aside?: ReactNode;
  room?: "observatory" | "library" | "models" | "dossier";
}) {
  return <header className="research-heading" data-room={room}>
    <div className="research-heading-art" aria-hidden="true" />
    <div className="research-heading-frame" aria-hidden="true"><span>✦</span></div>
    <div className="research-heading-copy">
      <p className="research-eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="research-lede">{description}</p>
    </div>
    {aside && <div className="research-heading-aside">{aside}</div>}
  </header>;
}
