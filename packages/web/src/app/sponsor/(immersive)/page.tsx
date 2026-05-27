"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { useSearchParams } from "next/navigation";
import { VideoOff, Inbox, Sparkles, Volume2, VolumeX, Play } from "lucide-react";
import { api } from "@smart-zuj/convex";
import { Spinner } from "@/components/ui";
import { TYPE_CONFIG } from "@/lib/configs/application";
import SponsorReelOverlayActions from "@/features/applications/components/SponsorReelOverlayActions";
import FloatingSponsorBottomBar from "@/features/sponsor/components/FloatingSponsorBottomBar";
import OliveSpinner from "@/components/OliveSpinner";

type Reel = NonNullable<
  ReturnType<
    typeof useQuery<typeof api.applications.sponsor.mySponsoredApplications>
  >
>[number];

/**
 * Immersive reels feed for sponsors — fills the viewport edge-to-edge so
 * the experience feels like a dedicated reels app instead of a dashboard
 * widget. The floating bottom bar is the only chrome; everything else
 * (interest heart, project file, applicant profile) lives in the
 * reel overlay column on the right.
 */
export default function SponsorReelsFeed() {
  const reels = useQuery(api.applications.sponsor.mySponsoredApplications, {});

  if (reels === undefined) return <LoadingState />;
  if (reels.length === 0) return <EmptyState />;

  return (
    <>
      <ReelsScroller reels={reels} />
      <FloatingSponsorBottomBar />
    </>
  );
}

function LoadingState() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center gap-4 text-white/80">
      <OliveSpinner size="xl" className="text-secondary" />
      <p className="font-bold animate-pulse">يجري تحميل المشاريع...</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center gap-4 text-center px-6 text-white/85">
      <div className="w-20 h-20 rounded-full bg-secondary/15 border border-secondary/40 flex items-center justify-center">
        <Inbox className="w-9 h-9 text-secondary" />
      </div>
      <h3 className="text-2xl font-black">لا توجد مشاريع معتمدة حاليًا</h3>
      <p className="text-sm text-white/65 font-medium max-w-xs leading-relaxed">
        تُعرض هنا الفيديوهات التعريفية للمشاريع التي اعتمدها المشرفون للاحتضان.
      </p>
      <FloatingSponsorBottomBar />
    </div>
  );
}

function ReelsScroller({ reels }: { reels: Reel[] }) {
  const searchParams = useSearchParams();
  const focusId = searchParams.get("focus");
  const containerRef = useRef<HTMLDivElement>(null);
  // Single global mute toggle (IG-style) — persists between slides so users
  // don't have to unmute every project. Defaults muted to satisfy browser
  // autoplay policies.
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    if (!focusId || !containerRef.current) return;
    const target = containerRef.current.querySelector<HTMLElement>(
      `[data-reel-id="${focusId}"]`,
    );
    target?.scrollIntoView({ behavior: "instant" as ScrollBehavior, block: "start" });
  }, [focusId, reels]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-y-auto snap-y snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      dir="rtl"
    >
      {reels.map((reel) => (
        <ReelSlide
          key={reel._id}
          reel={reel}
          muted={muted}
          onToggleMute={() => setMuted((m) => !m)}
        />
      ))}
    </div>
  );
}

function ReelSlide({
  reel,
  muted,
  onToggleMute,
}: {
  reel: Reel;
  muted: boolean;
  onToggleMute: () => void;
}) {
  const typeCfg = TYPE_CONFIG[reel.type];
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showPlayHint, setShowPlayHint] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // IG-style autoplay: the slide that fills the viewport plays, the others
  // pause. Uses IntersectionObserver with a high threshold so only the
  // dominant slide is "active".
  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.7) {
          video.play().catch(() => {
            // Some browsers block even muted autoplay (e.g., Safari with
            // reduced motion). Show a tap-to-play hint instead.
            setShowPlayHint(true);
          });
        } else {
          video.pause();
          video.currentTime = 0;
        }
      },
      { threshold: [0, 0.7, 1] },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const handleVideoClick = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPaused(false)).catch(() => {});
      setShowPlayHint(false);
    } else {
      video.pause();
      setIsPaused(true);
    }
  };

  return (
    <section
      ref={sectionRef}
      data-reel-id={reel._id}
      className="snap-start snap-always h-full w-full flex items-center justify-center px-4 sm:px-8"
    >
      <div className="relative w-full max-w-[440px] aspect-[9/16] max-h-[calc(100vh-2rem)] rounded-3xl overflow-hidden bg-black border border-secondary/20 shadow-[0_0_40px_rgba(201,162,39,0.18)] mx-auto">
        {reel.videoUrl ? (
          <video
            ref={videoRef}
            playsInline
            preload="metadata"
            loop
            muted={muted}
            src={reel.videoUrl}
            onClick={handleVideoClick}
            onPlay={() => setIsPaused(false)}
            onPause={() => setIsPaused(true)}
            className="absolute inset-0 w-full h-full object-cover z-0 cursor-pointer"
          />
        ) : (
          <div className="absolute inset-0 z-0 flex flex-col items-center justify-center bg-zinc-900">
            <VideoOff className="w-16 h-16 text-zinc-700 mb-4" />
            <p className="text-zinc-500 font-bold">لا يتوفّر فيديو تعريفي</p>
          </div>
        )}

        {/* Pause / autoplay-blocked indicator: a soft play glyph the user
            can tap to start the reel. */}
        {(showPlayHint || isPaused) && reel.videoUrl && (
          <button
            onClick={handleVideoClick}
            className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 backdrop-blur-[2px] cursor-pointer"
            aria-label="تشغيل"
          >
            <span className="w-20 h-20 rounded-full bg-white/15 backdrop-blur-md border-2 border-white/30 flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.25)]">
              <Play className="w-9 h-9 text-white fill-white ml-1" />
            </span>
          </button>
        )}

        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none opacity-90" />

        {/* Top right: mute toggle (IG-style) */}
        {reel.videoUrl && (
          <button
            onClick={onToggleMute}
            aria-label={muted ? "تشغيل الصوت" : "كتم الصوت"}
            className="absolute top-4 left-4 z-20 w-10 h-10 rounded-full bg-black/45 backdrop-blur-md border border-white/15 text-white flex items-center justify-center hover:bg-black/65 transition-colors"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        )}

        <SponsorReelOverlayActions
          app={reel}
          pdfUrl={reel.pdfUrl}
          videoUrl={reel.videoUrl}
          isInterested={reel.isInterested}
        />

        {/* Bottom: IG-style identity strip + project info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 pb-10 pr-6 pl-20 z-20 text-white pointer-events-none">
          <ReelIdentity reel={reel} />

          {typeCfg && (
            <div className="inline-flex mb-3 pointer-events-auto">
              <span className="text-[10px] font-extrabold px-3 py-1.5 bg-gradient-to-br from-secondary to-secondary-border text-secondary-foreground rounded-lg shadow-lg flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                {typeCfg.label}
              </span>
            </div>
          )}
          <h2 className="text-xl sm:text-2xl font-black mb-2 leading-tight drop-shadow-xl w-[90%] tracking-tight">
            {reel.projectName}
          </h2>
          <p className="text-sm font-medium text-white/90 leading-relaxed drop-shadow-lg line-clamp-3 max-h-[64px] overflow-hidden">
            {reel.description}
          </p>
        </div>
      </div>
    </section>
  );
}

/** IG-style avatar + handle row at the top of the caption block. */
function ReelIdentity({ reel }: { reel: Reel }) {
  const name = reel.student.name?.trim() || "طالب في الجامعة";
  const initial = name.charAt(0);
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/80 bg-zinc-700 shrink-0 shadow-md">
        {reel.student.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={reel.student.avatarUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm font-black text-white">
            {initial}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-extrabold text-white drop-shadow-md truncate">
          {name}
        </p>
        <p className="text-[10px] font-bold text-white/70 drop-shadow-md flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_8px_rgba(201,162,39,0.8)]" />
          مشروع معتمد
        </p>
      </div>
    </div>
  );
}
