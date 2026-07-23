"use client";

import { useRef, useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";

const VIDEO_URL =
  "https://gecvmizbryyiefclfnhs.supabase.co/storage/v1/object/public/STORAGE/video/Commercial.mp4";

/**
 * Autoplay looping commercial video.
 * - Starts muted (browser autoplay requirement).
 * - Hover over the video to temporarily enable sound.
 * - Click the sound button (or the video) to lock sound on/off permanently.
 */
export function VideoSection() {
  const videoRef = useRef<HTMLVideoElement>(null);

  // User's explicit persistent preference (click to toggle)
  const [soundOn, setSoundOn] = useState(false);
  // True while the pointer is inside the video
  const [hovering, setHovering] = useState(false);

  // Derived muted state: muted only when sound is off AND not hovering
  const isMuted = !soundOn && !hovering;

  // Sync muted property to the video element whenever it changes
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = isMuted;
  }, [isMuted]);

  function toggleSound() {
    setSoundOn((prev) => !prev);
  }

  return (
    <section
      aria-label="NeedItz commercial video"
      className="w-full bg-white py-6 sm:py-10 px-4 sm:px-6"
    >
      <div className="max-w-[1400px] mx-auto">
        <div
          className="relative rounded-2xl overflow-hidden bg-black cursor-pointer group"
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          onClick={toggleSound}
          role="button"
          tabIndex={0}
          aria-label={soundOn ? "Turn sound off" : "Turn sound on"}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") toggleSound(); }}
        >
          {/* ── Video element ─────────────────────────────────── */}
          <video
            ref={videoRef}
            src={VIDEO_URL}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="w-full h-auto block"
            aria-label="NeedItz commercial — submit large and hard-to-source purchase requests"
          />

          {/* ── Sound toggle button ───────────────────────────── */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); toggleSound(); }}
            aria-label={isMuted ? "Unmute video" : "Mute video"}
            className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-black/60 hover:bg-black/80 text-white text-xs font-semibold rounded-full px-3 py-2 transition-all backdrop-blur-sm select-none"
          >
            {isMuted ? (
              <>
                <VolumeX size={14} aria-hidden="true" />
                <span>Sound off</span>
              </>
            ) : (
              <>
                <Volume2 size={14} aria-hidden="true" />
                <span>Sound on</span>
              </>
            )}
          </button>

          {/* ── Hover hint shown only when muted and not yet interacted ── */}
          {!soundOn && !hovering && (
            <div
              aria-hidden="true"
              className="absolute bottom-4 left-4 text-xs text-white/70 font-medium pointer-events-none select-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              Hover or click for sound
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
