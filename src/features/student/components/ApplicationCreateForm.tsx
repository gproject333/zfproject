"use client";

import { useRouter } from "next/navigation";
import {ArrowLeft, Save, Send, FileText, AlertCircle, CheckCircle2} from "lucide-react";
import { TYPE_CONFIG } from "@/lib/configs/application";
import FileUploadFields from "@/features/applications/components/FileUploadFields";
import FormError from "@/features/applications/components/FormError";
import {
  useCreateApplication,
} from "@/features/student/hooks/useCreateApplication";
import type { ApplicationType } from "@/features/student/hooks/useApplicationForm";
import ApplicationFormFields from "./ApplicationFormFields";
import { Button, Spinner} from "@/components/ui";

interface ApplicationCreateFormProps {
  type: ApplicationType;
}

/**
 * Rendering-only component for the "create new application" page.
 * All state, mutations, validation, and redirect logic live in
 * useCreateApplication. This component composes header + form fields
 * + file uploads + draft/submit buttons + tips card.
 */
export default function ApplicationCreateForm({ type }: ApplicationCreateFormProps) {
  const router = useRouter();
  const config = TYPE_CONFIG[type];
  const { form, upload, loading, submitMode, submit } = useCreateApplication(type);

  if (!config) {
    return (
      <div className="nb-card p-12 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">نوع غير صالح</h3>
        <Button
          onPress={() => router.push("/student/new")}
          variant="primary"
          className="mt-4"
        >
          العودة لاختيار النوع
        </Button>
      </div>
    );
  }

  const Icon = config.icon;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push("/student/new")}
          className="w-10 h-10 nb-border rounded-lg flex items-center justify-center bg-card nb-shadow-hover shrink-0"
        >
          <ArrowLeft className="w-5 h-5 rotate-180" />
        </button>
        <div className={`w-12 h-12 ${config.bgColor} nb-border rounded-xl flex items-center justify-center shrink-0`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold">{config.formTitle}</h2>
          <p className="text-sm text-muted-foreground font-medium">{config.formSubtitle}</p>
        </div>
      </div>

      {/* Form */}
      <div className="nb-card p-6 md:p-8">
        <FormError message={form.errors.form} shake className="mb-6" />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submit("submit");
          }}
          className="space-y-6"
        >
          <div className="pb-4 border-b-2 border-foreground/10">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              المعلومات الأساسية
            </h3>
            <ApplicationFormFields
              formData={form.formData}
              errors={form.errors}
              updateField={form.updateField}
              validateField={form.validateField}
              extraFields={form.extraFields}
            />
          </div>

          <div className="pb-4">
            <FileUploadFields upload={upload} variant="create" />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              type="button"
              onPress={() => void submit("draft")}
              isDisabled={loading}
              variant="outline"
              className="flex-1"
            >
              {loading && submitMode === "draft" ? (
                <Spinner size="sm" color="current" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              حفظ كمسودة
            </Button>
            <Button type="submit" isDisabled={loading} variant="secondary" className="flex-[2]">
              {loading && submitMode === "submit" ? (
                <>
                  <Spinner size="sm" color="current" />
                  جاري التقديم...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  تقديم الطلب
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Tips */}
      <div className="mt-6 nb-card p-5 bg-muted/50">
        <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-success" />
          نصائح لطلب ناجح
        </h4>
        <ul className="text-sm text-muted-foreground font-medium space-y-1 list-disc list-inside">
          <li>اكتب وصفاً واضحاً ومفصلاً لمشروعك</li>
          <li>حدد المشكلة التي يحلها مشروعك بدقة</li>
          <li>أرفق فيديو تقديمي (يزيد فرص القبول 2x)</li>
          <li>يمكنك حفظ المسودة والعودة لإكمالها لاحقاً</li>
        </ul>
      </div>
    </div>
  );
}
