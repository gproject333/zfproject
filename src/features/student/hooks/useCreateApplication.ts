"use client";

import { useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useFileUpload } from "@/features/applications/hooks/useFileUpload";
import { useApplicationForm, type ApplicationType } from "./useApplicationForm";
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

        router.push(`/student/applications/${appId}`);
      } catch (e: unknown) {
        form.setFormError(
          "حدث خطأ: " + (e instanceof Error ? e.message : "حاول مرة أخرى.")
        );
      } finally {
        setLoading(false);
      }
    },
    [form, upload, createApplication, router, type]
  );

  return {
    form,
    upload,
    loading,
    submitMode,
    submit,
  };
}
