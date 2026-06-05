"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { Edit3, X, Trash2, FileQuestion } from "lucide-react";
import { api } from "@smart-zuj/convex";
import type { Id } from "@smart-zuj/convex";
import PdfViewer from "@/components/PdfViewerLazy";
import ProjectDetailsCard from "@/features/applications/components/ProjectDetailsCard";
import AttachmentsSection from "@/features/applications/components/AttachmentsSection";
import SupervisorFeedbackCard from "@/features/applications/components/SupervisorFeedbackCard";
import { useFileUpload } from "@/features/applications/hooks/useFileUpload";
import { useStudentApplicationDetails } from "@/features/student/hooks/useStudentApplicationDetails";
import { toast } from "@/lib/toast";
import { getConvexErrorMessage } from "@/lib/errors";
import ApplicationEditForm from "./ApplicationEditForm";
import DeleteConfirmModal from "./DeleteConfirmModal";
import StudentApplicationHero from "./StudentApplicationHero";
import ApplicationStatusBanner from "./ApplicationStatusBanner";
import { Button, Card } from "@/components/ui";
import { SkeletonApplicationDetail } from "@/components/ui/Skeleton";
import { Tooltip } from "@/components/ui/Tooltip";

/**
 * Top-level orchestrator for the student application details page.
 * All state, mutations, and navigation live in useStudentApplicationDetails.
 * This component composes hero + feedback + details/edit body.
 */
export default function StudentApplicationDetails() {
  const params = useParams();
  const router = useRouter();
  const appId = params.id as Id<"applications">;
  const {
    app,
    pdfUrl,
    videoUrl,

    isEditing,
    setIsEditing,
    showDeleteConfirm,
    setShowDeleteConfirm,
    showPdf,
    setShowPdf,
    deleting,
    canEdit,
    canDelete,
    handleDelete,
    goBack,
  } = useStudentApplicationDetails(appId);

  // Quick-attach support: let the owner add/replace the PDF or video straight
  // from the attachments card on an editable draft, without entering the full
  // edit form.
  const updateApplication = useMutation(api.applications.student.updateApplication);
  const { uploadFile } = useFileUpload();
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const handleAttach = async (kind: "pdf" | "video", file: File) => {
    if (!app) return;
    const maxBytes = kind === "pdf" ? 10 * 1024 * 1024 : 100 * 1024 * 1024;
    if (file.size > maxBytes) {
      toast.error(
        kind === "pdf"
          ? "يجب ألّا يتجاوز حجم الملف 10MB"
          : "يجب ألّا يتجاوز حجم الفيديو 100MB",
      );
      return;
    }
    const setUploading = kind === "pdf" ? setUploadingPdf : setUploadingVideo;
    setUploading(true);
    try {
      const storageId = await uploadFile(file);
      await updateApplication({
        id: app._id,
        ...(kind === "pdf" ? { pdfFileId: storageId } : { videoFileId: storageId }),
      });
      toast.success(kind === "pdf" ? "تم إرفاق ملف PDF" : "تم إرفاق الفيديو");
    } catch (e: unknown) {
      toast.error(getConvexErrorMessage(e, "تعذّر إرفاق الملف، يُرجى المحاولة مجددًا."));
    } finally {
      setUploading(false);
    }
  };

  if (app === undefined) {
    return (
      <div className="max-w-5xl mx-auto">
        <SkeletonApplicationDetail />
      </div>
    );
  }

  if (app === null) {
    return (
      <Card className="max-w-md mx-auto mt-12 p-10 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted ds-border flex items-center justify-center mx-auto mb-4">
          <FileQuestion className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold mb-1">الطلب غير موجود.</h2>
        <p className="text-sm text-muted-foreground mb-6">
          قد يكون الطلب محذوفًا أو أنّ الرابط غير صحيح.
        </p>
        <Button
          onPress={() => router.push("/student/applications")}
          variant="primary"
        >
          العودة إلى الطلبات
        </Button>
      </Card>
    );
  }

  const actions = (
    <div className="flex items-center gap-2">
      {!isEditing && (
        <>
          <Tooltip
            content={
              !canDelete ? "يمكن حذف المسودات والطلبات المرفوضة فقط." : "حذف الطلب"
            }
          >
            <Button
              onPress={() => canDelete && setShowDeleteConfirm(true)}
              isDisabled={!canDelete}
              variant="danger-soft"
              size="sm"
            >
              <Trash2 className="w-4 h-4" />
              حذف
            </Button>
          </Tooltip>
          {canEdit && (
            <Button
              onPress={() => setIsEditing(true)}
              variant="primary"
              size="sm"
            >
              <Edit3 className="w-4 h-4" />
              تعديل
            </Button>
          )}
        </>
      )}
      {isEditing && (
        <Button onPress={() => setIsEditing(false)} variant="ghost" size="sm">
          <X className="w-4 h-4" />
          إلغاء التعديل
        </Button>
      )}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-5 animate-fade-in">
      <DeleteConfirmModal
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        projectName={app.projectName}
        isDeleting={deleting}
        onConfirm={() => void handleDelete()}
      />

      {showPdf && pdfUrl && (
        <PdfViewer
          url={pdfUrl}
          title={app.projectName}
          onClose={() => setShowPdf(false)}
        />
      )}

      <StudentApplicationHero
        app={app}

        onBack={goBack}
        actions={actions}
        showStepper={!isEditing}
      />

      {/* Status-aware banner: timeline expectations during review,
          celebration + next-steps after acceptance. Renders nothing for
          draft/needs_modification/rejected — the existing feedback card
          handles those. */}
      {!isEditing && <ApplicationStatusBanner app={app} />}

      {/* Supervisor feedback sits above the body: when an application is
          returned for changes it is the first thing the student should
          read, and it stays visible while editing. */}
      <SupervisorFeedbackCard
        app={app}
        canEdit={canEdit && !isEditing}
        onEdit={() => setIsEditing(true)}
      />

      {isEditing ? (
        <ApplicationEditForm
          app={app}
          onSaved={() => setIsEditing(false)}
          pdfUrl={pdfUrl}
          videoUrl={videoUrl}
          onShowPdf={() => setShowPdf(true)}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main column — the submitted project details */}
          <div className="lg:col-span-2">
            <ProjectDetailsCard app={app} />
          </div>

          {/* Sidebar — attachments stay in view alongside the details */}
          <div className="lg:sticky lg:top-6 self-start">
            <AttachmentsSection
              pdfFileId={app.pdfFileId}
              videoFileId={app.videoFileId}
              pdfUrl={pdfUrl}
              videoUrl={videoUrl}
              onShowPdf={() => setShowPdf(true)}
              stack
              editable={canEdit}
              onAttachPdf={(file) => void handleAttach("pdf", file)}
              onAttachVideo={(file) => void handleAttach("video", file)}
              uploadingPdf={uploadingPdf}
              uploadingVideo={uploadingVideo}
            />
          </div>
        </div>
      )}
    </div>
  );
}
