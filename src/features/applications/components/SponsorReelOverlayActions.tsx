"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Heart, FileText, User as UserIcon } from "lucide-react";
import { Spinner } from "@/components/ui";
import { Dialog, DialogContent } from "@/components/ui/Dialog";
import { api } from "../../../../convex/_generated/api";
import type { Doc, Id } from "../../../../convex/_generated/dataModel";
import ProjectDetailsCard from "./ProjectDetailsCard";
import AttachmentsSection from "./AttachmentsSection";
import StudentProfileBody from "./StudentProfileBody";

interface SponsorReelOverlayActionsProps {
  app: Doc<"applications">;
  pdfUrl: string | null | undefined;
  videoUrl: string | null | undefined;
  isInterested: boolean;
}

/**
 * The TikTok-style side action column that floats on top of a sponsor's
 * reel: heart (toggle interest), project file (full incubation details +
 * PDF), and applicant profile. Each non-heart action opens a centered
 * dialog so the reel itself stays untouched.
 */
export default function SponsorReelOverlayActions({
  app,
  pdfUrl,
  videoUrl,
  isInterested,
}: SponsorReelOverlayActionsProps) {
  const toggleInterest = useMutation(
    api.applications.sponsor.toggleSponsorInterest,
  );
  const [isLiking, setIsLiking] = useState(false);
  const [optimistic, setOptimistic] = useState<boolean | null>(null);
  const interested = optimistic ?? isInterested;

  const [showProject, setShowProject] = useState(false);
  const [showStudent, setShowStudent] = useState(false);

  const student = useQuery(
    api.applications.sponsor.getStudentForAcceptedApplication,
    showStudent ? { applicationId: app._id as Id<"applications"> } : "skip",
  );

  const handleToggle = async () => {
    setOptimistic(!interested);
    setIsLiking(true);
    try {
      await toggleInterest({ applicationId: app._id as Id<"applications"> });
      setOptimistic(null);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <>
      <div className="absolute bottom-32 left-4 z-20 flex flex-col items-center gap-5">
        <OverlayButton
          label={interested ? "أنت مهتم" : "اهتمام"}
          onClick={handleToggle}
          disabled={isLiking}
          active={interested}
          activeClassName="bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] scale-110"
        >
          {isLiking ? (
            <Spinner size="md" color="current" />
          ) : (
            <Heart
              className={`w-6 h-6 transition-all ${interested ? "fill-white" : ""}`}
            />
          )}
        </OverlayButton>

        <OverlayButton
          label="ملف الاحتضان"
          onClick={() => setShowProject(true)}
        >
          <FileText className="w-6 h-6" />
        </OverlayButton>

        <OverlayButton
          label="ملف الطالب"
          onClick={() => setShowStudent(true)}
        >
          <UserIcon className="w-6 h-6" />
        </OverlayButton>
      </div>

      <Dialog open={showProject} onOpenChange={setShowProject}>
        <DialogContent
          title="ملف الاحتضان"
          className="max-w-2xl max-h-[85vh] overflow-y-auto"
        >
          <div className="space-y-4">
            <ProjectDetailsCard app={app} />
            <AttachmentsSection
              pdfFileId={app.pdfFileId}
              videoFileId={app.videoFileId}
              pdfUrl={pdfUrl}
              videoUrl={videoUrl}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showStudent} onOpenChange={setShowStudent}>
        <DialogContent title="ملف الطالب" className="max-w-md">
          {student === undefined ? (
            <div className="flex items-center justify-center min-h-[180px]">
              <Spinner size="sm" color="current" className="text-accent" />
            </div>
          ) : student === null ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              تعذّر تحميل بيانات الطالب.
            </p>
          ) : (
            <StudentProfileBody student={student} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function OverlayButton({
  label,
  onClick,
  disabled,
  active,
  activeClassName,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  activeClassName?: string;
  children: React.ReactNode;
}) {
  const baseInactive =
    "bg-black/40 text-white/90 backdrop-blur-md border border-white/20 hover:scale-105";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex flex-col items-center gap-1.5 group"
    >
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
          active && activeClassName ? activeClassName : baseInactive
        }`}
      >
        {children}
      </div>
      <span className="text-[11px] font-extrabold text-white drop-shadow-md">
        {label}
      </span>
    </button>
  );
}
