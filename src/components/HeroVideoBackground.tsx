import { useEffect, useRef, useState } from "react";

interface HeroVideoBackgroundProps {
  poster: string;
  mp4Src?: string;
  webmSrc?: string;
}

/**
 * Renders a muted, looping, autoplaying video behind hero content.
 * - Disabled under 768px (falls back to poster image).
 * - Pauses when hero scrolls out of view (IntersectionObserver).
 * - Falls back to poster image on load error.
 */
export default function HeroVideoBackground({
  poster,
  mp4Src = "/videos/hero-bg.mp4",
  webmSrc = "/videos/hero-bg.webm",
}: HeroVideoBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (isMobile || videoFailed) return;
    const el = containerRef.current;
    const video = videoRef.current;
    if (!el || !video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isMobile, videoFailed]);

  const showVideo = !isMobile && !videoFailed;

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full overflow-hidden">
      {showVideo && (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          poster={poster}
          onError={() => setVideoFailed(true)}
          aria-hidden="true"
        >
          <source src={webmSrc} type="video/webm" />
          <source src={mp4Src} type="video/mp4" />
        </video>
      )}
      {!showVideo && (
        <img
          src={poster}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
    </div>
  );
}
