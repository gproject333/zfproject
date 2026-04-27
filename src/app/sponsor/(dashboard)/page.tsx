"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  FileText,
  Lightbulb,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { TYPE_CONFIG } from "@/lib/configs/application";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonApplicationList } from "@/components/ui/Skeleton";

export default function SponsorProjectsPage() {
  const router = useRouter();
  const projects = useQuery(api.applications.sponsor.mySponsoredApplications, {});

  if (projects === undefined) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <div className="h-8 w-52 bg-muted rounded-lg mb-2 animate-pulse" />
          <div className="h-4 w-72 bg-muted rounded-lg animate-pulse" />
        </div>
        <SkeletonApplicationList count={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold flex items-center gap-2 mb-2">
          <Briefcase className="w-7 h-7" style={{ color: "#C9A227" }} />
          المشاريع المرتبطة بي
        </h2>
        <p className="text-muted-foreground font-medium">
          {projects.length === 0
            ? "لم يتم ربطك بأي مشاريع بعد"
            : `${projects.length} مشروع تحت رعايتك`}
        </p>
      </div>

      {/* Projects */}
      {projects.length === 0 ? (
        <EmptyState
          variant="empty-inbox"
          title="لا توجد مشاريع"
          description="سيقوم فريق الحاضنة بربط المشاريع المناسبة بك قريباً."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {projects.map((project, i) => {
            if (!project) return null;
            const typeCfg = TYPE_CONFIG[project.type];
            const TypeIcon = typeCfg?.icon ?? Lightbulb;

            return (
              <button
                key={project._id}
                onClick={() => router.push(`/sponsor/projects/${project._id}`)}
                className="nb-card-interactive p-6 text-right animate-slide-up w-full"
                style={{ animationDelay: `${i * 0.07}s`, opacity: 0 }}
              >
                {/* Top Row */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-xl nb-border flex items-center justify-center shrink-0"
                    style={{ background: "#C9A227" }}
                  >
                    <TypeIcon className="w-6 h-6 text-white" />
                  </div>
                  {/* Status = always accepted for sponsor */}
                  <span className="nb-badge bg-success/10 text-success border-success/30 self-start">
                    <CheckCircle2 className="w-3 h-3" />
                    مقبول
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-extrabold text-lg mb-1 truncate">{project.projectName}</h3>
                <p className="text-xs text-muted-foreground font-medium mb-3">{typeCfg?.label}</p>

                {/* Description Excerpt */}
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{project.description}</p>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 flex-wrap">
                  {project.pdfFileId && (
                    <span className="nb-badge bg-destructive/10 text-destructive border-destructive/20">
                      <FileText className="w-3 h-3" />
                      PDF
                    </span>
                  )}
                  {project.videoFileId && (
                    <span className="nb-badge bg-info/10 text-info border-info/20">
                      <Eye className="w-3 h-3" />
                      فيديو
                    </span>
                  )}
                  <Eye className="w-5 h-5 text-accent" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
