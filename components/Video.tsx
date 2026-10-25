"use client";
import { useState } from "react";
import { Play } from "lucide-react";
export function Video({ id, title }: { id: string; title: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="video-frame">
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
          <span className="video-rings" aria-hidden="true">
            ◎
          </span>
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
