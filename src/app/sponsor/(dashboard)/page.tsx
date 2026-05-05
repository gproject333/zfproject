"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";
import { Heart, VideoOff, Inbox } from "lucide-react";
import { Spinner } from "@/components/ui";
import { TYPE_CONFIG } from "@/lib/configs/application";
import type { Id } from "../../../../convex/_generated/dataModel";

type Reel = NonNullable<
  ReturnType<typeof useQuery<typeof api.applications.sponsor.mySponsoredApplications>>
>[number];

/**
 * Sponsor dashboard — Instagram-style vertical reels feed.
 * Each visible application that has a video gets one full-viewport slide.
 * Sponsors swipe vertically to browse; tap the heart to mark interest.
 */
export default function SponsorReelsFeed() {
  const reels = useQuery(api.applications.sponsor.mySponsoredApplications, {});

  if (reels === undefined) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
        <Spinner size="xl" color="current" className="text-primary" />
        <p className="font-bold text-muted-foreground animate-pulse">
          جاري تحميل المشاريع...
        </p>
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4 text-center px-6">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <Inbox className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-extrabold">لا توجد فيديوهات بعد</h3>
        <p className="text-sm text-muted-foreground font-medium max-w-xs">
          ستظهر هنا فيديوهات المشاريع فور تقديم الطلاب لها.
        </p>
      </div>
    );
  }

  return (
    <div
      className="h-[calc(100vh-9rem)] overflow-y-auto snap-y snap-mandatory -mx-4 md:-mx-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      dir="rtl"
    >
      {reels.map((reel) => (
        <ReelSlide key={reel._id} reel={reel} />
      ))}
    </div>
  );
}

function ReelSlide({ reel }: { reel: Reel }) {
  const toggleInterest = useMutation(
    api.applications.sponsor.toggleSponsorInterest,
  );
  const [isLiking, setIsLiking] = useState(false);
  // Optimistic-like: snap to whatever the server says, but show the toggle
  // immediately when the user taps so the feed doesn't feel laggy.
  const [optimistic, setOptimistic] = useState<boolean | null>(null);
  const isInterested = optimistic ?? reel.isInterested;

  const handleToggle = async () => {
    setOptimistic(!isInterested);
    setIsLiking(true);
    try {
      await toggleInterest({ applicationId: reel._id as Id<"applications"> });
      setOptimistic(null);
    } finally {
      setIsLiking(false);
    }
  };

  const typeCfg = TYPE_CONFIG[reel.type];

  return (
    <section className="snap-start snap-always h-[calc(100vh-9rem)] flex items-center justify-center px-4">
      <div className="relative w-full max-w-[420px] aspect-[9/16] max-h-full rounded-3xl overflow-hidden bg-black shadow-2xl flex flex-col justify-center mx-auto">
        {/* Video */}
        {reel.videoUrl ? (
          <video
            controls
            playsInline
            preload="metadata"
            src={reel.videoUrl}
            className="absolute inset-0 w-full h-full object-cover z-0"
          />
        ) : (
          <div className="absolute inset-0 z-0 flex flex-col items-center justify-center bg-zinc-900">
            <VideoOff className="w-16 h-16 text-zinc-700 mb-4" />
            <p className="text-zinc-500 font-bold">لا يوجد فيديو تعريفي</p>
          </div>
        )}

        {/* Bottom-up gradient for text legibility */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/30 to-transparent pointer-events-none opacity-80" />

        {/* Side actions (TikTok-style) */}
        <div className="absolute bottom-32 left-4 z-20 flex flex-col items-center gap-5">
          <button
            onClick={handleToggle}
            disabled={isLiking}
            className="flex flex-col items-center gap-1.5 group"
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                isInterested
                  ? "bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] scale-110"
                  : "bg-black/40 text-white/90 backdrop-blur-md border border-white/20 hover:scale-105"
              }`}
            >
              {isLiking ? (
                <Spinner size="md" color="current" />
              ) : (
                <Heart
                  className={`w-6 h-6 transition-all ${isInterested ? "fill-white" : ""}`}
                />
              )}
            </div>
            <span className="text-[11px] font-extrabold text-white drop-shadow-md">
              {isInterested ? "أنت مهتم" : "اهتمام"}
            </span>
          </button>
        </div>

        {/* Project info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-20 text-white pointer-events-none pb-8 pr-6 pl-20">
          {typeCfg && (
            <div className="inline-flex mb-3 pointer-events-auto">
              <span className="text-[10px] font-extrabold px-3 py-1.5 bg-primary/90 text-primary-foreground backdrop-blur-md rounded-lg shadow-lg">
                {typeCfg.label}
              </span>
            </div>
          )}
          <h2 className="text-2xl sm:text-3xl font-black mb-3 leading-tight drop-shadow-xl w-[90%]">
            {reel.projectName}
          </h2>
          <p className="text-sm font-medium text-white/90 leading-relaxed drop-shadow-lg line-clamp-4 max-h-[80px] overflow-hidden">
            {reel.description}
          </p>
        </div>
      </div>
    </section>
  );
}
