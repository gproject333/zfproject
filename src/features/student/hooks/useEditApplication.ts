"use client";

import { useState, useCallback, useMemo } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Doc } from "../../../../convex/_generated/dataModel";
import { useFileUpload } from "@/features/applications/hooks/useFileUpload";
import {
  useApplicationForm,
  type ApplicationFormData,
} from "./useApplicationForm";
import { buildApplicationPayload } from "../utils/buildApplicationPayload";
import { validateApplicationFiles } from "../utils/validateApplicationFiles";

type SaveMode = "save" | "submit";

/**
 * Owns the full "edit application" workflow: seeds form state from the
 * existing app, handles file uploads, calls updateApplication, and
 * optionally re-submits the draft via submitApplication.
 *
 * The consuming component provides the current `app` and an `onSaved`
 * callback; the hook handles everything else.
 */
export function useEditApplication(
  app: Doc<"applications">,
  onSaved: () => void
) {
  const updateApplication = useMutation(api.applications.student.updateApplication);
  const submitApplication = useMutation(api.applications.student.submitApplication);

  const initialData = useMemo<ApplicationFormData>(
    () => ({
      projectName: app.projectName,
      description: app.description,
      problemStatement: app.problemStatement,
      targetAudience: app.targetAudience,
      teamMembers: app.teamMembers ?? [],
      phone: app.phone ?? "",
      projectGoals: app.projectGoals ?? "",
      projectCategory:
        app.type === "it_graduation"
          ? (app.projectCategory ?? [])
          : (app.projectCategory?.[0] ?? ""),
      targetLocation: app.targetLocation ?? "",
      supervisor: app.supervisor ?? "",
      universityBenefit: app.universityBenefit ?? "",
    }),
    [app]
  );

  const form = useApplicationForm({ type: app.type, initialData });
  const upload = useFileUpload();

  const [saving, setSaving] = useState(false);
  const [saveMode, setSaveMode] = useState<SaveMode>("save");

  const save = useCallback(
    async (andSubmit: boolean) => {
      // Only "save and submit" needs full validation; plain saves can be
      // partial drafts.
      if (andSubmit) {
        if (!form.validate()) return;
        const filesError = validateApplicationFiles({
          pdfFile: upload.pdfFile,
          videoFile: upload.videoFile,
          existingPdfId: app.pdfFileId,
          existingVideoId: app.videoFileId,
        });
        if (filesError) {
          form.setFormError(filesError);
          return;
        }
      }

      setSaveMode(andSubmit ? "submit" : "save");
      setSaving(true);
      try {
        const pdfFileId = upload.pdfFile ? await upload.uploadFile(upload.pdfFile) : undefined;
        const videoFileId = upload.videoFile ? await upload.uploadFile(upload.videoFile) : undefined;

        await updateApplication({
          id: app._id,
          ...buildApplicationPayload(form.formData, { pdfFileId, videoFileId }),
        });

        if (andSubmit) await submitApplication({ id: app._id });
        onSaved();
      } catch (e: unknown) {
        form.setFormError(
          "حدث خطأ: " + (e instanceof Error ? e.message : "حاول مرة أخرى.")
        );
      } finally {
        setSaving(false);
      }
    },
    [form, upload, updateApplication, submitApplication, app._id, app.pdfFileId, app.videoFileId, onSaved]
  );

  return {
    form,
    upload,
    saving,
    saveMode,
    save,
  };
}
