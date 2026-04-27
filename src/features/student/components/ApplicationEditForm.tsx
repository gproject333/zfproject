"use client";

import { Edit3, Save, Send, Loader2 } from "lucide-react";
import type { Doc } from "../../../../convex/_generated/dataModel";
import FileUploadFields from "@/features/applications/components/FileUploadFields";
import FormError from "@/features/applications/components/FormError";
import { useEditApplication } from "@/features/student/hooks/useEditApplication";
import ApplicationFormFields from "./ApplicationFormFields";

interface ApplicationEditFormProps {
  app: Doc<"applications">;
  onSaved: () => void;
}

/**
 * Rendering-only component for the edit form (shown inside
 * StudentApplicationDetails when the student toggles edit mode).
 * All state, validation, mutations, and upload logic live in
 * useEditApplication.
 */
export default function ApplicationEditForm({ app, onSaved }: ApplicationEditFormProps) {
  const { form, upload, saving, saveMode, save } = useEditApplication(app, onSaved);

  return (
    <div className="nb-card p-6">
      <h3 className="font-bold text-base mb-5 flex items-center gap-2">
        <Edit3 className="w-5 h-5 text-primary" />
        تعديل الطلب
      </h3>

      <FormError message={form.errors.form} className="mb-5" />

      <ApplicationFormFields
        formData={form.formData}
        errors={form.errors}
        updateField={form.updateField}
        validateField={form.validateField}
        extraFields={form.extraFields}
      />

      <div className="mt-6">
        <FileUploadFields
          upload={upload}
          variant="edit"
          existingPdfId={app.pdfFileId}
          existingVideoId={app.videoFileId}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-5 border-t-2 border-foreground/10">
        <button
          onClick={() => void save(false)}
          disabled={saving}
          className="nb-btn nb-btn-outline flex-1"
        >
          {saving && saveMode === "save" ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          حفظ التعديلات
        </button>
        <button
          onClick={() => void save(true)}
          disabled={saving}
          className="nb-btn nb-btn-secondary flex-[2]"
        >
          {saving && saveMode === "submit" ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> جاري التقديم...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" /> حفظ وإعادة التقديم
            </>
          )}
        </button>
      </div>
    </div>
  );
}
