"use client";

import { useQuery } from "convex/react";
import { api } from "@smart-zuj/convex";
import { Id } from "@smart-zuj/convex";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, VideoOff } from "lucide-react";
import { Spinner } from "@/components/ui";
import { TYPE_CONFIG } from "@/lib/configs/application";
import { useApplication } from "@/features/applications/hooks/useApplication";
import SponsorReelOverlayActions from "@/features/applications/components/SponsorReelOverlayActions";

export default function SponsorProjectReelsPage() {
  const router = useRouter();
  const params = useParams();
  const appId = params.id as Id<"applications">;

  const { app, videoUrl, pdfUrl } = useApplication(appId);
  // Sponsor↔project link drives the heart's initial state.
  const assignment = useQuery(api.applications.sponsor.getAssignmentByProject, {
    applicationId: appId,
  });

  if (app === undefined) {
    return (
      <div className="flex justify-center flex-col items-center h-[60vh] gap-4">
        <Spinner size="xl" color="current" className="text-primary" />
        <p className="font-bold text-muted-foreground animate-pulse">
          جاري تحميل العرض...
        </p>
      </div>
    );
  }

  if (app === null) {
    return <div className="text-center py-20 font-bold">المشروع غير متاح</div>;
  }

  const typeCfg = TYPE_CONFIG[app.type];
  const isInterested = assignment?.isInterested ?? false;

  return (
    <div className="flex justify-center items-center h-full sm:-mt-2">
      <div
        className="relative w-full max-w-[420px] aspect-[9/16] max-h-[85vh] rounded-3xl overflow-hidden bg-black ds-border-thick shadow-2xl flex flex-col justify-center animate-fade-in mx-auto"
        dir="rtl"
      >
        {videoUrl ? (
          <video
            controls
            playsInline
            src={videoUrl}
            className="absolute inset-0 w-full h-full object-cover z-0"
          />
        ) : (
          <div className="absolute inset-0 z-0 flex flex-col items-center justify-center bg-zinc-900">
            <VideoOff className="w-16 h-16 text-zinc-700 mb-4" />
            <p className="text-zinc-500 font-bold">لا يوجد فيديو تعريفي</p>
          </div>
        )}

        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/30 to-transparent pointer-events-none opacity-80" />

        <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center">
          <span className="text-[10px] font-bold text-white/60 bg-black/40 px-3 py-1 rounded-full backdrop-blur-md">
            تصفح المشاريع
          </span>
          <button
            onClick={() => router.push("/sponsor")}
            className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-all border border-white/10 hover:border-white/30 hover:scale-105"
            style={{ direction: "ltr" }}
          >
            <ArrowLeft className="w-5 h-5 rotate-180" />
          </button>
        </div>

        <SponsorReelOverlayActions
          app={app}
          pdfUrl={pdfUrl}
          videoUrl={videoUrl}
          isInterested={isInterested}
        />

        <div className="absolute bottom-0 left-0 right-0 p-6 z-20 text-white pointer-events-none pb-8 pr-6 pl-20">
          <div className="inline-flex mb-3 pointer-events-auto">
            <span className="text-[10px] font-extrabold px-3 py-1.5 bg-primary/90 text-primary-foreground backdrop-blur-md ds-border rounded-lg shadow-lg">
              {typeCfg?.label}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black mb-3 leading-tight drop-shadow-xl w-[90%]">
            {app.projectName}
          </h2>

          <div className="relative">
            <p className="text-sm font-medium text-white/90 leading-relaxed drop-shadow-lg line-clamp-4 max-h-[80px] overflow-hidden">
              {app.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
