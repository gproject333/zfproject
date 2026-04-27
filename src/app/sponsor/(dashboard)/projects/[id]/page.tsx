"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Loader2, Heart, VideoOff } from "lucide-react";
import { TYPE_CONFIG } from "@/lib/configs/application";
import { useApplication } from "@/features/applications/hooks/useApplication";

export default function SponsorProjectReelsPage() {
  const router = useRouter();
  const params = useParams();
  const appId = params.id as Id<"applications">;

  const { app, videoUrl } = useApplication(appId);
  // الجلب الجديد للربط بين الراعي والمشروع بناءً على التصميم السينمائي
  const assignment = useQuery(api.applications.sponsor.getAssignmentByProject, { applicationId: appId });
  const toggleInterest = useMutation(api.applications.sponsor.toggleSponsorInterest);

  const [isLiking, setIsLiking] = useState(false);

  const handleToggle = async () => {
    if (!assignment) return;
    setIsLiking(true);
    try {
      await toggleInterest({ assignmentId: assignment._id });
    } finally {
      setIsLiking(false);
    }
  };

  if (app === undefined || assignment === undefined) {
    return (
      <div className="flex justify-center flex-col items-center h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="font-bold text-muted-foreground animate-pulse">جاري تحميل العرض...</p>
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
      {/* 
        تصميم Reels السينمائي: يأخذ شكل هاتف 
        ويحوي الفيديو بكامل مساحته مع أزرار الإعجاب الجانبية والمحتوى على الأسفل 
      */}
      <div 
        className="relative w-full max-w-[420px] aspect-[9/16] max-h-[85vh] rounded-3xl overflow-hidden bg-black nb-border-thick shadow-2xl flex flex-col justify-center animate-fade-in mx-auto"
        dir="rtl"
      >
        {/* ملف الفيديو الخلفي */}
        {videoUrl ? (
          <video 
            controls 
            // autoPlay 
            // muted // ينصح بـ muted في حال تفعيل الـ Autoplay 
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

        {/* طبقة التدرج اللوني للوضوح */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/30 to-transparent pointer-events-none opacity-80" />

        {/* الشريط العلوي */}
        <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center">
          <span className="text-[10px] font-bold text-white/60 bg-black/40 px-3 py-1 rounded-full backdrop-blur-md">
            تصفح المشاريع
          </span>
          <button
            onClick={() => router.push("/sponsor")}
            className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-all border border-white/10 hover:border-white/30 hover:scale-105"
            style={{ direction: 'ltr' }}
          >
            <ArrowLeft className="w-5 h-5 rotate-180" />
          </button>
        </div>

        {/* قائمة الأفعال الجانبية (Style TikTok Actions) */}
        <div className="absolute bottom-32 left-4 z-20 flex flex-col items-center gap-5">
          <button 
            onClick={handleToggle}
            disabled={isLiking}
            className="flex flex-col items-center gap-1.5 group"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
              isInterested 
                ? "bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] scale-110" 
                : "bg-black/40 text-white/90 backdrop-blur-md border border-white/20 hover:scale-105"
            }`}>
              {isLiking ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Heart className={`w-6 h-6 transition-all ${isInterested ? "fill-white" : ""}`} />
              )}
            </div>
            <span className="text-[11px] font-extrabold text-white drop-shadow-md">
              {isInterested ? "أنت مهتم" : "اهتمام"}
            </span>
          </button>
        </div>

        {/* تفاصيل المشروع العائمة في الأسفل */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-20 text-white pointer-events-none pb-8 pr-6 pl-20">
          
          {/* النوع */}
          <div className="inline-flex mb-3 pointer-events-auto">
            <span className="text-[10px] font-extrabold px-3 py-1.5 bg-primary/90 text-primary-foreground backdrop-blur-md nb-border rounded-lg shadow-lg">
              {typeCfg?.label}
            </span>
          </div>
          
          {/* العنوان */}
          <h2 className="text-2xl sm:text-3xl font-black mb-3 leading-tight drop-shadow-xl w-[90%]">
            {app.projectName}
          </h2>
          
          {/* الوصف (ملخص قصير) */}
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
