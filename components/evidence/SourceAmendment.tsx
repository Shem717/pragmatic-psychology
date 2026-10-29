import { ArrowUpRight } from "lucide-react";
export function SourceAmendment({ note, url }: { note?: string; url?: string }) {
  if (!note && !url) return null;
  return <div className="source-amendment"><strong>Published update</strong>{note && <p>{note}</p>}{url && <a href={url}>Read the update<ArrowUpRight size={14} aria-hidden="true" /></a>}</div>;
}
