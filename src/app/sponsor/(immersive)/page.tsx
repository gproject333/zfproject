"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { useSearchParams } from "next/navigation";
import { VideoOff, Inbox, Sparkles } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { Spinner } from "@/components/ui";
import { TYPE_CONFIG } from "@/lib/configs/application";
import SponsorReelOverlayActions from "@/features/applications/components/SponsorReelOverlayActions";
import FloatingSponsorBottomBar from "@/features/sponsor/components/FloatingSponsorBottomBar";

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
      <Spinner size="xl" color="current" className="text-secondary" />
      <p className="font-bold animate-pulse">جاري تحميل المشاريع...</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center gap-4 text-center px-6 text-white/85">
      <div className="w-20 h-20 rounded-full bg-secondary/15 border border-secondary/40 flex items-center justify-center">
        <Inbox className="w-9 h-9 text-secondary" />
      </div>
      <h3 className="text-2xl font-black">لا توجد مشاريع مقبولة بعد</h3>
      <p className="text-sm text-white/65 font-medium max-w-xs leading-relaxed">
        ستظهر هنا فيديوهات المشاريع التي اعتمدها المشرفون للاحتضان.
      </p>
      <FloatingSponsorBottomBar />
    </div>
  );
}

function ReelsScroller({ reels }: { reels: Reel[] }) {
  const searchParams = useSearchParams();
  const focusId = searchParams.get("focus");
  const containerRef = useRef<HTMLDivElement>(null);

  // When the sponsor lands here from /sponsor/interests with ?focus=<id>,
  // jump straight to that project instead of starting at the top.
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
        <ReelSlide key={reel._id} reel={reel} />
      ))}
    </div>
  );
}

function ReelSlide({ reel }: { reel: Reel }) {
  const typeCfg = TYPE_CONFIG[reel.type];

  return (
    <section
      data-reel-id={reel._id}
      className="snap-start snap-always h-full w-full flex items-center justify-center px-4 sm:px-8"
    >
      <div className="relative w-full max-w-[440px] aspect-[9/16] max-h-[calc(100vh-2rem)] rounded-3xl overflow-hidden bg-black border border-secondary/20 shadow-[0_0_40px_rgba(201,162,39,0.18)] mx-auto">
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

        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none opacity-90" />

        <SponsorReelOverlayActions
          app={reel}
          pdfUrl={reel.pdfUrl}
          videoUrl={reel.videoUrl}
          isInterested={reel.isInterested}
        />

        <div className="absolute bottom-0 left-0 right-0 p-6 pb-10 pr-6 pl-20 z-20 text-white pointer-events-none">
          {typeCfg && (
            <div className="inline-flex mb-3 pointer-events-auto">
              <span className="text-[10px] font-extrabold px-3 py-1.5 bg-gradient-to-br from-secondary to-secondary-border text-secondary-foreground rounded-lg shadow-lg flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                {typeCfg.label}
              </span>
            </div>
          )}
          <h2 className="text-2xl sm:text-3xl font-black mb-3 leading-tight drop-shadow-xl w-[90%] tracking-tight">
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
