"use client";

import { useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@smart-zuj/convex";
import type { Id } from "@smart-zuj/convex";
import { useFileUpload } from "@/features/applications/hooks/useFileUpload";
import { useApplicationForm, type ApplicationType } from "./useApplicationForm";
import { useDraftAutoSave, isFormDirty } from "./useDraftAutoSave";
import { buildApplicationPayload } from "../utils/buildApplicationPayload";
import { validateApplicationFiles } from "../utils/validateApplicationFiles";

type SubmitMode = "draft" | "submit";

/**
 * Owns the full "create application" workflow: form state, file upload
 * state, validation, payload building, the Convex mutation call, and the
 * post-success redirect.
 *
 * The consuming component only needs to render the form and wire the
 * returned handlers to buttons — no Convex imports, no try/catch, no
 * loading flag to manage.
 */
export function useCreateApplication(type: ApplicationType) {
  const router = useRouter();
  const createApplication = useMutation(api.applications.student.createApplication);
  const form = useApplicationForm({ type });
  const upload = useFileUpload();

  const [loading, setLoading] = useState(false);
  const [submitMode, setSubmitMode] = useState<SubmitMode>("submit");
  const [success, setSuccess] = useState<
    | null
    | { appId: Id<"applications">; mode: SubmitMode }
  >(null);

  // Auto-save + browser-close guard. The hook owns localStorage; here we
  // just feed it the current form snapshot and a "should we be saving?"
  // signal so it can debounce writes and warn on unload.
  const dirty = isFormDirty(form.formData);
  const draft = useDraftAutoSave(type, form.formData, dirty, loading);

  /**
   * Navigate to the new application. Called from the success dialog —
   * draft saves skip the dialog entirely (next argument), submitted
   * applications wait for the user to dismiss the dialog before routing.
   */
  const goToApplication = useCallback(() => {
    if (!success) return;
    router.push(`/student/applications/${success.appId}`);
  }, [router, success]);

  const submit = useCallback(
    async (mode: SubmitMode) => {
      // Only the "submit for review" flow needs validation; drafts can be
      // incomplete.
      if (mode === "submit") {
        if (!form.validate()) return;
        const filesError = validateApplicationFiles({
          pdfFile: upload.pdfFile,
          videoFile: upload.videoFile,
        });
        if (filesError) {
          form.setFormError(filesError);
          return;
        }
      }

      setSubmitMode(mode);
      setLoading(true);
      try {
        const pdfFileId: Id<"_storage"> | undefined = upload.pdfFile
          ? await upload.uploadFile(upload.pdfFile)
          : undefined;
        const videoFileId: Id<"_storage"> | undefined = upload.videoFile
          ? await upload.uploadFile(upload.videoFile)
          : undefined;

        const appId = await createApplication({
          type,
          ...buildApplicationPayload(form.formData, { pdfFileId, videoFileId }),
          submitNow: mode === "submit",
        });

        // Clear the persisted draft now that the server has the data —
        // keeping it around would re-prompt to restore on the next visit.
        draft.clearDraft();

        if (mode === "draft") {
          // Drafts skip the celebration — go straight to the application.
          router.push(`/student/applications/${appId}`);
        } else {
          // Submitted: pause on a success modal so the student knows what
          // happens next before landing on the read-only detail view.
          setSuccess({ appId, mode });
        }
      } catch (e: unknown) {
        form.setFormError(
          "حدث خطأ: " + (e instanceof Error ? e.message : "يُرجى المحاولة لاحقًا.")
        );
      } finally {
        setLoading(false);
      }
    },
    [form, upload, createApplication, router, type, draft]
  );

  return {
    form,
    upload,
    loading,
    submitMode,
    submit,
    success,
    goToApplication,
    draft,
  };
}
