"use client";

import { useQuery, useMutation } from "convex/react";
import Link from "next/link";
import { Heart, VideoOff, ArrowLeft } from "lucide-react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { Spinner } from "@/components/ui";
import { EmptyState } from "@/components/ui/EmptyState";
import { TYPE_CONFIG } from "@/lib/configs/application";

export default function SavedProjectsPage() {
  const saved = useQuery(api.applications.sponsor.mySavedApplications, {});
  const toggleInterest = useMutation(
    api.applications.sponsor.toggleSponsorInterest,
  );

  if (saved === undefined) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
        <Spinner size="xl" color="current" className="text-primary" />
        <p className="font-bold text-muted-foreground animate-pulse">
          جاري التحميل...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <header className="flex items-center gap-3 mb-6">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center nb-border"
          style={{ background: "rgba(239,68,68,0.1)" }}
        >
          <Heart className="w-6 h-6 text-destructive" fill="currentColor" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold leading-tight">
            المشاريع المحفوظة
          </h1>
          <p className="text-sm text-muted-foreground">
            المشاريع اللي ضغطت &quot;اهتمام&quot; عليها
          </p>
        </div>
      </header>

      {saved.length === 0 ? (
        <EmptyState
          variant="empty-inbox"
          title="ما في مشاريع محفوظة بعد"
          description="استعرض المشاريع في الصفحة الرئيسية واضغط على القلب لحفظ ما يهمّك"
          action={
            <Link
              href="/sponsor"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg nb-border font-bold text-sm bg-primary text-primary-foreground hover:nb-shadow-sm transition-all"
            >
              تصفّح المشاريع
              <ArrowLeft className="w-4 h-4" />
            </Link>
          }
        />
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {saved.map((project) => {
            const typeCfg = TYPE_CONFIG[project.type];
            return (
              <li key={project._id}>
                <SavedCard
                  project={project}
                  typeLabel={typeCfg?.label}
                  onUnsave={() =>
                    void toggleInterest({
                      applicationId: project._id as Id<"applications">,
                    })
                  }
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

interface SavedProject {
  _id: Id<"applications">;
  projectName: string;
  description: string;
  type: string;
  videoUrl: string | null;
  submittedAt?: number;
}

function SavedCard({
  project,
  typeLabel,
  onUnsave,
}: {
  project: SavedProject;
  typeLabel: string | undefined;
  onUnsave: () => void;
}) {
  return (
    <div className="relative group nb-card overflow-hidden flex flex-col">
      <Link href={`/sponsor/projects/${project._id}`} className="block">
        {/* Thumbnail */}
        <div className="relative aspect-video bg-zinc-900">
          {project.videoUrl ? (
            <video
              src={project.videoUrl}
              preload="metadata"
              className="w-full h-full object-cover"
              muted
              playsInline
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500">
              <VideoOff className="w-10 h-10 mb-1" />
              <span className="text-xs font-bold">لا يوجد فيديو</span>
            </div>
          )}
          {typeLabel && (
            <span className="absolute top-2 right-2 text-[10px] font-extrabold px-2 py-1 bg-primary/90 text-primary-foreground rounded-md">
              {typeLabel}
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-extrabold text-base mb-1 line-clamp-1">
            {project.projectName}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {project.description}
          </p>
        </div>
      </Link>
      <button
        type="button"
        onClick={onUnsave}
        aria-label="إزالة من المحفوظات"
        className="absolute top-2 left-2 w-9 h-9 rounded-full bg-destructive/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:scale-105 transition-all"
      >
        <Heart className="w-4 h-4" fill="currentColor" />
      </button>
    </div>
  );
}
