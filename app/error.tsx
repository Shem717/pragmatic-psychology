"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="panel section-pad">
      <h1>This view could not load.</h1>
      <p>
        Your device’s saved records have not been cleared. Retry, or return to
        the notebook to export a backup.
      </p>
      <button onClick={reset}>Retry</button>
      <a href="/notebook/">Open notebook</a>
    </div>
  );
}
