"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Volume2, VolumeX } from "lucide-react";

const AD_URL =
  "https://gecvmizbryyiefclfnhs.supabase.co/storage/v1/object/public/STORAGE/images/Ad2.png";
const VIDEO_URL =
  "https://gecvmizbryyiefclfnhs.supabase.co/storage/v1/object/public/STORAGE/video/Commercial.mp4";

export function PromoMediaSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [soundOn, setSoundOn] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Detect prefers-reduced-motion client-side
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Force muted + attempt autoplay after mount.
  // Must set .muted = true on the DOM element directly — React's muted
  // prop is not always reflected in the DOM in time for autoplay.
  useEffect(() => {
    const v = videoRef.current;
    if (!v || reducedMotion) return;
    v.muted = true;
    const p = v.play();
    if (p) p.catch(() => {}); // silent catch — blocked autoplay is not an error
  }, [reducedMotion]);

  // Keep muted state in sync when user toggles sound
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !soundOn;
  }, [soundOn]);

  return (
    <section
      aria-label="NeedItz promotional media"
      className="w-full bg-white pt-10 pb-12 sm:pt-12 sm:pb-14 px-5 sm:px-6"
    >
      <div className="max-w-[1150px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 items-start">

          {/* ── Square ad image ──────────────────────────────── */}
          <Link
            href="/request"
            aria-label="Submit a request — NeedItz"
            className="block rounded-[16px] overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC400] motion-safe:transition-opacity hover:opacity-96"
          >
            <div className="relative w-full aspect-square bg-[#F7F7F7] rounded-[16px] overflow-hidden">
              <Image
                src={AD_URL}
                alt="NeedItz advertisement inviting users to submit large and hard-to-source purchase requests."
                fill
                className="object-cover"
                sizes="(max-width: 768px) calc(100vw - 40px), (max-width: 1150px) 50vw, 555px"
                quality={90}
                priority={false}
              />
            </div>
          </Link>

          {/* ── Video ────────────────────────────────────────── */}
          <div className="relative w-full aspect-square bg-black rounded-[16px] overflow-hidden">
            <video
              ref={videoRef}
              src={VIDEO_URL}
              autoPlay
              muted        // JSX prop — also set via ref in useEffect for reliability
              loop
              playsInline
              preload="metadata"
              className="w-full h-full object-contain"
              aria-label="NeedItz commercial — submit large and hard-to-source purchase requests"
            />

            {/* Sound toggle */}
            <button
              type="button"
              onClick={() => setSoundOn((p) => !p)}
              aria-label={soundOn ? "Mute video" : "Unmute video"}
              className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 bg-black/60 hover:bg-black/80 text-white text-xs font-semibold rounded-full px-3 py-1.5 transition-colors backdrop-blur-sm select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC400]"
            >
              {soundOn
                ? <><Volume2 size={13} aria-hidden="true" /><span>Sound on</span></>
                : <><VolumeX size={13} aria-hidden="true" /><span>Sound off</span></>
              }
            </button>

            {/* Reduced-motion overlay */}
            {reducedMotion && (
              <div
                aria-hidden="true"
                className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none"
              >
                <p className="text-white text-xs font-medium px-4 text-center leading-relaxed">
                  Video paused — reduced motion is enabled in your system settings.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
