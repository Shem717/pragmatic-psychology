"use client";
import { useState } from "react";
import { Play } from "lucide-react";
export function Video({ id, title }: { id: string; title: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="video-frame archive-screen">
      {loaded ? (
        <>
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?rel=0`}
            title={title}
            allow="encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
          <button className="unload-video" onClick={() => setLoaded(false)}>
            Unload player
          </button>
        </>
      ) : (
        <div className="video-facade">
          <svg className="archive-video-orbit" viewBox="0 0 320 240" fill="none" aria-hidden="true"><circle cx="160" cy="120" r="82" /><circle cx="160" cy="120" r="64" /><ellipse cx="160" cy="120" rx="130" ry="39" transform="rotate(-29 160 120)" /><ellipse cx="160" cy="120" rx="111" ry="45" transform="rotate(37 160 120)" /><path d="M160 22v25M160 193v25M62 120h25M233 120h25" /><circle cx="66" cy="174" r="4" /><circle cx="256" cy="65" r="4" /></svg>
          <span className="small-label">
            SELECTED VIDEO · WATCH THE DISCUSSION
          </span>
          <h2>{title}</h2>
          <button className="primary" onClick={() => setLoaded(true)}>
            <Play size={16} aria-hidden="true" /> Load video
          </button>
          <p>
            Activating the player connects to YouTube. A direct watch link is
            always available.
          </p>
        </div>
      )}
    </div>
  );
}
