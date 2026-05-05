"use client";

import { useCallback, useState } from "react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useApplication } from "@/features/applications/hooks/useApplication";
import { usePresence } from "@/features/applications/hooks/usePresence";

/**
 * Orchestrates the student application details page: data fetching,
 * presence, edit-toggle, delete confirmation flow, and PDF viewer state.
 * Keeps StudentApplicationDetails as a thin presentation container.
 */
export function useStudentApplicationDetails(appId: Id<"applications">) {
  const router = useRouter();
  const { app, pdfUrl, videoUrl } = useApplication(appId);
  const presenceOthers = usePresence(app?._id);
  const deleteApplication = useMutation(api.applications.student.deleteApplication);

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showPdf, setShowPdf] = useState(false);

  const canEdit =
    app?.status === "draft" || app?.status === "needs_modification";
  const canDelete = app?.status === "draft" || app?.status === "rejected";

  const handleDelete = useCallback(async () => {
    setDeleting(true);
    try {
      await deleteApplication({ id: appId });
      toast.success("تم حذف الطلب");
      router.push("/student/applications");
    } catch (e: unknown) {
      toast.error(
        "خطأ: " + (e instanceof Error ? e.message : "حاول مرة أخرى."),
      );
      setDeleting(false);
    }
  }, [appId, deleteApplication, router]);

  const goBack = useCallback(
    () => router.push("/student/applications"),
    [router],
  );

  return {
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
  };
}
