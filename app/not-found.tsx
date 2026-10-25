import Link from "next/link";
export default function NotFound() {
  return (
    <div className="panel section-pad">
      <span className="eyebrow">404 · RECORD NOT FOUND</span>
      <h1>This page is not in the Observatory.</h1>
      <p>The record may be unavailable or the address may be incomplete.</p>
      <Link href="/explore">Explore the instruments ·</Link>
    </div>
  );
}
