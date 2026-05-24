"use client";

import { useState } from "react";
import {Edit3, Save, Send} from "lucide-react";
import type { Doc } from "../../../../convex/_generated/dataModel";
import FileUploadFields from "@/features/applications/components/FileUploadFields";
import FormError from "@/features/applications/components/FormError";
import { useEditApplication } from "@/features/student/hooks/useEditApplication";
import ApplicationFormFields from "./ApplicationFormFields";
import { Button, Spinner, Card} from "@/components/ui";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

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
  const [confirmResubmit, setConfirmResubmit] = useState(false);

  return (
    <Card className="p-6">
      <h3 className="font-bold text-base mb-5 flex items-center gap-2">
        <Edit3 className="w-5 h-5 text-primary" />
        تعديل الطلب
      </h3>

      <FormError message={form.errors.form} className="mb-5" />

      <ApplicationFormFields
        type={app.type}
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
        <Button
          onPress={() => void save(false)}
          isDisabled={saving}
          variant="outline"
          className="flex-1"
        >
          {saving && saveMode === "save" ? (
            <Spinner size="sm" color="current" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          حفظ التعديلات
        </Button>
        <Button
          onPress={() => setConfirmResubmit(true)}
          isDisabled={saving}
          variant="secondary"
          className="flex-[2]"
        >
          {saving && saveMode === "submit" ? (
            <>
              <Spinner size="sm" color="current" /> جاري التقديم...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" /> حفظ وإعادة التقديم
            </>
          )}
        </Button>
      </div>

      <ConfirmDialog
        open={confirmResubmit}
        onOpenChange={(open) => {
          if (!saving) setConfirmResubmit(open);
        }}
        title="إعادة تقديم الطلب"
        description="بعد إعادة التقديم سيعود طلبك إلى قائمة المراجعة عند المشرف ولن تقدر تعدّله حتى يصدر القرار. هل أنت متأكد؟"
        icon={<Send className="w-6 h-6 text-primary" />}
        confirmLabel="نعم، أعد التقديم"
        cancelLabel="إلغاء"
        isSubmitting={saving}
        onConfirm={() => {
          setConfirmResubmit(false);
          void save(true);
        }}
      />
    </Card>
  );
}
