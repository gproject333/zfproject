"use client";

import type { Doc } from "@smart-zuj/convex";
import ProjectDetailsCard from "./ProjectDetailsCard";
import AttachmentsSection from "./AttachmentsSection";

interface ApplicationDetailsViewProps {
  app: Doc<"applications">;
  pdfUrl: string | null | undefined;
  videoUrl: string | null | undefined;
  onShowPdf: () => void;
}

/**
 * Read-only application details: the project details card followed by the
 * attachments. Used by the supervisor review page; the student details
 * page composes ProjectDetailsCard and AttachmentsSection directly so it
 * can lay them out side by side.
 */
export default function ApplicationDetailsView({
  app,
  pdfUrl,
  videoUrl,
  onShowPdf,
}: ApplicationDetailsViewProps) {
  return (
    <>
      <ProjectDetailsCard app={app} />
      <AttachmentsSection
        pdfFileId={app.pdfFileId}
        videoFileId={app.videoFileId}
        pdfUrl={pdfUrl}
        videoUrl={videoUrl}
        onShowPdf={onShowPdf}
      />
    </>
  );
}
