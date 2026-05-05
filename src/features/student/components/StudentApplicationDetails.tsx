"use client";

import { useParams } from "next/navigation";
import {Edit3, Send, X, Trash2} from "lucide-react";
import type { Id } from "../../../../convex/_generated/dataModel";
import PdfViewer from "@/components/PdfViewerLazy";
import ApplicationDetailsView from "@/features/applications/components/ApplicationDetailsView";
import ApplicationHeader from "@/features/applications/components/ApplicationHeader";
import StatusStepper from "@/features/applications/components/StatusStepper";
import { useStudentApplicationDetails } from "@/features/student/hooks/useStudentApplicationDetails";
import ApplicationEditForm from "./ApplicationEditForm";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { Breadcrumbs, Button, Spinner } from "@/components/ui";
import { Tooltip } from "@/components/ui/Tooltip";

/**
 * Top-level orchestrator for the student application details page.
 * All state, mutations, and navigation live in useStudentApplicationDetails.
 * This component composes header + stepper + details/edit body.
 */
export default function StudentApplicationDetails() {
  const params = useParams();
  const appId = params.id as Id<"applications">;
  const {
    app,
    pdfUrl,
    videoUrl,
    presenceOthers,
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

  if (app === undefined) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" color="current" className="text-primary" />
      </div>
    );
  }

  if (app === null) {
    return <div className="text-center py-20 font-bold">الطلب غير موجود</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <Breadcrumbs>
        <Breadcrumbs.Item href="/student">الرئيسية</Breadcrumbs.Item>
        <Breadcrumbs.Item href="/student/applications">الطلبات</Breadcrumbs.Item>
        <Breadcrumbs.Item>{app.projectName}</Breadcrumbs.Item>
      </Breadcrumbs>

      <DeleteConfirmModal
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        projectName={app.projectName}
        isDeleting={deleting}
        onConfirm={() => void handleDelete()}
      />

      {showPdf && pdfUrl && (
        <PdfViewer url={pdfUrl} title={app.projectName} onClose={() => setShowPdf(false)} />
      )}

      <ApplicationHeader
        app={app}
        presenceOthers={presenceOthers}
        onBack={goBack}
        rightSlot={
          <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:items-center">
            {!isEditing && (
              <Tooltip content={!canDelete ? "يمكن حذف المسودات والمرفوضة فقط" : "حذف الطلب"}>
                <Button
                  onPress={() => canDelete && setShowDeleteConfirm(true)}
                  isDisabled={!canDelete}
                  variant="danger-soft"
                  size="sm"
                  className="col-span-1 justify-center"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="sm:hidden">حذف</span>
                </Button>
              </Tooltip>
            )}
            {canEdit && !isEditing && (
              <Button
                onPress={() => setIsEditing(true)}
                variant="primary"
                size="sm"
                className={`col-span-1 justify-center ${!canDelete ? "col-span-2" : ""}`}
              >
                <Edit3 className="w-4 h-4" />
                تعديل
              </Button>
            )}
            {isEditing && (
              <Button
                onPress={() => setIsEditing(false)}
                variant="ghost"
                size="sm"
                className="col-span-2 justify-center"
              >
                <X className="w-4 h-4" />
                إلغاء التعديل
              </Button>
            )}
          </div>
        }
      />

      {!isEditing && <StatusStepper status={app.status} />}

      {isEditing ? (
        <ApplicationEditForm app={app} onSaved={() => setIsEditing(false)} />
      ) : (
        <>
          <ApplicationDetailsView
            app={app}
            pdfUrl={pdfUrl}
            videoUrl={videoUrl}
            onShowPdf={() => setShowPdf(true)}
            canEdit={canEdit}
          />

          {canEdit && (
            <div className="flex gap-3">
              <Button onPress={() => setIsEditing(true)} variant="secondary" className="flex-1">
                <Send className="w-5 h-5" />
                تعديل وإعادة التقديم
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
